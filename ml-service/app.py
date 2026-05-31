from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "RentEase ML Service"})

@app.route('/predict', methods=['POST'])
def predict():
    # Placeholder prediction — real ML model added in Phase 2
    data = request.json
    sqft = data.get('sqft', 1000)
    bhk = data.get('bhk', 2)
    furnished = data.get('furnished', 1)  # 0=unfurnished, 1=semi, 2=furnished

    # Simple formula placeholder until real model is trained
    base = (sqft * 12) + (bhk * 2000) + (furnished * 1500)

    return jsonify({
        "min_rent": int(base * 0.9),
        "suggested": int(base),
        "max_rent": int(base * 1.1),
        "currency": "INR",
        "note": "Placeholder — ML model active in Phase 2"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)