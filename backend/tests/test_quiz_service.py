"""
Tests for Quiz Service
"""
import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.quiz_service import (
    generate_quiz_questions,
    analyze_quiz_results,
    generate_fallback_questions,
)


class TestGenerateFallbackQuestions:
    """Tests for fallback question generation"""

    def test_generates_correct_count(self):
        """Test fallback generates requested count"""
        questions = generate_fallback_questions(3)
        assert len(questions) == 3

    def test_max_five_questions(self):
        """Test fallback caps at 5 questions"""
        questions = generate_fallback_questions(10)
        assert len(questions) == 5

    def test_question_structure(self):
        """Test fallback question has correct structure"""
        questions = generate_fallback_questions(1)
        q = questions[0]
        
        assert "id" in q
        assert "question" in q
        assert "options" in q
        assert "correct_answer" in q

    def test_has_four_options(self):
        """Test question has 4 options"""
        questions = generate_fallback_questions(1)
        assert len(questions[0]["options"]) == 4

    def test_option_ids(self):
        """Test option IDs are a, b, c, d"""
        questions = generate_fallback_questions(1)
        option_ids = [o["id"] for o in questions[0]["options"]]
        assert option_ids == ["a", "b", "c", "d"]

    def test_first_option_is_correct(self):
        """Test first option is marked as correct"""
        questions = generate_fallback_questions(1)
        assert questions[0]["correct_answer"] == "a"


class TestAnalyzeQuizResults:
    """Tests for quiz result analysis"""

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_analyze_perfect_score(self, mock_llm):
        """Test analysis for perfect score"""
        mock_llm.return_value = "Excellent! You got all questions right!"
        
        analysis, gaps = await analyze_quiz_results(10, 10, [])
        
        assert isinstance(analysis, str)
        assert len(analysis) > 0
        assert mock_llm.called

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_analyze_partial_score(self, mock_llm):
        """Test analysis for partial score"""
        mock_llm.return_value = "Good job! Review the topics below."
        
        questions = [
            {"question": "What is Python?"},
            {"question": "What is a variable?"},
        ]
        
        analysis, gaps = await analyze_quiz_results(7, 10, questions)
        
        assert isinstance(analysis, str)
        assert gaps == ["What is Python?", "What is a variable?"]

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_analyze_low_score(self, mock_llm):
        """Test analysis for low score"""
        mock_llm.return_value = "Keep practicing!"
        
        questions = [
            {"question": "Question 1"},
            {"question": "Question 2"},
            {"question": "Question 3"},
        ]
        
        analysis, gaps = await analyze_quiz_results(2, 10, questions)
        
        assert isinstance(analysis, str)
        assert len(gaps) == 3

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_analyze_handles_llm_failure(self, mock_llm):
        """Test fallback when LLM call fails"""
        mock_llm.side_effect = Exception("API Error")
        
        analysis, gaps = await analyze_quiz_results(9, 10, [{"question": "Wrong"}])
        
        assert "great" in analysis.lower() or "excellent" in analysis.lower()

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_analyze_zero_correct(self, mock_llm):
        """Test analysis for zero correct"""
        mock_llm.side_effect = Exception("Fail")
        
        analysis, gaps = await analyze_quiz_results(0, 10, [{"question": "Q1"}])
        
        assert "keep" in analysis.lower() or "practicing" in analysis.lower()

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_knowledge_gaps_truncated(self, mock_llm):
        """Test knowledge gaps are limited to 5 items"""
        mock_llm.return_value = "Feedback"
        
        many_questions = [{"question": f"Q{i}"} for i in range(10)]
        
        analysis, gaps = await analyze_quiz_results(5, 10, many_questions)
        
        assert len(gaps) <= 5

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_percentage_calculation(self, mock_llm):
        """Test percentage is passed to LLM"""
        mock_llm.return_value = "Analysis"
        
        await analyze_quiz_results(8, 10, [])
        
        # Verify the prompt contains 80%
        call_args = mock_llm.call_args
        prompt = call_args[0][0]  # First positional arg (system prompt)
        assert "80.0%" in prompt or "80%" in prompt


class TestGenerateQuizQuestions:
    """Tests for quiz question generation"""

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_generates_questions(self, mock_llm):
        """Test question generation"""
        mock_response = json.dumps([
            {"id": "q1", "question": "What is Python?", "options": [
                {"id": "a", "text": "Language"},
                {"id": "b", "text": "Snake"},
                {"id": "c", "text": "Tool"},
                {"id": "d", "text": "Framework"}
            ], "correct_answer": "a"}
        ])
        mock_llm.return_value = mock_response
        
        questions = await generate_quiz_questions("vid123", "Python tutorial content", 1)
        
        assert len(questions) == 1
        assert questions[0]["id"] == "q1"
        assert questions[0]["correct_answer"] == "a"

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_truncates_long_transcript(self, mock_llm):
        """Test long transcripts are truncated"""
        mock_response = json.dumps([{"id": "q1", "question": "Q?", "options": [], "correct_answer": "a"}])
        mock_llm.return_value = mock_response
        
        long_transcript = "word " * 5000  # Very long
        await generate_quiz_questions("vid", long_transcript, 1)
        
        call_args = mock_llm.call_args
        prompt = call_args[0][0]
        assert len(prompt) < 15000  # Should be truncated

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_parses_json_from_markdown(self, mock_llm):
        """Test parsing JSON wrapped in markdown"""
        mock_response = """Here are the questions:
```json
[
  {"id": "q1", "question": "Test?", "options": [], "correct_answer": "a"}
]
```"""
        mock_llm.return_value = mock_response
        
        questions = await generate_quiz_questions("vid", "content", 1)
        
        assert len(questions) == 1
        assert questions[0]["id"] == "q1"

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_handles_invalid_json(self, mock_llm):
        """Test fallback when JSON parsing fails"""
        mock_llm.return_value = "Not valid JSON"
        
        questions = await generate_quiz_questions("vid", "content", 3)
        
        # Should return fallback questions
        assert len(questions) <= 5  # Fallback caps at 5

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_adds_missing_ids(self, mock_llm):
        """Test missing question IDs are added"""
        mock_response = json.dumps([
            {"question": "Q1", "options": [], "correct_answer": "a"},
            {"question": "Q2", "options": [], "correct_answer": "b"}
        ])
        mock_llm.return_value = mock_response
        
        questions = await generate_quiz_questions("vid", "content", 2)
        
        assert questions[0]["id"] == "q1"
        assert questions[1]["id"] == "q2"

    @patch("app.services.quiz_service.generate_llm_response")
    async def test_respects_count_parameter(self, mock_llm):
        """Test requested question count is in prompt"""
        mock_response = json.dumps([{"id": "q1", "question": "Q", "options": [], "correct_answer": "a"}])
        mock_llm.return_value = mock_response
        
        await generate_quiz_questions("vid", "content", 5)
        
        call_args = mock_llm.call_args
        prompt = call_args[0][0]
        assert "5" in prompt  # Count should be mentioned
