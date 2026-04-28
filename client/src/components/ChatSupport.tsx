/// <reference types="../vite-env.d.ts" />
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Bot } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSupportProps {
  orderId?: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const STORAGE_KEY = 'ai_chatbot_history';

export const ChatSupport: React.FC<ChatSupportProps> = ({ orderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contextData, setContextData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Fetch context data when chat opens
  useEffect(() => {
    if (isOpen && !contextData) {
      fetchContextData();
    }
  }, [isOpen]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, isMinimized, messages]);

  const fetchContextData = async () => {
    try {
      // Fetch menu items
      const foodsResponse = await api.get('/foods');
      const foods = foodsResponse.data.success ? foodsResponse.data.data : [];

      // Fetch user's orders if authenticated
      let orders = [];
      let specificOrder = null;
      if (user) {
        try {
          const ordersResponse = await api.get('/orders/my-orders');
          orders = ordersResponse.data.success ? ordersResponse.data.data : [];
          
          // If orderId is provided, get specific order details
          if (orderId) {
            const orderResponse = await api.get(`/orders/${orderId}`);
            specificOrder = orderResponse.data.success ? orderResponse.data.data : null;
          }
        } catch (error) {
          console.log('Could not fetch orders');
        }
      }

      setContextData({
        foods,
        orders,
        specificOrder,
        user: user ? {
          name: user.name,
          email: user.email,
          role: user.role
        } : null
      });
    } catch (error) {
      console.error('Failed to fetch context data:', error);
    }
  };

  const buildSystemPrompt = () => {
    if (!contextData) {
      return `You are a helpful customer support assistant for Polomolok Food Ordering System.`;
    }

    let prompt = `You are a helpful customer support assistant for Polomolok Food Ordering System.

AVAILABLE MENU ITEMS:
${contextData.foods.slice(0, 20).map((food: any) => 
  `- ${food.name}: ₱${food.price} (${food.category}) ${food.available ? '✓ Available' : '✗ Out of stock'}`
).join('\n')}
${contextData.foods.length > 20 ? `\n... and ${contextData.foods.length - 20} more items` : ''}

`;

    if (contextData.user) {
      prompt += `CUSTOMER INFORMATION:
- Name: ${contextData.user.name}
- Email: ${contextData.user.email}
- Account Type: ${contextData.user.role}

`;
    }

    if (contextData.orders && contextData.orders.length > 0) {
      prompt += `RECENT ORDERS:
${contextData.orders.slice(0, 5).map((order: any) => 
  `- Order #${order._id?.slice(-6)}: ${order.status} - ₱${order.totalAmount} (${new Date(order.createdAt).toLocaleDateString()})`
).join('\n')}

`;
    }

    if (contextData.specificOrder) {
      const order = contextData.specificOrder;
      prompt += `CURRENT ORDER DETAILS (Order #${order._id?.slice(-6)}):
- Status: ${order.status}
- Total: ₱${order.totalAmount}
- Items: ${order.items?.map((item: any) => `${item.quantity}x ${item.foodName}`).join(', ')}
- Delivery Address: ${order.deliveryAddress}
- Payment: ${order.paymentMethod} (${order.paymentStatus})
${order.riderId ? `- Rider assigned: Yes` : '- Rider assigned: Not yet'}

`;
    }

    prompt += `You can help with:
- Menu recommendations based on available items
- Order status and tracking
- Account questions
- Delivery information
- Payment inquiries

Be friendly, concise, and use the actual data provided above. If asked about specific menu items, prices, or orders, refer to the real data. If you don't have specific information, suggest contacting support.`;

    return prompt;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const callGroqAPI = async (userMessage: string): Promise<string> => {
    if (!GROQ_API_KEY) {
      return "I'm sorry, but the AI chatbot is not configured. Please add your Groq API key to the .env file.";
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt()
            },
            ...messages.slice(-10).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error('Groq API error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    scrollToBottom();

    // Get AI response
    const aiResponse = await callGroqAPI(messageToSend);

    // Add AI message
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMsg]);
    
    if (!isOpen || isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
    
    setIsLoading(false);
    scrollToBottom();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setUnreadCount(0);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear chat history?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-white text-black p-3 md:p-4 rounded-full shadow-2xl hover:bg-gray-200 transition-all z-50 border-2 border-zinc-800"
        >
          <Bot className="w-5 h-5 md:w-6 md:h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 bg-zinc-900 border-t-2 md:border-2 border-zinc-800 md:rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${
          isMinimized ? 'h-14' : 'h-[100vh] md:h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-white text-black p-4 md:rounded-t-2xl flex items-center justify-between border-b-2 border-zinc-800">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5" />
              <div>
                <span className="font-bold text-sm">AI Assistant</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-gray-600">Online</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-gray-200 p-2 rounded-lg transition"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-gray-200 p-2 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-black">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8 md:mt-16">
                    <div className="inline-block p-4 md:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl mb-4">
                      <Bot className="w-10 h-10 md:w-12 md:h-12 mx-auto opacity-50" />
                    </div>
                    <p className="text-sm font-semibold mb-2">AI Assistant Ready</p>
                    <p className="text-xs px-4">Ask me anything about orders, menu, or support!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[75%] rounded-xl p-3 ${
                          msg.role === 'user'
                            ? 'bg-white text-black'
                            : 'bg-zinc-800 text-white border border-zinc-700'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-3 h-3 opacity-75" />
                            <p className="text-xs opacity-75 font-semibold">AI Assistant</p>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 text-white border border-zinc-700 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-3 h-3 opacity-75" />
                        <p className="text-xs opacity-75 font-semibold">AI Assistant</p>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t-2 border-zinc-800 bg-zinc-900">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ask me anything..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-white focus:border-white"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="px-3 md:px-4 bg-black hover:bg-zinc-800 text-white border-2 border-white rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-300 mt-2 transition"
                  >
                    Clear chat history
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
