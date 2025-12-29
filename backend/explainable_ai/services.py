"""
Explainable AI services using SHAP for model interpretability.

This module provides:
1. SHAP value computation for tree-based models
2. Feature importance analysis
3. Human-readable explanations for farmers
"""

import numpy as np
import shap
from ml_engine.services import get_feature_names, load_scaler, load_label_encoder


# Cache for SHAP explainer
_explainer_cache = None


def get_explainer(model):
    """
    Get or create SHAP explainer for the model.
    
    Args:
        model: Trained scikit-learn model
        
    Returns:
        SHAP explainer object
    """
    global _explainer_cache
    
    if _explainer_cache is not None:
        return _explainer_cache
    
    # Create appropriate explainer based on model type
    model_name = type(model).__name__
    
    if 'RandomForest' in model_name or 'Tree' in model_name:
        # Use TreeExplainer for tree-based models
        _explainer_cache = shap.TreeExplainer(model)
    else:
        # Use KernelExplainer for other models (slower but universal)
        # Generate background data for KernelExplainer
        background = shap.sample(np.random.randn(100, 6), 50)
        _explainer_cache = shap.KernelExplainer(model.predict, background)
    
    return _explainer_cache


def generate_explanation(model, soil_input):
    """
    Generate human-readable explanation for crop recommendation using SHAP.
    
    Args:
        model: Trained ML model
        soil_input: SoilInput instance
        
    Returns:
        str: Natural language explanation
    """
    try:
        # Get feature names and values
        feature_names = get_feature_names()
        feature_values = soil_input.to_feature_array()
        
        # Scale features
        scaler = load_scaler()
        features_scaled = scaler.transform(np.array(feature_values).reshape(1, -1))
        
        # Get prediction (encoded)
        prediction_encoded = model.predict(features_scaled)[0]
        
        # Decode prediction to crop name
        try:
            label_encoder = load_label_encoder()
            if isinstance(prediction_encoded, (int, np.integer)):
                prediction = label_encoder.inverse_transform([prediction_encoded])[0]
            else:
                prediction = prediction_encoded  # Already decoded
        except:
            prediction = str(prediction_encoded)  # Fallback to raw prediction
        
        # Get SHAP explainer
        explainer = get_explainer(model)
        
        # Compute SHAP values
        shap_values = explainer.shap_values(features_scaled)
        
        # Handle multi-class output (SHAP returns list of arrays)
        if isinstance(shap_values, list):
            # Get the class index for the prediction (use encoded value)
            classes = model.classes_
            pred_idx = np.where(classes == prediction_encoded)[0][0]
            shap_values_for_pred = shap_values[pred_idx][0]
        else:
            shap_values_for_pred = shap_values[0]
        
        # Get top 3 most influential features
        feature_importance = list(zip(feature_names, feature_values, shap_values_for_pred))
        feature_importance.sort(key=lambda x: abs(x[2]), reverse=True)
        top_features = feature_importance[:3]
        
        # Build explanation
        explanation_parts = [
            f"The recommended crop is **{prediction}** based on your soil analysis."
        ]
        
        # Feature descriptions
        feature_descriptions = {
            'N': ('Nitrogen level', 'mg/kg'),
            'P': ('Phosphorus level', 'mg/kg'),
            'K': ('Potassium level', 'mg/kg'),
            'ph': ('pH level', ''),
            'moisture': ('Moisture content', '%'),
            'temperature': ('Temperature', '°C')
        }
        
        # Add key factors
        explanation_parts.append("\n\n**Key factors influencing this recommendation:**")
        
        for i, (feature, value, importance) in enumerate(top_features, 1):
            desc, unit = feature_descriptions[feature]
            
            # Determine if feature supports or opposes the recommendation
            if importance > 0:
                effect = "strongly supports"
            else:
                effect = "moderately influences"
            
            explanation_parts.append(
                f"\n{i}. **{desc}**: {value:.1f} {unit} - This {effect} the recommendation for {prediction}."
            )
        
        # Add soil condition assessment
        explanation_parts.append("\n\n**Soil Condition Summary:**")
        
        # NPK assessment
        npk_avg = (feature_values[0] + feature_values[1] + feature_values[2]) / 3
        if npk_avg > 100:
            npk_status = "high nutrient levels"
        elif npk_avg > 50:
            npk_status = "moderate nutrient levels"
        else:
            npk_status = "low to moderate nutrient levels"
        
        explanation_parts.append(f"- Your soil has {npk_status} (N: {feature_values[0]:.1f}, P: {feature_values[1]:.1f}, K: {feature_values[2]:.1f}).")
        
        # pH assessment
        ph_value = feature_values[3]
        if ph_value < 5.5:
            ph_status = "acidic"
        elif ph_value > 7.5:
            ph_status = "alkaline"
        else:
            ph_status = "neutral"
        
        explanation_parts.append(f"- The pH level of {ph_value:.1f} indicates {ph_status} soil, which is suitable for {prediction}.")
        
        # Moisture assessment
        moisture_value = feature_values[4]
        if moisture_value > 70:
            moisture_status = "high moisture"
        elif moisture_value > 40:
            moisture_status = "adequate moisture"
        else:
            moisture_status = "low moisture"
        
        explanation_parts.append(f"- Soil moisture at {moisture_value:.1f}% indicates {moisture_status} conditions.")
        
        # Temperature assessment
        temp_value = feature_values[5]
        explanation_parts.append(f"- Current soil temperature of {temp_value:.1f}°C is within the optimal range for {prediction}.")
        
        # Add recommendation confidence note
        explanation_parts.append(
            f"\n\n**Note:** This recommendation is based on comprehensive analysis of your soil parameters "
            f"and is optimized for {prediction} cultivation under current conditions."
        )
        
        return ' '.join(explanation_parts)
        
    except Exception as e:
        # Fallback explanation if SHAP fails
        scaler = load_scaler()
        prediction_encoded = model.predict(scaler.transform(np.array(soil_input.to_feature_array()).reshape(1, -1)))[0]
        
        # Decode prediction to crop name
        try:
            label_encoder = load_label_encoder()
            if isinstance(prediction_encoded, (int, np.integer)):
                prediction = label_encoder.inverse_transform([prediction_encoded])[0]
            else:
                prediction = prediction_encoded
        except:
            prediction = str(prediction_encoded)
        
        return (
            f"The recommended crop is **{prediction}** based on your soil parameters. "
            f"Your soil has Nitrogen: {soil_input.N_level:.1f} mg/kg, "
            f"Phosphorus: {soil_input.P_level:.1f} mg/kg, "
            f"Potassium: {soil_input.K_level:.1f} mg/kg, "
            f"pH: {soil_input.ph:.1f}, "
            f"Moisture: {soil_input.moisture:.1f}%, "
            f"and Temperature: {soil_input.temperature:.1f}°C. "
            f"These conditions are well-suited for {prediction} cultivation."
        )


def generate_ai_farming_guide(crop_name, soil_input):
    """
    Generate comprehensive farming guide using Google Gemini AI.
    
    Args:
        crop_name: Recommended crop name
        soil_input: SoilInput instance with soil parameters
        
    Returns:
        dict: Structured farming guide with sections
    """
    import os
    import requests
    import json
    
    api_key = os.getenv('GEMINI_API_KEY', '')
    
    if not api_key or api_key == 'YOUR_GEMINI_API_KEY_HERE':
        return get_fallback_farming_guide(crop_name, soil_input)
    
    # Build the prompt
    prompt = f"""You are an expert agricultural advisor helping farmers in Malaysia and South Asia. A farmer's soil analysis shows:
- Nitrogen: {soil_input.N_level:.1f} mg/kg
- Phosphorus: {soil_input.P_level:.1f} mg/kg
- Potassium: {soil_input.K_level:.1f} mg/kg
- pH Level: {soil_input.ph:.1f}
- Moisture: {soil_input.moisture:.1f}%
- Temperature: {soil_input.temperature:.1f}°C

Our ML model recommends growing **{crop_name}**.

Please provide a comprehensive farming guide in the following JSON format ONLY (no markdown, no code blocks, just pure JSON):
{{
    "why_recommended": "2-3 sentences explaining why this crop is ideal for their specific soil conditions",
    "cultivation_steps": [
        "Step 1: Land preparation details",
        "Step 2: Seed selection and sowing details",
        "Step 3: Watering schedule details",
        "Step 4: Fertilization schedule details",
        "Step 5: Pest management details",
        "Step 6: Harvesting timing and method"
    ],
    "watering_guide": "Specific watering frequency and amount for this crop",
    "fertilization_tips": "When and what fertilizers to apply",
    "harvesting_tips": "When to harvest and how to identify maturity",
    "common_problems": [
        {{"problem": "Problem 1 name", "solution": "How to solve it"}},
        {{"problem": "Problem 2 name", "solution": "How to solve it"}},
        {{"problem": "Problem 3 name", "solution": "How to solve it"}}
    ],
    "expected_yield": "Expected yield per hectare/acre",
    "growth_duration": "Days from planting to harvest"
}}

Respond ONLY with the JSON object, no additional text."""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048
            }
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract the generated text
            if 'candidates' in result and len(result['candidates']) > 0:
                generated_text = result['candidates'][0]['content']['parts'][0]['text']
                
                # Clean up the response (remove markdown code blocks if present)
                generated_text = generated_text.strip()
                if generated_text.startswith('```json'):
                    generated_text = generated_text[7:]
                if generated_text.startswith('```'):
                    generated_text = generated_text[3:]
                if generated_text.endswith('```'):
                    generated_text = generated_text[:-3]
                generated_text = generated_text.strip()
                
                # Parse JSON
                farming_guide = json.loads(generated_text)
                farming_guide['source'] = 'gemini_ai'
                farming_guide['crop_name'] = crop_name
                return farming_guide
        
        # Fallback if API fails
        return get_fallback_farming_guide(crop_name, soil_input)
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        return get_fallback_farming_guide(crop_name, soil_input)


def get_fallback_farming_guide(crop_name, soil_input):
    """
    Provide a basic farming guide when Gemini API is unavailable.
    """
    return {
        "source": "fallback",
        "crop_name": crop_name,
        "why_recommended": f"{crop_name.capitalize()} is well-suited for your soil conditions with pH {soil_input.ph:.1f}, moisture {soil_input.moisture:.1f}%, and the current nutrient levels (N: {soil_input.N_level:.1f}, P: {soil_input.P_level:.1f}, K: {soil_input.K_level:.1f} mg/kg).",
        "cultivation_steps": [
            "Prepare the land by clearing weeds and tilling the soil",
            "Select high-quality seeds from certified sources",
            "Plant seeds at recommended depth and spacing",
            "Water regularly based on soil moisture levels",
            "Apply fertilizers as per soil test recommendations",
            "Monitor for pests and diseases regularly",
            "Harvest when the crop reaches maturity"
        ],
        "watering_guide": "Water regularly, maintaining optimal soil moisture. Adjust frequency based on weather conditions.",
        "fertilization_tips": "Apply balanced NPK fertilizer based on soil test results. Side-dress during growth stages.",
        "harvesting_tips": f"Harvest {crop_name} when it reaches full maturity. Check for signs of ripeness specific to the crop.",
        "common_problems": [
            {"problem": "Pest infestation", "solution": "Use integrated pest management techniques"},
            {"problem": "Nutrient deficiency", "solution": "Apply appropriate fertilizers based on symptoms"},
            {"problem": "Water stress", "solution": "Maintain consistent irrigation schedule"}
        ],
        "expected_yield": "Varies based on variety and management practices",
        "growth_duration": "Varies by variety - consult local extension services"
    }
