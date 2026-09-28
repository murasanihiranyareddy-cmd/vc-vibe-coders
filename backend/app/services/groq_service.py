import json
import logging
import re
from typing import Dict, Any, List, Optional
from ..config import settings
from ..models.schemas import StructuredMeetingData, ActionItemExtracted

logger = logging.getLogger("vc.groq")

class GroqService:
    """
    Service for meeting structuring and text extraction via Groq LLM API.
    Falls back gracefully to intelligent local rule-based extractor when GROQ_API_KEY is not configured.
    """
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL

    async def structure_meeting(self, title: str, transcript: str, participants: List[str]) -> Dict[str, Any]:
        """
        Structure raw meeting notes/transcript into summary, decisions, action items, and questions.
        """
        if settings.is_groq_configured:
            try:
                from groq import AsyncGroq
                client = AsyncGroq(api_key=self.api_key)
                
                system_prompt = (
                    "You are VC (Vibe Coders) AI Meeting Structurer. "
                    "Analyze the provided meeting notes or transcript and return a strictly valid JSON object with the following schema:\n"
                    "{\n"
                    '  "summary": "Concise high-level summary of the meeting",\n'
                    '  "decisions": ["Decision 1", "Decision 2"],\n'
                    '  "action_items": [\n'
                    '    {"title": "Task title", "assignee": "Name of owner if mentioned or null", "due_date": null, "priority": "high|medium|low"}\n'
                    '  ],\n'
                    '  "unresolved_questions": ["Question 1"],\n'
                    '  "tags": ["tag1", "tag2"]\n'
                    "}\n"
                    "Do NOT include any markdown fences or explanation outside the JSON object."
                )

                user_prompt = f"Meeting Title: {title}\nParticipants: {', '.join(participants) if participants else 'Not specified'}\n\nTranscript / Notes:\n{transcript}"

                response = await client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    model=self.model,
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )

                content = response.choices[0].message.content
                data = json.loads(content)
                
                # Validate with Pydantic
                structured = StructuredMeetingData(
                    summary=data.get("summary", "Summary extracted by Groq."),
                    decisions=data.get("decisions", []),
                    action_items=[
                        ActionItemExtracted(
                            title=item.get("title", ""),
                            assignee=item.get("assignee"),
                            due_date=item.get("due_date"),
                            priority=item.get("priority", "medium")
                        ) for item in data.get("action_items", [])
                    ],
                    unresolved_questions=data.get("unresolved_questions", []),
                    tags=data.get("tags", ["meeting", "ai_extracted"])
                )
                return {
                    "success": True,
                    "is_live_groq": True,
                    "data": structured
                }
            except Exception as e:
                logger.error(f"Groq meeting structuring error: {str(e)}")
                # Fall back to local extractor
                return self._local_rule_extractor(title, transcript, participants, error=str(e))
        else:
            return self._local_rule_extractor(title, transcript, participants)

    def _local_rule_extractor(
        self,
        title: str,
        transcript: str,
        participants: List[str],
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """Intelligent rule-based parser for offline / unconfigured demo mode."""
        lines = [line.strip() for line in transcript.split("\n") if line.strip()]
        
        decisions = []
        action_items = []
        questions = []
        summary_sentences = []

        known_participants = participants or ["Aisha Patel", "Rahul Sharma", "Kiran Rao", "Demo User"]

        for line in lines:
            lower = line.lower()
            # Check for decisions
            if any(k in lower for k in ["decided", "decision:", "agreed", "selected", "chose", "will use", "settled on"]):
                decisions.append(line.lstrip("-*#•123456789. "))
            # Check for questions
            elif any(k in lower for k in ["?", "blocker", "unresolved", "question:", "need to check", "tbd"]):
                questions.append(line.lstrip("-*#•123456789. "))
            # Check for action items / tasks
            elif any(k in lower for k in ["will ", "take ", "handle ", "assigned", "todo:", "action:", "i'll ", "needs to"]):
                # Detect assignee
                assigned_to = None
                for p in known_participants:
                    if p.lower() in lower or p.split()[0].lower() in lower:
                        assigned_to = p
                        break
                
                clean_title = line.lstrip("-*#•123456789. ")
                priority = "high" if any(x in lower for x in ["urgent", "critical", "blocker", "today"]) else "medium"
                
                action_items.append(ActionItemExtracted(
                    title=clean_title,
                    assignee=assigned_to,
                    due_date=None,
                    priority=priority
                ))
            else:
                summary_sentences.append(line)

        # Build clean summary
        if summary_sentences:
            summary = " ".join(summary_sentences[:3])
        else:
            summary = f"Team alignment on {title} with {len(decisions)} decision(s) and {len(action_items)} action item(s)."

        # Sensible defaults if empty
        if not decisions and not action_items:
            action_items.append(ActionItemExtracted(
                title=f"Follow up on {title}",
                assignee=participants[0] if participants else "Aisha Patel",
                priority="medium"
            ))

        structured = StructuredMeetingData(
            summary=summary,
            decisions=decisions,
            action_items=action_items,
            unresolved_questions=questions,
            tags=["meeting", "notes", "extracted"]
        )

        return {
            "success": True,
            "is_live_groq": False,
            "demo_mode": True,
            "note": "Processed using local meeting structuring engine (Groq API key not provided)" if not error else f"Groq fallback: {error}",
            "data": structured
        }

groq_service = GroqService()
