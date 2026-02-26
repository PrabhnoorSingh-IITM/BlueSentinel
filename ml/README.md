# BlueSentinel Machine Learning

This directory contains the AI/ML pipeline for the BlueSentinel project, focusing on Water Quality Index (WQI) prediction.

## 🧠 Model Architecture

**Algorithm**: Random Forest Regressor
**Goal**: Predict `Water Quality Index (WQI)` based on sensor inputs.

### Features (inputs)

- Temperature (°C)
- pH
- Turbidity (NTU)
- Dissolved Oxygen (mg/L)

### Target (Output)

- WQI Score (0-100)
- Classification: *Excellent, Good, Poor, Unsafe (Freshwater Standards)*

---

## 📂 Directory Structure

```text
ml/
├── data/
│  ├── raw/       # Original datasets
│  └── processed/    # Cleaned CSVs ready for training
├── models/
│  └── wqi_model.pkl   # Serialized trained model
├── notebooks/
│  └── exploratory.ipynb # Data analysis and experiments
├── src/
│  ├── train_model.py  # Training script
│  └── inference.py   # Prediction script for the backend
└── requirements.txt   # Python dependencies
```

---

## 🚀 Usage

### 1. Training

To retrain the model with new data:

```bash
python src/train_model.py --data data/processed/water_quality.csv
```

output: `models/wqi_model.pkl` (Accuracy: ~94%)

### 2. Inference

To run a prediction on a new data point:

```bash
python src/inference.py --temp 25 --ph 7.2 --turb 5 --do 8.0
```

output: `{"wqi": 88, "class": "Good"}`

---

## 🔗 Integration

This ML model is wrapped in a Python Cloud Function (or local script) that:

1. Listens to Firebase `sensors/latest`.
2. Runs inference.
3. Updates `analysis/wqi_score` in Firebase for the Dashboard to display.
