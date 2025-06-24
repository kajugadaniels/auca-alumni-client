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

/**
 * Initiate user registration – verifies student_id & sends OTP to email.
 * @param {{ student_id: number, email: string, phone_number: string }} payload
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function initiateRegistration(payload) {
  try {
    const { data } = await apiClient.post('/auth/register/initiate', payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Complete user registration – verifies OTP and sets password.
 * @param {{ student_id: number, otp: string, password: string, confirm_password: string }} payload
 * @returns {Promise<{ status: string, message: string, user: object }>}
 */
export async function completeRegistration(payload) {
  try {
    const { data } = await apiClient.post('/auth/register/complete', payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Verify user access token – confirms validity and fetches user info.
 * @returns {Promise<{ status: string, message: string, user: object }>}
 */
export async function verifyToken() {
  try {
    const { data } = await apiClient.get('/auth/verify-token');
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * User logout – revokes current user's token.
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function logoutUser() {
  try {
    const { data } = await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of certifications.
 * @param {{ page?: number, page_size?: number, search?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchCertifications(params = {}) {
  try {
    const { data } = await apiClient.get('/certifications/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single certification by ID.
 * @param {number} certId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchCertificationDetail(certId) {
  try {
    const { data } = await apiClient.get(`/certifications/${certId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new certification with image upload.
 * @param {{ user_id: number, certificate_name: string, year: number, type: string, description: string, image: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addCertification(payload) {
  try {
    const formData = new FormData();
    formData.append('user_id', payload.user_id);
    formData.append('certificate_name', payload.certificate_name);
    formData.append('year', payload.year);
    formData.append('type', payload.type);
    formData.append('description', payload.description);
    formData.append('image', payload.image);
    const { data } = await apiClient.post('/certifications/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing certification by ID, optionally replacing the image.
 * @param {number} certId
 * @param {{ certificate_name: string, year: number, type: string, description: string, image?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateCertification(certId, payload) {
  try {
    const formData = new FormData();
    formData.append('certificate_name', payload.certificate_name);
    formData.append('year', payload.year);
    formData.append('type', payload.type);
    formData.append('description', payload.description);
    if (payload.image) {
      formData.append('image', payload.image);
    }
    const { data } = await apiClient.put(`/certifications/${certId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

