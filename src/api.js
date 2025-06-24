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

/**
 * Fetch paginated list of executive committees.
 * @param {{ page?: number, page_size?: number, search?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchExecutiveCommittees(params = {}) {
  try {
    const { data } = await apiClient.get('/executive-committees/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single executive committee member by ID.
 * @param {number} memberId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchExecutiveCommitteeDetail(memberId) {
  try {
    const { data } = await apiClient.get(`/executive-committees/${memberId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new executive committee member with image upload.
 * @param {{ name: string, position: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addExecutiveCommittee(payload) {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('position', payload.position);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/executive-committees/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing executive committee member by ID, optionally replacing the photo.
 * @param {number} memberId
 * @param {{ name: string, position: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateExecutiveCommittee(memberId, payload) {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('position', payload.position);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/executive-committees/${memberId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific executive committee member by ID.
 * @param {number} memberId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteExecutiveCommittee(memberId) {
  try {
    const { data } = await apiClient.delete(`/executive-committees/${memberId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of faculties.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchFaculties(params = {}) {
  try {
    const { data } = await apiClient.get('/faculties/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single faculty by ID.
 * @param {number} facultyId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchFacultyDetail(facultyId) {
  try {
    const { data } = await apiClient.get(`/faculties/${facultyId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new faculty.
 * @param {{ name: string, description: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addFaculty(payload) {
  try {
    const { data } = await apiClient.post('/faculties/add', payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing faculty by ID.
 * @param {number} facultyId
 * @param {{ name: string, description: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateFaculty(facultyId, payload) {
  try {
    const { data } = await apiClient.put(`/faculties/${facultyId}/update`, payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific faculty by ID.
 * @param {number} facultyId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteFaculty(facultyId) {
  try {
    const { data } = await apiClient.delete(`/faculties/${facultyId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of news items.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchNews(params = {}) {
  try {
    const { data } = await apiClient.get('/news', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single news item by ID.
 * @param {number} newsId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchNewsDetail(newsId) {
  try {
    const { data } = await apiClient.get(`/news/${newsId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new news item with image upload.
 * @param {{ title: string, date: string, description: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addNews(payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('date', payload.date);
    formData.append('description', payload.description);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/news/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing news item by ID, optionally replacing the image.
 * @param {number} newsId
 * @param {{ title: string, date: string, description: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateNews(newsId, payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('date', payload.date);
    formData.append('description', payload.description);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/news/${newsId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific news item by ID.
 * @param {number} newsId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteNews(newsId) {
  try {
    const { data } = await apiClient.delete(`/news/${newsId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of opportunities with nested user data.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchOpportunities(params = {}) {
  try {
    const { data } = await apiClient.get('/opportunities/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single opportunity by ID.
 * @param {number} opportunityId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchOpportunityDetail(opportunityId) {
  try {
    const { data } = await apiClient.get(`/opportunities/${opportunityId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new opportunity with image upload.
 * @param {{ title: string, description: string, date: string, user_id: number, status?: string, link?: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addOpportunity(payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('date', payload.date);
    formData.append('user_id', payload.user_id);
    if (payload.status) formData.append('status', payload.status);
    if (payload.link) formData.append('link', payload.link);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/opportunities/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing opportunity by ID, optionally replacing the image.
 * @param {number} opportunityId
 * @param {{ title: string, description: string, date: string, status?: string, link?: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateOpportunity(opportunityId, payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('date', payload.date);
    if (payload.status) formData.append('status', payload.status);
    if (payload.link) formData.append('link', payload.link);
    if (payload.photo) formData.append('photo', payload.photo);
    const { data } = await apiClient.put(`/opportunities/${opportunityId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific opportunity by ID.
 * @param {number} opportunityId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteOpportunity(opportunityId) {
  try {
    const { data } = await apiClient.delete(`/opportunities/${opportunityId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of opportunity histories.
 * @param {{ page?: number, page_size?: number, search?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchOpportunityHistories(params = {}) {
  try {
    const { data } = await apiClient.get('/opportunity-histories/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single opportunity history by ID.
 * @param {number} historyId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchOpportunityHistoryDetail(historyId) {
  try {
    const { data } = await apiClient.get(`/opportunity-histories/${historyId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new opportunity history entry.
 * @param {{ opportunity_id: number, user_id: number, comment: string, status: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addOpportunityHistory(payload) {
  try {
    const { data } = await apiClient.post('/opportunity-histories/add', payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing opportunity history by ID.
 * @param {number} historyId
 * @param {{ comment: string, status: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateOpportunityHistory(historyId, payload) {
  try {
    const { data } = await apiClient.put(`/opportunity-histories/${historyId}/update`, payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific opportunity history by ID.
 * @param {number} historyId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteOpportunityHistory(historyId) {
  try {
    const { data } = await apiClient.delete(`/opportunity-histories/${historyId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of personal information records.
 * @param {{ page?: number, page_size?: number, search?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchPersonalInformation(params = {}) {
  try {
    const { data } = await apiClient.get('/personal-information/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed personal information by ID.
 * @param {number} infoId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchPersonalInformationDetail(infoId) {
  try {
    const { data } = await apiClient.get(`/personal-information/${infoId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new personal information record with photo upload.
 * @param {{
 *   photo: File,
 *   bio: string,
 *   current_employer?: string,
 *   self_employed?: string,
 *   latest_education_level?: string,
 *   address: string,
 *   profession_id?: number,
 *   user_id: number,
 *   dob: string, // ISO date
 *   start_date?: string, // ISO date
 *   end_date?: string, // ISO date
 *   faculty_id?: number,
 *   country_id?: string,
 *   department?: string,
 *   gender: boolean,
 *   status?: string
 * }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addPersonalInformation(payload) {
  try {
    const formData = new FormData();
    formData.append('photo', payload.photo);
    formData.append('bio', payload.bio);
    if (payload.current_employer) formData.append('current_employer', payload.current_employer);
    if (payload.self_employed) formData.append('self_employed', payload.self_employed);
    if (payload.latest_education_level) formData.append('latest_education_level', payload.latest_education_level);
    formData.append('address', payload.address);
    if (payload.profession_id) formData.append('profession_id', payload.profession_id);
    formData.append('user_id', payload.user_id);
    formData.append('dob', payload.dob);
    if (payload.start_date) formData.append('start_date', payload.start_date);
    if (payload.end_date) formData.append('end_date', payload.end_date);
    if (payload.faculty_id) formData.append('faculty_id', payload.faculty_id);
    if (payload.country_id) formData.append('country_id', payload.country_id);
    if (payload.department) formData.append('department', payload.department);
    formData.append('gender', payload.gender);
    if (payload.status) formData.append('status', payload.status);

    const { data } = await apiClient.post('/personal-information/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing personal information record by ID.
 * @param {number} infoId
 * @param {{
 *   photo?: File,
 *   bio?: string,
 *   current_employer?: string,
 *   self_employed?: string,
 *   latest_education_level?: string,
 *   address?: string,
 *   profession_id?: number,
 *   dob?: string, // ISO date
 *   start_date?: string, // ISO date
 *   end_date?: string, // ISO date
 *   faculty_id?: number,
 *   country_id?: string,
 *   department?: string,
 *   gender?: boolean,
 *   status?: string
 * }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updatePersonalInformation(infoId, payload) {
  try {
    const formData = new FormData();
    if (payload.photo) formData.append('photo', payload.photo);
    if (payload.bio) formData.append('bio', payload.bio);
    if (payload.current_employer) formData.append('current_employer', payload.current_employer);
    if (payload.self_employed) formData.append('self_employed', payload.self_employed);
    if (payload.latest_education_level) formData.append('latest_education_level', payload.latest_education_level);
    if (payload.address) formData.append('address', payload.address);
    if (payload.profession_id) formData.append('profession_id', payload.profession_id);
    if (payload.dob) formData.append('dob', payload.dob);
    if (payload.start_date) formData.append('start_date', payload.start_date);
    if (payload.end_date) formData.append('end_date', payload.end_date);
    if (payload.faculty_id) formData.append('faculty_id', payload.faculty_id);
    if (payload.country_id) formData.append('country_id', payload.country_id);
    if (payload.department) formData.append('department', payload.department);
    if (payload.gender !== undefined) formData.append('gender', payload.gender);
    if (payload.status) formData.append('status', payload.status);

    const { data } = await apiClient.put(`/personal-information/${infoId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific personal information record by ID.
 * @param {number} infoId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deletePersonalInformation(infoId) {
  try {
    const { data } = await apiClient.delete(`/personal-information/${infoId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of professions.
 * @param {{ page?: number, page_size?: number, search?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchProfessions(params = {}) {
  try {
    const { data } = await apiClient.get('/professions/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single profession by ID.
 * @param {number} professionId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchProfessionDetail(professionId) {
  try {
    const { data } = await apiClient.get(`/professions/${professionId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new profession.
 * @param {{ name: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addProfession(payload) {
  try {
    const { data } = await apiClient.post('/professions/add', payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing profession by ID.
 * @param {number} professionId
 * @param {{ name: string }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateProfession(professionId, payload) {
  try {
    const { data } = await apiClient.put(`/professions/${professionId}/update`, payload);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific profession by ID.
 * @param {number} professionId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteProfession(professionId) {
  try {
    const { data } = await apiClient.delete(`/professions/${professionId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of programs.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchPrograms(params = {}) {
  try {
    const { data } = await apiClient.get('/programs/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single program by ID.
 * @param {number} programId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchProgramDetail(programId) {
  try {
    const { data } = await apiClient.get(`/programs/${programId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new program with image upload.
 * @param {{ title: string, description: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addProgram(payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/programs/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing program by ID, optionally replacing the image.
 * @param {number} programId
 * @param {{ title: string, description: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateProgram(programId, payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/programs/${programId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific program by ID.
 * @param {number} programId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteProgram(programId) {
  try {
    const { data } = await apiClient.delete(`/programs/${programId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of sliders.
 * @param {{ page?: number, page_size?: number }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchSliders(params = {}) {
  try {
    const { data } = await apiClient.get('/sliders/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single slider by ID.
 * @param {number} sliderId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchSliderDetail(sliderId) {
  try {
    const { data } = await apiClient.get(`/sliders/${sliderId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new slider with image upload.
 * @param {{ description: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addSlider(payload) {
  try {
    const formData = new FormData();
    formData.append('description', payload.description);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/sliders/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing slider by ID, optionally replacing the image.
 * @param {number} sliderId
 * @param {{ description: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateSlider(sliderId, payload) {
  try {
    const formData = new FormData();
    formData.append('description', payload.description);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/sliders/${sliderId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific slider by ID.
 * @param {number} sliderId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteSlider(sliderId) {
  try {
    const { data } = await apiClient.delete(`/sliders/${sliderId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of social activities.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchSocialActivities(params = {}) {
  try {
    const { data } = await apiClient.get('/social-activities/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single social activity by ID.
 * @param {number} activityId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchSocialActivityDetail(activityId) {
  try {
    const { data } = await apiClient.get(`/social-activities/${activityId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new social activity with image upload.
 * @param {{ title: string, description: string, date: string, photo: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addSocialActivity(payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('date', payload.date);
    formData.append('photo', payload.photo);
    const { data } = await apiClient.post('/social-activities/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing social activity by ID.
 * @param {number} activityId
 * @param {{ title: string, description: string, date: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateSocialActivity(activityId, payload) {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('date', payload.date);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/social-activities/${activityId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Delete a specific social activity by ID.
 * @param {number} activityId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function deleteSocialActivity(activityId) {
  try {
    const { data } = await apiClient.delete(`/social-activities/${activityId}/delete`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of students.
 * @param {{ page?: number, page_size?: number, search?: string, sort_by?: string, order?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchStudents(params = {}) {
  try {
    const { data } = await apiClient.get('/students', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch paginated list of work experiences.
 * @param {{ page?: number, page_size?: number, search?: string }} params
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchWorkExperiences(params = {}) {
  try {
    const { data } = await apiClient.get('/work-experiences/', { params });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Fetch detailed information for a single work experience by ID.
 * @param {number} experienceId
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function fetchWorkExperienceDetail(experienceId) {
  try {
    const { data } = await apiClient.get(`/work-experiences/${experienceId}`);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Create a new work experience with optional image upload.
 * @param {{ company: string, employer: string, job_title: string, job_description: string, start_date: string, end_date?: string, user_id: number, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function addWorkExperience(payload) {
  try {
    const formData = new FormData();
    formData.append('company', payload.company);
    formData.append('employer', payload.employer);
    formData.append('job_title', payload.job_title);
    formData.append('job_description', payload.job_description);
    formData.append('start_date', payload.start_date);
    if (payload.end_date) {
      formData.append('end_date', payload.end_date);
    }
    formData.append('user_id', payload.user_id);
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.post('/work-experiences/add', formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

/**
 * Update an existing work experience by ID, optionally replacing the image.
 * @param {number} experienceId
 * @param {{ company: string, employer: string, job_title: string, job_description: string, start_date: string, end_date?: string, photo?: File }} payload
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function updateWorkExperience(experienceId, payload) {
  try {
    const formData = new FormData();
    formData.append('company', payload.company);
    formData.append('employer', payload.employer);
    formData.append('job_title', payload.job_title);
    formData.append('job_description', payload.job_description);
    formData.append('start_date', payload.start_date);
    if (payload.end_date !== undefined) {
      formData.append('end_date', payload.end_date);
    }
    if (payload.photo) {
      formData.append('photo', payload.photo);
    }
    const { data } = await apiClient.put(`/work-experiences/${experienceId}/update`, formData);
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}