import express from 'express';
const router = express.Router();
import {createRoom, getRooms, sendMessage, getMessages, addMembers, leaveRoom, deleteRoom} from '../Controllers/chat.js';
import auth from '../middleware/auth.js';

router.post('/room', auth, createRoom);
router.get('/rooms/:userId', auth, getRooms);
router.post('/message', auth, sendMessage);
router.get('/messages/:roomId', auth, getMessages);
router.post('/room/:roomId/add-members', auth, addMembers);
router.post('/room/:roomId/leave', auth, leaveRoom);
router.delete('/room/:roomId', auth, deleteRoom);

export default router;
