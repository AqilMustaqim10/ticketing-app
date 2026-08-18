/**
 * API Service Utility
 *
 * Configures Axios HTTP client with baseURL and request interceptor
 * to automatically attach JWT tokens to secure endpoints.
 */

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request interceptor to attach Authorization header if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default API;
