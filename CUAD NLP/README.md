# Local Contract Compliance Checker

A complete, locally-hosted web application designed to parse and evaluate legal contracts (PDF, DOCX, TXT) against 15 strict compliance rules.

## System Architecture

The application adopts a monolithic client-server architecture designed to operate entirely locally, ensuring that sensitive legal data is never transmitted over the network. 

1. **Frontend (Client):** A Vanilla HTML/CSS/JS Single Page Application (SPA). It maps the local browser File API to manage Document Drag-and-Drop, using `fetch()` to POST multipart form data for asynchronous, non-blocking requests.
2. **Backend (Server):** A Python Flask WSGI server running locally over HTTP (default port 5001). It exposes a RESTful API endpoint capable of binary file ingestion.
3. **Algorithm (Engine):** A heuristic rule-matching engine utilizing the `re` (Regex) module to test parsed contiguous document streams against pre-defined regular expressions derived from `Rules.py`.

## Technical Stack & Dependencies

### Backend Dependencies
- **Python (3.9+):** The root execution language.
- **Flask (`Flask==3.0.0`):** Acts as the primary backend server, handling routing and the HTTP request lifecycle.
- **Werkzeug (`werkzeug==3.0.1`):** WSGI utility library used by Flask for secure filename processing and request management.
- **PyPDF2 (`PyPDF2==3.0.1`):** Used to extract raw byte strings from unstructured Portable Document Format (`.pdf`) files.
- **python-docx (`python-docx==1.1.0`):** Specifically handles XML-based parsing for Microsoft Word (`.docx`) file structures.

### Frontend Technologies
- **HTML5:** Semantic architecture with hidden `multipart/form-data` input structures.
- **CSS3:** Custom variable implementation, CSS Grid and Flexbox layouts, glassmorphism UI structures (`backdrop-filter`), dynamic keyframe rendering for loading states, and SVG manipulation used for the dynamic score indicator.
- **JavaScript (ES6):** Asynchronous `Promises`, `FormData` packing, dynamic localized DOM injection, client-side error handling, and file verification.

## Heuristic Checking Engine (`checker.py`)

Due to the fundamental constraint of **zero external API usage** (preventing OpenAI/Gemini requests), the document evaluator functions as a deterministically mapped rule engine.

- **Data Structure:** The core rules data structure originates from `COMPLIANCE_RULES` in `Rules.py`.
- **Heuristic Mapping:** Inside `checker.py`, a `RULE_HEURISTICS` variable explicitly maps the ID of every rule to an array of robust regex boundary conditions (e.g., `r"limit[\w\s]{0,20}liability"` – this natively allows up to 20 whitespace or text characters between critical compliance keywords).
- **Extraction Behavior:** 
  - The entire document byte stream is transformed into a lowercase contiguous string array.
  - Using `re.search`, the algorithm sweeps the document for heuristic hits.
  - If a rule heuristic hits, the engine dynamically calculates a string boundary index (± 80 characters relative to the `match.start()` and `match.end()` functions) to slice the exact text snippet to act as the "source of truth".

## API Interface Definition

### `POST /api/analyze` 

Expects a multipart/form-data payload with the key `file` containing the target binary.

**Responses:**
- `200 OK`: Successful document extraction, returns a JSON Object with `status` (boolean), `filename` (string), `stats` object (`passed`, `total`, `score`), and a highly nested array of `results` containing boolean pass/fail states and Regex `snippets` associated with IDs.
- `400 Bad Request`: Raised dynamically when files are missing, malformed, unreadable (e.g., image-based PDFs without OCR layer), or empty.
- `500 Internal Server Error`: For unhandled parsing library failures or server processing panics.

## Limitations

- **Lack of Deep Semantic NLP:** Because this utilizes offline Heuristics (Regex arrays) instead of Transformers or LLMs, the checker evaluates the *explicit presence* of required legal boilerplate phrasing rather than its deeper contextual implications.
- **Image-Based Unsearchable PDFs:** `PyPDF2` cannot perform Optical Character Recognition (OCR). If a PDF is exclusively a scanned image, the text extraction index will return empty logic resulting in an automated frontend error.

---

## Getting Started

### Prerequisites

Ensure you have Python 3.9+ installed on your machine. 

### Installation

1. Open your terminal and navigate to the project root directory.
2. Install the necessary pip modules:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server

1. Start the Flask dev server:
   ```bash
   python3 app.py
   ```
2. Open your web browser and navigate to **[http://127.0.0.1:5001](http://127.0.0.1:5001)**.
