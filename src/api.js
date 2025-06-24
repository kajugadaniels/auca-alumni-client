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

/**
 * Delete a specific certification by ID.
 * @param {number} certId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteCertification(certId) {
  try {
    const { data } = await apiClient.delete(`/certifications/${certId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of countries.
 * Reads X-Total-Count, X-Page, X-Page-Size from response headers.
 * @param {{ page?: number, page_size?: number }} params
 * @returns {Promise<{
 *   data: Array<{ id: number, name: string, abbreviation?: string, currency?: string, code?: string }>,
 *   total: number,
 *   page: number,
 *   pageSize: number
 * }>}
 */
export async function fetchCountries(params = {}) {
  try {
    const response = await apiClient.get('/countries', { params });
    return {
      data: response.data,
      total: parseInt(response.headers['x-total-count'], 10),
      page: parseInt(response.headers['x-page'], 10),
      pageSize: parseInt(response.headers['x-page-size'], 10),
    };
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of departments.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchDepartments(params = {}) {
  try {
    const { data } = await apiClient.get('/departments/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single department by ID.
 * @param {number} departmentId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchDepartmentDetail(departmentId) {
  try {
    const { data } = await apiClient.get(`/departments/${departmentId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new department.
 * @param {{ faculty_id: number, name: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addDepartment(payload) {
  try {
    const { data } = await apiClient.post('/departments/add', payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing department by ID.
 * @param {number} departmentId
 * @param {{ faculty_id: number, name: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateDepartment(departmentId, payload) {
  try {
    const { data } = await apiClient.put(`/departments/${departmentId}/update`, payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific department by ID.
 * @param {number} departmentId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteDepartment(departmentId) {
  try {
    const { data } = await apiClient.delete(`/departments/${departmentId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of events.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchEvents(params = {}) {
  try {
    const { data } = await apiClient.get('/events', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single event by ID.
 * @param {number} eventId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchEventDetail(eventId) {
  try {
    const { data } = await apiClient.get(`/event/${eventId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new event with image upload.
 * @param {{ event_date: string, description: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addEvent(payload) {
  try {
    const formData = new FormData();
    formData.append('event_date', payload.event_date);
    formData.append('description', payload.description);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/event/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing event by ID, optionally replacing the photo.
 * @param {number} eventId
 * @param {{ event_date: string, description: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateEvent(eventId, payload) {
  try {
    const formData = new FormData();
    formData.append('event_date', payload.event_date);
    formData.append('description', payload.description);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/event/${eventId}/update/`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific event by ID.
 * @param {number} eventId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteEvent(eventId) {
  try {
    const { data } = await apiClient.delete(`/event/${eventId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}