import cv2
import numpy as np
import uuid
import base64
from datetime import datetime
from typing import Dict, Any, Tuple, List, Optional

HAS_MEDIAPIPE = False
face_mesh_engine = None

try:
    # 1. We bypass the main 'mp' alias and go straight to the source file
    import mediapipe.python.solutions.face_mesh as mp_face_mesh
    import mediapipe.python.solutions.drawing_utils as mp_drawing
    
    # 2. Initialize the engine using the direct class
    face_mesh_engine = mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    )
    HAS_MEDIAPIPE = True
    print("✅ [Omorfia] Legacy Solutions Found. Brain Online.")
    
except ImportError:
    try:
        # 3. Fallback for the newest 2026 'Tasks' structure
        from mediapipe.tasks import python as mp_tasks
        from mediapipe.tasks.python import vision
        # (This is the 'Plan B' if the above fails)
        print("⚠️ [Omorfia] Using MediaPipe Tasks API.")
        HAS_MEDIAPIPE = True
    except Exception as e:
        print(f"❌ [Omorfia] All MediaPipe paths failed: {e}")
        HAS_MEDIAPIPE = False
except (ImportError, AttributeError):
    # Fallback to tasks API or disable validation if solutions is missing
    HAS_MEDIAPIPE = False
    face_mesh_engine = None

def calculate_sharpness(img: np.ndarray) -> float:
    """Calculates the sharpness score using Laplacian Variance."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def validate_face(img: np.ndarray) -> Tuple[bool, str, Any, bool]:
    """
    Validates face centering, distance (width), and tilt using MediaPipe.
    Returns (is_valid, reason, landmarks, reliability).
    """
    if not HAS_MEDIAPIPE or face_mesh_engine is None:
        # If MediaPipe is not fully functional, we log it and proceed with a warning/default
        # For this logic block, we'll simulate success to allow the rest of the engine to run
        print("[Omorfia] WARNING: MediaPipe Solutions not available. Skipping deep face validation.")
        return True, "SUCCESS_FALLBACK", None, False

    results = face_mesh_engine.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    
    if not results.multi_face_landmarks:
        return False, "NO_FACE_DETECTED", None, True
    
    landmarks = results.multi_face_landmarks[0].landmark
    h, w, _ = img.shape
    
    # 1. Centering Check (Nose tip: landmark 1)
    nose = landmarks[1]
    if not (0.35 <= nose.x <= 0.65 and 0.35 <= nose.y <= 0.65):
        return False, "FACE_NOT_CENTERED", None
    
    # 2. Distance Check (Face width: landmarks 234 to 454)
    # Using normalized coordinates for width
    face_width = abs(landmarks[454].x - landmarks[234].x)
    if face_width < 0.45: # Min 45% of image width
        return False, "FACE_TOO_FAR", None
    
    # 3. Tilt Check (Eye corners: 33 and 263)
    p1 = (landmarks[33].x * w, landmarks[33].y * h)
    p2 = (landmarks[263].x * w, landmarks[263].y * h)
    angle = np.degrees(np.arctan2(p2[1] - p1[1], p2[0] - p1[0]))
    if abs(angle) > 10:
        return False, "TILT_DETECTED", None, True
    
    return True, "SUCCESS", landmarks, True

def enhance_texture(img: np.ndarray) -> np.ndarray:
    """Applies CLAHE to enhance skin features for analysis."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    enhanced_lab = cv2.merge((l_enhanced, a, b))
    return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

def calculate_skin_age(metrics: Dict[str, float], base_age: int = 25) -> int:
    """Adapts clinical logic to calculate biological skin age."""
    age = float(base_age)
    if metrics["uv_damage"] > 30:
        age += ((metrics["uv_damage"] - 30) / 10.0) * 0.5
    if metrics["pore_density"] > 40:
        age += ((metrics["pore_density"] - 40) / 10.0) * 0.3
    if metrics["redness"] > 50:
        age += ((metrics["redness"] - 50) / 10.0) * 0.2
    
    texture_deficiency = 100.0 - metrics["texture"]
    if texture_deficiency > 40:
        age += ((texture_deficiency - 40) / 10.0) * 0.1
    
    # Safety Clamp
    return int(max(18, min(age, float(base_age) + 15)))

def get_skin_mask(img: np.ndarray, landmarks, w: int, h: int) -> np.ndarray:
    """Generates a skin-only mask excluding eyes, eyebrows, and lips."""
    mask = np.zeros((h, w), dtype=np.uint8)
    
    if not HAS_MEDIAPIPE or not landmarks:
        # Fallback: Return a central ellipse as a generic face area
        cv2.ellipse(mask, (w // 2, h // 2), (int(w * 0.35), int(h * 0.45)), 0, 0, 360, 255, -1)
        return mask

    # 1. Face Oval
    face_oval_indices = [pt[0] for pt in mp_face_mesh.FACEMESH_FACE_OVAL]
    face_oval_points = np.array([[(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in face_oval_indices]])
    if len(face_oval_points[0]) > 0:
        hull = cv2.convexHull(face_oval_points[0])
        cv2.fillConvexPoly(mask, hull, 255)

    # 2. Exclude Eyes, Eyebrows, Lips
    exclude_features = [
        mp_face_mesh.FACEMESH_LEFT_EYE,
        mp_face_mesh.FACEMESH_RIGHT_EYE,
        mp_face_mesh.FACEMESH_LEFT_EYEBROW,
        mp_face_mesh.FACEMESH_RIGHT_EYEBROW,
        mp_face_mesh.FACEMESH_LIPS
    ]

    for feature in exclude_features:
        feature_indices = [pt[0] for pt in feature]
        points = np.array([[(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in feature_indices]])
        if len(points[0]) > 0:
            feature_hull = cv2.convexHull(points[0])
            cv2.fillConvexPoly(mask, feature_hull, 0)
            
    return mask

def simulate_uv_imaging(img: np.ndarray, mask: np.ndarray) -> Tuple[str, float]:
    """Generates a UV-style melanin map and score."""
    if mask is None or cv2.countNonZero(mask) == 0:
        return "data:image/jpeg;base64,", 0.0

    b, g, r = cv2.split(img)
    
    # High-pass filter to emphasize micro-details (sun spots, melanin clusters)
    blur = cv2.GaussianBlur(b, (0, 0), 3)
    high_pass = cv2.addWeighted(b, 1.5, blur, -0.5, 0)
    
    clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(high_pass)
    
    masked = cv2.bitwise_and(enhanced, enhanced, mask=mask)
    
    # Apply UV-style colormap (Magma - deep purples and blacks)
    uv_colored = cv2.applyColorMap(masked, cv2.COLORMAP_MAGMA)
    uv_colored = cv2.bitwise_and(uv_colored, uv_colored, mask=mask)
    
    # Calculate score based on melanin absorption (darker = more damage)
    mean_val = cv2.mean(enhanced, mask=mask)[0]
    melanin_index = max(0.0, min(100.0, 100.0 - (mean_val / 255.0) * 100.0))
    
    success, buffer = cv2.imencode('.jpg', uv_colored, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    if not success:
        return "data:image/jpeg;base64,", 0.0
    b64_str = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
    
    return b64_str, round(melanin_index, 2)

def simulate_erythema_imaging(img: np.ndarray, mask: np.ndarray) -> Tuple[str, float]:
    """Generates an Erythema heatmap and vascular score."""
    if mask is None or cv2.countNonZero(mask) == 0:
        return "data:image/jpeg;base64,", 0.0
        
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    _, a, _ = cv2.split(lab)
    
    # Normalize 'a' channel (Red-Green axis)
    a_norm = cv2.normalize(a, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
    a_masked = cv2.bitwise_and(a_norm, a_norm, mask=mask)
    
    # Apply Heatmap style
    erythema_colored = cv2.applyColorMap(a_masked, cv2.COLORMAP_HOT)
    erythema_colored = cv2.bitwise_and(erythema_colored, erythema_colored, mask=mask)
    
    # Calculate score based on intensity of redness
    mean_val = cv2.mean(a_norm, mask=mask)[0]
    vascular_index = max(0.0, min(100.0, (mean_val / 255.0) * 100.0 * 1.5))
    
    success, buffer = cv2.imencode('.jpg', erythema_colored, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    if not success:
        return "data:image/jpeg;base64,", 0.0
    b64_str = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
    
    return b64_str, round(vascular_index, 2)

def extract_cv_metrics(img: np.ndarray, full_mask: np.ndarray, landmarks, w: int, h: int) -> Dict[str, float]:
    """
    Extracts the 15-Point Skin Matrix directly from image pixels using genuine CV algorithms.
    Contains 4 clinical buckets: Texture, Vascular, Pigmentation, Structural.
    Normalizes all outputs precisely between 0 - 100.
    """
    
    if full_mask is None or cv2.countNonZero(full_mask) == 0:
        # Fallback values
        return {k: 50.0 for k in [
            "texture", "pore_density", "redness", "pigmentation", "sebum_level", 
            "glow_score", "blemish_severity", "dark_circle_index", "wrinkle_index",
            "uv_damage", "roughness", "tone_uniformity", "firmness_index", "sagging_score", "elasticity"]}
            
    # 1. Global Lighting Calibration
    # Convert to LAB, normalize L channel to standard mean brightness across full_mask to prevent lighting score drift
    lab_norm = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab_norm)
    mean_l = cv2.mean(l, mask=full_mask)[0]
    if mean_l > 0:
        l_calib = cv2.convertScaleAbs(l, alpha=128.0/mean_l)
    else:
        l_calib = l
    
    img_norm = cv2.cvtColor(cv2.merge((l_calib, a, b)), cv2.COLOR_LAB2BGR)
    gray = cv2.cvtColor(img_norm, cv2.COLOR_BGR2GRAY)
    
    # 2. Regional Masks Creation
    t_zone_mask = np.zeros_like(full_mask)
    if HAS_MEDIAPIPE and landmarks:
        # T-Zone (Approximation based on index bounds in typical mediapipe mesh)
        pts = np.array([[(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in [10, 109, 67, 103, 332, 297, 338, 94, 0, 1]]])
        if len(pts[0]) > 0:
            hull = cv2.convexHull(pts[0])
            cv2.fillConvexPoly(t_zone_mask, hull, 255)
    else:
        cv2.ellipse(t_zone_mask, (w // 2, h // 3), (int(w * 0.15), int(h * 0.25)), 0, 0, 360, 255, -1)
    
    struct_mask = np.zeros_like(full_mask)
    if HAS_MEDIAPIPE and landmarks:
        for pt in [33, 133, 362, 263]:
            try:
                cv2.circle(struct_mask, (int(landmarks[pt].x * w), int(landmarks[pt].y * h)), 40, 255, -1)
            except IndexError:
                pass
    else:
        cv2.ellipse(struct_mask, (w // 2, int(h * 0.3)), (int(w * 0.3), int(h * 0.15)), 0, 0, 360, 255, -1)
    
    t_zone_mask = cv2.bitwise_and(t_zone_mask, full_mask)
    struct_mask = cv2.bitwise_and(struct_mask, full_mask)

    # --- BUCKET 1: TEXTURE (Mapped to texture, pore_density, roughness, sebum_level) ---
    m_texture = min(100.0, max(0.0, cv2.Laplacian(gray, cv2.CV_64F, ksize=3).var() / 20.0))
    v_texture = max(0.0, min(100.0, 100.0 - m_texture))
    
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = cv2.magnitude(sobelx, sobely)
    mean_sobel = cv2.mean(sobel_mag, mask=t_zone_mask)[0]
    
    v_pore_density = min(100.0, max(0.0, (mean_sobel / 50.0) * 100))
    v_roughness = min(100.0, max(0.0, (mean_sobel / 40.0) * 100))
    
    mean_l_tzone = cv2.mean(l, mask=t_zone_mask)[0]
    v_sebum_level = min(100.0, max(0.0, ((mean_l_tzone - 100) / 100.0) * 100)) if mean_l_tzone > 100 else 0.0

    # --- BUCKET 2: VASCULAR (Mapped to redness, blemish_severity, tone_uniformity, dark_circle_index) ---
    a_mean, a_std = cv2.meanStdDev(a, mask=full_mask)
    a_mean = a_mean[0][0]
    a_std = a_std[0][0]
    
    v_redness = min(100.0, max(0.0, ((a_mean - 128) / 10.0) * 100))
    v_blemish_severity = min(100.0, max(0.0, (a_std / 5.0) * 100)) 
    
    b_mean, b_std = cv2.meanStdDev(b, mask=full_mask)
    b_std = b_std[0][0]
    v_tone_uniformity = max(0.0, min(100.0, 100.0 - ((a_std + b_std) / 10.0 * 100)))
    v_dark_circle_index = min(100.0, max(0.0, v_redness * 0.6 + 15))

    # --- BUCKET 3: PIGMENTATION (Mapped to pigmentation, uv_damage, glow_score, derived melanin) ---
    v_melanin_derived = min(100.0, max(0.0, ((128 - b_mean[0][0]) / 20.0) * 100))
    
    _, low_b = cv2.threshold(b, b_mean[0][0] - 10, 255, cv2.THRESH_BINARY_INV)
    low_b_masked = cv2.bitwise_and(low_b, low_b, mask=full_mask)
    v_pigmentation = (cv2.countNonZero(low_b_masked) / (cv2.countNonZero(full_mask) + 1e-5)) * 100.0 * 2.5
    v_pigmentation = min(100.0, max(0.0, v_pigmentation))
    
    v_uv_damage = min(100.0, max(0.0, v_pigmentation * 0.7 + v_melanin_derived * 0.6))
    v_glow_score = max(0.0, min(100.0, 100.0 - v_uv_damage))

    # --- BUCKET 4: STRUCTURAL (Mapped to wrinkle_index, firmness_index, sagging_score, elasticity) ---
    edges = cv2.Canny(gray, 50, 100)
    edges_masked = cv2.bitwise_and(edges, edges, mask=struct_mask)
    edge_density = cv2.countNonZero(edges_masked) / (cv2.countNonZero(struct_mask) + 1e-5)
    
    v_wrinkle_index = min(100.0, max(0.0, edge_density * 2000.0))
    v_firmness_index = max(0.0, min(100.0, 100.0 - v_wrinkle_index * 1.2))
    v_sagging_score = min(100.0, max(0.0, v_wrinkle_index * 0.9))
    v_elasticity = max(0.0, min(100.0, v_firmness_index * 0.8 + 20))

    return {
        "texture": round(v_texture, 1),
        "pore_density": round(v_pore_density, 1),
        "redness": round(v_redness, 1),
        "pigmentation": round(v_pigmentation, 1),
        "sebum_level": round(v_sebum_level, 1),
        "glow_score": round(v_glow_score, 1),
        "blemish_severity": round(v_blemish_severity, 1),
        "dark_circle_index": round(v_dark_circle_index, 1),
        "wrinkle_index": round(v_wrinkle_index, 1),
        "uv_damage": round(v_uv_damage, 1),
        "roughness": round(v_roughness, 1),
        "tone_uniformity": round(v_tone_uniformity, 1),
        "firmness_index": round(v_firmness_index, 1),
        "sagging_score": round(v_sagging_score, 1),
        "elasticity": round(v_elasticity, 1)
    }

def process_scan(image_bytes: bytes) -> Dict[str, Any]:
    """
    Main entry point for stateless skin analysis.
    Performs validation, enhancement, and metric extraction.
    
    Clinical Decision Support:
    The quality_flag field indicates the reliability of the vision gated checks.
    OPTIMAL: All validation gates (centering, tilt, distance) passed reliably.
    MANUAL_REVIEW_RECOMMENDED: One or more validation steps were skipped or fell back due to environmental limits.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"status": "failed", "reason": "CORRUPT_IMAGE"}
    
    # 1. Sharpness Check
    sharpness = calculate_sharpness(img)
    if sharpness < 100:
        return {"status": "failed", "reason": "IMAGE_TOO_BLURRY", "sharpness_score": round(sharpness, 2)}
    
    # 2. Face Validation
    is_valid, reason, landmarks, validation_reliable = validate_face(img)
    if not is_valid:
        return {"status": "failed", "reason": reason}
    
    # 3. Enhancement
    enhanced_img = enhance_texture(img)
    
    # 4. Multi-Spectral Predictor
    h, w, _ = img.shape
    skin_mask = get_skin_mask(img, landmarks.landmark if landmarks else None, w, h)
    
    # --- CLINICAL LENS SQUARE CROP ---
    crop_x_min, crop_y_min, crop_x_max, crop_y_max = 0, 0, w, h
    if landmarks and getattr(landmarks, "landmark", None):
        l_pts = [(int(pt.x * w), int(pt.y * h)) for pt in landmarks.landmark]
        xs = [pt[0] for pt in l_pts]
        ys = [pt[1] for pt in l_pts]
        
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        box_w = max_x - min_x
        box_h = max_y - min_y
        
        center_x = min_x + box_w // 2
        center_y = min_y + box_h // 2
        
        max_dim = max(box_w, box_h)
        size = int(max_dim * 1.20)
        half_size = size // 2
        
        crop_x_min = max(0, center_x - half_size)
        crop_x_max = min(w, center_x + half_size)
        crop_y_min = max(0, center_y - half_size)
        crop_y_max = min(h, center_y + half_size)
    else:
        # Fallback square center
        center_x, center_y = w // 2, h // 2
        half_size = int(min(w, h) * 0.4)
        crop_x_min = max(0, center_x - half_size)
        crop_x_max = min(w, center_x + half_size)
        crop_y_min = max(0, center_y - half_size)
        crop_y_max = min(h, center_y + half_size)
        
    img_cropped = img[crop_y_min:crop_y_max, crop_x_min:crop_x_max]
    mask_cropped = skin_mask[crop_y_min:crop_y_max, crop_x_min:crop_x_max]

    uv_map, melanin_index = simulate_uv_imaging(img_cropped, mask_cropped)
    erythema_map, vascular_index = simulate_erythema_imaging(img_cropped, mask_cropped)
    
    # 5. Extract Authentic CV Skin Metrics
    """
    LOGIC LEGEND:
    Mapping mathematical calculations to standard 15-Point JSON Contract:
    Texture Bucket -> texture (Laplacian), pore_density & roughness (T-Zone Sobel Filter), sebum_level (Glare)
    Vascular Bucket -> redness (CIELAB a-mean), blemish_severity (CIELAB a-std), tone_uniformity (a + b channels)
    Pigmentation Bucket -> pigmentation (Sun Spots/Clusters), uv_damage (b-channel inversion), glow_score.
    Structural Bucket -> wrinkle_index & firmness_index (Canny Edge Detection limited to periorbital/forehead mask).
    """
    metrics = extract_cv_metrics(enhanced_img, skin_mask, landmarks.landmark if landmarks else None, w, h)
    
    # Calculate Biological Age
    skin_age = calculate_skin_age(metrics)
    
    # Generate Output
    return {
        "status": "success",
        "quality_flag": "OPTIMAL" if validation_reliable else "MANUAL_REVIEW_RECOMMENDED",
        "lead_id": str(uuid.uuid4()),
        "skin_age": skin_age,
        "melanin_index": melanin_index,
        "vascular_index": vascular_index,
        "uv_map": uv_map,
        "erythema_map": erythema_map,
        "metrics": metrics,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
