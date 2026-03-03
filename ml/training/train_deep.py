import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, PolynomialFeatures, MinMaxScaler
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE, ADASYN
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# Load Data
data_path = 'data/cleaned/cleaned water potability.csv'
if not os.path.exists(data_path):
    data_path = 'data/kaggle/water potability.csv'

print(f"Loading data from {data_path}...")
df = pd.read_csv(data_path)

X = df.drop('Potability', axis=1)
y = df['Potability']

# 1. Feature Engineering: Polynomial
print("Generating Polynomial Features (Degree 2)...")
# Using degree 2 because 3 explodes the feature space too much for this dataset size
poly = PolynomialFeatures(degree=2, interaction_only=False, include_bias=False)
X_poly = poly.fit_transform(X) # We impute *before* poly?? No, NaN issue. 

# Correct Pipeline: Impute -> Poly -> Scale -> SMOTE
print("Preprocessing...")
imputer = SimpleImputer(strategy='median')
X_imputed = imputer.fit_transform(X)

X_poly = poly.fit_transform(X_imputed)
print(f"New feature count: {X_poly.shape[1]}")

scaler = StandardScaler
X_scaled = scaler.fit_transform(X_poly)

# 2. SMOTE (ADASYN sometimes better for decision boundaries)
print("Applying ADASYN (Adaptive Synthetic Sampling)...")
smote = ADASYN(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_scaled, y)

# 3. Split
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.1, random_state=42)

# 4. Deep Neural Network
print("Training Deep Neural Network...")
# Validated architecture for this complexity
mlp = MLPClassifier(hidden_layer_sizes=(512, 256, 128, 64),
                    activation='relu',
                    solver='adam',
                    alpha=0.0001,
                    batch_size='auto',
                    learning_rate='adaptive',
                    learning_rate_init=0.001,
                    max_iter=1000,
                    early_stopping=True,
                    n_iter_no_change=20,
                    random_state=42,
                    verbose=True)

mlp.fit(X_train, y_train)

# 5. Evaluation
preds = mlp.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"\n---------------------------------------------------")
print(f"Deep Neural Network Accuracy: {acc:.4f}")
print("---------------------------------------------------")

# 6. Hybrid Ensemble (RF + MLP)
# RF is good at discrete splits, MLP at manifolds. combining them might help.
print("Training Random Forest on Expanded Features...")
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=42)
rf.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test))
print(f"Random Forest (Poly) Accuracy: {rf_acc:.4f}")

# Save the best one
model_to_save = mlp if acc > rf_acc else rf
best_acc_final = max(acc, rf_acc)

os.makedirs('models', exist_ok=True)
joblib.dump(model_to_save, 'models/best_model_deep.pkl')
joblib.dump(scaler, 'models/scaler_deep.pkl')
joblib.dump(imputer, 'models/imputer_deep.pkl')
joblib.dump(poly, 'models/poly_deep.pkl')

print("Classification Report:")
print(classification_report(y_test, model_to_save.predict(X_test)))
