// Gemini API Client Service

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Recommended)', desc: 'Ultra-fast multimodal model supporting text, coding, and vision analysis.' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Latest)', desc: 'Next-generation Gemini model with advanced multimodal reasoning.' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', desc: 'Latest flash model for responsive conversations.' }
];

export const geminiApi = {
  /**
   * Calls the Google Gemini API with streaming SSE response
   * @param {Object} options
   * @param {string} options.apiKey
   * @param {string} options.model
   * @param {Array} options.messages
   * @param {string} options.systemPrompt
   * @param {number} options.temperature
   * @param {Function} options.onChunk
   * @param {AbortSignal} options.signal
   */
  generateStream: async ({
    apiKey,
    model = 'gemini-1.5-flash',
    messages = [],
    systemPrompt = '',
    temperature = 0.7,
    onChunk = () => {},
    signal = null,
  }) => {
    if (!apiKey) {
      throw new Error('API Key is missing. Please set your Google Gemini API key in Settings or activate Demo Mode.');
    }

    // Format conversation messages for Gemini API
    const contents = messages.map((msg) => {
      const parts = [];

      // Add attached files if any (inlineData)
      if (msg.files && msg.files.length > 0) {
        msg.files.forEach((file) => {
          if (file.data && file.type?.startsWith('image/')) {
            const base64Data = file.data.includes('base64,')
              ? file.data.split('base64,')[1]
              : file.data;

            parts.push({
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            });
          }
        });
      }

      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const payload = {
      contents,
      generationConfig: {
        temperature: Number(temperature) || 0.7,
      },
    };

    if (systemPrompt && systemPrompt.trim()) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt.trim() }],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Fallback to response text
        const text = await response.text();
        if (text) errorMessage = text;
      }

      if (response.status === 400 && errorMessage.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API Key. Please verify the key in Settings.');
      } else if (response.status === 429) {
        throw new Error('Quota exceeded or rate limit reached. Please wait a moment or try again later.');
      }

      throw new Error(errorMessage);
    }

    // Process Server-Sent Events stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep the last incomplete fragment in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const candidates = parsed.candidates;
            if (candidates && candidates[0]?.content?.parts) {
              const textChunk = candidates[0].content.parts.map((p) => p.text || '').join('');
              accumulatedText += textChunk;
              onChunk(accumulatedText);
            }
          } catch (err) {
            // Partial JSON chunk, ignore and continue
          }
        }
      }
    }

    return accumulatedText;
  },

  /**
   * Validates if an API key works by sending a tiny test ping
   */
  testApiKey: async (apiKey, model = 'gemini-1.5-flash') => {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, message: data.error?.message || `HTTP ${res.status}` };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Network connection failed' };
    }
  },
};
