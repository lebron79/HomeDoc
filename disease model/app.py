from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the model and vectorizer
model_path = 'disease_prediction_model.pkl'
vectorizer_path = 'tfidf_vectorizer.pkl'

print("Loading model and vectorizer...")
with open(model_path, 'rb') as f:
    model = pickle.load(f)

with open(vectorizer_path, 'rb') as f:
    vectorizer = pickle.load(f)
print("Model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': 'loaded'})

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        symptoms = data['symptoms']

        # Transform symptoms and make prediction
        symptoms_vector = vectorizer.transform([symptoms.lower()])
        prediction = model.predict(symptoms_vector)[0]

        # Get confidence if available
        confidence = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(symptoms_vector)
            confidence = float(probabilities.max() * 100)

        return jsonify({
            'success': True,
            'disease': prediction,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
