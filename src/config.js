// Central config — values come from client/.env (VITE_ prefix required by Vite)
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export const APP_URL = import.meta.env.VITE_APP_URL ?? "http://localhost:3000";

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
