"""
Cybersecurity services for data validation and anomaly detection.

This module provides:
1. Pre-ML checks: Input validation, anomaly detection, integrity hashing
2. Post-ML checks: Confidence validation, result verification
3. Security logging to CyberLog
"""

import hashlib
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
from pathlib import Path
from logs.models import CyberLog


# Cache for anomaly detector
_anomaly_detector = None


def get_anomaly_detector():
    """
    Load or create anomaly detection model (IsolationForest).
    
    Returns:
        Trained IsolationForest model
    """
    global _anomaly_detector
    
    if _anomaly_detector is not None:
        return _anomaly_detector
    
    # Try to load pre-trained detector
    base_dir = Path(__file__).resolve().parent
    detector_path = base_dir / 'anomaly_detector.joblib'
    
    if detector_path.exists():
        _anomaly_detector = joblib.load(detector_path)
    else:
        # Create and train a new detector with typical soil parameter ranges
        # Generate training data based on normal ranges
        np.random.seed(42)
        training_data = []
        
        # Generate normal samples
        for _ in range(500):
            sample = [
                np.random.uniform(10, 150),   # N
                np.random.uniform(5, 100),    # P
                np.random.uniform(5, 100),    # K
                np.random.uniform(4.5, 8.5),  # pH
                np.random.uniform(20, 95),    # moisture
                np.random.uniform(5, 45)      # temperature
            ]
            training_data.append(sample)
        
        # Train IsolationForest
        _anomaly_detector = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        _anomaly_detector.fit(training_data)
        
        # Save detector
        joblib.dump(_anomaly_detector, detector_path)
    
    return _anomaly_detector


def compute_integrity_hash(soil_data):
    """
    Compute SHA-256 hash of soil input data for integrity checking.
    
    Args:
        soil_data: Dictionary of soil parameters
        
    Returns:
        str: SHA-256 hash hex digest
    """
    # Create deterministic string representation
    data_string = (
        f"{soil_data['N_level']:.2f}|"
        f"{soil_data['P_level']:.2f}|"
        f"{soil_data['K_level']:.2f}|"
        f"{soil_data['ph']:.2f}|"
        f"{soil_data['moisture']:.2f}|"
        f"{soil_data['temperature']:.2f}"
    )
    
    # Compute SHA-256 hash
    hash_object = hashlib.sha256(data_string.encode())
    return hash_object.hexdigest()


def validate_ranges(soil_data):
    """
    Validate that soil parameters are within acceptable ranges.
    
    Args:
        soil_data: Dictionary of soil parameters
        
    Returns:
        tuple: (is_valid, error_message)
    """
    validations = [
        (0 <= soil_data['N_level'] <= 200, "N level out of range (0-200)"),
        (0 <= soil_data['P_level'] <= 200, "P level out of range (0-200)"),
        (0 <= soil_data['K_level'] <= 200, "K level out of range (0-200)"),
        (0 <= soil_data['ph'] <= 14, "pH out of range (0-14)"),
        (0 <= soil_data['moisture'] <= 100, "Moisture out of range (0-100)"),
        (-10 <= soil_data['temperature'] <= 60, "Temperature out of range (-10 to 60)"),
    ]
    
    for is_valid, error_msg in validations:
        if not is_valid:
            return False, error_msg
    
    return True, None


def detect_anomaly(soil_data):
    """
    Detect if soil data is anomalous using IsolationForest.
    
    Args:
        soil_data: Dictionary of soil parameters
        
    Returns:
        bool: True if anomaly detected, False otherwise
    """
    detector = get_anomaly_detector()
    
    # Prepare features
    features = np.array([[
        soil_data['N_level'],
        soil_data['P_level'],
        soil_data['K_level'],
        soil_data['ph'],
        soil_data['moisture'],
        soil_data['temperature']
    ]])
    
    # Predict: -1 for anomaly, 1 for normal
    prediction = detector.predict(features)
    
    return prediction[0] == -1


def pre_ml_checks(soil_data, user):
    """
    Perform pre-ML cybersecurity checks on soil input data.
    
    Steps:
    1. Validate data types and schema
    2. Check value ranges
    3. Detect anomalies using IsolationForest
    4. Compute integrity hash
    5. Log results to CyberLog
    
    Args:
        soil_data: Dictionary with N_level, P_level, K_level, ph, moisture, temperature
        user: User object who submitted the data
        
    Returns:
        dict: {
            'anomaly_detected': bool,
            'integrity_status': str,
            'integrity_hash': str,
            'details': str
        }
        
    Raises:
        ValidationError: If data is severely invalid
    """
    from rest_framework.exceptions import ValidationError
    
    # 1. Validate ranges
    is_valid, error_msg = validate_ranges(soil_data)
    if not is_valid:
        # Log severe validation failure
        CyberLog.objects.create(
            input=None,
            anomaly_detected=True,
            integrity_status='OUT_OF_RANGE',
            details=f"Range validation failed: {error_msg}"
        )
        raise ValidationError(error_msg)
    
    # 2. Compute integrity hash
    integrity_hash = compute_integrity_hash(soil_data)
    
    # 3. Detect anomalies
    is_anomalous = detect_anomaly(soil_data)
    
    # 4. Determine integrity status
    if is_anomalous:
        integrity_status = 'ANOMALY'
        details = (
            f"Anomaly detected in soil data. "
            f"Values: N={soil_data['N_level']:.1f}, P={soil_data['P_level']:.1f}, "
            f"K={soil_data['K_level']:.1f}, pH={soil_data['ph']:.1f}, "
            f"moisture={soil_data['moisture']:.1f}%, temp={soil_data['temperature']:.1f}°C. "
            f"Data appears unusual but within valid ranges."
        )
    else:
        integrity_status = 'OK'
        details = "All pre-ML security checks passed. Data appears normal."
    
    # 5. Log to CyberLog (will be updated with input reference after SoilInput is saved)
    cyber_log = CyberLog.objects.create(
        input=None,  # Will be updated after SoilInput creation
        anomaly_detected=is_anomalous,
        integrity_status=integrity_status,
        details=details
    )
    
    return {
        'anomaly_detected': is_anomalous,
        'integrity_status': integrity_status,
        'integrity_hash': integrity_hash,
        'details': details,
        'cyber_log_id': cyber_log.id
    }


def post_ml_checks(prediction, probability, soil_input):
    """
    Perform post-ML cybersecurity checks on prediction results.
    
    Steps:
    1. Validate prediction confidence
    2. Check for empty/invalid predictions
    3. Log results to CyberLog
    
    Args:
        prediction: Predicted crop name
        probability: Prediction confidence (0-1)
        soil_input: SoilInput instance
        
    Returns:
        dict: Security check results
    """
    # Confidence threshold
    CONFIDENCE_THRESHOLD = 0.5
    
    # Determine integrity status
    if not prediction or prediction.strip() == '':
        integrity_status = 'TAMPERED'
        details = "Empty prediction result - possible model tampering"
        anomaly_detected = True
    elif probability < CONFIDENCE_THRESHOLD:
        integrity_status = 'LOW_CONFIDENCE'
        details = (
            f"Low prediction confidence: {probability:.2%}. "
            f"Recommended crop '{prediction}' may not be reliable."
        )
        anomaly_detected = True
    else:
        integrity_status = 'OK'
        details = (
            f"Post-ML checks passed. Prediction: {prediction}, "
            f"Confidence: {probability:.2%}"
        )
        anomaly_detected = False
    
    # Log to CyberLog
    CyberLog.objects.create(
        input=soil_input,
        anomaly_detected=anomaly_detected,
        integrity_status=integrity_status,
        details=details
    )
    
    return {
        'anomaly_detected': anomaly_detected,
        'integrity_status': integrity_status,
        'details': details
    }
