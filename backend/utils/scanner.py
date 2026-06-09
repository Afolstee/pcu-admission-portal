"""
utils/scanner.py — Document scanner using OpenCV.

Enhances a raw photograph of a document to look like a clean scanned copy:
  - Converts to grayscale
  - Removes noise (preserves text edges)
  - Applies adaptive threshold (white background, crisp black text)
  - Returns JPEG bytes + a quality assessment score

Loaded once when Flask starts. No browser-side dependency.
"""

import io
import base64
import numpy as np

# Lazy-import OpenCV so the app still starts if it's not installed
try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False


class ScannerError(Exception):
    """Raised when an image cannot be scanned."""


def _require_cv2():
    if not _CV2_AVAILABLE:
        raise ScannerError(
            "opencv-python-headless is not installed. "
            "Run: pip install opencv-python-headless numpy"
        )


# ── Quality assessment ────────────────────────────────────────────────────────

def assess_quality(image_bytes: bytes) -> dict:
    """
    Assess whether the raw photograph is sharp enough to be useful.

    Returns a dict:
      {
        "score": int (0–100),
        "is_acceptable": bool,
        "issues": list[str]   # human-readable warnings
      }

    Score interpretation:
      >= 70  → Good (acceptable for admin review)
      40–69  → Fair (may be acceptable, warn user)
      < 40   → Poor (ask user to retake)
    """
    _require_cv2()

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ScannerError("Could not decode image. Ensure it is a valid JPEG or PNG.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    issues = []
    score = 100

    # ── 1. Sharpness (Laplacian variance) ────────────────────────────────────
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if lap_var < 50:
        score -= 40
        issues.append("Image is blurry — hold the camera steady and retake.")
    elif lap_var < 150:
        score -= 20
        issues.append("Image could be sharper — try better lighting or hold steady.")

    # ── 2. Brightness (mean pixel value) ─────────────────────────────────────
    mean_brightness = float(np.mean(gray))
    if mean_brightness < 60:
        score -= 20
        issues.append("Image is too dark — move to a brighter area.")
    elif mean_brightness > 220:
        score -= 15
        issues.append("Image is overexposed — reduce direct light on the document.")

    # ── 3. Contrast (std deviation) ──────────────────────────────────────────
    std_dev = float(np.std(gray))
    if std_dev < 20:
        score -= 15
        issues.append("Low contrast — ensure document text is clearly visible.")

    # ── 4. Resolution check ───────────────────────────────────────────────────
    if h < 400 or w < 400:
        score -= 20
        issues.append("Resolution is too low — use a higher-quality camera setting.")
    elif h < 800 or w < 800:
        score -= 5
        issues.append("Resolution is acceptable but higher quality is preferred.")

    score = max(0, min(100, score))
    is_acceptable = score >= 40

    return {
        "score": score,
        "is_acceptable": is_acceptable,
        "issues": issues,
        "sharpness": round(lap_var, 1),
        "brightness": round(mean_brightness, 1),
    }


# ── Enhancement ───────────────────────────────────────────────────────────────

def enhance_document(image_bytes: bytes) -> bytes:
    """
    Enhance a document photograph to look like a clean scan.

    Steps:
      1. Decode image
      2. Convert to grayscale
      3. Denoise (preserves text edges)
      4. Adaptive threshold → crisp black text on white background
      5. Re-encode as JPEG at quality 92

    Returns enhanced JPEG bytes.
    """
    _require_cv2()

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ScannerError("Could not decode image.")

    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise — preserves edge sharpness for text
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

    # Adaptive threshold — makes text crisp like a proper scan
    scanned = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=7,
    )

    # Encode back to JPEG
    success, buffer = cv2.imencode(
        ".jpg", scanned,
        [cv2.IMWRITE_JPEG_QUALITY, 92]
    )
    if not success:
        raise ScannerError("Failed to encode enhanced image.")

    return buffer.tobytes()


# ── Combined scan + preview ───────────────────────────────────────────────────

def scan_document(image_bytes: bytes) -> dict:
    """
    Assess quality, enhance the document, and return everything the frontend needs.

    Returns:
      {
        "quality": { score, is_acceptable, issues, sharpness, brightness },
        "preview_b64": str,   # base64-encoded enhanced JPEG for <img src>
        "original_b64": str,  # base64-encoded original (for side-by-side)
        "enhanced_bytes": bytes  # raw bytes ready to upload if user confirms
      }

    Raises ScannerError on decode failure.
    """
    quality = assess_quality(image_bytes)
    enhanced_bytes = enhance_document(image_bytes)

    return {
        "quality": quality,
        "preview_b64": base64.b64encode(enhanced_bytes).decode("utf-8"),
        "original_b64": base64.b64encode(image_bytes).decode("utf-8"),
        "enhanced_bytes": enhanced_bytes,
    }
