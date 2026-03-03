import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import joblib
import os
import sys

# Try to import XGBoost/LightGBM, else fallback
try:
    from xgboost import XGBClassifier
    has_xgb = True
except ImportError:
    has_xgb = False
    print("XGBoost not found. Install with 'pip install xgboost'")

try:
    from lightgbm import LGBMClassifier
    has_lgbm = True
except ImportError:
    has_lgbm = False
    print("LightGBM not found. Install with 'pip install lightgbm'")

# Load Data
data_path = 'data/cleaned/cleaned water potability.csv'
if not os.path.exists(data_path):
    data_path = 'data/kaggle/water potability.csv'

print(f"Loading data from {data_path}...")
df = pd.read_csv(data_path)

# 1. Feature Engineering (Basic interactions)
# Add basic domain-specific ratios if possible, or just interaction terms
# For now, we'll rely on the models to find interactions, but PolynomialFeatures can help
# df['ph_turbidity'] = df['ph'] * df['Turbidity'] # Example

X = df.drop('Potability', axis=1)
y = df['Potability']

# 2. Imputation & Scaling
print("Preprocessing...")
imputer = SimpleImputer(strategy='median') # Median often better for skewed data
scaler = StandardScaler()

X_imputed = imputer.fit_transform(X)
X_scaled = scaler.fit_transform(X_imputed)

# 3. SMOTE for Imbalance
print("Applying SMOTE...")
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_scaled, y)

# 4. Split
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.15, random_state=42)

# 5. Define Models
models = []

# RandomForest
rf = RandomForestClassifier(n_estimators=300, max_depth=20, min_samples_split=2, n_jobs=-1, random_state=42)
models.append(('rf', rf))

# GradientBoosting
gb = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=7, random_state=42)
models.append(('gb', gb))

# XGBoost
if has_xgb:
    xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', n_estimators=300, learning_rate=0.05, max_depth=10, n_jobs=-1, random_state=42)
    models.append(('xgb', xgb))

# LightGBM
if has_lgbm:
    lgbm = LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=31, n_jobs=-1, random_state=42)
    models.append(('lgbm', lgbm))

# 6. Training & Tuning
best_acc = 0
best_model = None

print(f"Training {len(models)} base models...")

for name, model in models:
    print(f"Training {name}...")
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"{name} Accuracy: {acc:.4f}")
    
    if acc > best_acc:
        best_acc = acc
        best_model = model

# 7. Ensemble (Voting)
print("Training Voting Classifier...")
voting_clf = VotingClassifier(estimators=models, voting='soft', n_jobs=-1)
voting_clf.fit(X_train, y_train)
voting_preds = voting_clf.predict(X_test)
voting_acc = accuracy_score(y_test, voting_preds)
print(f"Voting Ensemble Accuracy: {voting_acc:.4f}")

if voting_acc > best_acc:
    best_acc = voting_acc
    best_model = voting_clf

print("\n---------------------------------------------------")
print(f"Best Accuracy Achieved: {best_acc:.4f}")
print("---------------------------------------------------")

# 8. Save
os.makedirs('models', exist_ok=True)
joblib.dump(best_model, 'models/best_model_advanced.pkl')
joblib.dump(scaler, 'models/scaler_advanced.pkl')
joblib.dump(imputer, 'models/imputer_advanced.pkl') # Save imputer too!

print("Classification Report (Best Model):")
print(classification_report(y_test, best_model.predict(X_test)))
