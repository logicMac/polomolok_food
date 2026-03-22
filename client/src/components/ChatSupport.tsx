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
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      if (orderId && socket) {
        socket.emit('join-order', orderId);
      }
    }

    return () => {
      if (orderId && socket) {
        socket.emit('leave-order', orderId);
      }
    };
  }, [isOpen, orderId, socket]);

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
    if (!newMessage.trim() || !socket) return;

    try {
      const response = await api.post('/chat/messages', {
        message: newMessage,
        orderId
      });

      if (response.data.success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setUnreadCount(0);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all z-50"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">
                {orderId ? 'Order Support' : 'Customer Support'}
              </span>
              {isConnected && (
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-orange-600 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-orange-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`flex ${msg.sender === 'user' && msg.userId === user.userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          msg.sender === 'user' && msg.userId === user.userId
                            ? 'bg-orange-500 text-white'
                            : msg.sender === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.sender !== 'user' || msg.userId !== user.userId ? (
                          <p className="text-xs opacity-75 mb-1">{msg.userName}</p>
                        ) : null}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(msg.createdAt || msg.timestamp || '').toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={!isConnected}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-1">Connecting...</p>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
