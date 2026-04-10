// src/pages/Chat.jsx
import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await API.get('/chat/conversations');
        setConversations(res.data?.conversations || res.data || []);
      } catch {
        setError('Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const getOtherParticipant = (conv) => {
    if (!conv?.participants) return null;
    return conv.participants.find(
      (p) => (p._id || p) !== user?._id
    );
  };

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-6xl w-full mx-auto px-0 sm:px-4 py-0 sm:py-6 gap-0 sm:gap-4">
        {/* Conversations sidebar */}
        <aside className="w-72 shrink-0 bg-white border-r border-gray-100 sm:rounded-xl sm:shadow-sm flex flex-col">
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm p-4">{error}</p>
            )}

            {!loading && conversations.length === 0 && !error && (
              <div className="p-6 text-center">
                <span className="text-3xl">💬</span>
                <p className="text-gray-500 text-sm mt-2">No conversations yet.</p>
              </div>
            )}

            {conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = selected?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  {other?.avatar ? (
                    <img
                      src={other.avatar}
                      alt={other.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {getInitials(other?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {other?.name || 'User'}
                    </p>
                    {conv.listing?.title && (
                      <p className="text-xs text-gray-400 truncate">{conv.listing.title}</p>
                    )}
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessage.text || conv.lastMessage.content || conv.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat window */}
        <main className="flex-1 bg-white sm:rounded-xl sm:shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-0">
          {selected ? (
            <ChatWindow
              conversationId={selected._id}
              otherUser={getOtherParticipant(selected)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <span className="text-5xl mb-4">💬</span>
              <h3 className="font-semibold text-gray-700 text-lg">Select a conversation</h3>
              <p className="text-gray-400 text-sm mt-1">
                Choose a conversation from the left to start chatting.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
