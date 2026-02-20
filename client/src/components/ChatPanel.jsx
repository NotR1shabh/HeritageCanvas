import React, { useEffect, useRef, useState } from 'react';
import './ChatPanel.css';

export default function ChatPanel({ initialCharacter, initialItem, onClose }) {
  const [character, setCharacter] = useState(initialCharacter || { name:'Heritage Guide', avatar:'/images/Chatbot/all_chatbot.png', persona:'' });
  const [site, setSite] = useState(initialItem || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [voiceOn, setVoiceOn] = useState(true);
  const messagesRef = useRef();

  useEffect(() => {
    console.log('ChatPanel initialCharacter:', initialCharacter);
    if (initialCharacter) {
      setCharacter(initialCharacter);
      setSite(initialItem || null);
      const greeting = initialCharacter.greeting || 'Hello — ask me anything about this place.';
      setMessages([{ from: initialCharacter.name || 'Guide', text: greeting }]);
      if (voiceOn) speakText(greeting);
    }
  }, [initialCharacter, initialItem]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  function appendMessage(from, text) {
    setMessages(prev => [...prev, { from, text }]);
  }

  function speakText(text) {
    if (!voiceOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      startTalkingAnim();
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => { stopTalkingAnim(); };
      window.speechSynthesis.speak(u);
    } catch (e) { console.warn('TTS error', e); stopTalkingAnim(); }
  }

  function startTalkingAnim() {
    const el = document.querySelector('.chat-avatar-img');
    if (el) el.classList.add('talking');
  }
  function stopTalkingAnim() {
    const el = document.querySelector('.chat-avatar-img');
    if (el) el.classList.remove('talking');
  }

  async function sendMessage() {
    const txt = (input || '').trim();
    if (!txt) return;
    appendMessage('You', txt);
    setInput('');
    appendMessage(character.name, '...');

    try {
      const payload = { message: txt, characterId: character.id, characterPersona: character.persona, site };
      console.log('🚀 Sending chat request:', payload);
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      console.log('📥 Response status:', r.status);
      const j = await r.json();
      console.log('📦 Response data:', j);
      // remove '...' placeholder
      setMessages(prev => {
        const cp = [...prev];
        if (cp.length && cp[cp.length-1].text === '...') cp.pop();
        return cp;
      });
      const assistantText = j.text || 'Sorry, I cannot reply right now.';
      appendMessage(character.name, assistantText);
      // trigger animations and TTS
      if (j.animationTag) {
        // map animationTag to CSS or Lottie (Phase1: CSS)
        const root = document.querySelector('.chat-panel-root');
        if (root) {
          root.classList.add(`anim-${j.animationTag}`);
          setTimeout(() => root.classList.remove(`anim-${j.animationTag}`), 1400);
        }
      }
      if (voiceOn) speakText(stripHtml(assistantText));
    } catch (err) {
      console.error('❌ Chat error:', err);
      console.error('❌ Error details:', err.message, err.stack);
      setMessages(prev => {
        const cp = [...prev];
        if (cp.length && cp[cp.length-1].text === '...') cp.pop();
        return cp;
      });
      appendMessage(character.name, 'There was an error connecting to the chat service.');
    }
  }

  function stripHtml(s) { return (s||'').replace(/<\/?[^>]+(>|$)/g, ''); }

  return (
    <div className="chat-panel-root">
      <div className="chat-header">
        <div className="chat-meta">
          <div className="chat-name">{character.name}</div>
          <div className="chat-role">{character.role || ''}</div>
        </div>
        <div className="chat-actions">
          <button onClick={() => setVoiceOn(v => !v)} className="icon-btn">{voiceOn ? '🔊' : '🔈'}</button>
          <button onClick={() => onClose && onClose()} className="icon-btn">✖</button>
        </div>
      </div>

      <div className="chat-messages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.from === 'You' ? 'bubble-user' : 'bubble-assistant'}`}>
            <div className="bubble-from">{m.from}</div>
            <div className="bubble-text" dangerouslySetInnerHTML={{ __html: m.text }} />
          </div>
        ))}
      </div>

      <div className="chat-avatar-portrait" aria-hidden="true">
        <img
          className="chat-avatar-img"
          src={character.avatar || '/images/Chatbot/all_chatbot.png'}
          alt=""
          onError={(e) => {
            console.error('Avatar failed to load:', character.avatar);
            if (e.target.src !== 'http://localhost:5173/images/Chatbot/all_chatbot.png') {
              e.target.src = '/images/Chatbot/all_chatbot.png';
            }
          }}
        />
      </div>

      <div className="chat-input-row">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask the guide..." />
        <button onClick={sendMessage} className="send-btn" aria-label="Send message" title="Send">
          <span className="send-icon" aria-hidden="true">➤</span>
        </button>
      </div>
    </div>
  );
}
