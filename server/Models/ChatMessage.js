import mongoose from 'mongoose';    
const ChatMessageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  encryptedText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChatMessage', ChatMessageSchema);
