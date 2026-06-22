import pytest

from cognitive_engine.app.complexity_classifier import ComplexityClassifier, ComplexityClass


@pytest.fixture
def classifier():
    return ComplexityClassifier()


class TestComplexityClassifier:
    def test_classify_simple_query(self, classifier):
        """Test classification of simple queries."""
        result = classifier.classify("What is the weather today?")
        assert result == ComplexityClass.SIMPLE

    def test_classify_moderate_query(self, classifier):
        """Test classification of moderate queries."""
        result = classifier.classify("Explain how the system works")
        assert result == ComplexityClass.MODERATE

    def test_classify_complex_query(self, classifier):
        """Test classification of complex queries."""
        result = classifier.classify("Analyze the multi-step reasoning process for strategic decision making")
        assert result == ComplexityClass.COMPLEX

    def test_classify_vision_query(self, classifier):
        """Test classification of vision queries."""
        result = classifier.classify("Describe this image", has_images=True)
        assert result == ComplexityClass.VISION

    def test_classify_audio_query(self, classifier):
        """Test classification of audio queries."""
        result = classifier.classify("Transcribe this audio", has_audio=True)
        assert result == ComplexityClass.VISION

    def test_estimate_tokens(self, classifier):
        """Test token estimation."""
        text = "This is a test string with some words"
        tokens = classifier.estimate_tokens(text)
        assert tokens > 0
        assert tokens == len(text) // 4

    def test_classify_by_token_count(self, classifier):
        """Test classification based on token count."""
        # Create a long query
        long_query = "analyze " * 500  # Should exceed complex threshold
        result = classifier.classify(long_query, input_tokens=15000)
        assert result == ComplexityClass.COMPLEX

    def test_classify_moderate_by_token_count(self, classifier):
        """Test moderate classification based on token count."""
        result = classifier.classify("some query", input_tokens=500)
        assert result == ComplexityClass.MODERATE

    def test_classify_simple_by_token_count(self, classifier):
        """Test simple classification based on token count."""
        result = classifier.classify("some query", input_tokens=50)
        assert result == ComplexityClass.SIMPLE
