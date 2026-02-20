# Heritage Canvas Interactive Character Chatbot Engine

## Overview

The Heritage Canvas Interactive Chatbot Engine provides personalized AI-powered heritage guides that assist users in exploring Indian cultural sites. Each heritage category has its own unique character persona that responds with culturally appropriate information, storytelling, and educational content.

## Architecture

### Components

1. **Frontend Component**: `client/src/components/ChatBot.jsx`
   - React component with real-time chat interface
   - Message history management
   - Typing indicators and animations
   - Suggested follow-up questions
   - Minimize/maximize functionality

2. **Backend API**: `server/server.js`
   - POST `/api/chat` - Main chat endpoint
   - GET `/api/persona/:category` - Get persona information

3. **Persona System**: `server/personas.js`
   - 9 character definitions
   - Category-specific personalities
   - System prompts for AI integration

4. **Styling**: `client/src/styles/chatbot.css`
   - Modern gradient design
   - Dark mode support
   - Responsive layout
   - Smooth animations

## Personas

### 1. Deepa (Festivals & Traditions)
- **Character**: Warm, enthusiastic festival guide
- **Greeting**: "Namaste! I'm Deepa, your guide to India's vibrant festivals and sacred traditions!"
- **Expertise**: Festival customs, rituals, regional variations, spiritual significance

### 2. Taal (Music & Dance)
- **Character**: Rhythmic, passionate performing arts guide
- **Greeting**: "Namaste! I'm Taal, and I'll take you on a melodious journey through India's music and dance!"
- **Expertise**: Classical ragas, folk dances, instruments, performance traditions

### 3. Shanti (Spiritual & Pilgrimage)
- **Character**: Serene, respectful spiritual guide
- **Greeting**: "Om Shanti. I'm Shanti, here to guide you through India's sacred spiritual heritage."
- **Expertise**: Temple architecture, pilgrimage routes, meditation practices, philosophies

### 4. Vishwakarma (Monuments & Architecture)
- **Character**: Knowledgeable architecture historian
- **Greeting**: "Namaste! I'm Vishwakarma, named after the divine architect. Let me unveil architectural wonders!"
- **Expertise**: Construction techniques, architectural styles, historical significance

### 5. Rasika (Cuisine)
- **Character**: Flavorful, warm culinary guide
- **Greeting**: "Namaste! I'm Rasika, your guide to India's delicious culinary heritage!"
- **Expertise**: Regional dishes, spices, cooking methods, food history

### 6. Katha (Tales & Epics)
- **Character**: Wise, engaging storyteller
- **Greeting**: "Namaste! I'm Katha, the keeper of ancient tales. Let me share stories from our great epics!"
- **Expertise**: Ramayana, Mahabharata, folk tales, moral lessons

### 7. Kala (Folk Arts & Handicrafts)
- **Character**: Creative, detail-oriented arts guide
- **Greeting**: "Namaste! I'm Kala, your guide to India's beautiful folk arts and traditional crafts!"
- **Expertise**: Painting styles, weaving techniques, pottery, regional crafts

### 8. Prakriti (Nature & Wildlife)
- **Character**: Gentle, observant nature guide
- **Greeting**: "Namaste! I'm Prakriti, here to show you the natural wonders of India's heritage!"
- **Expertise**: Sacred groves, wildlife sanctuaries, conservation, ecosystem relationships

### 9. Sanjay (Default Guide)
- **Character**: Versatile, friendly general guide
- **Greeting**: "Namaste! I'm Sanjay, your friendly guide to India's incredible heritage!"
- **Expertise**: General heritage knowledge across all categories

## Features

### User Experience
- **Context-Aware Responses**: Chatbot knows the current heritage site and its details
- **Conversation History**: Maintains context across multiple messages
- **Suggested Follow-ups**: AI generates relevant next questions
- **Animation Tags**: Responses include suggested animations (wave, explain, point, delight, calm, dance)
- **Emotion Detection**: Tracks conversation tone (curious, inspired, reflective, joyful, serene, excited)

### Response Format
```json
{
  "text": "Response text (max 120 words)",
  "animationTag": "wave|explain|point|delight|calm|dance",
  "emotion": "curious|inspired|reflective|joyful|serene|excited",
  "suggestedFollowUp": "Suggested next question for the user"
}
```

### Constraints & Guidelines
- **120-word limit** per response (strict enforcement)
- **Cultural sensitivity** - respectful, accurate, unbiased
- **Educational focus** - informative yet engaging
- **No hallucination** - truthful information only
- **Respectful tone** - appropriate for all ages
- **Context integration** - uses place name and details from the site

## Usage

### Opening the Chatbot

Users can open the chatbot by:
1. Clicking a heritage location on the map
2. Opening the details panel in the right sidebar
3. Clicking the "Ask Guide" button

### Integration in Code

```jsx
// In App.jsx
import ChatBot from './components/ChatBot';

const [chatbotPlace, setChatbotPlace] = useState(null);

// Render chatbot
{chatbotPlace && (
  <ChatBot
    place={chatbotPlace}
    category={chatbotPlace.category || 'default'}
    onClose={() => setChatbotPlace(null)}
  />
)}

// Pass handler to DetailsPanel
<DetailsPanel
  place={selectedPlace}
  onOpenChatbot={setChatbotPlace}
  // ... other props
/>
```

## API Integration

### Current State (Mock Responses)

The `/api/chat` endpoint currently returns mock responses for testing:

```javascript
res.json({
  text: `This is a sample response from ${persona.characterName}...`,
  animationTag: 'wave',
  emotion: 'curious',
  suggestedFollowUp: 'Would you like to know more about the history of this place?'
});
```

### Production Integration (OpenAI/Claude)

To enable real AI responses:

1. **Add API Key** to environment variables:
   ```bash
   # In server/.env
   OPENAI_API_KEY=your_api_key_here
   # OR
   ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **Uncomment AI Integration Code** in `server/server.js`:
   - Import OpenAI or Anthropic SDK
   - Replace mock response with actual API call
   - Use the comprehensive system prompt template
   - Parse JSON response format

3. **System Prompt Template** (already in code):
   ```javascript
   const systemPrompt = `You are ${persona.characterName}...
   [Full system prompt with all constraints and guidelines]`;
   ```

## File Structure

```
heritage-canvas/
├── client/
│   └── src/
│       ├── components/
│       │   └── ChatBot.jsx          # Main chat UI component
│       └── styles/
│           └── chatbot.css          # Chatbot styling
├── server/
│   ├── personas.js                  # Character definitions
│   ├── server.js                    # API endpoints
│   └── package.json                 # Includes openai dependency
└── CHATBOT_README.md               # This file
```

## Testing Checklist

- [ ] Chatbot opens when clicking "Ask Guide" button
- [ ] Correct persona loads based on heritage category
- [ ] Messages send and receive successfully
- [ ] Typing indicator shows during bot response
- [ ] Suggested follow-up questions are clickable
- [ ] Minimize/maximize functionality works
- [ ] Close button properly unmounts chatbot
- [ ] Conversation history is maintained
- [ ] Dark mode styling applies correctly
- [ ] Mobile responsive layout works

## Future Enhancements

1. **Voice Integration**: Add text-to-speech for bot responses
2. **Avatar Animations**: Custom animated avatars for each persona
3. **Multi-language Support**: Translate personas to regional languages
4. **Image Analysis**: Allow users to upload photos for identification
5. **Quiz Mode**: Interactive quizzes about heritage sites
6. **Sharing**: Export conversation history
7. **Feedback Loop**: Rate responses to improve AI quality
8. **Offline Mode**: Cached responses for common questions

## Dependencies

### Client
- React 18+
- CSS variables for theming

### Server
- Express.js
- OpenAI SDK (v4.20.0) - installed but not yet active
- Alternative: Anthropic SDK for Claude

## Troubleshooting

### Chatbot doesn't open
- Check console for errors
- Verify `onOpenChatbot` prop is passed to DetailsPanel
- Ensure `chatbotPlace` state is updating in App.jsx

### Persona not loading
- Check network tab for `/api/persona/:category` request
- Verify category name matches personas.js keys
- Ensure server is running on port 4000

### Styling issues
- Verify `chatbot.css` is imported in ChatBot.jsx
- Check CSS variable definitions in root theme
- Test dark mode toggle

### API errors
- Verify server is running
- Check `/api/chat` endpoint is responding
- Validate request payload format
- Check OpenAI API key (when integrated)

## Contributing

When adding new personas:
1. Add definition to `server/personas.js`
2. Follow 120-word description limit
3. Include all required fields: characterId, characterName, avatarUrl, greeting, description
4. Test with mock responses before AI integration
5. Update this README with persona details

## License

Part of Heritage Canvas project - preserving and sharing India's cultural heritage through technology.
