import axios from "axios";
import toast from "react-hot-toast";

export const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
export const apiBaseUrl = backendUrl ? `${backendUrl}/api` : "/api";

export const buildApiUrl = (path = "") => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
};

export const buildImageUrl = (imagePath) => {
    if (!imagePath) {
        return "https://placehold.co/1200x600?text=WasteZero+Campaign";
    }

    if (/^https?:\/\//i.test(imagePath)) {
        return imagePath;
    }

    const cleanPath = imagePath.replace(/^\/+/, "");

    if (!backendUrl) {
        return cleanPath.startsWith("uploads") ? `/${cleanPath}` : `/uploads/${cleanPath}`;
    }

    return cleanPath.startsWith("uploads")
        ? `${backendUrl}/${cleanPath}`
        : `${backendUrl}/uploads/${cleanPath}`;
};

export const applyAuthSession = ({ token, user }) => {
    if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common.Authorization;
};

const API = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000,
});

if (backendUrl) {
    axios.defaults.baseURL = backendUrl;
}

const existingToken = localStorage.getItem("token");
if (existingToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

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
            clearAuthSession();
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
