"""
Scraper module for Viral Content System
- Mock mode: returns realistic sample LinkedIn posts (default, no API key needed)
- Apify mode: calls real Apify LinkedIn scraper (requires token)
"""

import random
import requests
from typing import List, Optional


# ─── MOCK DATA ────────────────────────────────────────────────────────────────

MOCK_LINKEDIN_POSTS = [
    {
        "url": "https://linkedin.com/posts/mock-001",
        "author": "Sarah Chen",
        "author_title": "Head of Product @ TechCorp",
        "text": "I've been using AI tools for content creation for 6 months now. Here's what actually worked vs what was overhyped:\n\n✅ Draft generation: saved me 3 hrs/week\n✅ Repurposing long-form into posts: game changer\n❌ Auto-publishing: lost my authentic voice\n❌ Comment replies: felt robotic\n\nThe key insight: AI as a first draft, human as the final voice.",
        "likes": 4821,
        "comments": 312,
        "shares": 189,
        "comments_text": [
            "This is exactly my experience too! AI drafts are great starting points.",
            "What tools do you use for repurposing?",
            "The auto-publishing point is so true - my engagement dropped 40%",
            "Saving this post. Thanks for being honest about the failures too.",
            "Can you share more about your workflow?",
        ]
    },
    {
        "url": "https://linkedin.com/posts/mock-002",
        "author": "Marcus Williams",
        "author_title": "Founder, GrowthOS",
        "text": "Most LinkedIn advice is wrong.\n\nEveryone says:\n→ Post every day\n→ Use hooks\n→ Add hashtags\n→ Engage in comments\n\nWhat actually grew my audience from 0 to 28K in 8 months:\n→ Posted 3x/week, not 7\n→ Led with data, not opinions\n→ One clear idea per post\n→ Replied to EVERY comment in first hour\n\nConsistency > Volume. Always.",
        "likes": 9302,
        "comments": 541,
        "shares": 782,
        "comments_text": [
            "The reply in the first hour is a huge algo signal.",
            "I tried posting daily and burned out in 3 weeks.",
            "28K in 8 months is incredible. What niche are you in?",
            "The 'one clear idea per post' tip is underrated.",
            "This is the most practical growth advice I've seen.",
            "Saving this. Quality > quantity is real.",
        ]
    },
    {
        "url": "https://linkedin.com/posts/mock-003",
        "author": "Priya Nair",
        "author_title": "B2B Content Strategist",
        "text": "Your LinkedIn hook is your whole strategy.\n\nI analyzed 200 viral posts (1000+ reactions) and found 5 patterns:\n\n1. Counterintuitive statement → 'Cold outreach is dead. Here's what replaced it.'\n2. Specific number → 'I made $340K from 1 LinkedIn post. Here's how.'\n3. Personal failure → 'I wasted 2 years on the wrong content strategy.'\n4. Bold prediction → 'LinkedIn will kill newsletters in 2025.'\n5. Before/after → 'My profile got 3 views/week. Now it gets 30,000.'\n\nWhich one fits your brand?",
        "likes": 7109,
        "comments": 428,
        "shares": 601,
        "comments_text": [
            "The specific number pattern is the most powerful in my experience.",
            "I've been using counterintuitive statements and seeing 3x more impressions.",
            "Can you share the full spreadsheet of posts you analyzed?",
            "Number 3 feels the most authentic to me.",
            "This is content strategy gold. Bookmarked.",
        ]
    },
    {
        "url": "https://linkedin.com/posts/mock-004",
        "author": "David Kim",
        "author_title": "VP Marketing, ScaleAI",
        "text": "I fired our content agency and hired a 22-year-old instead.\n\nResults after 90 days:\n→ Impressions: +340%\n→ Followers: +12K\n→ Inbound leads: 47 new conversations\n→ Cost: 60% less\n\nWhat she does differently:\n• She lives on the platform\n• She understands native formats\n• She tests fast and kills losers\n• She doesn't overthink it\n\nThe best content creators aren't in agencies. They're individual creators who grew their own audiences.",
        "likes": 11234,
        "comments": 893,
        "shares": 1102,
        "comments_text": [
            "This is the future of marketing. Creators > agencies.",
            "What was her background? Self-taught or formal education?",
            "Bold move. Most executives are too risk-averse to do this.",
            "The 'tests fast and kills losers' point is key.",
            "I had the exact same experience. Agencies are stuck in 2015.",
            "Can you share her LinkedIn? Would love to follow her work.",
            "This is brave to post but I completely agree.",
        ]
    },
    {
        "url": "https://linkedin.com/posts/mock-005",
        "author": "Aisha Thompson",
        "author_title": "Career Coach | 50K+ Followers",
        "text": "Nobody talks about LinkedIn burnout.\n\nI grew from 0 to 50K followers in 18 months.\n\nAt month 14, I stopped posting for 6 weeks.\n\nNot because I ran out of ideas.\nNot because I was busy.\n\nBecause I forgot WHY I was posting.\n\nThe algorithm rewards volume.\nYour soul rewards meaning.\n\nFind your 'why' before you find your strategy.",
        "likes": 15823,
        "comments": 1204,
        "shares": 2341,
        "comments_text": [
            "This hit different. Taking a break this week.",
            "Thank you for being vulnerable about this.",
            "The algorithm vs soul tension is real.",
            "I'm at month 10 and already feeling this.",
            "The most important post you've written.",
            "Bookmarking this for when I feel the pressure.",
        ]
    },
]


def get_linkedin_posts(
    niche: str,
    keywords: Optional[List[str]] = None,
    num_posts: int = 5,
    use_mock: bool = True,
    apify_token: Optional[str] = None
) -> List[dict]:
    """
    Fetch LinkedIn posts either from mock data or Apify.
    Falls back to mock if Apify fails.
    """
    if not use_mock and apify_token:
        try:
            return _fetch_apify_linkedin(keywords or [niche], num_posts, apify_token)
        except Exception as e:
            print(f"[Apify] Failed: {e}. Falling back to mock data.")

    return _get_mock_posts(niche, num_posts)


def _get_mock_posts(niche: str, num_posts: int) -> List[dict]:
    """Return shuffled mock posts, optionally filtered by niche keywords."""
    posts = MOCK_LINKEDIN_POSTS.copy()
    random.shuffle(posts)
    selected = posts[:min(num_posts, len(posts))]

    # Tag each post with niche for context
    for post in selected:
        post["niche"] = niche
        post["source"] = "mock"

    return selected


def _fetch_apify_linkedin(
    keywords: List[str],
    num_posts: int,
    apify_token: str
) -> List[dict]:
    """
    Call Apify's LinkedIn Posts Scraper actor.
    Actor ID: apify/linkedin-post-search-scraper
    """
    actor_id = "apify~linkedin-post-search-scraper"
    run_url = f"https://api.apify.com/v2/acts/{actor_id}/run-sync-get-dataset-items"

    payload = {
        "queries": keywords,
        "maxResults": num_posts,
        "proxy": {"useApifyProxy": True}
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {apify_token}"
    }

    response = requests.post(
        run_url,
        json=payload,
        headers=headers,
        timeout=60
    )
    response.raise_for_status()

    raw_posts = response.json()
    normalized = []

    for p in raw_posts:
        normalized.append({
            "url": p.get("url") or p.get("postUrl", ""),
            "author": p.get("authorName") or p.get("author", {}).get("name", "Unknown"),
            "author_title": p.get("authorTitle", ""),
            "text": p.get("text") or p.get("content", ""),
            "likes": p.get("likesCount") or p.get("likes", 0),
            "comments": p.get("commentsCount") or p.get("comments", 0),
            "shares": p.get("sharesCount") or p.get("shares", 0),
            "comments_text": p.get("topComments", []),
            "source": "apify"
        })

    return normalized
