import express from 'express';
import { searchByChannelName } from '../Controllers/userSearch.js';
const router = express.Router();

router.get('/search', searchByChannelName);

export default router;
