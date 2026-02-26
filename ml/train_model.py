import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import joblib
import os

# Load Data
data_path = 'data/cleaned/cleaned water potability.csv'
if not os.path.exists(data_path):
    data_path = 'data/kaggle/water potability.csv'

print(f"Loading data from {data_path}...")
df = pd.read_csv(data_path)

# Preprocessing
print("Preprocessing data...")
# Handle missing values if any (though cleaned data should be clean)
imputer = SimpleImputer(strategy='mean')
X = df.drop('Potability', axis=1)
y = df['Potability']

X_imputed = imputer.fit_transform(X)
scaler = StandardScaler
X_scaled = scaler.fit_transform(X_imputed)

# Split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Models to Train
models = {
    'RandomForest': RandomForestClassifier(random_state=42),
    'GradientBoosting': GradientBoostingClassifier(random_state=42)
}

# Hyperparameter Grids
param_grids = {
    'RandomForest': {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    },
    'GradientBoosting': {
        'n_estimators': [100, 200],
        'learning_rate': [0.05, 0.1, 0.2],
        'max_depth': [3, 5, 7]
    }
}

best_model = None
best_accuracy = 0
best_model_name = 

print("Starting training...")

for name, model in models.items:
    print(f"Training {name}...")
    grid = GridSearchCV(model, param_grids[name], cv=5, scoring='accuracy', n_jobs=-1)
    grid.fit(X_train, y_train)
    
    y_pred = grid.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"{name} Best Params: {grid.best_params_}")
    print(f"{name} Accuracy: {accuracy:.4f}")
    
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = grid.best_estimator_
        best_model_name = name

print("\n---------------------------------------------------")
print(f"Best Model: {best_model_name}")
print(f"Best Accuracy: {best_accuracy:.4f}")
print("---------------------------------------------------")

# Save Model
if best_model:
    os.makedirs('models', exist_ok=True)
    model_path = f'models/best_water_quality_model.pkl'
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, 'models/scaler.pkl')
    print(f"Model saved to {model_path}")
    
    # Generate Report
    print("Classification Report:")
    print(classification_report(y_test, best_model.predict(X_test)))
