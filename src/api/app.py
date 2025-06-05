from flask import Flask, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_latest_data():
    """Get the latest data from the JSON file"""
    try:
        # Get the path to the latest data file
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../public/data'))
        latest_file = os.path.join(data_dir, 'membean_data_latest.json')
        
        if not os.path.exists(latest_file):
            return None
            
        with open(latest_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading latest data: {e}")
        return None

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students data"""
    data = get_latest_data()
    if not data:
        return jsonify({'error': 'No data available'}), 404
        
    return jsonify(data)

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get data for a specific student"""
    data = get_latest_data()
    if not data:
        return jsonify({'error': 'No data available'}), 404
        
    student_data = data.get('students', {}).get(student_id)
    if not student_data:
        return jsonify({'error': 'Student not found'}), 404
        
    return jsonify(student_data)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 