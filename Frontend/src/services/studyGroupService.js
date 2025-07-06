import { axiosInstance } from "../lib/axios";

export const studyGroupService = {
  // Get all study groups with filters
  getGroups: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return axiosInstance.get(`/study-groups?${queryString}`);
  },

  // Create new study group
  createGroup: async (groupData) => {
    return axiosInstance.post("/study-groups", groupData);
  },

  // Join or request to join a group
  joinGroup: async (groupId) => {
    try {
      const response = await axiosInstance.post(`/study-groups/${groupId}/join`);
      return response;
    } catch (error) {
      console.error("Service join group error:", error);
      throw error;
    }
  },

  // Update group details (admin only)
  updateGroup: async (groupId, updates) => {
    return axiosInstance.put(`/study-groups/${groupId}`, updates);
  },

  // Leave or delete group
  leaveGroup: async (groupId) => {
    try {
      const response = await axiosInstance.post(`/study-groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  // Get group messages
  getGroupMessages: async (groupId, page = 1) => {
    return axiosInstance.get(`/group-messages/${groupId}?page=${page}`);
  },

  // Send group message
  sendGroupMessage: async (groupId, message) => {
    return axiosInstance.post(`/group-messages/${groupId}`, message);
  }
};


