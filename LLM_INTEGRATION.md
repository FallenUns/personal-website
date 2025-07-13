# AI Chatbot Integration Guide

This guide explains how to integrate an LLM (Large Language Model) API with your personal website's chatbot.

## Features

- **Project-Focused AI**: The chatbot only responds to questions about your website and portfolio
- **Multiple LLM Support**: Compatible with OpenAI, Anthropic Claude, and other LLM APIs
- **Conversation Memory**: Maintains context throughout the conversation
- **Security-First**: Environment variable configuration for API keys
- **Error Handling**: Graceful handling of API failures and configuration issues

## Setup Instructions

### 1. Choose Your LLM Provider

**OpenAI (Recommended)**
- Sign up at [OpenAI](https://openai.com/)
- Generate an API key from your dashboard
- Use endpoint: `https://api.openai.com/v1/chat/completions`

**Anthropic Claude**
- Sign up at [Anthropic](https://anthropic.com/)
- Generate an API key from your console
- Use endpoint: `https://api.anthropic.com/v1/messages`

**Other Providers**
- Most OpenAI-compatible APIs will work
- Examples: Azure OpenAI, OpenRouter, local models via Ollama

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# OpenAI Configuration
VITE_LLM_API_URL=https://api.openai.com/v1/chat/completions
VITE_LLM_API_KEY=your_openai_api_key_here
VITE_LLM_MODEL=gpt-3.5-turbo

# OR Anthropic Configuration
# VITE_LLM_API_URL=https://api.anthropic.com/v1/messages
# VITE_LLM_API_KEY=your_anthropic_api_key_here
# VITE_LLM_MODEL=claude-3-sonnet-20240229
```

### 3. Restart Development Server

After adding environment variables, restart your development server:

```bash
npm run dev
```

### 4. Test the Integration

1. Click the floating assistant orb on your website
2. Send a test message like "What technologies were used to build this website?"
3. The AI should respond with information about your tech stack (React, TypeScript, Three.js, etc.)

## Customization

### System Prompt

The AI assistant is configured with a system prompt that restricts it to only answer questions about your website. You can customize this in `src/api/llmService.ts`:

```typescript
this.systemPrompt = `You are an AI assistant for a personal portfolio website...`;
```

### Adding Project Information

To make the AI more knowledgeable about your specific projects:

1. Update the system prompt with details about your projects
2. Include information about your skills and experience
3. Add context about your background and what makes you unique

### API Configuration

Modify `src/api/llmService.ts` to adjust:
- **Temperature**: Controls creativity (0.0 = focused, 1.0 = creative)
- **Max Tokens**: Maximum response length
- **Model**: Choose different models for different capabilities

## Security Best Practices

1. **Never commit API keys**: Always use environment variables
2. **Restrict API key permissions**: If your provider supports it, limit API key scope
3. **Monitor usage**: Keep track of API costs and usage
4. **Rate limiting**: Consider implementing rate limiting for production

## Troubleshooting

### "LLM service not configured" Error
- Check that your `.env.local` file exists
- Verify all required environment variables are set
- Restart your development server

### API Request Failed
- Verify your API key is correct and active
- Check your API endpoint URL
- Ensure you have sufficient credits/quota

### Slow Responses
- Try a faster model (e.g., gpt-3.5-turbo instead of gpt-4)
- Reduce max_tokens for shorter responses
- Check your internet connection

## Production Deployment

For production deployment:

1. **Use server-side API calls**: Move API calls to a backend to hide your API key
2. **Implement authentication**: Prevent unauthorized access to your AI service
3. **Add rate limiting**: Prevent abuse and control costs
4. **Monitor costs**: Set up billing alerts with your LLM provider

## Cost Optimization

- Use cheaper models for simple questions (gpt-3.5-turbo vs gpt-4)
- Limit conversation history length
- Set reasonable max_tokens limits
- Implement caching for common questions

## Legal Considerations

- Review your LLM provider's terms of service
- Consider privacy implications of sending user messages to third-party APIs
- Add appropriate disclaimers about AI-generated content

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment variables are correctly set
3. Test your API key with a simple curl request
4. Review the LLM provider's documentation

## File Structure

```
src/
├── api/
│   ├── types.ts           # TypeScript types for LLM integration
│   └── llmService.ts      # Main LLM service class
└── components/
    ├── FloatingAssistant.tsx  # Main chatbot component
    ├── ChatWindow.tsx         # Chat UI component
    └── ConfigModal.tsx        # Configuration modal
```
