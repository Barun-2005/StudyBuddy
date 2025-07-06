import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    class: "",
    exam: "Other",
    subjects: [],
    studyPreferences: "Either",
    availability: "",
  });

  const [availableSubjects, setAvailableSubjects] = useState([
    "Math",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "English",
    "Computer Science",
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    if (profileData.subjects.includes(value)) {
      setProfileData({
        ...profileData,
        subjects: profileData.subjects.filter((subject) => subject !== value),
      });
    } else {
      setProfileData({
        ...profileData,
        subjects: [...profileData.subjects, value],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/updateProfile", profileData);
      alert("Profile updated successfully!");
      navigate("/dashboard"); // Redirect to dashboard after profile completion
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    // Fetch current profile details if needed
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/auth/profile");
        setProfileData(data); // Populate form with existing profile data if available
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <label>
          Class:
          <input
            type="text"
            name="class"
            value={profileData.class}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </label>

        <label>
          Exam Type:
          <select
            name="exam"
            value={profileData.exam}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="UPSC">UPSC</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>Subjects:</label>
        <div className="grid grid-cols-2 gap-2">
          {availableSubjects.map((subject) => (
            <label key={subject} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={subject}
                checked={profileData.subjects.includes(subject)}
                onChange={handleSubjectChange}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>

        <label>
          Study Preferences:
          <select
            name="studyPreferences"
            value={profileData.studyPreferences}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="Group">Group</option>
            <option value="One-on-One">One-on-One</option>
            <option value="Either">Either</option>
          </select>
        </label>

        <label>
          Availability (e.g., 5pm - 7pm):
          <input
            type="text"
            name="availability"
            value={profileData.availability}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </label>

        <button type="submit" className="bg-blue-500 text-white rounded p-2">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
