"""Model adapters. Each returns cvoutput.Detection objects in the coordinates of the image given.

`null` finds nothing; it lets the stream, dashboard and storage run before the model is
installed. `long` wraps the team's YOLO26s + DINOv2-S + LanceDB pipeline from Long's
GPU machine; its adapter is added once that code is copied from there.
"""
from __future__ import annotations

from typing import Protocol

import numpy as np

from .cvoutput import Detection


class Pipeline(Protocol):
    name: str

    def detect(self, image: np.ndarray) -> list[Detection]: ...


class NullPipeline:
    name = "null"

    def detect(self, image: np.ndarray) -> list[Detection]:
        return []


def load_pipeline(kind: str, models_dir: str) -> Pipeline:
    if kind == "null":
        return NullPipeline()
    if kind == "long":
        from .long_adapter import LongPipeline  # imported lazily: needs torch and the model files

        return LongPipeline(models_dir)
    raise ValueError(f"unknown MILK_PIPELINE {kind!r}; expected 'null' or 'long'")
