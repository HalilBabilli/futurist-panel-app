// Futurist Panel - Main Application Logic

(function() {
    'use strict';

    // DOM Elements
    const elements = {
        topicInput: document.getElementById('topicInput'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        quickTopics: document.querySelectorAll('.quick-topic'),
        analystCards: document.querySelectorAll('.analyst-card'),
        modeOptions: document.querySelectorAll('.mode-option'),
        resultsSection: document.getElementById('resultsSection'),
        topicDisplay: document.getElementById('topicDisplay'),
        topicText: document.getElementById('topicText'),
        panelsContainer: document.getElementById('panelsContainer'),
        synthesisSection: document.getElementById('synthesisSection'),
        synthesisContent: document.getElementById('synthesisContent'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        exportBtn: document.getElementById('exportBtn'),
        clearBtn: document.getElementById('clearBtn'),
        promptModal: document.getElementById('promptModal'),
        closeModal: document.getElementById('closeModal'),
        promptPreview: document.getElementById('promptPreview'),
        copyFullPrompt: document.getElementById('copyFullPrompt'),
        loadingOverlay: document.getElementById('loadingOverlay')
    };

    // State
    let currentTopic = '';
    let currentPrompt = '';
    let selectedAnalysts = ['tech', 'geopolitical', 'societal', 'business', 'historical'];
    let selectedMode = 'standard';

    // Initialize
    function init() {
        setupEventListeners();
        updateAnalystSelection();
        hideResults();
    }

    // Event Listeners
    function setupEventListeners() {
        // Analyze button
        elements.analyzeBtn.addEventListener('click', handleAnalyze);

        // Enter key on input
        elements.topicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAnalyze();
            }
        });

        // Quick topics
        elements.quickTopics.forEach(btn => {
            btn.addEventListener('click', () => {
                const topic = btn.dataset.topic;
                elements.topicInput.value = topic;
                elements.topicInput.focus();
            });
        });

        // Analyst selection
        elements.analystCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent double-toggling from checkbox
                if (e.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                updateAnalystSelection();
            });
        });

        // Mode selection
        elements.modeOptions.forEach(option => {
            option.addEventListener('click', () => {
                elements.modeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                selectedMode = radio.value;
            });
        });

        // Copy prompt button
        elements.copyPromptBtn.addEventListener('click', showPromptModal);

        // Export button
        elements.exportBtn.addEventListener('click', handleExport);

        // Clear button
        elements.clearBtn.addEventListener('click', handleClear);

        // Modal close
        elements.closeModal.addEventListener('click', hidePromptModal);
        elements.promptModal.addEventListener('click', (e) => {
            if (e.target === elements.promptModal) {
                hidePromptModal();
            }
        });

        // Copy full prompt
        elements.copyFullPrompt.addEventListener('click', copyPromptToClipboard);

        // Escape key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.promptModal.classList.contains('active')) {
                hidePromptModal();
            }
        });
    }

    // Update analyst selection state
    function updateAnalystSelection() {
        selectedAnalysts = [];
        elements.analystCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            const analystId = card.dataset.analyst;
            if (checkbox.checked) {
                card.classList.add('selected');
                selectedAnalysts.push(analystId);
            } else {
                card.classList.remove('selected');
            }
        });
    }

    // Handle analyze button click
    function handleAnalyze() {
        const topic = elements.topicInput.value.trim();

        if (!topic) {
            shakeElement(elements.topicInput);
            elements.topicInput.focus();
            return;
        }

        if (selectedAnalysts.length === 0) {
            alert('Please select at least one analyst.');
            return;
        }

        currentTopic = topic;
        showLoading();

        // Simulate brief processing time for UX
        setTimeout(() => {
            generateAnalysis();
            hideLoading();
        }, 500);
    }

    // Generate the analysis UI
    function generateAnalysis() {
        // Generate prompt
        currentPrompt = window.FuturistSkills.generatePrompt(
            currentTopic,
            selectedAnalysts,
            selectedMode
        );

        // Update topic display
        elements.topicText.textContent = currentTopic;

        // Generate analyst panels
        const panelsHTML = selectedAnalysts.map(analystId => {
            const analyst = window.FuturistSkills.ANALYSTS[analystId];
            return generateAnalystPanelHTML(analyst);
        }).join('');

        elements.panelsContainer.innerHTML = panelsHTML;

        // Setup panel interactions
        setupPanelInteractions();

        // Update synthesis section
        updateSynthesisSection();

        // Show results
        showResults();

        // Scroll to results
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Generate HTML for an analyst panel
    function generateAnalystPanelHTML(analyst) {
        return `
            <div class="analyst-panel" data-analyst="${analyst.id}">
                <div class="panel-header" style="--analyst-color: ${analyst.color}">
                    <span class="panel-icon">${analyst.icon}</span>
                    <div class="panel-title">
                        <h3>${analyst.name}</h3>
                        <span class="panel-focus">${analyst.focus}</span>
                    </div>
                    <button class="panel-toggle" title="Expand/Collapse">
                        <span>▼</span>
                    </button>
                </div>
                <div class="panel-content">
                    <div class="panel-placeholder active">
                        <div class="placeholder-icon">📋</div>
                        <p>Run the generated prompt in Claude, then paste the <strong>${analyst.name}</strong>'s analysis here.</p>
                        <button class="paste-btn">Paste Analysis</button>
                    </div>
                    <div class="panel-analysis">
                        <div class="analysis-text"></div>
                        <button class="edit-btn">Edit</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup panel interactions
    function setupPanelInteractions() {
        const panels = document.querySelectorAll('.analyst-panel');

        panels.forEach(panel => {
            const toggleBtn = panel.querySelector('.panel-toggle');
            const pasteBtn = panel.querySelector('.paste-btn');
            const editBtn = panel.querySelector('.edit-btn');
            const placeholder = panel.querySelector('.panel-placeholder');
            const analysisDiv = panel.querySelector('.panel-analysis');
            const analysisText = panel.querySelector('.analysis-text');

            // Toggle expand/collapse
            toggleBtn.addEventListener('click', () => {
                panel.classList.toggle('collapsed');
                toggleBtn.querySelector('span').textContent =
                    panel.classList.contains('collapsed') ? '▶' : '▼';
            });

            // Paste button
            pasteBtn.addEventListener('click', async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text.trim()) {
                        analysisText.innerHTML = formatAnalysisText(text);
                        placeholder.classList.remove('active');
                        analysisDiv.classList.add('active');
                    }
                } catch (err) {
                    // Fallback: prompt for input
                    const text = prompt('Paste the analysis text:');
                    if (text && text.trim()) {
                        analysisText.innerHTML = formatAnalysisText(text);
                        placeholder.classList.remove('active');
                        analysisDiv.classList.add('active');
                    }
                }
            });

            // Edit button
            editBtn.addEventListener('click', () => {
                const currentText = analysisText.textContent;
                const newText = prompt('Edit the analysis:', currentText);
                if (newText !== null) {
                    if (newText.trim()) {
                        analysisText.innerHTML = formatAnalysisText(newText);
                    } else {
                        placeholder.classList.add('active');
                        analysisDiv.classList.remove('active');
                    }
                }
            });
        });
    }

    // Format analysis text for display
    function formatAnalysisText(text) {
        // Basic markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    // Update synthesis section
    function updateSynthesisSection() {
        elements.synthesisContent.innerHTML = `
            <div class="synthesis-placeholder">
                <div class="placeholder-icon">🎯</div>
                <p>After pasting all analyst perspectives, paste the <strong>Futurist Prime Synthesis</strong> here.</p>
                <button class="paste-synthesis-btn">Paste Synthesis</button>
            </div>
            <div class="synthesis-analysis">
                <div class="synthesis-text"></div>
                <button class="edit-synthesis-btn">Edit</button>
            </div>
        `;

        const pasteBtn = elements.synthesisContent.querySelector('.paste-synthesis-btn');
        const editBtn = elements.synthesisContent.querySelector('.edit-synthesis-btn');
        const placeholder = elements.synthesisContent.querySelector('.synthesis-placeholder');
        const analysisDiv = elements.synthesisContent.querySelector('.synthesis-analysis');
        const synthesisText = elements.synthesisContent.querySelector('.synthesis-text');

        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text.trim()) {
                    synthesisText.innerHTML = formatAnalysisText(text);
                    placeholder.style.display = 'none';
                    analysisDiv.classList.add('active');
                }
            } catch (err) {
                const text = prompt('Paste the synthesis text:');
                if (text && text.trim()) {
                    synthesisText.innerHTML = formatAnalysisText(text);
                    placeholder.style.display = 'none';
                    analysisDiv.classList.add('active');
                }
            }
        });

        editBtn.addEventListener('click', () => {
            const currentText = synthesisText.textContent;
            const newText = prompt('Edit the synthesis:', currentText);
            if (newText !== null) {
                if (newText.trim()) {
                    synthesisText.innerHTML = formatAnalysisText(newText);
                } else {
                    placeholder.style.display = 'flex';
                    analysisDiv.classList.remove('active');
                }
            }
        });
    }

    // Show prompt modal
    function showPromptModal() {
        if (!currentPrompt) {
            alert('Please generate an analysis first.');
            return;
        }
        elements.promptPreview.value = currentPrompt;
        elements.promptModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Hide prompt modal
    function hidePromptModal() {
        elements.promptModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Copy prompt to clipboard
    async function copyPromptToClipboard() {
        try {
            await navigator.clipboard.writeText(currentPrompt);
            const btn = elements.copyFullPrompt;
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            elements.promptPreview.select();
            document.execCommand('copy');
            alert('Prompt copied to clipboard!');
        }
    }

    // Handle export
    function handleExport() {
        const panels = document.querySelectorAll('.analyst-panel');
        let exportText = `FUTURIST PANEL ANALYSIS\n`;
        exportText += `Topic: ${currentTopic}\n`;
        exportText += `Date: ${new Date().toLocaleDateString()}\n`;
        exportText += `${'═'.repeat(60)}\n\n`;

        panels.forEach(panel => {
            const analyst = window.FuturistSkills.ANALYSTS[panel.dataset.analyst];
            const analysisText = panel.querySelector('.analysis-text');

            exportText += `${analyst.icon} ${analyst.name.toUpperCase()}\n`;
            exportText += `${'─'.repeat(40)}\n`;

            if (analysisText && analysisText.textContent.trim()) {
                exportText += analysisText.textContent + '\n\n';
            } else {
                exportText += '[No analysis provided]\n\n';
            }
        });

        const synthesisText = elements.synthesisContent.querySelector('.synthesis-text');
        exportText += `${'═'.repeat(60)}\n`;
        exportText += `🎯 FUTURIST PRIME SYNTHESIS\n`;
        exportText += `${'═'.repeat(60)}\n`;

        if (synthesisText && synthesisText.textContent.trim()) {
            exportText += synthesisText.textContent + '\n';
        } else {
            exportText += '[No synthesis provided]\n';
        }

        // Download as text file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `futurist-panel-${slugify(currentTopic)}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Handle clear
    function handleClear() {
        if (confirm('Are you sure you want to clear all results?')) {
            hideResults();
            currentTopic = '';
            currentPrompt = '';
            elements.topicInput.value = '';
            elements.topicInput.focus();
        }
    }

    // Show/hide results section
    function showResults() {
        elements.resultsSection.classList.add('active');
    }

    function hideResults() {
        elements.resultsSection.classList.remove('active');
    }

    // Show/hide loading overlay
    function showLoading() {
        elements.loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        elements.loadingOverlay.classList.remove('active');
    }

    // Shake animation for validation
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    // Slugify text for filename
    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
