import Room from '../Models/Room.js';
import ChatMessage from '../Models/ChatMessage.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
// import User from '../Models/User.js'; // Assuming you have a User model
dotenv.config();
const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY; // 32 bytes
// console.log('ENCRYPTION_KEY length:', ENCRYPTION_KEY.length);
// console.log(process.env.CHAT_ENCRYPTION_KEY);
// console.log(process.env.PORT);

const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const createRoom = async (req, res) => {
  try {
    const { name, members } = req.body;
    let allMembers = (members || []).map(m => m.toString());
    const ownerId = req.userid || req.userId;
    if (!allMembers.includes(ownerId)) {
      allMembers.push(ownerId);
    }
    const allMembersObjId = allMembers.map(id => new mongoose.Types.ObjectId(id));
    const room = new Room({ name, members: allMembersObjId, admin: new mongoose.Types.ObjectId(ownerId) });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId, senderId, text } = req.body;
    const encryptedText = encrypt(text);
    const message = new ChatMessage({ room: roomId, sender: senderId, encryptedText });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatMessage.find({ room: roomId }).populate('sender', 'name email');
    const decryptedMessages = messages.map(msg => ({
      ...msg._doc,
      text: decrypt(msg.encryptedText)
    }));
    res.json(decryptedMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const rooms = await Room.find({ members: userId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add members to room (admin only)
export const addMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { members } = req.body; // array of user IDs
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.admin.toString() !== (req.userid || req.userId)) return res.status(403).json({ error: 'Only admin can add members' });
    const newMembers = members.map(id => new mongoose.Types.ObjectId(id));
    // Add only unique members
    room.members = Array.from(new Set([...room.members.map(m=>m.toString()), ...newMembers.map(m=>m.toString())])).map(id=>new mongoose.Types.ObjectId(id));
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave room (any member)
export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userid || req.userId;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    // Remove user from members
    room.members = room.members.filter(m => m.toString() !== userId);
    // If admin leaves, transfer admin to another member or delete room if empty
    if (room.admin.toString() === userId) {
      if (room.members.length > 0) {
        room.admin = room.members[0];
      } else {
        await Room.findByIdAndDelete(roomId);
        return res.json({ message: 'Room deleted as last member left' });
      }
    }
    await room.save();
    res.json({ message: 'Left room', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete room (admin only)
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userid || req.userId;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.admin.toString() !== userId) return res.status(403).json({ error: 'Only admin can delete room' });
    await Room.findByIdAndDelete(roomId);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
