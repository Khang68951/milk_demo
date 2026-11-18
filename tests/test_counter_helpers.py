import numpy as np

from milk.counter import encode_jpeg, normalise, roi_pixels
from milk.cvoutput import Detection


def test_no_roi_is_the_whole_frame():
    assert roi_pixels(None, 3840, 2160) == (0, 0, 3840, 2160)


def test_roi_fractions_become_pixels_and_stay_inside_the_frame():
    assert roi_pixels((0.25, 0.5, 0.5, 0.5), 3840, 2160) == (960, 1080, 1920, 1080)
    assert roi_pixels((0.9, 0.9, 0.5, 0.5), 1000, 1000) == (900, 900, 100, 100)


def test_normalise_converts_numpy_numbers_and_shifts_to_frame_coordinates():
    det = Detection("TMP-MLK-VNM-01", "x", np.float32(0.8125), tuple(np.array([10.4, 20.6, 30, 40], dtype=np.float32)))
    (out,) = normalise([det], dx=960, dy=1080)
    assert out.box == (970, 1101, 30, 40)
    assert all(type(v) is int for v in out.box)
    assert type(out.confidence) is float


def test_encode_jpeg_caps_the_width():
    image = np.zeros((2160, 3840, 3), dtype=np.uint8)
    jpeg, width, height = encode_jpeg(image, 80, max_width=1920)
    assert jpeg[:2] == b"\xff\xd8"
    assert (width, height) == (1920, 1080)
