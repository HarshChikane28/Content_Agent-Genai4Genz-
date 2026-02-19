"""
Gemini AI Agent for Viral Content System
- analyze_sentiment: scores a post's comments for sentiment & insights
- generate_viral_content: creates new viral LinkedIn posts based on analysis
"""

import os
import json
import re
from typing import List, Optional
import google.generativeai as genai

_gemini_configured = False


def _configure_gemini():
    global _gemini_configured
    if _gemini_configured:
        return
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY not set. Add it to your .env file.\n"
            "Get a free key at: https://aistudio.google.com/app/apikey"
        )
    genai.configure(api_key=api_key)
    _gemini_configured = True


def _parse_json_from_response(text: str) -> dict:
    """Robustly extract JSON from Gemini response text."""
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()

    # Find the first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Try parsing the whole thing
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


def analyze_sentiment(post: dict, platform: str = "LinkedIn") -> dict:
    """
    Use Gemini to analyze the sentiment and extract insights from a post.
    Returns a dict with: overall_sentiment, tool_usefulness, common_questions, key_insights
    """
    try:
        _configure_gemini()
    except EnvironmentError:
        return _mock_sentiment_analysis(post)

    post_text = post.get("text", "")
    comments = post.get("comments_text", [])
    comments_block = "\n".join(f"- {c}" for c in comments) if comments else "No comments available."

    prompt = f"""You are a viral content analyst specializing in {platform} growth strategy.

Analyze this {platform} post and its comments, then return a JSON object with exactly these fields:

{{
  "overall_sentiment": <integer 1-5, where 1=very negative, 5=very positive>,
  "tool_usefulness": <integer 1-5, how useful/actionable the content is perceived>,
  "common_questions": ["question 1", "question 2", "question 3"],
  "key_insights": "<2-3 sentence summary of what resonates with the audience and why this post performed>"
}}

POST CONTENT:
{post_text}

COMMENTS FROM AUDIENCE:
{comments_block}

POST METRICS:
- Likes: {post.get('likes', 0)}
- Comments: {post.get('comments', 0)}
- Shares: {post.get('shares', 0)}

Rules:
- Scores must be integers (not decimals)
- common_questions must be real questions the audience is asking or would ask
- key_insights must explain WHY this content resonated
- Return ONLY valid JSON, no preamble or explanation
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        result = _parse_json_from_response(response.text)

        # Validate and sanitize
        result["overall_sentiment"] = int(result.get("overall_sentiment", 3))
        result["tool_usefulness"] = int(result.get("tool_usefulness", 3))
        result["common_questions"] = result.get("common_questions", [])
        result["key_insights"] = result.get("key_insights", "")

        return result

    except Exception as e:
        print(f"[Gemini] Sentiment analysis error: {e}")
        return _mock_sentiment_analysis(post)


def generate_viral_content(niche: str, platform: str, analyses: List[dict]) -> List[dict]:
    """
    Use Gemini to generate 3 viral LinkedIn posts based on the analyzed data.
    Returns a list of post dicts with: hook, body, cta, hashtags, viral_score, tone
    """
    try:
        _configure_gemini()
    except EnvironmentError:
        return _mock_generated_content(niche, platform)

    # Build a summary of what worked
    insights_summary = []
    for a in analyses:
        if a.get("key_insights"):
            insights_summary.append(f"- {a['key_insights']}")

    top_posts = sorted(analyses, key=lambda x: x.get("likes", 0), reverse=True)[:3]
    top_posts_text = "\n\n".join([
        f"POST (Likes: {p.get('likes', 0)}, Shares: {p.get('shares', 0)}):\n{p.get('text', '')[:400]}"
        for p in top_posts
    ])

    prompt = f"""You are a world-class {platform} content strategist. Your job is to create viral {platform} posts.

NICHE: {niche}
PLATFORM: {platform}

WHAT RESONATED WITH THIS AUDIENCE (from analysis of top posts):
{chr(10).join(insights_summary) if insights_summary else "Focus on practical, data-driven, authentic content."}

TOP PERFORMING POSTS FOR REFERENCE:
{top_posts_text}

Generate exactly 3 viral {platform} posts in different tones. Return a JSON array with exactly this structure:

[
  {{
    "hook": "<first 1-2 lines — must be a scroll-stopping opener>",
    "body": "<the main content — use line breaks, numbered lists or bullet points where appropriate>",
    "cta": "<a compelling call to action or closing question>",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "viral_score": <integer 7-10 predicting virality>,
    "tone": "<one of: Bold, Vulnerable, Data-Driven, Contrarian, Storytelling>"
  }},
  ...
]

Rules:
- Each post must be complete and ready to publish
- Hooks must be direct and provocative (no fluff intros)
- Body should feel like a real expert sharing hard-won knowledge
- Vary the tone across the 3 posts
- viral_score must be an integer
- hashtags should be 3-5 relevant tags without # symbol
- Return ONLY valid JSON array, no preamble
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text

        # Strip markdown fences
        text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()

        # Find JSON array
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            posts = json.loads(match.group())
        else:
            posts = json.loads(text)

        # Validate each post
        validated = []
        for p in posts:
            validated.append({
                "hook": p.get("hook", ""),
                "body": p.get("body", ""),
                "cta": p.get("cta", ""),
                "hashtags": p.get("hashtags", []),
                "viral_score": int(p.get("viral_score", 7)),
                "tone": p.get("tone", "Bold"),
                "platform": platform,
                "niche": niche
            })

        return validated

    except Exception as e:
        print(f"[Gemini] Content generation error: {e}")
        return _mock_generated_content(niche, platform)


# ─── MOCK FALLBACKS (when no API key is present) ──────────────────────────────

def _mock_sentiment_analysis(post: dict) -> dict:
    """Return plausible mock sentiment when Gemini isn't available."""
    likes = post.get("likes", 0)
    score = 5 if likes > 10000 else (4 if likes > 5000 else (3 if likes > 1000 else 2))
    return {
        "overall_sentiment": score,
        "tool_usefulness": min(5, score),
        "common_questions": [
            "What tools do you recommend for this?",
            "How long did this take to implement?",
            "Can you share more details about your process?"
        ],
        "key_insights": (
            "This post resonated because it combined personal experience with actionable takeaways. "
            "The specific numbers and honest tone built credibility, while the format made it easy to skim and share."
        )
    }


def _mock_generated_content(niche: str, platform: str) -> List[dict]:
    """Return mock generated posts when Gemini isn't available."""
    return [
        {
            "hook": f"I spent 6 months studying every viral {niche} post on {platform}.\n\nHere's the pattern nobody talks about:",
            "body": (
                "Most people focus on what to say.\n"
                "The top 1% focus on when to say it.\n\n"
                "→ Post between 7-9am or 5-7pm on weekdays\n"
                "→ Tuesday and Wednesday outperform all other days\n"
                "→ Your first comment sets the tone for the algorithm\n"
                "→ Replies in the first 60 minutes are worth 3x\n\n"
                "The content is the price of entry.\n"
                "The timing is the multiplier."
            ),
            "cta": "What's been your best posting time? Drop it below 👇",
            "hashtags": [niche.replace(" ", ""), "LinkedIn", "ContentStrategy", "GrowthHacking"],
            "viral_score": 8,
            "tone": "Data-Driven",
            "platform": platform,
            "niche": niche
        },
        {
            "hook": f"I was completely wrong about {niche}.\n\nIt took a failure to see it.",
            "body": (
                "For 2 years, I optimized for impressions.\n\n"
                "I hit 100K views on a post.\n"
                "Zero inbound leads.\n"
                "Zero conversations.\n"
                "Zero revenue.\n\n"
                "Then I wrote one post for 200 people in my exact niche.\n\n"
                "11 DMs in 24 hours.\n"
                "3 became clients.\n\n"
                "The lesson?\n"
                "Viral ≠ valuable.\n"
                "Resonant > Reach."
            ),
            "cta": "Are you chasing the right metric?",
            "hashtags": [niche.replace(" ", ""), "B2B", "ContentMarketing", "LinkedInTips"],
            "viral_score": 9,
            "tone": "Vulnerable",
            "platform": platform,
            "niche": niche
        },
        {
            "hook": f"The {niche} playbook is broken.\n\nHere's what replaced it in 2024:",
            "body": (
                "Old playbook:\n"
                "→ Post daily\n"
                "→ Broad topics\n"
                "→ Polish everything\n"
                "→ Never share failures\n\n"
                "New playbook:\n"
                "→ Post 3x/week with intent\n"
                "→ Hyper-specific audience\n"
                "→ Raw > Perfect\n"
                "→ Failures drive 10x more engagement\n\n"
                "The algorithm didn't change.\n"
                "The audience did.\n"
                "They can smell inauthenticity from 3 scrolls away."
            ),
            "cta": "Which old habit are you still holding onto?",
            "hashtags": [niche.replace(" ", ""), "PersonalBranding", "LinkedIn", "ThoughtLeadership"],
            "viral_score": 8,
            "tone": "Contrarian",
            "platform": platform,
            "niche": niche
        }
    ]
