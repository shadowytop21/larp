// LARP stdlib — ai.js
// "ask ai" built-in — calls a configured LLM API.
// Set LARP_AI_KEY in your environment.
// Set LARP_AI_MODEL to change model (default: gpt-4o-mini).
// Set LARP_AI_PROVIDER to "openai" or "gemini" (default: openai).
'use strict';

exports.ask = async function ask(prompt) {
  const key      = process.env.LARP_AI_KEY;
  const provider = (process.env.LARP_AI_PROVIDER || 'openai').toLowerCase();
  const model    = process.env.LARP_AI_MODEL || 'gpt-4o-mini';

  if (!key) {
    throw new Error(
      'The "ask ai" feature needs an API key.\n' +
      'Set the LARP_AI_KEY environment variable to your OpenAI or Gemini API key.\n' +
      'Example: set LARP_AI_KEY=sk-... in your terminal before running.'
    );
  }

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!res.ok) throw new Error(`AI API returned HTTP ${res.status}. Check your LARP_AI_KEY.`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  // Default: OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 1000 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`AI API error: ${err.error?.message || `HTTP ${res.status}`}. Check your LARP_AI_KEY.`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
};
