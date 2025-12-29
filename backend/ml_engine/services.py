"""
ML model inference services for crop prediction.

This module provides:
1. Model loading with caching (both RF and NB models)
2. Dual-model crop prediction from soil input
3. Probability/confidence scoring
4. Model agreement detection
"""

import os
import numpy as np
import joblib
from pathlib import Path


# Cache for loaded models and components
_rf_model_cache = None
_nb_model_cache = None
_scaler_cache = None
_label_encoder_cache = None

# Base directories
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'

# Feature names (must match training)
FEATURE_NAMES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph']


def load_model():
    """
    Load the primary ML model (Random Forest) from disk with caching.
    
    Returns:
        Trained scikit-learn RandomForest model
    """
    global _rf_model_cache
    
    if _rf_model_cache is not None:
        return _rf_model_cache
    
    # Try loading the RF pipeline first
    rf_pipeline_path = MODELS_DIR / 'rf_pipeline.joblib'
    
    if rf_pipeline_path.exists():
        pipeline = joblib.load(rf_pipeline_path)
        _rf_model_cache = pipeline['model']
        return _rf_model_cache
    
    # Fallback to best_model.joblib
    model_path = MODELS_DIR / 'best_model.joblib'
    
    if not model_path.exists():
        raise FileNotFoundError(
            f"Trained model not found at {model_path}. "
            "Please run 'python ml_engine/train_model.py' first."
        )
    
    _rf_model_cache = joblib.load(model_path)
    return _rf_model_cache


def load_nb_model():
    """
    Load the Naive Bayes model from disk with caching.
    
    Returns:
        Trained scikit-learn GaussianNB model
    """
    global _nb_model_cache
    
    if _nb_model_cache is not None:
        return _nb_model_cache
    
    nb_pipeline_path = MODELS_DIR / 'nb_pipeline.joblib'
    
    if not nb_pipeline_path.exists():
        raise FileNotFoundError(
            f"Naive Bayes model not found at {nb_pipeline_path}. "
            "Please run 'python ml_engine/train_model.py' first."
        )
    
    pipeline = joblib.load(nb_pipeline_path)
    _nb_model_cache = pipeline['model']
    return _nb_model_cache


def load_scaler():
    """
    Load the feature scaler from disk with caching.
    
    Returns:
        Fitted StandardScaler
    """
    global _scaler_cache
    
    if _scaler_cache is not None:
        return _scaler_cache
    
    # Try loading from scaler.joblib
    scaler_path = MODELS_DIR / 'scaler.joblib'
    
    if scaler_path.exists():
        _scaler_cache = joblib.load(scaler_path)
        return _scaler_cache
    
    # Fallback: load from RF pipeline
    rf_pipeline_path = MODELS_DIR / 'rf_pipeline.joblib'
    
    if rf_pipeline_path.exists():
        pipeline = joblib.load(rf_pipeline_path)
        _scaler_cache = pipeline['scaler']
        return _scaler_cache
    
    raise FileNotFoundError(
        f"Scaler not found at {scaler_path}. "
        "Please run 'python ml_engine/train_model.py' first."
    )


def load_label_encoder():
    """
    Load the label encoder from disk with caching.
    
    Returns:
        Fitted LabelEncoder
    """
    global _label_encoder_cache
    
    if _label_encoder_cache is not None:
        return _label_encoder_cache
    
    # Try loading from label_encoder.joblib
    encoder_path = MODELS_DIR / 'label_encoder.joblib'
    
    if encoder_path.exists():
        _label_encoder_cache = joblib.load(encoder_path)
        return _label_encoder_cache
    
    # Fallback: load from RF pipeline
    rf_pipeline_path = MODELS_DIR / 'rf_pipeline.joblib'
    
    if rf_pipeline_path.exists():
        pipeline = joblib.load(rf_pipeline_path)
        _label_encoder_cache = pipeline['label_encoder']
        return _label_encoder_cache
    
    raise FileNotFoundError(
        f"Label encoder not found at {encoder_path}. "
        "Please run 'python ml_engine/train_model.py' first."
    )


def get_feature_names():
    """Return the feature names used for training."""
    return FEATURE_NAMES


def predict_crop(soil_input, model=None):
    """
    Predict crop recommendation from soil input using Random Forest.
    
    Args:
        soil_input: SoilInput model instance with to_feature_array() method
        model: Optional pre-loaded model (if None, will load from cache)
        
    Returns:
        tuple: (crop_name, probability)
            - crop_name: Predicted crop as string
            - probability: Confidence score (0-1)
    """
    # Load model and scaler if not provided
    if model is None:
        model = load_model()
    
    scaler = load_scaler()
    label_encoder = load_label_encoder()
    
    # Extract features from soil input
    features = soil_input.to_feature_array()
    features_array = np.array(features).reshape(1, -1)
    
    # Standardize features
    features_scaled = scaler.transform(features_array)
    
    # Predict
    prediction_encoded = model.predict(features_scaled)[0]
    crop_name = label_encoder.inverse_transform([prediction_encoded])[0]
    
    # Get probability
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(features_scaled)[0]
        probability = float(np.max(proba))
    else:
        probability = 0.85  # Default for models without predict_proba
    
    return crop_name, probability


def predict_crop_dual(soil_input):
    """
    Predict crop recommendation using BOTH Random Forest and Naive Bayes models.
    
    This provides:
    - Higher confidence when models agree
    - Alternative suggestions when models disagree
    
    Args:
        soil_input: SoilInput model instance
        
    Returns:
        dict: {
            'rf_prediction': str,
            'rf_probability': float,
            'nb_prediction': str,
            'nb_probability': float,
            'models_agree': bool,
            'primary_recommendation': str,
            'confidence': float
        }
    """
    # Load all components
    rf_model = load_model()
    nb_model = load_nb_model()
    scaler = load_scaler()
    label_encoder = load_label_encoder()
    
    # Extract and scale features
    features = soil_input.to_feature_array()
    features_array = np.array(features).reshape(1, -1)
    features_scaled = scaler.transform(features_array)
    
    # Random Forest prediction
    rf_pred_encoded = rf_model.predict(features_scaled)[0]
    rf_crop = label_encoder.inverse_transform([rf_pred_encoded])[0]
    rf_proba = float(np.max(rf_model.predict_proba(features_scaled)[0]))
    
    # Naive Bayes prediction
    nb_pred_encoded = nb_model.predict(features_scaled)[0]
    nb_crop = label_encoder.inverse_transform([nb_pred_encoded])[0]
    nb_proba = float(np.max(nb_model.predict_proba(features_scaled)[0]))
    
    # Determine if models agree
    models_agree = rf_crop == nb_crop
    
    # Primary recommendation (use RF if agree, or the one with higher confidence)
    if models_agree:
        primary = rf_crop
        confidence = max(rf_proba, nb_proba)
    else:
        # Use the model with higher probability
        if rf_proba >= nb_proba:
            primary = rf_crop
            confidence = rf_proba
        else:
            primary = nb_crop
            confidence = nb_proba
    
    return {
        'rf_prediction': rf_crop,
        'rf_probability': rf_proba,
        'nb_prediction': nb_crop,
        'nb_probability': nb_proba,
        'models_agree': models_agree,
        'primary_recommendation': primary,
        'confidence': confidence
    }
