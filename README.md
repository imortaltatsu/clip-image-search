# CLIP Image Search

A modern image search application that uses OpenAI's CLIP model for semantic image search. Built with FastAPI backend and React frontend.

## Features

- 🔍 Semantic image search using CLIP embeddings
- ⚡ Fast search with FAISS similarity index
- 🎨 Modern, responsive UI with grid layout
- 🌓 Dark mode support
- 📱 Mobile-friendly design

## Setup

### Backend
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd search-frontend
npm install
npm run dev
```