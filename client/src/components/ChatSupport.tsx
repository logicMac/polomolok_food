import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChatMessage } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ChatSupportProps {
  orderId?: string;
}

export const ChatSupport: React.FC<ChatSupportProps> = ({ orderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      if (orderId && socket) {
        socket.emit('join-order', orderId);
      }
      
      // Poll for new messages if socket is not connected
      let pollInterval: NodeJS.Timeout;
      if (!isConnected) {
        pollInterval = setInterval(() => {
          loadMessages();
        }, 3000); // Poll every 3 seconds
      }
      
      return () => {
        if (orderId && socket) {
          socket.emit('leave-order', orderId);
        }
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      };
    }
  }, [isOpen, orderId, socket, isConnected]);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        if (!isOpen || isMinimized) {
          setUnreadCount(prev => prev + 1);
        }
        scrollToBottom();
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, isMinimized, messages]);

  const loadMessages = async () => {
    try {
      const params = orderId ? { orderId } : {};
      const response = await api.get('/chat/messages', { params });
      if (response.data.success) {
        setMessages(response.data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await api.post('/chat/messages', {
        message: messageToSend,
        orderId
      });

      if (response.data.success) {
        // Add message to local state immediately for better UX
        const newMsg: ChatMessage = {
          _id: response.data.data._id,
          userId: user.userId,
          userName: user.name,
          message: messageToSend,
          sender: 'user',
          orderId,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageToSend);
      alert('Failed to send message. Please try again.');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setUnreadCount(0);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-2xl hover:bg-gray-200 transition-all z-50 border-2 border-zinc-800"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-zinc-900 border-2 border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="bg-white text-black p-4 rounded-t-2xl flex items-center justify-between border-b-2 border-zinc-800">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <div>
                <span className="font-bold text-sm">
                  {orderId ? 'Order Support' : 'Customer Support'}
                </span>
                {isConnected && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                )}
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-16">
                    <div className="inline-block p-6 bg-zinc-900 border border-zinc-800 rounded-2xl mb-4">
                      <MessageCircle className="w-12 h-12 mx-auto opacity-50" />
                    </div>
                    <p className="text-sm">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`flex ${msg.sender === 'user' && msg.userId === user.userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl p-3 ${
                          msg.sender === 'user' && msg.userId === user.userId
                            ? 'bg-white text-black'
                            : msg.sender === 'admin'
                            ? 'bg-zinc-800 text-white border border-zinc-700'
                            : 'bg-zinc-800 text-gray-200 border border-zinc-700'
                        }`}
                      >
                        {msg.sender !== 'user' || msg.userId !== user.userId ? (
                          <p className="text-xs opacity-75 mb-1 font-semibold">{msg.userName}</p>
                        ) : null}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(msg.createdAt || msg.timestamp || '').toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-zinc-800 bg-zinc-900">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-black border-zinc-800 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-white"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 bg-white hover:bg-gray-200 text-black rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Real-time updates disabled. Messages will still be delivered.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
