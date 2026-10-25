import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 180000,
  headers: { "Content-Type": "application/json" },
});

/** Turns any axios error into a readable message from the backend's ApiError. */
export function errorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ECONNABORTED") return "The AI took too long to respond. Please try again.";
  if (error?.message === "Network Error") return "Cannot reach the backend. Is Spring Boot running on port 8080?";
  return error?.message || "Something went wrong";
}
