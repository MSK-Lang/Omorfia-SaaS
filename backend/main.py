from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64

app = FastAPI()

# Enable CORS for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_pore_density(gray): 
    # Local thresholding to find small dark spots (pores) 
    # We increase the 'C' constant (last param) to reduce noise 
    thresh = cv2.adaptiveThreshold( 
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 11, 5 
    ) 
    
    pore_pixels = cv2.countNonZero(thresh) 
    total_pixels = gray.shape[0] * gray.shape[1] 
    
    # Scale it realistically: a "very porous" face is rarely > 15% of total pixels 
    # We normalize 0-15% of pixels to a 0-100 score 
    raw_ratio = (pore_pixels / total_pixels) * 100 
    normalized_score = min((raw_ratio / 15) * 100, 100) 
    
    return round(normalized_score, 1)

def calculate_redness(img): 
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB) 
    a_channel = lab[:,:,1] 
    # Higher values in 'a' channel = more redness/inflammation 
    redness_score = np.mean(a_channel) 
    # Normalized to percentage (127 is neutral in LAB 'a' channel)
    return round(((redness_score - 127) / 128) * 100, 2) 

def calculate_oiliness(gray): 
    _, specular = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY) 
    oil_pixels = cv2.countNonZero(specular) 
    return round((oil_pixels / (gray.shape[0] * gray.shape[1])) * 100, 2)

def analyze_skin_profile(img):
    # 1. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Apply CLAHE (Clinical Normalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    normalized = clahe.apply(gray)
    
    # 3. Calculate Laplacian Variance (Texture/Focus Score)
    # $$L(x,y) = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}$$
    laplacian_var = cv2.Laplacian(normalized, cv2.CV_64F).var()
    
    # 4. Specialized Determinstic Metrics
    pore_score = calculate_pore_density(normalized)
    redness_score = calculate_redness(img)
    oil_score = calculate_oiliness(normalized)
    
    return {
        "texture": round(laplacian_var, 2),
        "pores": pore_score,
        "redness": redness_score,
        "oiliness": oil_score,
        "luminance_stable": True if 50 < np.mean(normalized) < 200 else False
    }

@app.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run the "Elite" Math
    results = analyze_skin_profile(img)
    
    return {
        "status": "success",
        "data": results,
        "timestamp": "2026-04-12T12:20:00Z"
    }