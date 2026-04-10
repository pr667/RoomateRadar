// src/components/ChatWindow.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatWindow({ conversationId, otherUser }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const res = await API.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(res.data?.messages || res.data || []);
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket: join room & listen for new messages
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('join_room', conversationId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    try {
      setSending(true);
      const res = await API.post(`/chat/conversations/${conversationId}/messages`, {
        text: content,
      });
      const newMsg = res.data?.message || res.data;
      setMessages((prev) => {
        if (prev.find((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    } catch {
      setError('Failed to send message.');
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  const isMine = (msg) =>
    msg.sender?._id === user?._id || msg.sender === user?._id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
        {otherUser?.avatar ? (
          <img
            src={otherUser.avatar}
            alt={otherUser.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            {getInitials(otherUser?.name)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800 text-sm">{otherUser?.name || 'User'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}
        {messages.length === 0 && !error && (
          <p className="text-center text-gray-400 text-sm mt-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg, idx) => {
          const mine = isMine(msg);
          const senderName = msg.sender?.name || otherUser?.name || 'User';
          const senderAvatar = msg.sender?.avatar || null;
          return (
            <div
              key={msg._id || idx}
              className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!mine && (
                <div className="shrink-0">
                  {senderAvatar ? (
                    <img
                      src={senderAvatar}
                      alt={senderName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(senderName)}
                    </div>
                  )}
                </div>
              )}
              <div className={`flex flex-col max-w-xs lg:max-w-md ${mine ? 'items-end' : 'items-start'}`}>
                {!mine && (
                  <span className="text-xs text-gray-500 mb-1 ml-1">{senderName}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    mine
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.text || msg.content}
                </div>
                {msg.createdAt && (
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none max-h-24"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors shrink-0"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
