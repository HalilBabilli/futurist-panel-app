// Futurist Panel - Main Application Logic

(function() {
    'use strict';

    // DOM Elements
    const elements = {
        // API Section
        apiKeyInput: document.getElementById('apiKeyInput'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        saveApiKey: document.getElementById('saveApiKey'),
        apiStatus: document.getElementById('apiStatus'),

        // Input Section
        topicInput: document.getElementById('topicInput'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        quickTopics: document.querySelectorAll('.quick-topic'),
        analystCards: document.querySelectorAll('.analyst-card'),
        modeOptions: document.querySelectorAll('.mode-option'),
        selectAllBtn: document.getElementById('selectAllBtn'),
        deselectAllBtn: document.getElementById('deselectAllBtn'),

        // Results Section
        resultsSection: document.getElementById('resultsSection'),
        topicDisplay: document.getElementById('topicDisplay'),
        topicText: document.getElementById('topicText'),
        panelsContainer: document.getElementById('panelsContainer'),
        synthesisSection: document.getElementById('synthesisSection'),
        synthesisContent: document.getElementById('synthesisContent'),
        synthesisStatus: document.getElementById('synthesisStatus'),

        // Progress
        progressContainer: document.getElementById('progressContainer'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),

        // Action Buttons
        stopBtn: document.getElementById('stopBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),
        exportBtn: document.getElementById('exportBtn'),
        clearBtn: document.getElementById('clearBtn'),

        // Modal
        promptModal: document.getElementById('promptModal'),
        closeModal: document.getElementById('closeModal'),
        promptPreview: document.getElementById('promptPreview'),
        copyFullPrompt: document.getElementById('copyFullPrompt'),

        // Loading
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingText: document.getElementById('loadingText')
    };

    // State
    let currentTopic = '';
    let selectedAnalysts = ['tech', 'geopolitical', 'societal', 'business', 'historical'];
    let selectedMode = 'standard';
    let isGenerating = false;
    let analystResults = [];

    // Initialize
    function init() {
        setupEventListeners();
        updateAnalystSelection();
        updateApiStatus();
        hideResults();

        // Load saved API key if exists
        if (window.ClaudeAPI.isConfigured()) {
            elements.apiKeyInput.value = '••••••••••••••••';
        }
    }

    // Update API status display
    function updateApiStatus() {
        if (window.ClaudeAPI.isConfigured()) {
            elements.apiStatus.textContent = 'Connected';
            elements.apiStatus.className = 'api-status connected';
            elements.saveApiKey.textContent = 'Update';
        } else {
            elements.apiStatus.textContent = 'Not configured';
            elements.apiStatus.className = 'api-status';
            elements.saveApiKey.textContent = 'Save';
        }
    }

    // Event Listeners
    function setupEventListeners() {
        // API Key
        elements.saveApiKey.addEventListener('click', handleSaveApiKey);
        elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
        elements.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSaveApiKey();
        });

        // Analyze button
        elements.analyzeBtn.addEventListener('click', handleAnalyze);

        // Enter key on topic input
        elements.topicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAnalyze();
        });

        // Quick topics
        elements.quickTopics.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.topicInput.value = btn.dataset.topic;
                elements.topicInput.focus();
            });
        });

        // Analyst selection
        elements.analystCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                updateAnalystSelection();
            });
        });

        // Select All / Deselect All
        elements.selectAllBtn.addEventListener('click', () => {
            elements.analystCards.forEach(card => {
                const checkbox = card.querySelector('input[type="checkbox"]');
                checkbox.checked = true;
            });
            updateAnalystSelection();
        });

        elements.deselectAllBtn.addEventListener('click', () => {
            elements.analystCards.forEach(card => {
                const checkbox = card.querySelector('input[type="checkbox"]');
                checkbox.checked = false;
            });
            updateAnalystSelection();
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

        // Action buttons
        elements.stopBtn.addEventListener('click', handleStop);
        elements.regenerateBtn.addEventListener('click', handleRegenerate);
        elements.exportBtn.addEventListener('click', handleExport);
        elements.clearBtn.addEventListener('click', handleClear);

        // Modal
        elements.closeModal.addEventListener('click', hidePromptModal);
        elements.promptModal.addEventListener('click', (e) => {
            if (e.target === elements.promptModal) hidePromptModal();
        });
        elements.copyFullPrompt.addEventListener('click', copyPromptToClipboard);

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.promptModal.classList.contains('active')) {
                    hidePromptModal();
                }
            }
        });
    }

    // Handle API key save
    function handleSaveApiKey() {
        const key = elements.apiKeyInput.value.trim();

        if (!key || key === '••••••••••••••••') {
            shakeElement(elements.apiKeyInput);
            return;
        }

        if (window.ClaudeAPI.setApiKey(key)) {
            elements.apiKeyInput.value = '••••••••••••••••';
            elements.apiKeyInput.type = 'password';
            updateApiStatus();
            showNotification('API key saved successfully!', 'success');
        } else {
            showNotification('Invalid API key format. Should start with sk-ant-', 'error');
        }
    }

    // Toggle API key visibility
    function toggleApiKeyVisibility() {
        const isPassword = elements.apiKeyInput.type === 'password';
        elements.apiKeyInput.type = isPassword ? 'text' : 'password';
        elements.toggleApiKey.querySelector('span').textContent = isPassword ? '🔒' : '👁️';
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

    // Handle analyze button
    async function handleAnalyze() {
        const topic = elements.topicInput.value.trim();

        if (!topic) {
            shakeElement(elements.topicInput);
            elements.topicInput.focus();
            return;
        }

        if (selectedAnalysts.length === 0) {
            showNotification('Please select at least one analyst.', 'error');
            return;
        }

        if (!window.ClaudeAPI.isConfigured()) {
            showNotification('Please configure your Claude API key first.', 'error');
            elements.apiKeyInput.focus();
            return;
        }

        currentTopic = topic;
        await runAnalysis();
    }

    // Run the full analysis
    async function runAnalysis() {
        isGenerating = true;
        analystResults = [];

        // Setup UI
        elements.topicText.textContent = currentTopic;
        elements.stopBtn.style.display = 'inline-flex';
        showResults();
        showProgress();

        // Create analyst panels
        createAnalystPanels();

        // Scroll to results
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const totalSteps = selectedAnalysts.length + 1; // analysts + synthesis
        let currentStep = 0;

        try {
            // Run each analyst sequentially
            for (const analystId of selectedAnalysts) {
                if (!isGenerating) break;

                currentStep++;
                const analyst = window.FuturistSkills.ANALYSTS[analystId];
                updateProgress(currentStep, totalSteps, `${analyst.icon} ${analyst.name} is analyzing...`);

                const panel = document.querySelector(`.analyst-panel[data-analyst="${analystId}"]`);
                setPanelStatus(panel, 'generating');

                const prompt = window.FuturistSkills.generateAnalystPrompt(
                    currentTopic,
                    analystId,
                    selectedMode,
                    analystResults
                );

                const content = await streamToPanel(panel, prompt.system, prompt.user);

                if (content) {
                    analystResults.push({
                        id: analystId,
                        name: analyst.name,
                        content: content
                    });
                    setPanelStatus(panel, 'complete');
                }
            }

            // Run synthesis if we have results
            if (isGenerating && analystResults.length > 0) {
                currentStep++;
                updateProgress(currentStep, totalSteps, '🎯 Futurist Prime is synthesizing...');

                elements.synthesisStatus.textContent = 'Generating...';
                elements.synthesisStatus.className = 'synthesis-status generating';

                const synthPrompt = window.FuturistSkills.generateSynthesisPrompt(
                    currentTopic,
                    selectedMode,
                    analystResults
                );

                await streamToSynthesis(synthPrompt.system, synthPrompt.user);

                elements.synthesisStatus.textContent = 'Complete';
                elements.synthesisStatus.className = 'synthesis-status complete';
            }

            updateProgress(totalSteps, totalSteps, 'Analysis complete!');

        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            isGenerating = false;
            elements.stopBtn.style.display = 'none';
            setTimeout(hideProgress, 2000);
        }
    }

    // Stream response to analyst panel
    function streamToPanel(panel, systemPrompt, userMessage) {
        return new Promise((resolve, reject) => {
            const contentDiv = panel.querySelector('.panel-content-text');
            let fullContent = '';

            window.ClaudeAPI.streamMessage(
                systemPrompt,
                userMessage,
                // onChunk
                (chunk, fullText) => {
                    fullContent = fullText;
                    contentDiv.innerHTML = formatMarkdown(fullText);
                    contentDiv.scrollTop = contentDiv.scrollHeight;
                },
                // onComplete
                (text, aborted) => {
                    if (aborted) {
                        resolve(fullContent || null);
                    } else {
                        resolve(text);
                    }
                },
                // onError
                (error) => {
                    contentDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
                    reject(error);
                }
            );
        });
    }

    // Stream response to synthesis section
    function streamToSynthesis(systemPrompt, userMessage) {
        return new Promise((resolve, reject) => {
            elements.synthesisContent.innerHTML = '<div class="synthesis-text"></div>';
            const contentDiv = elements.synthesisContent.querySelector('.synthesis-text');

            window.ClaudeAPI.streamMessage(
                systemPrompt,
                userMessage,
                // onChunk
                (chunk, fullText) => {
                    contentDiv.innerHTML = formatMarkdown(fullText);
                    contentDiv.scrollTop = contentDiv.scrollHeight;
                },
                // onComplete
                (text, aborted) => {
                    resolve(text);
                },
                // onError
                (error) => {
                    contentDiv.innerHTML = `<span class="error">Error: ${error.message}</span>`;
                    reject(error);
                }
            );
        });
    }

    // Create analyst panels
    function createAnalystPanels() {
        const panelsHTML = selectedAnalysts.map(analystId => {
            const analyst = window.FuturistSkills.ANALYSTS[analystId];
            return `
                <div class="analyst-panel" data-analyst="${analystId}">
                    <div class="panel-header" style="--analyst-color: ${analyst.color}">
                        <span class="panel-icon">${analyst.icon}</span>
                        <div class="panel-title">
                            <h3>${analyst.name}</h3>
                            <span class="panel-focus">${analyst.focus}</span>
                        </div>
                        <span class="panel-status"></span>
                    </div>
                    <div class="panel-content">
                        <div class="panel-content-text">
                            <span class="waiting">Waiting...</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        elements.panelsContainer.innerHTML = panelsHTML;

        // Reset synthesis
        elements.synthesisContent.innerHTML = '<div class="synthesis-placeholder">Synthesis will appear after all analysts complete their analysis.</div>';
        elements.synthesisStatus.textContent = '';
        elements.synthesisStatus.className = 'synthesis-status';
    }

    // Set panel status
    function setPanelStatus(panel, status) {
        const statusEl = panel.querySelector('.panel-status');
        panel.className = `analyst-panel ${status}`;

        switch (status) {
            case 'generating':
                statusEl.textContent = '⏳ Generating...';
                break;
            case 'complete':
                statusEl.textContent = '✓ Complete';
                break;
            case 'error':
                statusEl.textContent = '✗ Error';
                break;
            default:
                statusEl.textContent = '';
        }
    }

    // Handle stop button
    function handleStop() {
        isGenerating = false;
        window.ClaudeAPI.stopGeneration();
        showNotification('Generation stopped', 'info');
    }

    // Handle regenerate
    async function handleRegenerate() {
        if (currentTopic && selectedAnalysts.length > 0) {
            await runAnalysis();
        }
    }

    // Progress functions
    function showProgress() {
        elements.progressContainer.style.display = 'block';
        elements.progressFill.style.width = '0%';
    }

    function hideProgress() {
        elements.progressContainer.style.display = 'none';
    }

    function updateProgress(current, total, text) {
        const percent = (current / total) * 100;
        elements.progressFill.style.width = `${percent}%`;
        elements.progressText.textContent = text;
    }

    // Format markdown to HTML
    function formatMarkdown(text) {
        if (!text) return '';

        return text
            // Headers
            .replace(/^\*\*([^*]+)\*\*$/gm, '<h4>$1</h4>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Bullet points
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            // Numbered lists
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            // Clean up list items
            .replace(/<p><li>/g, '<ul><li>')
            .replace(/<\/li><\/p>/g, '</li></ul>')
            .replace(/<\/li><br><li>/g, '</li><li>');
    }

    // Handle export
    function handleExport() {
        let exportText = `FUTURIST PANEL ANALYSIS\n`;
        exportText += `${'═'.repeat(60)}\n`;
        exportText += `Topic: ${currentTopic}\n`;
        exportText += `Date: ${new Date().toLocaleString()}\n`;
        exportText += `Mode: ${selectedMode}\n`;
        exportText += `${'═'.repeat(60)}\n\n`;

        analystResults.forEach(result => {
            const analyst = window.FuturistSkills.ANALYSTS[result.id];
            exportText += `${analyst.icon} ${analyst.name.toUpperCase()}\n`;
            exportText += `${'─'.repeat(40)}\n`;
            exportText += `${result.content}\n\n`;
        });

        const synthesisText = elements.synthesisContent.querySelector('.synthesis-text');
        if (synthesisText && synthesisText.textContent) {
            exportText += `${'═'.repeat(60)}\n`;
            exportText += `🎯 FUTURIST PRIME SYNTHESIS\n`;
            exportText += `${'═'.repeat(60)}\n`;
            exportText += synthesisText.textContent + '\n';
        }

        // Download
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
        if (isGenerating) {
            handleStop();
        }

        hideResults();
        currentTopic = '';
        analystResults = [];
        elements.topicInput.value = '';
        elements.topicInput.focus();
    }

    // Show/hide results
    function showResults() {
        elements.resultsSection.classList.add('active');
    }

    function hideResults() {
        elements.resultsSection.classList.remove('active');
    }

    // Show prompt modal
    function showPromptModal() {
        const prompt = window.FuturistSkills.generateFullPrompt(currentTopic, selectedAnalysts, selectedMode);
        elements.promptPreview.value = prompt;
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
            await navigator.clipboard.writeText(elements.promptPreview.value);
            showNotification('Prompt copied to clipboard!', 'success');
        } catch (err) {
            elements.promptPreview.select();
            document.execCommand('copy');
            showNotification('Prompt copied!', 'success');
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Shake animation
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    // Slugify text
    function slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
