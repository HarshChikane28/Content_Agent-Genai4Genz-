ViralOS — AI Viral Content Generation System

ViralOS is a full-stack application that scrapes LinkedIn posts within a selected niche and generates high-performing LinkedIn content using Google Gemini.

The system runs locally and demonstrates a clean AI pipeline architecture: data collection, prompt construction, content generation, and structured response delivery.

This repository focuses on how the system works internally rather than presenting a hackathon-style demo.

Overview

The application consists of two layers:

Frontend (React + Vite)

Backend (FastAPI + Gemini API)

The backend is responsible for:

Collecting LinkedIn posts

Constructing AI prompts

Calling Gemini

Storing generated results

Returning structured responses

The frontend is responsible for:

Collecting user input

Triggering the pipeline

Displaying generated posts

High-Level Flow

The system follows a simple linear pipeline:

User selects a niche.

Backend retrieves LinkedIn posts for that niche.

Posts are summarized into a structured prompt.

Gemini generates three LinkedIn posts.

Generated posts are stored in SQLite.

Results are returned to the frontend.

There is only one AI call in the pipeline.

Project Structure
viral-content-system/
├── backend/
│   ├── main.py
│   ├── scraper.py
│   ├── gemini_agent.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   ├── index.html
│   └── package.json
└── README.md

Backend Architecture
main.py

This is the FastAPI entry point.

Responsibilities:

Defines API endpoints

Coordinates the scraping and AI generation process

Stores results in SQLite

Returns structured responses

Primary endpoint:

POST /api/run

When called, it:

Calls get_linkedin_posts() from scraper.py

Passes the posts to generate_viral_content() in gemini_agent.py

Saves generated content in SQLite

Returns both scraped and generated data

scraper.py

Handles data retrieval.

It supports two modes:

Mock data (default fallback)

Real LinkedIn scraping via Apify (if APIFY_TOKEN exists in .env)

The function:

get_linkedin_posts(niche, num_posts)


Returns normalized post objects with:

url

author

text

likes

comments

shares

This normalization ensures the AI layer always receives consistent structured input.

gemini_agent.py

Handles AI interaction.

The function:

generate_viral_content(niche, platform, posts)


Performs the following:

Extracts engagement signals from scraped posts.

Builds a structured prompt summarizing high-performing content.

Sends the request to Gemini 1.5 Flash using the official v1 endpoint.

Parses and returns generated content.

The API key is loaded from environment variables:

GEMINI_API_KEY=your_key_here


The key is sent through request headers using:

x-goog-api-key


Only one AI request is made per pipeline execution.

Database

SQLite is used for local persistence.

Table: generated_content

Columns:

id

created_at

niche

platform

content

No external database setup is required.

Frontend Architecture

The frontend is built using React and Vite.

Main components:

App.jsx — state management and pipeline trigger

RunForm.jsx — user input

GeneratedPosts.jsx — output display

LoadingScreen.jsx — async feedback

Header.jsx — layout

The frontend sends a POST request to:

http://localhost:8000/api/run


With payload:

{
  "niche": "growth and mindset",
  "platform": "LinkedIn",
  "num_posts": 5
}


The backend returns:

{
  "scraped_posts": [...],
  "generated_posts": [...],
  "run_id": 14
}


The UI renders the generated posts only.

Running the Application
Backend Setup
cd backend
python -m venv venv


Activate environment:

Mac/Linux:

source venv/bin/activate


Windows:

venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


Create .env file:

GEMINI_API_KEY=your_key_here


Start server:

uvicorn main:app --reload


Backend runs at:

http://localhost:8000

Frontend Setup

In a new terminal:

cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

API Endpoints

POST /api/run
Runs the scraping and generation pipeline.

GET /api/history
Returns previously generated posts.

DELETE /api/history
Clears stored results.

GET /docs
Interactive API documentation via Swagger.

Environment Variables

Required:

GEMINI_API_KEY=your_key_here


Optional:

APIFY_TOKEN=your_apify_token


If APIFY_TOKEN is not provided, the system falls back to mock data.

Design Decisions

FastAPI provides a lightweight, high-performance API layer.

SQLite keeps the system portable and easy to run locally.

Gemini 1.5 Flash balances speed and quality.

Mock mode allows offline demonstration.

AI logic is isolated in a dedicated module for easy replacement.

Extending the System

Potential improvements:

Structured JSON output from Gemini

Additional platforms (Twitter, Instagram)

Scheduled content generation

Replace SQLite with PostgreSQL

Add authentication middleware

Add export endpoint for CSV or Markdown
