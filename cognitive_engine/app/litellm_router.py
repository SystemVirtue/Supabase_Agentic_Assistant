import logging
from dataclasses import dataclass

from litellm import acompletion, aembedding

from cognitive_engine.app.complexity_classifier import ComplexityClass
from cognitive_engine.app.config import get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RoutingDecision:
    request_id: str
    complexity_class: ComplexityClass
    model_selected: str
    routing_confidence: float
    estimated_input_tokens: int
    estimated_cost_usd: float


class LiteLLMRouter:
    """Routes reasoning tasks to appropriate LLM models based on complexity and budget."""

    def __init__(self):
        self._settings = get_settings()

    def select_model(self, complexity: ComplexityClass) -> str:
        """Select the appropriate model based on complexity class."""
        model_map = {
            ComplexityClass.SIMPLE: self._settings.simple_model,
            ComplexityClass.MODERATE: self._settings.moderate_model,
            ComplexityClass.COMPLEX: self._settings.complex_model,
            ComplexityClass.VISION: self._settings.vision_model,
        }
        return model_map.get(complexity, self._settings.default_model)

    def estimate_cost(self, model: str, input_tokens: int, output_tokens: int = 0) -> float:
        """
        Estimate cost for a model call.

        Simplified cost estimation (in USD):
        - Ollama (local): $0
        - Claude Sonnet: $3/1M input, $15/1M output
        - GPT-4o: $5/1M input, $15/1M output
        """
        if model.startswith("ollama"):
            return 0.0

        total_tokens = input_tokens + output_tokens

        if "claude" in model.lower():
            # Claude pricing
            input_cost = (input_tokens / 1_000_000) * 3.0
            output_cost = (output_tokens / 1_000_000) * 15.0
            return input_cost + output_cost

        if "gpt" in model.lower():
            # GPT-4o pricing
            input_cost = (input_tokens / 1_000_000) * 5.0
            output_cost = (output_tokens / 1_000_000) * 15.0
            return input_cost + output_cost

        return 0.0

    def check_budget(
        self, estimated_cost: float, estimated_tokens: int
    ) -> tuple[bool, str]:
        """
        Check if the request fits within budget constraints.

        Returns:
            tuple (allowed, reason)
        """
        if estimated_cost > self._settings.max_cost_usd:
            return False, f"Estimated cost ${estimated_cost:.4f} exceeds budget ${self._settings.max_cost_usd}"

        if estimated_tokens > self._settings.max_input_tokens:
            return False, f"Estimated tokens {estimated_tokens} exceeds limit {self._settings.max_input_tokens}"

        return True, ""

    async def route(
        self,
        query: str,
        complexity: ComplexityClass,
        request_id: str,
        estimated_tokens: int = 0,
    ) -> RoutingDecision:
        """
        Make a routing decision for a reasoning task.

        Args:
            query: The user query
            complexity: Classified complexity
            request_id: Unique request identifier
            estimated_tokens: Estimated input token count

        Returns:
            RoutingDecision with model selection and metadata
        """
        model = self.select_model(complexity)
        estimated_cost = self._estimate_cost(model, estimated_tokens)

        # Check budget constraints
        allowed, reason = self.check_budget(estimated_cost, estimated_tokens)
        if not allowed:
            logger.warning(f"Request {request_id} rejected: {reason}")
            # Fall back to simpler model
            if complexity != ComplexityClass.SIMPLE:
                logger.info(f"Falling back to simple model for request {request_id}")
                model = self._settings.simple_model
                estimated_cost = self._estimate_cost(model, estimated_tokens)

        routing_confidence = 0.9  # High confidence in heuristic routing

        decision = RoutingDecision(
            request_id=request_id,
            complexity_class=complexity,
            model_selected=model,
            routing_confidence=routing_confidence,
            estimated_input_tokens=estimated_tokens,
            estimated_cost_usd=estimated_cost,
        )

        logger.info(
            f"Routing decision: {decision.model_selected} for {complexity.value} task "
            f"(cost: ${estimated_cost:.4f}, tokens: {estimated_tokens})"
        )

        return decision

    async def complete(
        self,
        model: str,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> dict:
        """
        Execute a completion request using LiteLLM.

        Args:
            model: Model identifier (e.g., "ollama/llama3.2", "anthropic/claude-3-5-sonnet")
            messages: Chat messages
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            Completion response
        """
        try:
            response = await acompletion(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response
        except Exception as e:
            logger.error(f"LiteLLM completion error: {e}")
            raise

    async def embed(self, text: str, model: str = "text-embedding-ada-002") -> list[float]:
        """
        Generate embeddings for text using LiteLLM.

        Args:
            text: Text to embed
            model: Embedding model identifier

        Returns:
            Embedding vector
        """
        try:
            response = await aembedding(model=model, input=text)
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"LiteLLM embedding error: {e}")
            raise
