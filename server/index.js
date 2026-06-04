import 'dotenv/config';  // ← MUST be first: loads .env before any other module reads process.env
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import router from './routes.js';
import { connectDB } from './db.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5001;

// CORS settings to allow frontend dashboard connection
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Main Router attachment
app.use('/api', router);

// Support legacy /proxy/flash path without /api prefix by redirecting to the proper route
app.use('/proxy/flash', (req, res) => {
  // Preserve method and body with 307 Temporary Redirect
  res.redirect(307, '/api/proxy/flash');
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Shamutha AI EdTech API is active.' });
});

const httpServer = createServer(app);

// Socket.IO setup with CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Redis Caching Integration with dynamic offline fallback
let redisClient = null;
let isUsingRedis = false;

try {
  console.log('Connecting to Redis...');
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 1000
  });
  
  redisClient.on('connect', () => {
    isUsingRedis = true;
    console.log('✅ Redis client connected successfully.');
  });

  redisClient.on('error', (err) => {
    if (isUsingRedis) {
      console.warn('⚠️ Redis error observed:', err.message);
    } else {
      // Catch initial connection failure to prevent server crash
      isUsingRedis = false;
    }
  });
} catch (e) {
  console.warn('⚠️ Redis not running. Falling back to internal memory-caching store.');
  isUsingRedis = false;
}

// In-Memory cache fallback if Redis is down
const memoryCache = new Map();

async function setCache(key, value, expirySec = 3600) {
  if (isUsingRedis && redisClient) {
    try {
      await redisClient.setex(key, expirySec, JSON.stringify(value));
      return;
    } catch (e) {
      // fallback
    }
  }
  memoryCache.set(key, { value, expiry: Date.now() + (expirySec * 1000) });
}

async function getCache(key) {
  if (isUsingRedis && redisClient) {
    try {
      const cachedVal = await redisClient.get(key);
      if (cachedVal) return JSON.parse(cachedVal);
    } catch (e) {
      // fallback
    }
  }
  const entry = memoryCache.get(key);
  if (entry) {
    if (Date.now() < entry.expiry) {
      return entry.value;
    }
    memoryCache.delete(key); // clear expired entry
  }
  return null;
}

// REAL-TIME SOCKET.IO COORDINATION (Coding Battles, Collaborative Coding, Live Webinars)
let codingBattleQueue = [];

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('error', (err) => {
    console.warn(`Socket error on ${socket.id}:`, err && err.message ? err.message : err);
  });

  // 1. Join live webinar room
  socket.on('join-webinar', (webinarId) => {
    socket.join(`webinar-${webinarId}`);
    console.log(`Socket ${socket.id} joined webinar: ${webinarId}`);
  });

  // Webinar Chat message broadcasts
  socket.on('webinar-chat-msg', (data) => {
    // Broadcast message to all users in the specific webinar channel
    io.to(`webinar-${data.webinarId}`).emit('webinar-chat-msg', {
      sender: data.sender || 'Student',
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Interactive Live Whiteboard Canvas syncer
  socket.on('canvas-draw', (data) => {
    socket.to(`webinar-${data.webinarId}`).emit('canvas-draw', data);
  });

  socket.on('canvas-clear', (data) => {
    socket.to(`webinar-${data.webinarId}`).emit('canvas-clear');
  });

  // 2. Real-Time Coding Battles Matchmaking
  socket.on('join-battle-queue', (userData) => {
    const queueObj = { socketId: socket.id, username: userData.username, xp: userData.xp || 1000 };
    codingBattleQueue.push(queueObj);
    console.log(`Queue updated. Active size: ${codingBattleQueue.length}`);

    // If we have at least 2 users, pair them up
    if (codingBattleQueue.length >= 2) {
      const player1 = codingBattleQueue.shift();
      const player2 = codingBattleQueue.shift();

      const roomId = `battle-${player1.socketId}-${player2.socketId}`;

      // Notify clients they have been matched
      io.to(player1.socketId).emit('battle-matched', {
        roomId,
        role: 'challenger',
        opponent: player2.username,
        problem: {
          id: 'two-sum',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          starterCode: 'function solution(nums, target) {\n  // Write your code here\n  \n}'
        }
      });

      io.to(player2.socketId).emit('battle-matched', {
        roomId,
        role: 'defender',
        opponent: player1.username,
        problem: {
          id: 'two-sum',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          starterCode: 'function solution(nums, target) {\n  // Write your code here\n  \n}'
        }
      });
      console.log(`Match established: ${roomId}`);
    } else {
      // Simulate matching with an AI bot opponent if the user is waiting too long (mocked trigger at client-side if needed, 
      // or send an AI matching event after 4 seconds)
      setTimeout(() => {
        const foundIndex = codingBattleQueue.findIndex(q => q.socketId === socket.id);
        if (foundIndex >= 0) {
          codingBattleQueue.splice(foundIndex, 1);
          // Match player with simulated AI Coding Bot
          socket.emit('battle-matched', {
            roomId: `battle-ai-${socket.id}`,
            role: 'challenger',
            opponent: 'Shamutha AI Coder Bot',
            isAiOpponent: true,
            problem: {
              id: 'reverse-string',
              title: 'Reverse String',
              description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
              starterCode: 'function solution(str) {\n  // Write your code here\n  \n}'
            }
          });
          console.log(`Matched user ${socket.id} with AI Coder Bot`);
        }
      }, 5000);
    }
  });

  // Code updates from player during battle
  socket.on('battle-code-update', (data) => {
    socket.to(data.roomId).emit('opponent-code-update', {
      progress: data.progress, // progress percentage (e.g. line count or checks completed)
      code: data.code
    });
  });

  socket.on('battle-win', (data) => {
    socket.to(data.roomId).emit('battle-lost', {
      winner: data.winner
    });
  });

  // Client WebRTC proctoring logs & screenshare disconnect updates
  socket.on('proctor-violation', (data) => {
    console.log(`[PROCTOR VIOLATION] Student ${socket.id} triggered alert: ${data.reason}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    codingBattleQueue = codingBattleQueue.filter(user => user.socketId !== socket.id);
  });
});

// Global process and Socket.IO error handlers to avoid unhandled crashes
io.on('error', (err) => {
  console.warn('Socket.IO error:', err && err.message ? err.message : err);
});

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Establish database connection and boot server
connectDB().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Shamutha Server running on http://0.0.0.0:${PORT}`);
  });
});
