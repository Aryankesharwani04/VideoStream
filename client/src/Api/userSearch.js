import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/' });
export const searchUsersByChannelName = (name) => API.get(`/usersearch/search?name=${encodeURIComponent(name)}`);
