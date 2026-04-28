AI Chatbot Setup Guide
Polomolok Food Ordering System

OVERVIEW

The chat support has been converted to an AI-powered chatbot using Groq API.
Chat history is stored in browser localStorage (no database needed).

FEATURES

✓ AI-powered responses using Groq's Llama 3.3 70B model
✓ Context-aware conversations (remembers last 10 messages)
✓ Chat history stored in localStorage
✓ No backend database required
✓ Clear chat history option
✓ Fast and responsive
✓ Works offline (shows error message)

SETUP INSTRUCTIONS

Step 1: Get Groq API Key
========================

1. Go to https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy your API key

Free Tier Limits:
- 30 requests per minute
- 14,400 requests per day
- Perfect for small to medium applications

Step 2: Add API Key to .env
============================

Open client/.env and add your Groq API key:

VITE_API_URL=/api
VITE_RECAPTCHA_SITE_KEY=6LfRCIMsAAAAADxvQPAYEIGuZxRvqfTyli_QmYId
VITE_GROQ_API_KEY=gsk_your_actual_groq_api_key_here

Replace "your_groq_api_key_here" with your actual key from Groq.

Step 3: Restart Development Server
===================================

If running locally:
cd client
npm run dev

The chatbot will now work with AI responses!

Step 4: Test the Chatbot
=========================

1. Open your application
2. Click the bot icon in bottom-right corner
3. Ask questions like:
   - "What's on the menu?"
   - "How do I track my order?"
   - "What are your delivery hours?"
   - "How do I change my password?"

DEPLOYMENT TO RENDER

For Production:
===============

1. Go to your Render dashboard
2. Select your client static site
3. Go to Environment
4. Add environment variable:
   
   Key: VITE_GROQ_API_KEY
   Value: gsk_your_actual_groq_api_key_here

5. Save and redeploy

IMPORTANT: Keep your API key secret!
Do NOT commit .env file with real API key to GitHub.

HOW IT WORKS

Architecture:
=============

1. User types message
2. Message stored in localStorage
3. Request sent to Groq API with:
   - System prompt (defines AI behavior)
   - Last 10 messages (context)
   - Current user message
4. AI generates response
5. Response stored in localStorage
6. Chat history persists across sessions

Data Storage:
=============

Location: Browser localStorage
Key: "ai_chatbot_history"
Format: JSON array of messages

Each message contains:
- id: Unique identifier
- role: "user" or "assistant"
- content: Message text
- timestamp: ISO date string

No server-side storage needed!

AI Model:
=========

Model: llama-3.3-70b-versatile
Provider: Groq
Speed: ~500 tokens/second
Context: 8,192 tokens

System Prompt:
The AI is configured to help with:
- Order inquiries and tracking
- Menu information and recommendations
- Account and profile questions
- Payment and delivery information
- General support questions

CUSTOMIZATION

Change AI Behavior:
===================

Edit the system prompt in ChatSupport.tsx:

const systemPrompt = `You are a helpful customer support assistant...`;

Adjust to match your business needs.

Change AI Model:
================

In ChatSupport.tsx, change the model:

model: 'llama-3.3-70b-versatile'  // Current
model: 'mixtral-8x7b-32768'       // Alternative
model: 'llama-3.1-8b-instant'     // Faster, less capable

Available models: https://console.groq.com/docs/models

Adjust Response Length:
=======================

In ChatSupport.tsx:

max_tokens: 500  // Current (shorter responses)
max_tokens: 1000 // Longer responses

Adjust Temperature:
===================

In ChatSupport.tsx:

temperature: 0.7  // Current (balanced)
temperature: 0.3  // More focused/deterministic
temperature: 1.0  // More creative/varied

FEATURES EXPLAINED

Chat History:
=============

- Stored in browser localStorage
- Persists across page refreshes
- Unique per browser/device
- Can be cleared by user
- No server storage needed

Context Window:
===============

- Last 10 messages sent to AI
- Provides conversation context
- Keeps API costs low
- Maintains conversation flow

Loading State:
==============

- Shows typing indicator
- Prevents duplicate requests
- Disables input while loading
- Better user experience

Error Handling:
===============

- Graceful API failures
- User-friendly error messages
- Suggests retry
- Doesn't crash app

TROUBLESHOOTING

Chatbot Not Responding:
=======================

1. Check API key is set in .env
2. Verify API key is valid
3. Check browser console for errors
4. Verify Groq API is accessible
5. Check rate limits not exceeded

Error: "AI chatbot is not configured":
======================================

Solution: Add VITE_GROQ_API_KEY to .env file

Error: "Groq API error: 401":
==============================

Solution: API key is invalid or expired
- Generate new API key from Groq console
- Update .env file

Error: "Groq API error: 429":
==============================

Solution: Rate limit exceeded
- Wait a few minutes
- Upgrade Groq plan if needed
- Reduce request frequency

Chat History Not Saving:
=========================

Solution: Check browser localStorage
- Open DevTools → Application → Local Storage
- Look for "ai_chatbot_history" key
- Clear and try again

COST ANALYSIS

Groq Free Tier:
===============

Limits:
- 30 requests/minute
- 14,400 requests/day
- Free forever

Typical Usage:
- Average conversation: 5-10 messages
- 1,440 conversations/day possible
- More than enough for most apps

Paid Tier (if needed):
======================

- Pay-as-you-go pricing
- ~$0.10 per 1M tokens
- Very affordable
- Only pay for what you use

COMPARISON WITH OLD SYSTEM

Old Chat Support:
=================

✗ Required Socket.IO connection
✗ Needed backend chat controller
✗ Required MongoDB storage
✗ Needed admin to respond
✗ Real-time infrastructure
✗ More complex deployment

New AI Chatbot:
===============

✓ No backend needed
✓ No database needed
✓ Instant AI responses
✓ 24/7 availability
✓ Scales automatically
✓ Simple deployment
✓ Lower costs

PRIVACY & SECURITY

Data Privacy:
=============

- Chat stored locally in browser
- Not sent to your server
- Only sent to Groq API
- Groq privacy policy applies
- User can clear history anytime

API Key Security:
=================

- Never commit .env to git
- Use environment variables
- Rotate keys periodically
- Monitor usage in Groq console

User Data:
==========

- No PII sent to AI by default
- Order IDs can be included
- Customize system prompt as needed
- Review Groq's data policy

BEST PRACTICES

1. Monitor API Usage:
   - Check Groq console regularly
   - Set up usage alerts
   - Track costs

2. Optimize Prompts:
   - Keep system prompt concise
   - Provide clear instructions
   - Test different prompts

3. Handle Errors:
   - Show friendly messages
   - Provide fallback options
   - Log errors for debugging

4. User Experience:
   - Fast responses
   - Clear loading states
   - Easy to clear history
   - Intuitive interface

5. Security:
   - Protect API keys
   - Validate user input
   - Rate limit if needed
   - Monitor for abuse

FUTURE ENHANCEMENTS

Possible Improvements:
======================

1. Add voice input/output
2. Multi-language support
3. Image understanding
4. Order-specific context
5. Integration with order system
6. Analytics and insights
7. Custom training data
8. Sentiment analysis

SUPPORT

Groq Documentation:
https://console.groq.com/docs

Groq API Reference:
https://console.groq.com/docs/api-reference

Groq Community:
https://groq.com/community

For issues with this implementation:
1. Check this guide
2. Review browser console
3. Test API key separately
4. Check Groq status page

QUICK START CHECKLIST

□ Sign up for Groq account
□ Generate API key
□ Add key to client/.env
□ Restart development server
□ Test chatbot functionality
□ Verify responses are working
□ Clear history works
□ Deploy to production
□ Add key to Render environment
□ Test in production

SUCCESS!

Your AI chatbot is now ready to help customers 24/7! 🤖

The chatbot will:
- Answer common questions
- Help with orders
- Provide menu information
- Assist with account issues
- Give general support

All without needing human intervention!
