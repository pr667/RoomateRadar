// controllers/listingController.js
const Listing = require('../models/Listing');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { computeCompatibility } = require('../utils/compatibilityScore');
const { geocodeAddress } = require('../utils/geocode');

// ── Helper: upload a single buffer to Cloudinary ──────────────────────────────
function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });
}

// ── POST /api/listings  (host only) ───────────────────────────────────────────
const createListing = async (req, res) => {
  try {
    const {
      title, description, address, rent, deposit, roomType,
      amenities, availableFrom, preferredGender, smokingAllowed,
      petsAllowed, maxRoommates,
    } = req.body;

    // Auto-geocode address
    const coordinates = await geocodeAddress(address || {});

    const listing = await Listing.create({
      host: req.user._id,
      title,
      description,
      address,
      location: {
        type: 'Point',
        coordinates,
      },
      rent,
      deposit,
      roomType,
      amenities,
      availableFrom,
      preferredGender,
      smokingAllowed,
      petsAllowed,
      maxRoommates,
    });

    res.status(201).json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/listings  (seeker, with filters + compatibility) ─────────────────
const getListings = async (req, res) => {
  try {
    const {
      city, area, minRent, maxRent, roomType, amenities,
      sortBy = 'newest',
    } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Build filter
    const filter = { isActive: true };

    if (city) {
      filter['address.city'] = { $regex: escapeRegex(city), $options: 'i' };
    }
    if (area) {
      filter['address.street'] = { $regex: escapeRegex(area), $options: 'i' };
    }
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }
    if (roomType) {
      filter.roomType = roomType;
    }
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      filter.amenities = { $all: amenityList };
    }

    const skip = (page - 1) * limit;
    const total = await Listing.countDocuments(filter);
    const sortOptions = {
      'price-asc': { rent: 1, createdAt: -1 },
      'price-desc': { rent: -1, createdAt: -1 },
      newest: { createdAt: -1 },
      compatibility: { createdAt: -1 },
    };
    const sort = sortOptions[sortBy] || sortOptions.newest;
    const isSeeker = req.user && req.user.role === 'seeker';
    const query = Listing.find(filter).populate('host', 'name avatar preferences trustScore');
    let listings;

    const addCompatibilityScore = (listing) => {
      const obj = listing.toObject();
      if (isSeeker) {
        const seekerPrefs = req.user.preferences || {};
        const hostPrefs = listing.host && listing.host.preferences
          ? listing.host.preferences
          : null;
        obj.compatibilityScore = computeCompatibility(seekerPrefs, listing, hostPrefs);
      }
      return obj;
    };

    // Rank the full matching set before slicing so compatibility is consistent across pages.
    if (isSeeker && sortBy === 'compatibility') {
      listings = (await query.sort({ createdAt: -1 })).map(addCompatibilityScore);
      listings.sort((a, b) =>
        (b.compatibilityScore || 0) - (a.compatibilityScore || 0) ||
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      listings = listings.slice(skip, skip + limit);
    } else {
      listings = (await query.sort(sort).skip(skip).limit(limit)).map(addCompatibilityScore);
    }

    res.json({
      success: true,
      listings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/listings/:id  (public, optional auth) ────────────────────────────
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'host',
      'name avatar preferences bio trustScore totalRatings'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    let compatibilityScore = null;

    // Optional auth – req.user may have been set by optional middleware
    try {
      if (req.user && req.user.role === 'seeker') {
        const seekerPrefs = req.user.preferences || {};
        const hostPrefs = listing.host && listing.host.preferences
          ? listing.host.preferences
          : null;
        compatibilityScore = computeCompatibility(seekerPrefs, listing, hostPrefs);
      }
    } catch (_) {
      // Ignore auth errors for public route
    }

    res.json({ success: true, listing, compatibilityScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/listings/:id  (host only, must be listing.host) ──────────────────
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Only the listing owner (or admin) may update
    if (
      listing.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorised to update this listing' });
    }

    const allowedFields = [
      'title', 'description', 'address', 'rent', 'deposit', 'roomType',
      'amenities', 'availableFrom', 'preferredGender', 'smokingAllowed',
      'petsAllowed', 'maxRoommates', 'isActive',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    // Auto-geocode if address changed
    if (req.body.address) {
      const coordinates = await geocodeAddress(listing.address || {});
      if (coordinates[0] !== 0 || coordinates[1] !== 0) {
        listing.location = { type: 'Point', coordinates };
      }
    }

    await listing.save();

    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle whether a host's listing appears in browse results.
const toggleListingActive = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to update this listing' });
    }

    listing.isActive = !listing.isActive;
    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/listings/:id  (host only or admin) – soft delete ──────────────
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (
      listing.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorised to delete this listing' });
    }

    listing.isActive = false;
    await listing.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/listings/:id/photos  (host only) ────────────────────────────────
const uploadListingPhotos = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to upload photos for this listing' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: 'roommateradar/listings',
        transformation: [{ width: 800, height: 600, crop: 'fill' }],
      })
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.secure_url);

    listing.photos.push(...urls);
    await listing.save();

    res.json({ success: true, photos: listing.photos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/listings/my  (host only) ─────────────────────────────────────────
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/listings/:id/photos  (host only) ─────────────────────────────
const removeListingPhoto = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    const { photoUrl } = req.body;
    if (!photoUrl) return res.status(400).json({ message: 'photoUrl is required' });

    listing.photos = listing.photos.filter((p) => p !== photoUrl);
    await listing.save();

    res.json({ success: true, photos: listing.photos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/listings/:id/photos  (host only – replace all photos) ───────────
const replaceListingPhotos = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: 'roommateradar/listings',
        transformation: [{ width: 800, height: 600, crop: 'fill' }],
      })
    );

    const results = await Promise.all(uploadPromises);
    listing.photos = results.map((r) => r.secure_url);
    await listing.save();

    res.json({ success: true, photos: listing.photos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getListing,
  updateListing,
  toggleListingActive,
  deleteListing,
  uploadListingPhotos,
  removeListingPhoto,
  replaceListingPhotos,
  getMyListings,
};
