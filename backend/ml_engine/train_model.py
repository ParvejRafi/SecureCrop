"""
ML model training script based on the Kaggle notebook workflow.

This script:
1. Loads and blends datasets from Malaysia (gathered_data.csv) and India (Crop_recommendation.csv)
2. Trains 9 models for comparison (including RandomForest and NaiveBayes)
3. Performs GridSearchCV hyperparameter tuning for the top 2 models
4. Saves the optimized models, scaler, and label encoder for production use

Based on the user's notebook: "Decision tree for getting optimal crop based on soil nutrition parameters"
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report

# Try to import xgboost - optional
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    print("Warning: XGBoost not installed, skipping XGBClassifier")

warnings.filterwarnings('ignore')

# Define paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'
MODELS_DIR = BASE_DIR / 'models'

# Ensure models directory exists
MODELS_DIR.mkdir(exist_ok=True)

# Feature names used for training
TRAINING_FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph']


def load_and_prepare_data():
    """Load and blend the India and Malaysia datasets."""
    
    print("=" * 60)
    print("STEP 1: Loading Datasets")
    print("=" * 60)
    
    # Load India dataset (Crop_recommendation.csv)
    india_path = DATA_DIR / 'Crop_recommendation.csv'
    if not india_path.exists():
        raise FileNotFoundError(f"India dataset not found at {india_path}")
    
    df1 = pd.read_csv(india_path)
    print(f"✅ Loaded India dataset: {df1.shape[0]} samples, {df1.shape[1]} columns")
    
    # Load Malaysia dataset (gathered_data.csv)
    malaysia_path = DATA_DIR / 'gathered_data.csv'
    if not malaysia_path.exists():
        raise FileNotFoundError(f"Malaysia dataset not found at {malaysia_path}")
    
    df2 = pd.read_csv(malaysia_path)
    print(f"✅ Loaded Malaysia dataset: {df2.shape[0]} samples, {df2.shape[1]} columns")
    
    # Clean column names
    df1.columns = df1.columns.str.strip()
    df2.columns = df2.columns.str.strip()
    
    # Clean label values (remove trailing/leading whitespace)
    df1['label'] = df1['label'].str.strip()
    df2['label'] = df2['label'].str.strip()
    
    # Handle humidity with percentage symbols in Malaysia data
    if df2['humidity'].dtype == 'object':
        # Remove % symbol and convert to float
        df2['humidity'] = df2['humidity'].astype(str).str.replace('%', '').astype(float)
        # Check if values are already percentages (> 1) or decimal (need * 100)
        if df2['humidity'].max() <= 1:
            df2['humidity'] = df2['humidity'] * 100
        print("✅ Cleaned humidity column (removed % symbols)")
    
    # Drop rainfall column from India data to match Malaysia data structure
    if 'rainfall' in df1.columns:
        df1_prepared = df1.drop('rainfall', axis=1)
        print("✅ Dropped 'rainfall' column from India data")
    else:
        df1_prepared = df1.copy()
    
    # Blend datasets (vertical stack)
    df = pd.concat([df1_prepared, df2], axis=0, ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # Shuffle
    
    print(f"\n📊 Blended dataset: {df.shape[0]} total samples")
    print(f"📊 Unique crops: {df['label'].nunique()}")
    print(f"📊 No null values: {df.isnull().sum().sum() == 0}")
    
    return df


def prepare_train_test_split(df):
    """Prepare data with stratified split handling rare classes."""
    
    print("\n" + "=" * 60)
    print("STEP 2: Preparing Train/Test Split")
    print("=" * 60)
    
    # Separate features and labels
    X = df.drop(columns=['label'])
    y = df['label']
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print(f"✅ Encoded {len(le.classes_)} unique crop labels")
    
    # Convert to series for rare class handling
    y_encoded_series = pd.Series(y_encoded, index=X.index, name='label_encoded')
    
    # Identify rare classes (only 1 sample)
    counts = y_encoded_series.value_counts()
    rare_classes = counts[counts == 1].index.tolist()
    
    # Split into rare and majority classes
    mask = y_encoded_series.isin(rare_classes)
    X_rare = X[mask]
    y_rare = y_encoded_series[mask]
    X_main = X[~mask]
    y_main = y_encoded_series[~mask]
    
    # Stratified split on majority classes
    X_train_main, X_test, y_train_main, y_test = train_test_split(
        X_main, y_main,
        test_size=0.2,
        random_state=42,
        stratify=y_main
    )
    
    # Add rare classes to training set
    X_train = pd.concat([X_train_main, X_rare], ignore_index=True)
    y_train = pd.concat([y_train_main, y_rare], ignore_index=True)
    
    # Convert to NumPy arrays
    X_train = X_train.values
    X_test = X_test.values
    y_train = y_train.values
    y_test = y_test.values
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"✅ Training set: {X_train_scaled.shape[0]} samples")
    print(f"✅ Testing set: {X_test_scaled.shape[0]} samples")
    print(f"✅ Features scaled using StandardScaler")
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, le


def get_metrics_df(model, model_name, X_train, y_train, X_test, y_test):
    """Train model and return metrics DataFrame."""
    
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    accuracy = accuracy_score(y_test, y_pred)
    
    return pd.DataFrame({
        'Model': [model_name],
        'Accuracy': [accuracy],
        'F1-Score (W)': [report['weighted avg']['f1-score']],
        'F1-Score (M)': [report['macro avg']['f1-score']]
    })


def compare_models(X_train, y_train, X_test, y_test):
    """Compare 9 different models."""
    
    print("\n" + "=" * 60)
    print("STEP 3: Comparing 9 Models")
    print("=" * 60)
    
    models = {
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "AdaBoost": AdaBoostClassifier(random_state=42),
        "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5, n_jobs=-1),
        "Naive Bayes (Gaussian)": GaussianNB(),
        "Support Vector Machine": SVC(random_state=42, kernel='rbf', C=10, max_iter=200000)
    }
    
    if HAS_XGBOOST:
        models["XGBoost"] = XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='mlogloss', n_jobs=-1)
    
    all_results = []
    
    for name, model in models.items():
        print(f"Training {name}...")
        metrics = get_metrics_df(model, name, X_train, y_train, X_test, y_test)
        all_results.append(metrics)
    
    comparison_df = pd.concat(all_results, ignore_index=True)
    comparison_df = comparison_df.sort_values(by='F1-Score (W)', ascending=False).reset_index(drop=True)
    
    print("\n" + "-" * 60)
    print("MODEL COMPARISON RESULTS (sorted by Weighted F1)")
    print("-" * 60)
    print(comparison_df.to_string(index=False))
    
    return comparison_df


def tune_random_forest(X_train, y_train):
    """Hyperparameter tuning for Random Forest."""
    
    print("\n" + "=" * 60)
    print("STEP 4: Tuning Random Forest")
    print("=" * 60)
    
    rf_param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2],
        'criterion': ['gini', 'entropy']
    }
    
    rf_model = RandomForestClassifier(random_state=42, n_jobs=-1)
    
    grid_search = GridSearchCV(
        estimator=rf_model,
        param_grid=rf_param_grid,
        scoring='f1_weighted',
        cv=5,
        verbose=1,
        n_jobs=-1
    )
    
    print("Running GridSearchCV (this may take several minutes)...")
    grid_search.fit(X_train, y_train)
    
    print(f"\n✅ Best Parameters: {grid_search.best_params_}")
    print(f"✅ Best CV Score (Weighted F1): {grid_search.best_score_:.4f}")
    
    return grid_search.best_estimator_


def tune_naive_bayes(X_train, y_train):
    """Hyperparameter tuning for Naive Bayes."""
    
    print("\n" + "=" * 60)
    print("STEP 5: Tuning Naive Bayes")
    print("=" * 60)
    
    nb_param_grid = {
        'var_smoothing': np.logspace(0, -9, num=100)
    }
    
    nb_model = GaussianNB()
    
    grid_search = GridSearchCV(
        estimator=nb_model,
        param_grid=nb_param_grid,
        scoring='f1_weighted',
        cv=5,
        verbose=1,
        n_jobs=-1
    )
    
    print("Running GridSearchCV...")
    grid_search.fit(X_train, y_train)
    
    print(f"\n✅ Best Parameters: {grid_search.best_params_}")
    print(f"✅ Best CV Score (Weighted F1): {grid_search.best_score_:.4f}")
    
    return grid_search.best_estimator_


def save_models(rf_model, nb_model, scaler, label_encoder):
    """Save trained models and components."""
    
    print("\n" + "=" * 60)
    print("STEP 6: Saving Models")
    print("=" * 60)
    
    # Save Random Forest pipeline
    rf_pipeline = {
        'model': rf_model,
        'scaler': scaler,
        'label_encoder': label_encoder,
        'features': TRAINING_FEATURES
    }
    rf_path = MODELS_DIR / 'rf_pipeline.joblib'
    joblib.dump(rf_pipeline, rf_path)
    print(f"✅ Saved Random Forest: {rf_path}")
    
    # Save Naive Bayes pipeline
    nb_pipeline = {
        'model': nb_model,
        'scaler': scaler,
        'label_encoder': label_encoder,
        'features': TRAINING_FEATURES
    }
    nb_path = MODELS_DIR / 'nb_pipeline.joblib'
    joblib.dump(nb_pipeline, nb_path)
    print(f"✅ Saved Naive Bayes: {nb_path}")
    
    # Save best model (Random Forest) for backward compatibility
    best_model_path = MODELS_DIR / 'best_model.joblib'
    joblib.dump(rf_model, best_model_path)
    print(f"✅ Saved Best Model: {best_model_path}")
    
    # Save scaler separately
    scaler_path = MODELS_DIR / 'scaler.joblib'
    joblib.dump(scaler, scaler_path)
    print(f"✅ Saved Scaler: {scaler_path}")
    
    # Save label encoder
    encoder_path = MODELS_DIR / 'label_encoder.joblib'
    joblib.dump(label_encoder, encoder_path)
    print(f"✅ Saved Label Encoder: {encoder_path}")
    
    # Save feature list
    features_path = MODELS_DIR / 'input_features.joblib'
    joblib.dump(TRAINING_FEATURES, features_path)
    print(f"✅ Saved Feature List: {features_path}")


def test_predictions(rf_model, nb_model, scaler, label_encoder):
    """Test the models with sample input."""
    
    print("\n" + "=" * 60)
    print("STEP 7: Testing Predictions")
    print("=" * 60)
    
    # Sample input: [N, P, K, temperature, humidity, ph]
    sample_input = [90, 42, 43, 20.87, 82.00, 6.50]
    
    print(f"Test Input: {sample_input}")
    print(f"Features: {TRAINING_FEATURES}")
    
    # Scale input
    input_scaled = scaler.transform([sample_input])
    
    # Random Forest prediction
    rf_pred = rf_model.predict(input_scaled)[0]
    rf_crop = label_encoder.inverse_transform([rf_pred])[0]
    print(f"\n🌲 Random Forest Prediction: {rf_crop}")
    
    # Naive Bayes prediction
    nb_pred = nb_model.predict(input_scaled)[0]
    nb_crop = label_encoder.inverse_transform([nb_pred])[0]
    print(f"📊 Naive Bayes Prediction: {nb_crop}")
    
    if rf_crop == nb_crop:
        print("\n✅ Models AGREE! This is a highly confident prediction.")
    else:
        print("\n⚠️ Models DISAGREE. Both predictions will be provided to the user.")


def main():
    """Main training pipeline."""
    
    print("\n" + "=" * 60)
    print("  CROP RECOMMENDATION ML TRAINING PIPELINE")
    print("  Based on Blended Malaysia + India Datasets")
    print("=" * 60 + "\n")
    
    try:
        # Step 1: Load data
        df = load_and_prepare_data()
        
        # Step 2: Prepare train/test split
        X_train, X_test, y_train, y_test, scaler, label_encoder = prepare_train_test_split(df)
        
        # Step 3: Compare models
        comparison_df = compare_models(X_train, y_train, X_test, y_test)
        
        # Step 4: Tune Random Forest
        best_rf = tune_random_forest(X_train, y_train)
        
        # Step 5: Tune Naive Bayes
        best_nb = tune_naive_bayes(X_train, y_train)
        
        # Step 6: Save models
        save_models(best_rf, best_nb, scaler, label_encoder)
        
        # Step 7: Test predictions
        test_predictions(best_rf, best_nb, scaler, label_encoder)
        
        print("\n" + "=" * 60)
        print("  TRAINING COMPLETE!")
        print("  Models saved to:", MODELS_DIR)
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
