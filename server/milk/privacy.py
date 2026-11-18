"""Hiding people before any frame is stored or shown.

The team keeps this as its own requirement (Sprint Report 15/11). Two blurrers can be
chained:

- PersonBlurrer pixelates whole people found by a COCO detector (class 0, "person"),
  for example the stock YOLO26s weights. It also covers people seen from above, whose
  faces a face detector misses. Needs ultralytics, so it runs on the GPU worker.
- FaceBlurrer pixelates faces found by OpenCV's YuNet, on a downscaled copy for speed.
  It is light enough for the hub's CPU and catches faces the person detector missed.

Both can still miss someone; stored frames are reviewed with that limit in mind.
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np

log = logging.getLogger(__name__)


def pixelate(image: np.ndarray, x0: int, y0: int, x1: int, y1: int, blocks: int = 6) -> bool:
    """Replaces the region with a coarse mosaic, in place. False if the region is empty."""
    import cv2

    h, w = image.shape[:2]
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(w, x1), min(h, y1)
    if x1 - x0 < 2 or y1 - y0 < 2:
        return False
    region = image[y0:y1, x0:x1]
    tiny = cv2.resize(region, (blocks, blocks), interpolation=cv2.INTER_AREA)
    image[y0:y1, x0:x1] = cv2.resize(tiny, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
    return True


class FaceBlurrer:
    def __init__(self, model_path: str, score_threshold: float = 0.6, detect_max_side: int = 1280) -> None:
        import cv2

        if not Path(model_path).is_file():
            raise FileNotFoundError(model_path)
        self._cv2 = cv2
        self._detector = cv2.FaceDetectorYN.create(model_path, "", (320, 320), score_threshold, 0.3, 5000)
        self._max_side = detect_max_side

    def blur(self, image: np.ndarray) -> tuple[np.ndarray, int]:
        cv2 = self._cv2
        h, w = image.shape[:2]
        scale = min(1.0, self._max_side / max(h, w))
        small = cv2.resize(image, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA) if scale < 1 else image
        self._detector.setInputSize((small.shape[1], small.shape[0]))
        _, faces = self._detector.detect(small)
        if faces is None:
            return image, 0
        out = image.copy()
        count = 0
        for face in faces:
            x, y, fw, fh = (float(v) / scale for v in face[:4])
            pad_w, pad_h = 0.3 * fw, 0.3 * fh
            if pixelate(out, int(x - pad_w), int(y - pad_h), int(x + fw + pad_w), int(y + fh + pad_h)):
                count += 1
        return out, count


class PersonBlurrer:
    def __init__(self, model_path: str, conf: float = 0.35, imgsz: int = 1280, device: str | None = None) -> None:
        from ultralytics import YOLO  # only on machines that run the model

        if not Path(model_path).is_file():
            raise FileNotFoundError(model_path)
        self._model = YOLO(model_path)
        self._conf, self._imgsz, self._device = conf, imgsz, device or None

    def blur(self, image: np.ndarray) -> tuple[np.ndarray, int]:
        result = self._model.predict(image, classes=[0], conf=self._conf, imgsz=self._imgsz,
                                     device=self._device, verbose=False)[0]
        boxes = [] if result.boxes is None else result.boxes.xyxy.cpu().numpy()
        if len(boxes) == 0:
            return image, 0
        out = image.copy()
        count = 0
        for x0, y0, x1, y1 in boxes:
            pad = 0.05 * (y1 - y0)
            if pixelate(out, int(x0 - pad), int(y0 - pad), int(x1 + pad), int(y1 + pad), blocks=8):
                count += 1
        return out, count


class ChainBlurrer:
    """Runs blurrers one after another; the count is the total of what they hid."""

    def __init__(self, blurrers: list) -> None:
        self._blurrers = blurrers

    def blur(self, image: np.ndarray) -> tuple[np.ndarray, int]:
        total = 0
        for blurrer in self._blurrers:
            image, n = blurrer.blur(image)
            total += n
        return image, total


def load_blurrer(face_model: str, person_model: str | None = None, device: str | None = None) -> ChainBlurrer | None:
    """Every blurrer that can load. None only if none can: then nothing is stored."""
    blurrers = []
    if person_model:
        try:
            blurrers.append(PersonBlurrer(person_model, device=device))
            log.info("person blurring on (%s)", person_model)
        except Exception as exc:  # noqa: BLE001
            log.warning("person blurring unavailable (%s); faces only", exc)
    try:
        blurrers.append(FaceBlurrer(face_model))
    except Exception as exc:  # noqa: BLE001
        log.warning("face blurring unavailable (%s)", exc)
    if not blurrers:
        log.error("no blurring available; frames will not be stored")
        return None
    return ChainBlurrer(blurrers)
