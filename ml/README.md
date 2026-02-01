# BlueSentinel Machine Learning

This directory will contain ML models for water quality predictions and anomaly detection.

## Current Status

🔴 **Not yet implemented** - This is planned for future development.

## Planned ML Features

### 1. Health Score Prediction
- Input: Temperature, pH, turbidity, DO, salinity
- Output: Marine health score (0-100)
- Model: Random Forest or Gradient Boosting
- Training data: Historical sensor readings with labeled health scores

### 2. Anomaly Detection
- Input: Real-time sensor readings
- Output: Anomaly flag + confidence score
- Model: Isolation Forest or AutoEncoder
- Use case: Detect sudden pollution events

### 3. Time Series Forecasting
- Input: Historical sensor data
- Output: Predicted values for next 24-48 hours
- Model: LSTM or Prophet
- Use case: Predict when pH/temperature will breach thresholds

### 4. Classification
- Input: Multiple sensor readings
- Output: Water quality category (Excellent, Good, Fair, Poor, Critical)
- Model: Neural Network or XGBoost
- Training data: Labeled water quality samples

## Project Structure (Planned)

```
ml/
├── data/
│   ├── raw/              # Raw sensor data
│   ├── processed/        # Cleaned and preprocessed data
│   └── kaggle/           # External datasets
├── notebooks/
│   ├── training.ipynb    # Model training experiments
│   ├── evaluation.ipynb  # Model evaluation and metrics
│   └── eda.ipynb         # Exploratory data analysis
├── models/
│   ├── health_score.pkl  # Trained health score model
│   ├── anomaly.pkl       # Trained anomaly detector
│   └── forecast.pkl      # Time series model
├── inference/
│   ├── predict.py        # Prediction scripts
│   └── preprocess.py     # Data preprocessing utilities
└── requirements.txt      # Python dependencies
```

## Tech Stack (Planned)

### Libraries
- **pandas**: Data manipulation
- **numpy**: Numerical computations
- **scikit-learn**: Traditional ML models
- **tensorflow/pytorch**: Deep learning
- **prophet**: Time series forecasting
- **joblib**: Model serialization

### Deployment
- Firebase Cloud Functions (Python)
- Scheduled predictions every hour
- Real-time anomaly detection on new data points

## Data Collection Strategy

### Phase 1: Simulated Data
- Generate synthetic sensor data based on:
  - Normal daily/seasonal patterns
  - Pollution event scenarios
  - Sensor noise and drift
- Use for initial model development

### Phase 2: Real Sensor Data
- Collect data from deployed ESP32
- Minimum 1 month of continuous data
- Label major events (rain, pollution, etc.)

### Phase 3: External Datasets
- Download public water quality datasets
- Kaggle ocean monitoring data
- Government environmental data

## Model Training Pipeline

```python
# Pseudocode for health score model

1. Load sensor data from Firebase
2. Preprocess:
   - Handle missing values
   - Remove outliers
   - Normalize features
3. Feature engineering:
   - Rolling averages
   - Rate of change
   - Time-based features
4. Split train/test (80/20)
5. Train Random Forest model
6. Hyperparameter tuning (GridSearch)
7. Evaluate on test set
8. Save model to models/
9. Deploy to Cloud Function
```

## Evaluation Metrics

### Health Score Model
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- R² Score

### Anomaly Detection
- Precision, Recall, F1-Score
- ROC-AUC curve
- False positive rate (critical!)

### Time Series Forecasting
- MAPE (Mean Absolute Percentage Error)
- MAE for different time horizons
- Visual inspection of predictions

## Integration with Dashboard

Once models are trained:
1. Deploy model to Firebase Cloud Function
2. Trigger prediction on new sensor data
3. Store prediction in Firebase at `/predictions/`
4. Dashboard reads prediction and displays:
   - Health score gauge
   - Anomaly alert banner
   - Forecasted values graph

## Getting Started (Future)

```bash
# Set up Python environment
cd ml/
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run example training notebook
jupyter notebook notebooks/training.ipynb

# Make predictions
python inference/predict.py --model health_score --input data.json
```

## Contributing

ML contributions welcome! Focus areas:
- Data collection scripts
- Model architectures
- Feature engineering ideas
- Hyperparameter tuning
- Model interpretability (SHAP, LIME)

## Resources

- [Kaggle Water Quality Dataset](https://www.kaggle.com/datasets/adityakadiwal/water-potability)
- [UCI Water Quality Dataset](https://archive.ics.uci.edu/ml/datasets/water+quality)
- [EPA Water Quality Data](https://www.epa.gov/waterdata)
- [Prophet Documentation](https://facebook.github.io/prophet/)
- [scikit-learn Docs](https://scikit-learn.org/)

## Research Papers

- "Deep Learning for Water Quality Prediction" (2020)
- "Anomaly Detection in Sensor Networks" (2019)
- "Time Series Forecasting with LSTM Networks" (2017)

---

**Note:** This is a roadmap. Implementation will begin after we have sufficient real sensor data collected.
