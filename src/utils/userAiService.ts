export type AiProvider = 'gemini' | 'anthropic' | 'openai' | 'custom';

export interface UserAiConfig {
  provider: AiProvider;
  geminiApiKey?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  customEndpoint?: string;
  customApiKey?: string;
  customModelName?: string;
}

export const DEFAULT_AI_CONFIG: UserAiConfig = {
  provider: 'gemini',
  geminiApiKey: '',
  anthropicApiKey: '',
  openaiApiKey: '',
  customEndpoint: '',
  customApiKey: '',
  customModelName: ''
};

export const STORAGE_KEY_AI_CONFIG = 'win11_notepad_user_ai_config_v1';

export function getStoredAiConfig(): UserAiConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
    if (saved) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load AI config from localStorage:', e);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveStoredAiConfig(config: UserAiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save AI config to localStorage:', e);
  }
}

/**
 * Execute AI request directly using the user's provided API key and provider
 */
export async function executeAiRequest(
  config: UserAiConfig,
  prompt: string,
  contextText: string = ''
): Promise<{ text: string; error?: string }> {
  const fullPrompt = `${prompt}\n\nContext text to process:\n"""\n${contextText}\n"""\n\nDirect, clean, formatted output only without conversational preambles or chat filler.`;

  try {
    // 1. Google Gemini (BYOK)
    if (config.provider === 'gemini') {
      const apiKey = config.geminiApiKey?.trim();
      if (!apiKey) {
        throw new Error('Please enter your Google Gemini API Key in the AI Settings.');
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API Error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response returned from Gemini.');
      return { text: text.trim() };
    }

    // 2. Anthropic Claude (BYOK)
    if (config.provider === 'anthropic') {
      const apiKey = config.anthropicApiKey?.trim();
      if (!apiKey) {
        throw new Error('Please enter your Anthropic Claude API Key in the AI Settings.');
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [{ role: 'user', content: fullPrompt }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Claude API Error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (!text) throw new Error('No response returned from Claude.');
      return { text: text.trim() };
    }

    // 3. OpenAI / Copilot GPT-4o (BYOK)
    if (config.provider === 'openai') {
      const apiKey = config.openaiApiKey?.trim();
      if (!apiKey) {
        throw new Error('Please enter your OpenAI / Copilot API Key in the AI Settings.');
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional editor and document writing assistant integrated directly into a text editor. Produce clear, polished, structured output without conversational chit-chat.' },
            { role: 'user', content: fullPrompt }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API Error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('No response returned from OpenAI.');
      return { text: text.trim() };
    }

    // 4. Custom OpenAI-compatible / Local AI Endpoint (Ollama / LocalAI / OpenRouter)
    if (config.provider === 'custom') {
      const endpoint = (config.customEndpoint || 'http://localhost:11434/v1/chat/completions').trim();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.customApiKey?.trim()) {
        headers['Authorization'] = `Bearer ${config.customApiKey.trim()}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.customModelName?.trim() || 'llama3',
          messages: [
            { role: 'system', content: 'You are a professional text editor assistant.' },
            { role: 'user', content: fullPrompt }
          ]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Custom API Error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || data.response;
      if (!text) throw new Error('No response returned from custom endpoint.');
      return { text: text.trim() };
    }

    throw new Error('Unsupported AI Provider.');
  } catch (err: any) {
    console.error('AI Request Error:', err);
    return { text: '', error: err.message || 'Failed to complete AI request.' };
  }
}
