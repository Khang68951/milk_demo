import pytest

from milk.smoothing import CountSmoother


def test_single_frame_passes_through():
    s = CountSmoother(window=3)
    assert s.update({"A": 4, "B": 2}) == {"A": 4, "B": 2}


def test_one_occluded_frame_does_not_drop_the_count():
    s = CountSmoother(window=3)
    s.update({"A": 6})
    s.update({"A": 6})
    assert s.update({"A": 2}) == {"A": 6}  # a hand hid four cartons for one frame


def test_real_change_shows_after_two_frames():
    s = CountSmoother(window=3)
    for _ in range(3):
        s.update({"A": 6})
    assert s.update({"A": 5}) == {"A": 6}
    assert s.update({"A": 5}) == {"A": 5}


def test_sku_missing_from_frame_counts_as_zero_and_disappears():
    s = CountSmoother(window=3)
    s.update({"A": 1, "B": 3})
    s.update({"B": 3})
    assert s.update({"B": 3}) == {"B": 3}


def test_window_must_be_positive():
    with pytest.raises(ValueError):
        CountSmoother(window=0)
