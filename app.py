import os
import torch
import faiss
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from PIL import Image
import clip
from pathlib import Path
from tqdm import tqdm

app = FastAPI(title="Image Search API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)
index = None
filenames = []
original_paths = []

class SearchQuery(BaseModel):
    text: str
    num_results: int = 15

def initialize_index(image_folder: str = "images"):
    global index, filenames, original_paths
    
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png']:
        image_files.extend(list(Path(image_folder).glob(ext)))
    
    if not image_files:
        raise Exception(f"No images found in {image_folder}")
    
    print(f"Found {len(image_files)} images to process")
    
    embedding_dim = 512
    index = faiss.IndexFlatIP(embedding_dim)
    
    with torch.no_grad():
        for img_path in tqdm(image_files, desc="Processing images", unit="img"):
            try:
                image = preprocess(Image.open(img_path)).unsqueeze(0).to(device)
                image_features = model.encode_image(image)
                image_features /= image_features.norm(dim=-1, keepdim=True)
                index.add(image_features.cpu().numpy())
                original_paths.append(img_path)
                filenames.append(img_path.stem)
            except Exception as e:
                print(f"\nError processing {img_path}: {e}")
    
    print(f"\nSuccessfully indexed {len(filenames)} images")

@app.on_event("startup")
async def startup_event():
    try:
        initialize_index()
    except Exception as e:
        print(f"Error initializing index: {e}")

@app.post("/search", response_model=List[str])
async def search_images(query: SearchQuery):
    if index is None or not filenames:
        raise HTTPException(status_code=500, detail="Image index not initialized")
    
    with torch.no_grad():
        text_features = model.encode_text(clip.tokenize(query.text).to(device))
        text_features /= text_features.norm(dim=-1, keepdim=True)
    
    k = min(query.num_results, len(filenames))
    distances, indices = index.search(text_features.cpu().numpy(), k)
    
    return [filenames[idx] for idx in indices[0]]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5510)