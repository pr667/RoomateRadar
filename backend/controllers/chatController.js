// controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ── GET /api/chat/conversations ───────────────────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isUnlocked: true,
    })
      .populate('participants', 'name avatar')
      .populate('listing', 'title address')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/chat/conversations/:id/messages ──────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify user is a participant
    const isParticipant = conversation.participants
      .map((p) => p.toString())
      .includes(req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorised to view this conversation' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark unread messages (sent by the other party) as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/chat/conversations/:id/messages ─────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify user is a participant
    const isParticipant = conversation.participants
      .map((p) => p.toString())
      .includes(req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorised to send messages in this conversation' });
    }

    if (!conversation.isUnlocked) {
      return res.status(403).json({ message: 'This conversation is locked' });
    }

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    let message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: text.trim(),
    });

    // Update conversation metadata
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender info for the response and socket emit
    message = await message.populate('sender', 'name avatar');

    // Emit to the conversation room via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('new_message', message);
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage };
