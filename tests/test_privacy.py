import numpy as np

from milk.privacy import ChainBlurrer, load_blurrer, person_regions, pixelate


def test_a_standing_shopper_has_only_head_and_shoulders_hidden():
    # 1080-pixel frame, person 600 pixels tall: hide the top 40%, keep the shelf below visible
    (region,) = person_regions([(100, 200, 300, 800)], image_height=1080)
    x0, y0, x1, y1 = region
    assert (x0, x1) == (80, 320)
    assert y0 == 182 and y1 == 440


def test_a_small_box_is_hidden_whole():
    # shorter than a quarter of the frame: often a head on its own, or someone far away
    (region,) = person_regions([(500, 100, 560, 300)], image_height=1080)
    assert region == (494, 80, 566, 320)


def test_body_mode_hides_every_person_whole():
    (region,) = person_regions([(100, 200, 300, 800)], image_height=1080, mode="body")
    assert region == (80, 140, 320, 860)


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
