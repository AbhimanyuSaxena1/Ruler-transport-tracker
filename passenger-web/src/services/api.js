import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const getRoutes = async () => {
  const response = await apiClient.get('/routes');
  return response.data.data;
};

export const getBuses = async () => {
  const response = await apiClient.get('/buses');
  return response.data.data;
};

export const getSchedules = async () => {
  const response = await apiClient.get('/schedules');
  return response.data.data;
};

export default apiClient;
