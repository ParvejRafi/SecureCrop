"""
Service functions for creating and managing recommendations.
"""
from .models import Recommendation
from ml_engine.services import load_model, predict_crop
from explainable_ai.services import generate_explanation
from cyber_layer.services import post_ml_checks


def create_recommendation_for_input(soil_input):
    """
    Create a crop recommendation for the given soil input.
    
    Steps:
    1. Load ML model
    2. Predict crop and confidence
    3. Generate XAI explanation
    4. Run post-ML security checks
    5. Save and return recommendation
    
    Args:
        soil_input: SoilInput instance
        
    Returns:
        Recommendation instance
    """
    # Load the trained model
    model = load_model()
    
    # Predict crop
    crop_name, probability = predict_crop(soil_input, model)
    
    # Generate XAI explanation
    explanation = generate_explanation(model, soil_input)
    
    # Run post-ML security checks
    post_ml_checks(crop_name, probability, soil_input)
    
    # Create and save recommendation
    recommendation = Recommendation.objects.create(
        input=soil_input,
        crop_name=crop_name,
        explanation=explanation
    )
    
    return recommendation
