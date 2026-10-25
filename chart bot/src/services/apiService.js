// API Service to communicate with the Backend Server for Vision and Chat

export const apiService = {
  /**
   * Stream chat and vision requests through the backend /api/chat endpoint
   */
  streamChat: async ({
    messages = [],
    model = 'gemini-3.1-flash-lite',
    systemPrompt = '',
    temperature = 0.7,
    apiKey = '',
    onChunk = () => {},
    signal = null,
  }) => {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (apiKey && apiKey.trim()) {
      headers['x-api-key'] = apiKey.trim();
    }

    const payload = {
      messages,
      model,
      systemPrompt,
      temperature,
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let errorMsg = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.error) errorMsg = errJson.error;
      } catch (_) {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    // Process SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Retain remainder in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(accumulatedText);
            }
          } catch (_) {
            // Partial JSON fragment, ignore
          }
        }
      }
    }

    return accumulatedText;
  },

  /**
   * Check backend health and API key status
   */
  checkHealth: async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
      return { status: 'error', hasApiKey: false };
    } catch (e) {
      return { status: 'offline', hasApiKey: false };
    }
  },
};
