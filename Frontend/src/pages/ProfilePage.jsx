import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, BookOpen, Clock, Book, Users, Star, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [userClass, setUserClass] = useState(authUser?.class || "");
  const [exam, setExam] = useState(authUser?.exam || "Other");
  const [subjects, setSubjects] = useState(
    authUser?.subjects ? authUser.subjects.join(", ") : ""
  );
  const [availability, setAvailability] = useState(authUser?.availability || "");
  const [studyPreferences, setStudyPreferences] = useState(
    authUser?.studyPreferences || "Either"
  );
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/api/reviews/user/${authUser._id}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (authUser?._id) {
      fetchReviews();
    }
  }, [authUser?._id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleUpdateProfile = async () => {
    await updateProfile({
      class: userClass,
      exam,
      subjects: subjects.split(",").map((subj) => subj.trim()),
      availability,
      studyPreferences,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <div className="flex-1 pt-4 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost mb-2 hover:bg-base-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-base-200 rounded-2xl shadow-lg overflow-hidden">
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-primary to-primary-focus" />

            <div className="px-6 pb-6">
              {/* Profile Picture Section */}
              <div className="relative -mt-16 mb-8 flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4 border-base-100 shadow-lg"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 size-10 bg-primary hover:bg-primary-focus 
                    text-primary-content rounded-full cursor-pointer transition-all duration-200 
                    flex items-center justify-center shadow-md
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
                  >
                    <Camera className="size-5" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="mt-4 text-center">
                  <h1 className="text-2xl font-bold">{authUser.fullName}</h1>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Star className="w-5 h-5 text-warning fill-current" />
                    <span className="text-lg font-semibold">{authUser.rating || "0"}</span>
                    <span className="text-base-content/70">
                      ({reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/reviews/${authUser._id}`)}
                    className="btn btn-ghost btn-sm mt-3 gap-2 text-primary hover:bg-primary/10"
                  >
                    <Star className="w-4 h-4" />
                    View Reputation
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <BookOpen className="size-4" />
                        Class
                      </span>
                    </label>
                    <input
                      type="text"
                      value={userClass}
                      onChange={(e) => setUserClass(e.target.value)}
                      className="input input-bordered"
                      placeholder="Enter your class"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Book className="size-4" />
                        Exam
                      </span>
                    </label>
                    <select
                      value={exam}
                      onChange={(e) => setExam(e.target.value)}
                      className="select select-bordered"
                    >
                      <option value="JEE">JEE</option>
                      <option value="NEET">NEET</option>
                      <option value="UPSC">UPSC</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Study Preferences Section */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Users className="size-4" />
                        Study Preferences
                      </span>
                    </label>
                    <select
                      value={studyPreferences}
                      onChange={(e) => setStudyPreferences(e.target.value)}
                      className="select select-bordered"
                    >
                      <option value="Group">Group</option>
                      <option value="One-on-One">One-on-One</option>
                      <option value="Either">Either</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Clock className="size-4" />
                        Availability
                      </span>
                    </label>
                    <input
                      type="text"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="input input-bordered"
                      placeholder="e.g. 5pm - 7pm"
                    />
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Book className="size-4" />
                      Subjects
                    </span>
                  </label>
                  <input
                    type="text"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    className="input input-bordered"
                    placeholder="e.g. Math, Physics, Chemistry"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Separate subjects with commas
                    </span>
                  </label>
                </div>

                {/* Update Button */}
                <button
                  onClick={handleUpdateProfile}
                  className={`btn btn-primary w-full ${
                    isUpdatingProfile ? "loading" : ""
                  }`}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;












