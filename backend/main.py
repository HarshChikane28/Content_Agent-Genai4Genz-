from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import os
import json
import datetime
from scraper import get_linkedin_posts
from gemini_agent import analyze_sentiment, generate_viral_content

app = FastAPI(title="Viral Content System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "viral_content.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT,
            niche TEXT,
            platform TEXT,
            post_url TEXT,
            post_text TEXT,
            author TEXT,
            likes INTEGER,
            comments INTEGER,
            shares INTEGER,
            overall_sentiment INTEGER,
            tool_usefulness INTEGER,
            common_questions TEXT,
            key_insights TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS generated_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT,
            niche TEXT,
            platform TEXT,
            hook TEXT,
            body TEXT,
            cta TEXT,
            hashtags TEXT,
            viral_score INTEGER,
            tone TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()


class RunRequest(BaseModel):
    niche: str
    platform: str = "LinkedIn"
    keywords: Optional[List[str]] = []
    use_mock: bool = True
    apify_token: Optional[str] = None
    num_posts: int = 5


class RunResponse(BaseModel):
    success: bool
    message: str
    analyses: list
    generated_posts: list
    run_id: int


@app.get("/")
def root():
    return {"status": "Viral Content System is running 🚀"}


@app.post("/api/run", response_model=RunResponse)
async def run_pipeline(req: RunRequest):
    try:
        # Step 1: Scrape posts
        posts = get_linkedin_posts(
            niche=req.niche,
            keywords=req.keywords,
            num_posts=req.num_posts,
            use_mock=req.use_mock,
            apify_token=req.apify_token
        )

        if not posts:
            raise HTTPException(status_code=400, detail="No posts found for the given inputs.")

        analyses = []
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        now = datetime.datetime.utcnow().isoformat()

        # Step 2: Sentiment analysis per post
        for post in posts:
            analysis = analyze_sentiment(post, req.platform)

            c.execute("""
                INSERT INTO analyses
                (created_at, niche, platform, post_url, post_text, author, likes, comments, shares,
                 overall_sentiment, tool_usefulness, common_questions, key_insights)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                now, req.niche, req.platform,
                post.get("url", ""),
                post.get("text", ""),
                post.get("author", ""),
                post.get("likes", 0),
                post.get("comments", 0),
                post.get("shares", 0),
                analysis.get("overall_sentiment", 3),
                analysis.get("tool_usefulness", 3),
                json.dumps(analysis.get("common_questions", [])),
                analysis.get("key_insights", "")
            ))
            conn.commit()
            analyses.append({**post, **analysis})

        # Step 3: Generate viral content
        generated_posts = generate_viral_content(
            niche=req.niche,
            platform=req.platform,
            analyses=analyses
        )

        run_id = 0
        for gp in generated_posts:
            c.execute("""
                INSERT INTO generated_content
                (created_at, niche, platform, hook, body, cta, hashtags, viral_score, tone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                now, req.niche, req.platform,
                gp.get("hook", ""),
                gp.get("body", ""),
                gp.get("cta", ""),
                json.dumps(gp.get("hashtags", [])),
                gp.get("viral_score", 7),
                gp.get("tone", "")
            ))
            conn.commit()
            run_id = c.lastrowid

        conn.close()

        return RunResponse(
            success=True,
            message=f"Pipeline completed. Analysed {len(analyses)} posts, generated {len(generated_posts)} viral posts.",
            analyses=analyses,
            generated_posts=generated_posts,
            run_id=run_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT * FROM analyses ORDER BY created_at DESC LIMIT 50")
    analyses = [dict(row) for row in c.fetchall()]

    c.execute("SELECT * FROM generated_content ORDER BY created_at DESC LIMIT 20")
    generated = [dict(row) for row in c.fetchall()]

    conn.close()
    return {"analyses": analyses, "generated": generated}


@app.delete("/api/history")
def clear_history():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM analyses")
    c.execute("DELETE FROM generated_content")
    conn.commit()
    conn.close()
    return {"success": True, "message": "History cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
