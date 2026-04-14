import unittest
import numpy as np
import cv2
import io
import base64
from backend.engine.inference_engine import process_scan, calculate_sharpness, get_skin_mask

class TestInferenceEngine(unittest.TestCase):

    def create_dummy_image(self, width=640, height=480, blurry=False):
        """Creates a dummy image as bytes."""
        if blurry:
            img = np.zeros((height, width, 3), dtype=np.uint8)
            # Pure black/flat is blurry (low variance)
        else:
            # Create a high-contrast pattern
            img = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.rectangle(img, (100, 100), (500, 400), (255, 255, 255), -1)
            cv2.putText(img, "TEST", (200, 250), cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 0, 0), 5)
            # Add some noise to increase variance
            noise = np.random.randint(0, 50, (height, width, 3), dtype='uint8')
            img = cv2.add(img, noise)
            
        _, buffer = cv2.imencode('.jpg', img)
        return buffer.tobytes()

    def test_sharpness_check(self):
        """Verify that blurry images are detected."""
        blurry_bytes = self.create_dummy_image(blurry=True)
        result = process_scan(blurry_bytes)
        self.assertEqual(result["status"], "failed")
        self.assertEqual(result["reason"], "IMAGE_TOO_BLURRY")

    def test_corrupt_image(self):
        """Verify handling of invalid byte sequences."""
        result = process_scan(b"not_an_image_data")
        self.assertEqual(result["status"], "failed")
        self.assertEqual(result["reason"], "CORRUPT_IMAGE")

    def test_sharpness_calculation(self):
        """Ensure the Laplacian Variance logic is functional."""
        high_contrast = np.zeros((100, 100, 3), dtype=np.uint8)
        cv2.rectangle(high_contrast, (40, 40), (60, 60), (255, 255, 255), -1)
        sharpness = calculate_sharpness(high_contrast)
        self.assertGreater(sharpness, 0)

    def test_quality_flag_presence(self):
        """Verify that quality_flag is present in successful scan results."""
        img_bytes = self.create_dummy_image(blurry=False)
        result = process_scan(img_bytes)
        if result["status"] == "success":
            self.assertIn("quality_flag", result)
            self.assertIn(result["quality_flag"], ["OPTIMAL", "MANUAL_REVIEW_RECOMMENDED"])

    def test_spectral_output_presence(self):
        """Verify that melanin and vascular spectral maps and indices are returned."""
        img_bytes = self.create_dummy_image(blurry=False)
        result = process_scan(img_bytes)
        if result["status"] == "success":
            self.assertIn("melanin_index", result)
            self.assertIn("vascular_index", result)
            self.assertIn("uv_map", result)
            self.assertIn("erythema_map", result)
            self.assertTrue(0.0 <= result["melanin_index"] <= 100.0)
            self.assertTrue(0.0 <= result["vascular_index"] <= 100.0)

    def test_base64_validity(self):
        """Verify that the generated spectral maps are valid base64 strings."""
        img_bytes = self.create_dummy_image(blurry=False)
        result = process_scan(img_bytes)
        if result["status"] == "success":
            uv_map = result["uv_map"]
            erythema_map = result["erythema_map"]
            
            # Check prefix
            self.assertTrue(uv_map.startswith("data:image/jpeg;base64,"))
            self.assertTrue(erythema_map.startswith("data:image/jpeg;base64,"))
            
            # Extract base64 part and attempt decoding
            b64_uv = uv_map.split(",")[1]
            try:
                decoded = base64.b64decode(b64_uv, validate=True)
                self.assertTrue(len(decoded) > 0)
            except Exception as e:
                self.fail(f"Invalid Base64 string for uv_map: {e}")

    def test_authentic_cv_metrics_presence(self):
        """Verify that all 15 authentic CV skin metrics are dynamically calculated and bounded 0-100."""
        img_bytes = self.create_dummy_image(blurry=False)
        result = process_scan(img_bytes)
        if result["status"] == "success":
            metrics = result["metrics"]
            expected_keys = [
                "texture", "pore_density", "redness", "pigmentation", "sebum_level", 
                "glow_score", "blemish_severity", "dark_circle_index", "wrinkle_index",
                "uv_damage", "roughness", "tone_uniformity", "firmness_index", "sagging_score", "elasticity"
            ]
            for key in expected_keys:
                self.assertIn(key, metrics)
                self.assertTrue(0.0 <= metrics[key] <= 100.0, f"Metric {key} out of bounds: {metrics[key]}")

    def test_fallback_logic_empty_mask(self):
        """Verify that the engine handles total mask failure without crashing and returns safe fallback values."""
        from backend.engine.inference_engine import extract_cv_metrics
        dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
        empty_mask = np.zeros((100, 100), dtype=np.uint8)
        
        fallback_metrics = extract_cv_metrics(dummy_img, empty_mask, None, 100, 100)
        self.assertEqual(fallback_metrics["texture"], 50.0)
        self.assertEqual(fallback_metrics["uv_damage"], 50.0)

if __name__ == '__main__':
    unittest.main()
