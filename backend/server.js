// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');
const Conversation = require('./models/Conversation');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id isActive');
    if (!user || !user.isActive) return next(new Error('Authentication required'));

    socket.userId = user._id.toString();
    next();
  } catch (err) {
    next(new Error('Authentication required'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.join(`user:${socket.userId}`);

  socket.on('join_room', async (conversationId, acknowledge) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
        isUnlocked: true,
      }).select('_id');

      if (!conversation) {
        if (typeof acknowledge === 'function') acknowledge({ joined: false });
        return;
      }

      await socket.join(conversation._id.toString());
      if (typeof acknowledge === 'function') acknowledge({ joined: true });
    } catch (err) {
      if (typeof acknowledge === 'function') acknowledge({ joined: false });
    }
  });

  socket.on('leave_room', (conversationId) => {
    if (typeof conversationId === 'string') socket.leave(conversationId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: 'RoommateRadar API running' }));

// Start
connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
