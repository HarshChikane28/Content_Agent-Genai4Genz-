# ⚡ ViralOS — AI Viral Content System

A web app that scrapes top LinkedIn posts, runs sentiment analysis via **Google Gemini**, and generates 3 viral posts tailored to your niche.

Built for hackathon. Runs fully locally. Zero paid dependencies required in mock mode.

---

## 🗂 Project Structure

```
viral-content-system/
├── backend/
│   ├── main.py          # FastAPI app + pipeline orchestration
│   ├── gemini_agent.py  # Gemini AI: sentiment analysis + content generation
│   ├── scraper.py       # Mock data + optional Apify LinkedIn scraper
│   ├── requirements.txt
│   └── .env.example     # Copy to .env and fill in your keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── RunForm.jsx
│   │       ├── LoadingScreen.jsx
│   │       ├── GeneratedPosts.jsx
│   │       └── AnalysisResults.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

---

### Step 1 — Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
```

Now open `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

> 🔑 **Get a FREE Gemini API key** at: https://aistudio.google.com/app/apikey
> The free tier is more than enough for a hackathon demo.

```bash
# Start the backend
python main.py
# → Running at http://localhost:8000
# → API docs at http://localhost:8000/docs
```

---

### Step 2 — Frontend Setup

Open a **new terminal tab**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running at http://localhost:5173
```

---

### Step 3 — Open the App

Visit **http://localhost:5173** in your browser.

---

## 🧪 Running Without a Gemini Key

The app works fully in **mock mode** without any API keys:
- Select **Mock Data** as the data source (default)
- The pipeline will use realistic pre-built LinkedIn post samples
- Sentiment analysis and content generation fall back to smart mock responses

This lets you demo the full UI flow at a hackathon without any setup.

---

## 🔄 Pipeline Flow

```
User Input (niche + keywords)
    ↓
[Scraper] LinkedIn posts (mock OR Apify)
    ↓
[Gemini] Sentiment analysis per post
  - overall_sentiment (1-5)
  - tool_usefulness (1-5)
  - common_questions
  - key_insights
    ↓
[Gemini] Generate 3 viral posts
  - Bold / Vulnerable / Data-Driven / Contrarian / Storytelling
  - Hook + Body + CTA + Hashtags + Viral Score
    ↓
[SQLite] Save results locally
    ↓
[Frontend] Display results dashboard
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/run` | Run the full pipeline |
| GET  | `/api/history` | Get past analyses + generated posts |
| DELETE | `/api/history` | Clear local history |
| GET  | `/docs` | Interactive API docs (Swagger) |

### POST `/api/run` payload:
```json
{
  "niche": "B2B SaaS",
  "platform": "LinkedIn",
  "keywords": ["viral content", "thought leadership"],
  "num_posts": 5,
  "use_mock": true,
  "apify_token": null
}
```

---

## 🔌 Optional: Real LinkedIn Scraping with Apify

1. Sign up at https://apify.com (free tier available)
2. Copy your API token from Settings → Integrations
3. Add to `.env`: `APIFY_TOKEN=apify_api_xxxx`
4. In the UI, switch Data Source to **Real Apify Scraper** and paste your token

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Pure CSS (no Tailwind needed) |
| Backend | FastAPI (Python) |
| AI Agent | Google Gemini 1.5 Flash |
| Database | SQLite (local file, zero config) |
| Scraping | Mock data + optional Apify |

---

## 🧩 Extending for the Hackathon

Some quick wins to add features:
- **More platforms**: Add Twitter/Instagram scrapers in `scraper.py`
- **Scheduled runs**: Use `APScheduler` in `main.py`
- **Export**: Add a `/api/export` endpoint that returns CSV
- **Auth**: Add simple API key check in FastAPI middleware

---

## 📝 License
MIT — use freely for your hackathon!
