from flask import Flask, request, jsonify, render_template
import os
import PyPDF2
import docx
from checker import analyze_document

app = Flask(__name__)

def extract_text(file, filename):
    ext = filename.rsplit('.', 1)[1].lower()
    text = ""
    
    if ext == 'txt':
        text = file.read().decode('utf-8', errors='ignore')
    elif ext == 'pdf':
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            t = page.extract_text()
            if t: text += t + "\n"
    elif ext == 'docx':
        doc = docx.Document(file)
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        raise ValueError(f"Unsupported file format: {ext}")
        
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        text = extract_text(file, file.filename)
        
        if not text.strip():
            return jsonify({"error": "Could not extract any text from the document. It might be an image-based PDF or empty."}), 400
            
        results = analyze_document(text)
        
        # Calculate stats
        passed_count = sum(1 for r in results if r['passed'])
        total_count = len(results)
        
        return jsonify({
            "success": True,
            "filename": file.filename,
            "stats": {
                "passed": passed_count,
                "total": total_count,
                "score": round((passed_count / total_count) * 100) if total_count > 0 else 0
            },
            "results": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
