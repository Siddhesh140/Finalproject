"""
Quiz Service
Handles quiz generation and analysis using AI
"""
from typing import List, Tuple
import json
import uuid

from ..config import get_settings
from .rag_service import generate_llm_response

settings = get_settings()


async def generate_quiz_questions(video_id: str, transcript: str, count: int = 10) -> List[dict]:
    """Generate quiz questions from video transcript using AI"""
    
    # Truncate transcript if too long
    max_chars = 10000
    if len(transcript) > max_chars:
        transcript = transcript[:max_chars] + "..."
    
    system_prompt = f"""You are a quiz generator. Create {count} multiple choice questions based on the video transcript.
    
Each question should:
- Test understanding of key concepts
- Have 4 options (A, B, C, D)
- Have exactly one correct answer
- Be clear and unambiguous

Return ONLY valid JSON in this exact format:
[
  {{
    "id": "q1",
    "question": "Question text here?",
    "options": [
      {{"id": "a", "text": "Option A"}},
      {{"id": "b", "text": "Option B"}},
      {{"id": "c", "text": "Option C"}},
      {{"id": "d", "text": "Option D"}}
    ],
    "correct_answer": "a"
  }}
]

Video Transcript:
{transcript}"""

    user_message = f"Generate {count} multiple choice questions about this video content."
    
    response = await generate_llm_response(system_prompt, user_message)
    
    # Parse JSON from response
    try:
        # Try to extract JSON from response
        json_match = response
        if "```json" in response:
            json_match = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            json_match = response.split("```")[1].split("```")[0]
        
        questions = json.loads(json_match.strip())
        
        # Ensure all questions have proper IDs
        for i, q in enumerate(questions):
            if "id" not in q:
                q["id"] = f"q{i+1}"
        
        return questions
        
    except json.JSONDecodeError:
        # Fallback: generate simple questions
        return generate_fallback_questions(count)


def generate_fallback_questions(count: int) -> List[dict]:
    """Generate fallback questions if AI generation fails"""
    questions = []
    for i in range(min(count, 5)):
        questions.append({
            "id": f"q{i+1}",
            "question": f"Sample question {i+1} - AI generation failed",
            "options": [
                {"id": "a", "text": "Option A"},
                {"id": "b", "text": "Option B"},
                {"id": "c", "text": "Option C"},
                {"id": "d", "text": "Option D"}
            ],
            "correct_answer": "a"
        })
    return questions


async def analyze_quiz_results(
    correct: int, 
    total: int, 
    incorrect_questions: List[dict]
) -> Tuple[str, List[str]]:
    """Analyze quiz results and generate feedback"""
    
    percentage = (correct / total * 100) if total > 0 else 0
    
    # Build context about incorrect questions
    incorrect_topics = []
    for q in incorrect_questions[:5]:  # Limit to 5 for context
        incorrect_topics.append(q.get("question", ""))
    
    system_prompt = f"""You are an educational assistant analyzing quiz results.

Quiz Results:
- Score: {correct}/{total} ({percentage:.1f}%)
- Incorrect questions topics: {'; '.join(incorrect_topics) if incorrect_topics else 'None'}

Provide:
1. A brief encouraging analysis (2-3 sentences)
2. Specific topics to review based on wrong answers

Be constructive and helpful."""

    user_message = "Analyze these quiz results and provide feedback."
    
    try:
        analysis = await generate_llm_response(system_prompt, user_message)
        
        # Extract knowledge gaps (simplified)
        knowledge_gaps = []
        for q in incorrect_questions[:5]:
            # Extract key topic from question
            question_text = q.get("question", "")
            if len(question_text) > 50:
                question_text = question_text[:50] + "..."
            knowledge_gaps.append(question_text)
        
        return analysis, knowledge_gaps
        
    except Exception as e:
        # Fallback analysis
        if percentage >= 80:
            analysis = "Great job! You demonstrated strong understanding of the material."
        elif percentage >= 60:
            analysis = "Good effort! Review the topics below to strengthen your knowledge."
        else:
            analysis = "Keep practicing! Focus on the highlighted topics for improvement."
        
        return analysis, [q.get("question", "")[:50] for q in incorrect_questions[:3]]
