"""Face blurring before any frame is stored or shown, with OpenCV's YuNet detector.

The team keeps face blurring as its own requirement (Sprint Report 15/11). Faces are
found on a downscaled copy for speed, then pixelated on the full-resolution frame.
Very small or turned-away faces can be missed; the stored frames are reviewed with
that limit in mind.
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np

log = logging.getLogger(__name__)


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
            x0, y0 = max(0, int(x - pad_w)), max(0, int(y - pad_h))
            x1, y1 = min(w, int(x + fw + pad_w)), min(h, int(y + fh + pad_h))
            if x1 - x0 < 2 or y1 - y0 < 2:
                continue
            region = out[y0:y1, x0:x1]
            tiny = cv2.resize(region, (6, 6), interpolation=cv2.INTER_AREA)
            out[y0:y1, x0:x1] = cv2.resize(tiny, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
            count += 1
        return out, count


def load_blurrer(model_path: str) -> FaceBlurrer | None:
    try:
        return FaceBlurrer(model_path)
    except Exception as exc:  # noqa: BLE001
        log.error("face blurring unavailable (%s); frames will not be stored", exc)
        return None
