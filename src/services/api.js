import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
    baseURL: "/api",
    timeout: 30000,
});

// Request Interceptor: Inject JWT Token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle Global Errors
API.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        const { status, data } = error.response;

        // Auto Logout on Unauthorized (Token Expired)
        if (status === 401) {
            localStorage.clear();
            window.location.href = "/login";
            toast.error("Session expired. Please log in again.");
        } 
        
        // Handle Validation Errors
        else if (status === 400) {
            toast.error(data.message || "Invalid request. Please check your input.");
        }

        // Handle Server Errors
        else if (status >= 500) {
            toast.error("System error. Our engineers are notified.");
        }
    } else if (error.request) {
        toast.error("Unable to reach the server. Please check your internet.");
    }

    return Promise.reject(error);
});

export default API;
