from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

# This is the ONLY import that matters for the logic
from engine.inference_engine import process_scan 

app = FastAPI()

# Standard Clinical CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    try:
        # 1. Read the bytes
        contents = await file.read()
        
        # 2. Hand the bytes to the FORTRESS BRAIN
        # This function now handles everything: Validation, Maps, and CV Math
        result = process_scan(contents)
        
        # 3. Check if the Brain reported an error
        if result.get("status") == "failed":
            return {"status": "error", "message": result.get("reason")}

        # 4. Return the full clinical payload
        return result

    except Exception as e:
        print(f"🚀 [CRITICAL ERROR]: {str(e)}")
        raise HTTPException(status_code=500, detail="Inference Engine Failure")

# Manual start for debugging
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)