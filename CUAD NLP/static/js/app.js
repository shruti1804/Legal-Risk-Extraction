document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const dropZoneContent = document.getElementById('dropZoneContent');
    const loaderContent = document.getElementById('loaderContent');
    const errorMsg = document.getElementById('errorMsg');
    
    const uploadSection = document.getElementById('uploadSection');
    const resultsSection = document.getElementById('resultsSection');
    
    const restartBtn = document.getElementById('restartBtn');

    // Drag & Drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    restartBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        dropZoneContent.classList.remove('hidden');
        loaderContent.classList.add('hidden');
        fileInput.value = '';
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        const validExts = ['pdf', 'txt', 'docx'];
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (!validExts.includes(ext)) {
            showError(`Error: Invalid file format (.${ext}). Please upload PDF, DOCX, or TXT.`);
            return;
        }

        uploadFile(file);
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 5000);
    }

    function uploadFile(file) {
        // Show loader
        dropZoneContent.classList.add('hidden');
        loaderContent.classList.remove('hidden');
        errorMsg.classList.add('hidden');
        dropZone.style.pointerEvents = 'none';

        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            displayResults(data);
        })
        .catch(err => {
            console.error(err);
            showError("Analysis failed: " + err.message);
            dropZoneContent.classList.remove('hidden');
            loaderContent.classList.add('hidden');
            dropZone.style.pointerEvents = 'auto';
        });
    }

    function displayResults(data) {
        document.getElementById('filenameDisplay').textContent = data.filename;
        
        // Update Score
        const scoreCircle = document.getElementById('scoreCircle');
        const scoreText = document.getElementById('scoreText');
        document.getElementById('passedCountText').textContent = `${data.stats.passed} / ${data.stats.total}`;
        
        // Define color based on score
        let strokeColor = 'var(--danger)';
        if (data.stats.score > 70) strokeColor = 'var(--success)';
        else if (data.stats.score > 40) strokeColor = '#f59e0b'; // warning
        
        scoreCircle.style.stroke = strokeColor;
        
        // Add tiny delay for animation
        setTimeout(() => {
            scoreCircle.setAttribute('stroke-dasharray', `${data.stats.score}, 100`);
            scoreText.textContent = `${data.stats.score}%`;
        }, 100);

        // Render Rules Grid
        const container = document.getElementById('rulesContainer');
        container.innerHTML = '';
        
        data.results.forEach(rule => {
            const isPassed = rule.passed;
            const badgeClass = isPassed ? 'badge-passed' : 'badge-failed';
            const badgeText = isPassed ? 'Passed' : 'Failed';
            
            const card = document.createElement('div');
            card.className = 'rule-card';
            
            let html = `
                <div class="rule-header">
                    <span class="rule-badge ${badgeClass}">${badgeText}</span>
                    <small style="color:var(--text-muted)">${rule.category}</small>
                </div>
                <h3>${rule.title}</h3>
                <p class="rule-desc">${rule.description}</p>
            `;
            
            if (isPassed && rule.snippet) {
                html += `
                    <div class="snippet">
                        "${highlightMatch(rule.snippet)}"
                    </div>
                `;
            }
            
            card.innerHTML = html;
            container.appendChild(card);
        });

        // Switch screens
        uploadSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        dropZone.style.pointerEvents = 'auto';
    }

    function highlightMatch(text) {
        // Just escape HTML to be safe
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
