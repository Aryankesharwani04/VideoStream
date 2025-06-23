import User from '../Models/Auth.js';

export const searchByChannelName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Channel name required' });
    const users = await User.find({ name: { $regex: name, $options: 'i' } }).select('_id name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
