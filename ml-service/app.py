from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

model = None
city_encoder = None
locality_encoder = None
metadata = None


def ensure_model_exists():
    if not os.path.exists('model/rent_model.pkl'):
        logger.info("Model not found — training now (2-3 mins)...")
        try:
            import subprocess
            result = subprocess.run(
                ['python', 'train_model.py'],
                capture_output=True,
                text=True,
                timeout=300
            )
            if result.returncode == 0:
                logger.info("Model trained successfully")
                logger.info(result.stdout[-500:])
            else:
                logger.error(f"Training failed: {result.stderr[-500:]}")
        except subprocess.TimeoutExpired:
            logger.error("Training timed out after 5 minutes")
        except Exception as e:
            logger.error(f"Auto-train error: {e}")
    else:
        logger.info("Model files found — skipping training")


def load_model():
    global model, city_encoder, locality_encoder, metadata
    try:
        model = joblib.load('model/rent_model.pkl')
        city_encoder = joblib.load('model/city_encoder.pkl')
        locality_encoder = joblib.load('model/locality_encoder.pkl')

        with open('model/metadata.json', 'r') as f:
            metadata = json.load(f)

        logger.info("Model loaded successfully")
        logger.info(f"R²: {metadata['r2']} | MAE: ₹{metadata['mae']:,}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")


# Auto-train if needed then load
ensure_model_exists()
load_model()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok" if model is not None else "model_not_loaded",
        "service": "RentEase ML Service",
        "model_loaded": model is not None,
        "model_accuracy": {
            "r2": metadata['r2'],
            "mae": metadata['mae'],
            "median_ae": metadata.get('median_ae'),
            "mape": metadata['mape'],
            "training_samples": metadata['training_samples']
        } if metadata else None
    })


@app.route('/cities', methods=['GET'])
def get_cities():
    if metadata is None:
        return jsonify({"error": "Model not loaded"}), 500
    return jsonify({
        "cities": metadata['cities'],
        "count": len(metadata['cities'])
    })


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "ML model not loaded"}), 500

    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        bhk = int(data.get('bhk', 2))
        sqft = float(data.get('sqft', 1000))
        floor_num = int(data.get('floor', 0))
        furnished = int(data.get('furnished', 1))
        bathrooms = int(data.get('bathrooms', bhk))
        city = str(data.get('city', ''))
        locality = str(data.get('locality', ''))

        cities = metadata['cities']
        if city in cities:
            city_encoded = int(city_encoder.transform([city])[0])
            city_median_rent = metadata['city_median_rent'].get(city, 20000)
        else:
            fallback_city = 'Hyderabad' if 'Hyderabad' in cities else cities[0]
            city_encoded = int(city_encoder.transform([fallback_city])[0])
            city_median_rent = metadata['city_median_rent'].get(fallback_city, 20000)
            logger.warning(f"Unknown city: {city}, using {fallback_city}")

        localities = metadata['localities']
        if locality in localities:
            locality_encoded = int(locality_encoder.transform([locality])[0])
        else:
            locality_encoded = len(localities) // 2
            logger.warning(f"Unknown locality: {locality}, using median index")

        size_log = np.log1p(sqft)
        size_per_bhk = sqft / max(bhk, 1)
        floor_ratio = floor_num / 10.0
        bath_per_bhk = bathrooms / max(bhk, 1)

        features = np.array([[
            bhk,
            sqft,
            size_log,
            size_per_bhk,
            floor_num,
            floor_ratio,
            furnished,
            bathrooms,
            bath_per_bhk,
            city_encoded,
            city_median_rent,
            locality_encoded,
        ]])

        predicted_rent = float(model.predict(features)[0])
        predicted_rent = max(predicted_rent, 3000)

        min_rent = int(predicted_rent * 0.85)
        max_rent = int(predicted_rent * 1.15)
        suggested = int(predicted_rent)

        logger.info(
            f"Prediction: {bhk}BHK {sqft}sqft "
            f"in {city}/{locality} → ₹{suggested:,}"
        )

        return jsonify({
            "min_rent": min_rent,
            "suggested": suggested,
            "max_rent": max_rent,
            "currency": "INR",
            "city": city,
            "model_r2": metadata['r2'],
            "inputs": {
                "bhk": bhk,
                "sqft": sqft,
                "floor": floor_num,
                "furnished": furnished,
                "bathrooms": bathrooms,
                "city": city,
                "locality": locality
            }
        })

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')