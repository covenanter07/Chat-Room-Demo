const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");
const getConversation = require("../helpers/getConversation");

const app = express();

/** Create HTTP server and Socket.IO instance */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Use array for methods
    credentials: true,
  },
});

/**
 * socket running at http://localhost:8090/
 */

// Set to keep track of online users
const onlineUsers = new Set();

// Middleware to authenticate socket connection
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.error("No token provided");
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const user = await getUserDetailsFromToken(token);

    if (!user) {
      console.error("Invalid token, user not found");
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user details to the socket object
    socket.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    next(new Error("Authentication error: " + error.message));
  }
});

io.on("connection", async (socket) => {
  const user = socket.user;
  console.log("User connected", user._id);


  socket.join(user?._id.toString());
  onlineUsers.add(user?._id?.toString());

  // Emit the list of online users to all connected clients
  io.emit("onlineUser", Array.from(onlineUsers));

  // Listen for 'message-page' events
  socket.on("message-page", async (userId) => {
    console.log("Requested userId", userId);
    const userDetails = await UserModel.findById(userId).select("-password");

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUsers.has(userId),
    };

    socket.emit("message-user", payload);

    // get previous message
    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    socket.emit("message", getConversationMessage?.messages || []);
  });

  // new message
  socket.on("new message", async (data) => {
    // check conversation is available both user

    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });

    // if conversation is not available
    if (!conversation) {
      const createConversation = await ConversationModel({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      pdfUrl: data.pdfUrl,
      audioUrl: data.audioUrl,
      msgByuserId: data?.msgByuserId,
    });
    const saveMessage = await message.save();

    const updateConversation = await ConversationModel.updateOne(
      {
        _id: conversation?._id,
      },
      {
        $push: { messages: saveMessage?._id },
      }
    );

    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );

    // send conversation
    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
  });

  // sidebar
  socket.on("sidebar", async (currentUserId) => {
    console.log("current user", currentUserId);

    const conversation = await getConversation(currentUserId);

    socket.emit("conversation", conversation);
  });

  socket.on("seen", async (msgByuserId) => {
    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: msgByuserId },
        { sender: msgByuserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];

    const updateMessages = await MessageModel.updateMany(
      { _id: { $in: conversationMessageId }, msgByuserId: msgByuserId },
      { $set: { seen: true } }
    );

    // send conversation
    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByuserId);

    io.to(user?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByuserId).emit("conversation", conversationReceiver);
  });

  // Handle user logout
  socket.on("logout", (userId) => {
    onlineUsers.delete(userId?.toString());
    io.emit("onlineUser", Array.from(onlineUsers));
    console.log(`User ${userId} has logged out`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    onlineUsers.delete(user?._id?.toString());
    io.emit("onlineUser", Array.from(onlineUsers));
    console.log("User disconnected", socket.id);
  });

  // Delete conversation
  socket.on("delete-conversation", async ({ senderId, receiverId }) => {
    try {
      // Find and delete the conversation between the two users
      const conversation = await ConversationModel.findOneAndDelete({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      });

      if (!conversation) {
        return socket.emit("conversation-deleted", {
          success: false,
          message: "Conversation not found",
        });
      }

      // Delete all messages associated with this conversation
      await MessageModel.deleteMany({
        conversationId: conversation._id,
      });

      // Notify both users that the conversation has been deleted
      io.to(senderId).emit("conversation-deleted", {
        success: true,
        message: "Conversation deleted successfully",
      });

      io.to(receiverId).emit("conversation-deleted", {
        success: true,
        message: "Conversation deleted successfully",
      });

      console.log(`Conversation between ${senderId} and ${receiverId} deleted`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      socket.emit("conversation-deleted", {
        success: false,
        message: "An error occurred while deleting the conversation",
      });
    }
  });
});

module.exports = {
  app,
  server,
};
