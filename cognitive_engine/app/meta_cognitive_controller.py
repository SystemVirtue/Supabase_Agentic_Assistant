import logging
import uuid

from cognitive_engine.app.complexity_classifier import ComplexityClassifier, ComplexityClass
from cognitive_engine.app.litellm_router import LiteLLMRouter, RoutingDecision

logger = logging.getLogger(__name__)


class MetaCognitiveController:
    """
    Meta-Cognitive Controller (MCC) - Routes reasoning tasks to appropriate models
    based on complexity classification and budget constraints.
    """

    def __init__(self):
        self._classifier = ComplexityClassifier()
        self._router = LiteLLMRouter()

    async def process_request(
        self,
        query: str,
        has_images: bool = False,
        has_audio: bool = False,
        estimated_tokens: int = 0,
    ) -> tuple[RoutingDecision, dict]:
        """
        Process a reasoning request through the MCC pipeline.

        Args:
            query: The user query or task description
            has_images: Whether the task includes vision input
            has_audio: Whether the task includes audio input
            estimated_tokens: Pre-calculated token estimate (optional)

        Returns:
            tuple (routing_decision, completion_response)
        """
        request_id = str(uuid.uuid4())

        # Estimate tokens if not provided
        if estimated_tokens == 0:
            estimated_tokens = self._classifier.estimate_tokens(query)

        # Classify complexity
        complexity = self._classifier.classify(
            query=query,
            input_tokens=estimated_tokens,
            has_images=has_images,
            has_audio=has_audio,
        )

        # Make routing decision
        routing_decision = await self._router.route(
            query=query,
            complexity=complexity,
            request_id=request_id,
            estimated_tokens=estimated_tokens,
        )

        # Execute the completion
        messages = [{"role": "user", "content": query}]
        completion_response = await self._router.complete(
            model=routing_decision.model_selected,
            messages=messages,
        )

        return routing_decision, completion_response

    async def classify_only(
        self,
        query: str,
        has_images: bool = False,
        has_audio: bool = False,
    ) -> ComplexityClass:
        """
        Classify complexity without executing the request.

        Args:
            query: The user query or task description
            has_images: Whether the task includes vision input
            has_audio: Whether the task includes audio input

        Returns:
            ComplexityClass enum value
        """
        estimated_tokens = self._classifier.estimate_tokens(query)
        return self._classifier.classify(
            query=query,
            input_tokens=estimated_tokens,
            has_images=has_images,
            has_audio=has_audio,
        )
