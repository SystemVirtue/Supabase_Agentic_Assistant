import logging
from enum import Enum

from cognitive_engine.app.config import get_settings

logger = logging.getLogger(__name__)


class ComplexityClass(Enum):
    SIMPLE = "SIMPLE"
    MODERATE = "MODERATE"
    COMPLEX = "COMPLEX"
    VISION = "VISION"


class ComplexityClassifier:
    """Classifies task complexity using heuristics (can be extended with DistilBERT)."""

    def __init__(self):
        self._settings = get_settings()

    def classify(
        self,
        query: str,
        input_tokens: int = 0,
        has_images: bool = False,
        has_audio: bool = False,
    ) -> ComplexityClass:
        """
        Classify the complexity of a reasoning task.

        Args:
            query: The user query or task description
            input_tokens: Estimated input token count
            has_images: Whether the task includes vision input
            has_audio: Whether the task includes audio input

        Returns:
            ComplexityClass enum value
        """
        # Vision tasks are always complex
        if has_images or has_audio:
            logger.info("Classified as VISION due to multimodal input")
            return ComplexityClass.VISION

        # Token-based classification
        if input_tokens > self._settings.complex_token_threshold:
            logger.info(f"Classified as COMPLEX (tokens: {input_tokens})")
            return ComplexityClass.COMPLEX

        if input_tokens > self._settings.moderate_token_threshold:
            logger.info(f"Classified as MODERATE (tokens: {input_tokens})")
            return ComplexityClass.MODERATE

        # Heuristic analysis of query content
        query_lower = query.lower()

        # Keywords indicating complexity
        complex_keywords = [
            "analyze",
            "compare",
            "evaluate",
            "synthesize",
            "reasoning",
            "multi-step",
            "complex",
            "detailed",
            "comprehensive",
            "strategic",
        ]

        moderate_keywords = [
            "explain",
            "describe",
            "summarize",
            "calculate",
            "process",
            "interpret",
        ]

        simple_keywords = [
            "what is",
            "who is",
            "when",
            "where",
            "list",
            "simple",
            "basic",
        ]

        # Check for complex keywords
        if any(keyword in query_lower for keyword in complex_keywords):
            logger.info("Classified as COMPLEX based on keyword analysis")
            return ComplexityClass.COMPLEX

        # Check for moderate keywords
        if any(keyword in query_lower for keyword in moderate_keywords):
            logger.info("Classified as MODERATE based on keyword analysis")
            return ComplexityClass.MODERATE

        # Check for simple keywords
        if any(keyword in query_lower for keyword in simple_keywords):
            logger.info("Classified as SIMPLE based on keyword analysis")
            return ComplexityClass.SIMPLE

        # Default to moderate if no clear classification
        logger.info("Default classification: MODERATE")
        return ComplexityClass.MODERATE

    def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count from text (rough approximation: 1 token ≈ 4 characters).

        Args:
            text: Input text

        Returns:
            Estimated token count
        """
        return len(text) // 4
