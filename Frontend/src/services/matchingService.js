import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:5002';

export const getAIMatches = async (userData) => {
  if (!userData) {
    throw new Error('No user data provided');
  }

  // Ensure all fields have valid default values
  const payload = {
    profile: {
      user_id: userData._id || '',
      fullName: userData.fullName || '',
      email: userData.email || '',
      class: userData.class || '',
      exam: userData.exam || '',
      subjects: userData.subjects || [],
      preferred_subjects: userData.subjects || [],
      availability: userData.availability || "flexible",
      age: userData.age || 0  // Changed from null to 0
    },
    top_k: 6
  };

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/get_matches`, payload);
    
    // Log the successful response for debugging
    console.log('AI Service Response:', response.data);
    
    return response.data.matches || []; // Ensure we always return an array
  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw new Error('Failed to get AI matches. Please try again later.');
  }
};


