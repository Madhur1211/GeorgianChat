// Import necessary dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose'); // Import mongoose for MongoDB connectivity
const formatMessage = require('./utils/messages'); // Custom utility function for formatting messages
const {
   userJoin,
   getCurrentUser,
   userLeave,
   getRoomUsers,
} = require('./utils/users'); // Utility functions for managing users

// Create an Express application, an HTTP server, and a Socket.IO instance
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB using the provided connection string
const config = require('./config/global'); // Import MongoDB connection configuration
let connectionString = config.db;

// Connect to MongoDB
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      console.log('Connected successfully to MongoDB!');
   })
   .catch((error) => {
      console.error('Error while connecting to MongoDB:', error);
   });

// Set up mongoose schema and model for messages
const chatSchema = new mongoose.Schema({
   username: String,
   message: String,
   room: String,
   time: {
      type: Date,
      default: Date.now,
   },
});

const ChatMessage = mongoose.model('ChatMessage', chatSchema);

// Set static file directory
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Group Alpha Chat Room'; // Define a bot name for the chat

// Handle incoming socket connections
io.on('connection', (socket) => {
   // Listen for 'joinRoom' event when a user joins a room
   socket.on('joinRoom', async ({ username, room }) => {
      const user = userJoin(socket.id, username, room); // Add the user to the room

      socket.join(user.room); // Join the room

      // Load previous messages from MongoDB
      try {
         const messages = await ChatMessage.find({ room: user.room }).sort('time');
         messages.forEach((message) => {
            socket.emit('message', formatMessage(message.username, message.message, message.time));
         });
      } catch (error) {
         console.error('Error loading messages from MongoDB:', error);
      }

      // Broadcast when a user connects to the room
      socket.broadcast
         .to(user.room)
         .emit(
            'message',
            formatMessage(botName, `${user.username} has joined the chat!`)
         );

      // Send users and room info to all clients in the room
      io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room),
      });
   });

   // Listen for 'chatMessage' event when a user sends a chat message
   socket.on('chatMessage', async (msg) => {
      const user = getCurrentUser(socket.id); // Get the current user

      // Save the message to MongoDB
      const chatMessage = new ChatMessage({
         username: user.username,
         message: msg,
         room: user.room,
      });

      try {
         await chatMessage.save();
      } catch (error) {
         console.error('Error saving message to MongoDB:', error);
      }

      // Broadcast the message to all clients in the room
      io.to(user.room).emit('message', formatMessage(user.username, msg));
   });

   // Listen for 'disconnect' event when a user disconnects
   socket.on('disconnect', () => {
      const user = userLeave(socket.id); // Remove the user from the room

      if (user) {
         // Broadcast when a user disconnects from the room
         io.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.username} has left the chat!`)
         );

         // Send users and room info to all clients in the room
         io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
         });
      }
   })
});

// Set the server to listen on the specified port (default is 3001)
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
   console.log(`🎯 Server is running on PORT: ${PORT}`);
});
