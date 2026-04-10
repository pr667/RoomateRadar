// src/components/RequestButton.jsx
import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-600',
};

export default function RequestButton({ listingId, hostId }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/requests/my');
      const existing = res.data?.requests?.find(
        (r) => r.listing?._id === listingId || r.listing === listingId
      );
      setRequest(existing || null);
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please write a message to the host.');
      return;
    }
    try {
      setActionLoading(true);
      setError('');
      const res = await API.post('/requests', {
        listingId,
        message: message.trim(),
      });
      setRequest(res.data?.request || res.data);
      setShowModal(false);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!request?._id) return;
    try {
      setActionLoading(true);
      await API.delete(`/requests/${request._id}`);
      setRequest(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to withdraw request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  if (request) {
    const status = request.status || 'pending';
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${
              STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {status === 'pending' && '⏳ '}
            {status === 'accepted' && '✅ '}
            {status === 'rejected' && '❌ '}
            {status === 'withdrawn' && '↩️ '}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {status === 'pending' && (
            <button
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="text-sm text-gray-500 hover:text-red-600 underline disabled:opacity-50"
            >
              {actionLoading ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          setError('');
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        Send Request
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Send Room Request
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Introduce yourself and tell the host why you're interested.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder="Hi, I'm interested in your listing because..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400 mb-3">
              {message.length}/500
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSend}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {actionLoading ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setMessage('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
