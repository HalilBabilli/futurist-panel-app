// Futurist Panel - Claude API Service

const ClaudeAPI = (function() {
    'use strict';

    const API_URL = 'https://api.anthropic.com/v1/messages';
    const MODEL = 'claude-sonnet-4-20250514';
    const MAX_TOKENS = 4096;

    let apiKey = null;
    let abortController = null;

    // Initialize API key from localStorage
    function init() {
        const savedKey = localStorage.getItem('futurist_panel_api_key');
        if (savedKey) {
            apiKey = savedKey;
            return true;
        }
        return false;
    }

    // Set API key
    function setApiKey(key) {
        if (key && key.startsWith('sk-ant-')) {
            apiKey = key;
            localStorage.setItem('futurist_panel_api_key', key);
            return true;
        }
        return false;
    }

    // Get API key (masked for display)
    function getMaskedApiKey() {
        if (!apiKey) return null;
        return apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
    }

    // Check if API key is configured
    function isConfigured() {
        return apiKey !== null && apiKey.length > 0;
    }

    // Clear API key
    function clearApiKey() {
        apiKey = null;
        localStorage.removeItem('futurist_panel_api_key');
    }

    // Stop ongoing request
    function stopGeneration() {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
    }

    // Make API call with streaming
    async function streamMessage(systemPrompt, userMessage, onChunk, onComplete, onError) {
        if (!isConfigured()) {
            onError(new Error('API key not configured'));
            return;
        }

        abortController = new AbortController();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: MODEL,
                    max_tokens: MAX_TOKENS,
                    stream: true,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: userMessage }
                    ]
                }),
                signal: abortController.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                fullText += parsed.delta.text;
                                onChunk(parsed.delta.text, fullText);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            onComplete(fullText);
        } catch (error) {
            if (error.name === 'AbortError') {
                onComplete(null, true); // Aborted
            } else {
                onError(error);
            }
        } finally {
            abortController = null;
        }
    }

    // Non-streaming API call (simpler, for fallback)
    async function sendMessage(systemPrompt, userMessage) {
        if (!isConfigured()) {
            throw new Error('API key not configured');
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: MAX_TOKENS,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    // Initialize on load
    init();

    return {
        init,
        setApiKey,
        getMaskedApiKey,
        isConfigured,
        clearApiKey,
        stopGeneration,
        streamMessage,
        sendMessage
    };
})();

// Export for use in other modules
window.ClaudeAPI = ClaudeAPI;
