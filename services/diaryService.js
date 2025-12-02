import { API_BASE_URL } from "../config";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
};

// Diary API methods
export const diaryApi = {
  // Get all diary entries for the authenticated user
  async getAllEntries() {
    const response = await fetch(`${API_BASE_URL}/diaries`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch diary entries");
    }

    return response.json();
  },

  // Create a new diary entry
  async createEntry(entryData) {
    const response = await fetch(`${API_BASE_URL}/diaries`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(entryData),
    });

    if (!response.ok) {
      throw new Error("Failed to create diary entry");
    }

    return response.json();
  },

  // Update an existing diary entry
  async updateEntry(id, updates) {
    const response = await fetch(`${API_BASE_URL}/diaries/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to update diary entry");
    }

    return response.json();
  },

  // Delete a diary entry
  async deleteEntry(id) {
    const response = await fetch(`${API_BASE_URL}/diaries/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete diary entry");
    }

    return response.json();
  },
};
