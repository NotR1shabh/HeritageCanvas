// server/routes/chat.js  (simplified Gemini 2.0 flash version)
const express = require('express');
const router = express.Router();
require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const DEFAULT_ANIM = 'explain';
const VALID_ANIMS = ['wave', 'explain', 'point', 'delight', 'calm', 'dance'];
const VALID_EMOTIONS = ['happy', 'neutral', 'excited', 'calm', 'serious'];

// CHANGE THIS IF YOU USE A DIFFERENT MODEL
const GEMINI_MODEL = 'models/gemini-2.0-flash';

function clamp(s, n = 120) {
  if (!s) return '';
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// Walk any Gemini JSON and collect all .text fields
function extractTextFromGeminiJson(j) {
  const texts = [];

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (typeof node.text === 'string') {
      texts.push(node.text);
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
    } else {
      Object.values(node).forEach(walk);
    }
  }

  walk(j);

  const joined = texts.join('\n\n').trim();
  return joined || null;
}

// Never send raw JSON to the user. Always return either:
// - natural language text
// - or null (so caller can use fallback)
function extractTextFromGeminiRaw(raw) {
  if (!raw) return null;

  try {
    const j = JSON.parse(raw);
    return extractTextFromGeminiJson(j);
  } catch (e) {
    const trimmed = String(raw).trim();
    return trimmed || null;
  }
}

// Try to parse a JSON object out of the model's response text
function parseAssistantJSONFromText(text) {
  if (!text) return null;

  let cleaned = text.trim();

  // Strip markdown code fences ``` or ```json
  if (cleaned.startsWith('```json') || cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '').replace(/```\s*$/,'').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch (e) {}
  }

  return null;
}

// Call Gemini 2.0 flash directly
async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512
    }
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const raw = await r.text().catch(() => '');

  return {
    ok: r.ok,
    status: r.status,
    raw,
    url
  };
}

router.post('/chat', async (req, res) => {
  try {
    const { message, characterId, characterPersona, site } = req.body || {};
    const userMessage = (message || '').trim();

    if (!userMessage) {
      return res.status(400).json({
        text: 'Empty message',
        animationTag: DEFAULT_ANIM,
        emotion: 'neutral',
        suggestedFollowUp: ''
      });
    }

    console.log('🎯 Chat route HIT!');
    console.log('📨 Message preview:', userMessage.slice(0, 200));
    console.log('🔑 GOOGLE_API_KEY present?', !!process.env.GOOGLE_API_KEY);

    const API_KEY = process.env.GOOGLE_API_KEY;

    const fallback = {
      text: `${characterId || 'Guide'}: This is a local test reply. Configure a generative model in Google Cloud for live responses.`,
      animationTag: DEFAULT_ANIM,
      emotion: 'neutral',
      suggestedFollowUp: 'Want more context?'
    };

    if (!API_KEY) {
      console.warn('No GOOGLE_API_KEY set. Returning fallback.');
      return res.json(fallback);
    }

    const systemInstruction = [
      `You are an in-character heritage guide. Persona: ${characterPersona || 'Neutral Guide'}.`,
      `Try to respond as a JSON object with keys: text, animationTag, emotion, suggestedFollowUp.`,
      `If you cannot, just respond in plain natural language under 120 words.`,
      `animationTag must be one of: ${VALID_ANIMS.join(',')}.`,
      `emotion must be one of: ${VALID_EMOTIONS.join(',')}.`,
      `If unsure, say "I can't confirm that detail".`
    ].join(' ');

    const prompt = [
      systemInstruction,
      `Site context: ${site ? JSON.stringify(site) : 'none'}.`,
      `User: ${userMessage}`
    ].join('\n\n');

    // Single direct call to Gemini 2.0 flash
    const attempt = await callGemini(API_KEY, prompt);
    console.log('📡 Gemini call status:', attempt.status, 'url:', attempt.url);

    if (attempt.raw) {
      console.log('📄 Gemini raw (truncated):', attempt.raw.slice(0, 1000));
    }

    if (!attempt.ok) {
      console.warn('Gemini call failed; returning fallback.');
      return res.json(fallback);
    }

    const assistantText = extractTextFromGeminiRaw(attempt.raw);
    console.log('Assistant extracted text (truncated):', (assistantText || '').slice(0, 1000));

    if (!assistantText) {
      console.warn('No text extracted from Gemini; returning fallback.');
      return res.json(fallback);
    }

    const parsed = parseAssistantJSONFromText(assistantText);

    if (parsed && parsed.text) {
      parsed.animationTag = VALID_ANIMS.includes(parsed.animationTag)
        ? parsed.animationTag
        : DEFAULT_ANIM;
      parsed.emotion = VALID_EMOTIONS.includes(parsed.emotion)
        ? parsed.emotion
        : 'neutral';
      parsed.suggestedFollowUp = parsed.suggestedFollowUp ? String(parsed.suggestedFollowUp) : '';
      parsed.text = clamp(String(parsed.text), 2000);

      return res.json(parsed);
    }

    // If the text looks like JSON or code but we couldn't parse it, hide internals
    const looksLikeJSON =
      /^\s*```/.test(assistantText) ||
      /^\s*\{/.test(assistantText);

    if (looksLikeJSON) {
      console.warn('Assistant response looked like JSON but could not be parsed. Returning fallback.');
      return res.json(fallback);
    }

    // Plain natural-language fallback
    return res.json({
      text: clamp(assistantText, 1200),
      animationTag: DEFAULT_ANIM,
      emotion: 'neutral',
      suggestedFollowUp: 'Would you like more details?'
    });

  } catch (err) {
    console.error('Chat route error:', err);
    return res.status(500).json({
      text: 'Server internal error',
      animationTag: 'calm',
      emotion: 'serious',
      suggestedFollowUp: ''
    });
  }
});

module.exports = router;
