from flask import Flask, request, jsonify
import joblib
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load trained model ONCE at startup
model = joblib.load("water_potability_model.pkl")
print("Model loaded successfully")

@app.route("/", methods=["GET"])
def home:
    return "Riventhra ML Backend is running"

@app.route("/predict", methods=["POST"])
def predict:
    data = request.json

    # IMPORTANT: order must match training data
    features = np.array([[
        data["ph"],
        data["Hardness"],
        data["Solids"],
        data["Chloramines"],
        data["Sulfate"],
        data["Conductivity"],
        data["Organic_carbon"],
        data["Trihalomethanes"],
        data["Turbidity"]
    ]])

    prediction = model.predict(features)[0]

    return jsonify({
        "prediction": int(prediction),
        "result": "Potable" if prediction == 1 else "Not Potable"
    })

if __name__ == "__main__":
    app.run(debug=True)
