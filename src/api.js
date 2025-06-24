import axios from "axios";

const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized – please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * User login – retrieves access token.
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export async function login({ username, password }) {
  try {
    const { data } = await apiClient.post("/auth/login", {
      username,
      password,
    });
    localStorage.setItem("token", data.access_token);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
