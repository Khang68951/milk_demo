import numpy as np

from milk.privacy import ChainBlurrer, load_blurrer, pixelate


class Fake:
    def __init__(self, hidden: int):
        self.hidden = hidden

    def blur(self, image):
        return image + 1, self.hidden


def test_chain_runs_every_blurrer_in_order_and_adds_the_counts():
    image = np.zeros((4, 4, 3), dtype=np.uint8)
    out, hidden = ChainBlurrer([Fake(2), Fake(3)]).blur(image)
    assert hidden == 5
    assert out[0, 0, 0] == 2


def test_pixelate_turns_the_region_into_a_coarse_mosaic_and_leaves_the_rest():
    rng = np.random.default_rng(0)
    image = rng.integers(0, 255, size=(120, 160, 3), dtype=np.uint8)
    original = image.copy()
    assert pixelate(image, 40, 30, 100, 90, blocks=6)
    region = image[30:90, 40:100].reshape(-1, 3)
    assert len(np.unique(region, axis=0)) <= 36  # at most 6 x 6 colours: nothing recognisable is left
    outside = np.ones(image.shape[:2], dtype=bool)
    outside[30:90, 40:100] = False
    assert np.array_equal(image[outside], original[outside])


def test_pixelate_clips_to_the_frame_and_skips_empty_regions():
    image = np.zeros((50, 50, 3), dtype=np.uint8)
    assert pixelate(image, -20, -20, 10, 10)
    assert not pixelate(image, 60, 60, 80, 80)


def test_no_model_files_means_no_blurrer_so_nothing_gets_stored(tmp_path):
    assert load_blurrer(str(tmp_path / "missing-yunet.onnx"), str(tmp_path / "missing-yolo.pt")) is None
