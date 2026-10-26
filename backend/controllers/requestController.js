// controllers/requestController.js
const Request = require('../models/Request');
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');
const { computeCompatibility } = require('../utils/compatibilityScore');

// ── POST /api/requests  (seeker only) ────────────────────────────────────────
const sendRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;

    const listing = await Listing.findById(listingId).populate(
      'host',
      'name avatar preferences trustScore'
    );

    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: 'Listing not found or no longer active' });
    }

    // Prevent seeker from requesting their own listing
    if (listing.host._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a request to your own listing' });
    }

    // Compute compatibility
    const seekerPrefs = req.user.preferences || {};
    const hostPrefs = listing.host.preferences || null;
    const compatibilityScore = computeCompatibility(seekerPrefs, listing, hostPrefs);

    const request = await Request.create({
      seeker: req.user._id,
      host: listing.host._id,
      listing: listingId,
      message,
      compatibilityScore,
      status: 'pending',
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    // Handle duplicate request (unique index on seeker+listing)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already sent a request for this listing' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/requests/my  (seeker – their sent requests) ─────────────────────
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ seeker: req.user._id })
      .populate('listing', 'title address rent photos roomType')
      .populate('host', 'name avatar trustScore')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/requests/incoming  (host – requests for their listings) ──────────
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ host: req.user._id })
      .populate('listing', 'title address rent')
      .populate('seeker', 'name avatar bio preferences trustScore')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/requests/:id  (host only) ───────────────────────────────────────
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "rejected"' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to respond to this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    request.status = status;
    await request.save();

    let conversation = null;

    if (status === 'accepted') {
      // Find existing or create new conversation
      conversation = await Conversation.findOne({
        participants: { $all: [request.seeker, request.host] },
        listing: request.listing,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [request.seeker, request.host],
          request: request._id,
          listing: request.listing,
          isUnlocked: true,
        });
      } else {
        conversation.isUnlocked = true;
        await conversation.save();
      }
    }

    res.json({ success: true, request, conversation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/requests/:id  (seeker only – withdraw) ───────────────────────
const withdrawRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.seeker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to withdraw this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be withdrawn' });
    }

    request.status = 'withdrawn';
    await request.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendRequest,
  getMyRequests,
  getIncomingRequests,
  respondToRequest,
  withdrawRequest,
};
