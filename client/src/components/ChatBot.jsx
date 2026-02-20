// client/src/components/ChatBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/chatbot.css';

export default function ChatBot({ place, category, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch persona info when category changes
  useEffect(() => {
    if (category) {
      fetch(`/api/persona/${category}`)
        .then(r => r.json())
        .then(data => {
          setPersona(data);
          // Add greeting as first message
          setMessages([{
            id: Date.now(),
            from: 'bot',
            text: data.greeting,
            animationTag: 'wave',
            emotion: 'happy'
          }]);
        })
        .catch(err => console.error('Failed to load persona', err));
    }
  }, [category]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      from: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          characterId: persona?.characterId || 'sanjay',
          characterPersona: persona?.description || 'General heritage guide',
          site: place ? {
            name: place.name,
            category: place.category,
            year: place.year,
            description: place.info || place.details
          } : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const botReply = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'bot',
        text: botReply.text,
        animationTag: botReply.animationTag,
        emotion: botReply.emotion,
        suggestedFollowUp: botReply.suggestedFollowUp
      }]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'bot',
        text: "There was an error connecting to the chat service. Please check that the backend server is running and try again.",
        animationTag: 'calm',
        emotion: 'neutral'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  if (!persona) {
    return (
      <div className="chatbot-container loading">
        <div className="loading-spinner">Loading character...</div>
      </div>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <div className="avatar-placeholder">
            {persona.characterName.charAt(0)}
          </div>
        </div>
        <div className="chatbot-title">
          <h3>{persona.characterName}</h3>
          <span className="chatbot-category">{category?.replace(/_/g, ' ')}</span>
        </div>
        <div className="chatbot-controls">
          <button 
            className="minimize-btn" 
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button className="close-btn" onClick={onClose} aria-label="Close chat">×</button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="message-avatar">
                    {persona.characterName.charAt(0)}
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  {msg.suggestedFollowUp && (
                    <button 
                      className="suggested-question"
                      onClick={() => handleSuggestionClick(msg.suggestedFollowUp)}
                    >
                      💭 {msg.suggestedFollowUp}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot typing">
                <div className="message-avatar">
                  {persona.characterName.charAt(0)}
                </div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder={`Ask ${persona.characterName} anything...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}
