import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatically attach the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('finflow_jwt');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;