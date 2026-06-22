import logging
from datetime import UTC, datetime
from typing import Any

import cv2
import numpy as np

from edge_daemon.app.config import get_settings

logger = logging.getLogger(__name__)


class VisionProcessor:
    """Processes camera frames using YOLO for object detection."""

    def __init__(self):
        self._settings = get_settings()
        self._model = None
        self._camera = None

    def load_model(self) -> None:
        """Load YOLO model for object detection."""
        try:
            from ultralytics import YOLO

            self._model = YOLO(self._settings.yolo_model)
            logger.info(f"Loaded YOLO model: {self._settings.yolo_model}")
        except ImportError:
            logger.warning("Ultralytics not installed, using mock detection")
            self._model = None
        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")
            self._model = None

    def initialize_camera(self) -> None:
        """Initialize camera capture."""
        self._camera = cv2.VideoCapture(self._settings.camera_index)
        self._camera.set(cv2.CAP_PROP_FRAME_WIDTH, self._settings.camera_width)
        self._camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self._settings.camera_height)
        self._camera.set(cv2.CAP_PROP_FPS, self._settings.camera_fps)
        logger.info(f"Camera initialized: {self._settings.camera_index}")

    def close(self) -> None:
        """Release camera resources."""
        if self._camera:
            self._camera.release()
            self._camera = None
            logger.info("Camera released")

    def capture_frame(self) -> np.ndarray | None:
        """Capture a single frame from the camera."""
        if self._camera is None:
            raise RuntimeError("Camera not initialized")

        ret, frame = self._camera.read()
        if not ret:
            logger.error("Failed to capture frame")
            return None

        return frame

    def process_frame(self, frame: np.ndarray) -> dict[str, Any]:
        """
        Process a frame to detect objects using YOLO.

        Args:
            frame: Camera frame as numpy array

        Returns:
            Detection results as dictionary
        """
        if self._model is None:
            # Mock detection for testing without YOLO
            return self._mock_detection()

        try:
            results = self._model(
                frame,
                conf=self._settings.yolo_confidence_threshold,
                iou=self._settings.yolo_iou_threshold,
                verbose=False,
            )

            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        class_name = self._model.names[cls_id]
                        confidence = float(box.conf[0])
                        bbox = box.xyxy[0].tolist()

                        detections.append(
                            {
                                "class": class_name,
                                "confidence": confidence,
                                "bbox": bbox,
                            }
                        )

            return {
                "timestamp": datetime.now(UTC).isoformat(),
                "detections": detections,
                "detection_count": len(detections),
            }

        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {"timestamp": datetime.now(UTC).isoformat(), "detections": [], "detection_count": 0}

    def _mock_detection(self) -> dict[str, Any]:
        """Generate mock detection results for testing."""
        # Simulate random detections
        import random

        mock_classes = ["person", "car", "dog", "cat"]
        detections = []

        # Randomly add 0-2 detections
        for _ in range(random.randint(0, 2)):
            if random.random() > 0.7:
                detections.append(
                    {
                        "class": random.choice(mock_classes),
                        "confidence": round(random.uniform(0.5, 0.95), 2),
                        "bbox": [
                            random.randint(0, 300),
                            random.randint(0, 300),
                            random.randint(300, 640),
                            random.randint(300, 480),
                        ],
                    }
                )

        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "detections": detections,
            "detection_count": len(detections),
            "mock": True,
        }

    def get_frame_summary(self, frame: np.ndarray) -> dict[str, Any]:
        """
        Get a summary of the frame (basic statistics).

        Args:
            frame: Camera frame

        Returns:
            Frame summary
        """
        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "width": frame.shape[1],
            "height": frame.shape[0],
            "channels": frame.shape[2] if len(frame.shape) > 2 else 1,
            "brightness": float(np.mean(frame)),
        }
