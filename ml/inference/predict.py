import argparse
import joblib
import pandas as pd
import numpy as np
import os
import sys

def load_artifacts(model_dir='../models'):
    # Try deep model first
    model_path = os.path.join(model_dir, 'best_model_deep.pkl')
    scaler_path = os.path.join(model_dir, 'scaler_deep.pkl')
    imputer_path = os.path.join(model_dir, 'imputer_deep.pkl')
    poly_path = os.path.join(model_dir, 'poly_deep.pkl')
    
    if not os.path.exists(model_path):
        # Fallback to advanced
        model_path = os.path.join(model_dir, 'best_model_advanced.pkl')
        scaler_path = os.path.join(model_dir, 'scaler_advanced.pkl')
        imputer_path = os.path.join(model_dir, 'imputer_advanced.pkl')
        poly_path = None
    
    if not os.path.exists(model_path):
        print("Error: No trained model found in", model_dir)
        sys.exit(1)
        
    print(f"Loading model from {model_path}...")
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    imputer = joblib.load(imputer_path)
    poly = joblib.load(poly_path) if poly_path and os.path.exists(poly_path) else None
    
    return model, scaler, imputer, poly

def predict(args):
    model, scaler, imputer, poly = load_artifacts()
    
    # Input data (must match training columns in order)
    # ph, Hardness, Solids, Chloramines, Sulfate, Conductivity, Organic_carbon, Trihalomethanes, Turbidity
    feature_names = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 
                     'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity']
    
    # Parse input
    if args.input_csv:
        data = pd.read_csv(args.input_csv)
    else:
        # Example default
        data = pd.DataFrame([args.features], columns=feature_names)
        
    # Preprocess
    # 1. Impute
    data_imputed = imputer.transform(data)
    
    # 2. Poly
    if poly:
        data_poly = poly.transform(data_imputed)
        data_to_scale = data_poly
    else:
        data_to_scale = data_imputed
        
    # 3. Scale
    data_scaled = scaler.transform(data_to_scale)
    
    # Predict
    prediction = model.predict(data_scaled)
    proba = model.predict_proba(data_scaled)[:, 1]
    
    results = pd.DataFrame({
        'Prediction (0=Not Potable, 1=Potable)': prediction,
        'Confidence': proba
    })
    
    print("\nPrediction Results:")
    print(results)
    
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='BlueSentinel Water Quality Prediction')
    parser.add_argument('--input_csv', type=str, help='Path to input CSV file')
    parser.add_argument('--features', type=float, nargs='+', 
                        default=[7.0, 200.0, 20000.0, 7.0, 300.0, 400.0, 10.0, 60.0, 4.0],
                        help='Input features: pH Hardness Solids Chloramines Sulfate Conductivity Carbon Trihalo Turbidity')
    
    args = parser.parse_args()
    predict(args)
