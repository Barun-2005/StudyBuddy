import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from '../lib/axios';
import { Search, Star, Clock, Users, Book, School, Calendar, Filter, Sparkles } from "lucide-react";
import ReviewsPreviewModal from "../components/ReviewsPreviewModal";
import { getAIMatches } from '../services/matchingService';
import { useAuthStore } from '../store/useAuthStore';

const SearchBuddy = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    subject: "",
    exam: "",
    class: "",
    studyPreference: ""
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [aiMatches, setAiMatches] = useState([]);
  const [isLoadingAIMatches, setIsLoadingAIMatches] = useState(false);
  const [showingAIMatches, setShowingAIMatches] = useState(false);
  const [aiMatchedUsers, setAiMatchedUsers] = useState([]);
  const { authUser } = useAuthStore();

  // Function to send a friend request
  const sendFriendRequest = async (toUserId) => {
    try {
      await axiosInstance.post("/friendRequests/sendFriendRequest", { toUserId });
      // Update the local state to reflect the pending status without refetching
      setUsers(users.map(user => 
        user._id === toUserId 
          ? { ...user, friendRequestStatus: "pending" } 
          : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user._id === toUserId 
          ? { ...user, friendRequestStatus: "pending" } 
          : user
      ));
      toast.success("Friend request sent successfully!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request.");
    }
  };

  const handleViewReviews = async (user) => {
    try {
      const response = await axios.get(`/api/reviews/user/${user._id}`);
      setUserReviews(response.data);
      setSelectedUser(user);
      setShowReviews(true);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    }
  };

  // Fetch initial users (limited to 6)
  const fetchInitialUsers = async () => {
    try {
      const response = await axiosInstance.get("/studyBuddy/search");
      // Since the endpoint returns all users, we'll limit them on the frontend
      const limitedUsers = response.data.slice(0, 6);
      setUsers(response.data); // Keep all users in state for filtering
      setFilteredUsers(limitedUsers); // Show only 6 initially
      setError("");
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialUsers();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = [...users];
    
    // Apply search term filter (name or email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.fullName.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply subject filter
    if (filter.subject) {
      result = result.filter(user => 
        user.subjects && user.subjects.some(subject => 
          subject.toLowerCase().includes(filter.subject.toLowerCase())
        )
      );
    }
    
    // Apply exam filter
    if (filter.exam) {
      result = result.filter(user => 
        user.exam && user.exam.toLowerCase().includes(filter.exam.toLowerCase())
      );
    }
    
    // Apply class filter
    if (filter.class) {
      result = result.filter(user => 
        user.class && user.class.toLowerCase().includes(filter.class.toLowerCase())
      );
    }
    
    // Apply study preference filter
    if (filter.studyPreference) {
      result = result.filter(user => 
        user.studyPreferences && user.studyPreferences.toLowerCase() === filter.studyPreference.toLowerCase()
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filter, users]);

  // Extract unique values for filters
  const uniqueExams = [...new Set(users.filter(user => user.exam).map(user => user.exam))];
  const uniqueClasses = [...new Set(users.filter(user => user.class).map(user => user.class))];
  const uniqueSubjects = [...new Set(users.flatMap(user => user.subjects || []))];
  const studyPreferences = ["Group", "One-on-One", "Either"];

  // Enhanced AI matching function
  const fetchAIMatches = async () => {
    setIsLoadingAIMatches(true);
    setShowingAIMatches(true);
    try {
      // Get AI matches
      const matches = await getAIMatches(authUser);
      
      // Fetch complete user details for each match from your main backend
      const matchedUsersDetails = await Promise.all(
        matches.map(async (match) => {
          try {
            const response = await axiosInstance.get(`/studyBuddy/user/${match.user_id}`);
            return {
              ...response.data,
              compatibility_score: match.compatibility_score,
              matched_subjects: match.matched_subjects || [],
              // Preserve the AI match specific fields while getting full user details
            };
          } catch (error) {
            console.error(`Failed to fetch details for user ${match.user_id}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed fetches and set the enriched user data
      const validMatchedUsers = matchedUsersDetails.filter(user => user !== null);
      setAiMatchedUsers(validMatchedUsers);
      setFilteredUsers(validMatchedUsers);
    } catch (error) {
      console.error("Error in AI matching:", error);
      toast.error("Failed to get AI matches");
      setShowingAIMatches(false);
    } finally {
      setIsLoadingAIMatches(false);
    }
  };

  // Reset to normal recommendations
  const resetToNormalView = () => {
    setShowingAIMatches(false);
    setFilteredUsers(users);
  };

  // Render user card (used for both normal and AI matches)
  const renderUserCard = (user) => (
    <div
      key={user._id}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="card-body p-6">
        {/* User Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {user.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.fullName} 
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                {user.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <p className="text-base-content/70">{user.email}</p>
            </div>
          </div>
          
          {showingAIMatches && (
            <div className="badge badge-primary badge-lg gap-2 whitespace-nowrap min-w-[100px] flex items-center justify-center px-3">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{Math.round(user.compatibility_score * 100)}% Match</span>
            </div>
          )}
        </div>
        
        {/* User Details */}
        <div className="space-y-4 mb-6">
          {user.subjects && user.subjects.length > 0 && (
            <div className="flex items-start gap-3">
              <Book className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm text-base-content/70 mb-1">Subjects</div>
                <div className="flex flex-wrap gap-2">
                  {user.subjects.map((subject, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {user.exam && (
              <div className="flex items-start gap-3">
                <School className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-base-content/70 mb-1">Exam</div>
                  <div className="font-medium">{user.exam}</div>
                </div>
              </div>
            )}
            
            {user.class && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-base-content/70 mb-1">Class</div>
                  <div className="font-medium">{user.class}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {user.availability && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-base-content/70 mb-1">Available</div>
                  <div className="font-medium">{user.availability}</div>
                </div>
              </div>
            )}
            
            {user.studyPreferences && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-base-content/70 mb-1">Prefers</div>
                  <div className="font-medium">{user.studyPreferences}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {user.sampleReview && (
          <div className="bg-base-200 p-4 rounded-xl mb-6 cursor-pointer"
               onClick={() => handleViewReviews(user)}>
            <div className="flex justify-between items-center">
              <p className="text-sm italic">"{user.sampleReview}"</p>
              <span className="text-primary text-sm">View all reviews</span>
            </div>
          </div>
        )}
        
        {/* Friend Request Button */}
        <button
          onClick={() => sendFriendRequest(user._id)}
          className="btn btn-primary w-full"
          disabled={user.friendRequestStatus === "pending"}
        >
          {user.friendRequestStatus === "pending" ? "Request Pending" : "Send Friend Request"}
        </button>
      </div>
    </div>
  );

  const renderAIMatchButton = () => (
    <button
      onClick={fetchAIMatches}
      className="btn btn-primary gap-2"
      disabled={isLoadingAIMatches}
    >
      {isLoadingAIMatches ? (
        <>
          <span className="loading loading-spinner"></span>
          Finding Matches...
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5" />
          Get AI Matches
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header Section with AI Button */}
          <div className="text-center relative mb-12">
            <div className="absolute right-0 top-0 md:right-4">
              {showingAIMatches ? (
                <button
                  onClick={resetToNormalView}
                  className="btn btn-outline btn-md gap-2 hover:scale-105 transition-transform"
                >
                  <Users className="h-5 w-5" />
                  Regular Recommendations
                </button>
              ) : (
                <button
                  onClick={fetchAIMatches}
                  className="btn btn-primary btn-md gap-2 hover:scale-105 transition-transform shadow-lg"
                  disabled={isLoadingAIMatches}
                >
                  {isLoadingAIMatches ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Finding Perfect Matches...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      AI-Powered Matching
                    </>
                  )}
                </button>
              )}
            </div>
            
            <h1 className="text-5xl font-bold text-base-content mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Find Your Study Buddy
            </h1>
            <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
              Connect with students who share your academic interests and study goals
            </p>
          </div>

          {/* Enhanced Search and Filters Card */}
          <div className="bg-base-100 rounded-3xl shadow-xl p-8 mb-10 backdrop-blur-lg bg-opacity-90">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Improved Search Bar */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="input input-bordered input-primary w-full pl-12 h-12 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Enhanced Clear Filters Button */}
              <button 
                className="btn btn-outline btn-primary gap-2 px-6"
                onClick={() => {
                  setSearchTerm("");
                  setFilter({
                    subject: "",
                    exam: "",
                    class: "",
                    studyPreference: ""
                  });
                }}
              >
                <Filter className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
            
            {/* Enhanced Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Book, label: "Subject", value: filter.subject, options: uniqueSubjects },
                { icon: School, label: "Exam", value: filter.exam, options: uniqueExams },
                { icon: Calendar, label: "Class", value: filter.class, options: uniqueClasses },
                { icon: Users, label: "Study Preference", value: filter.studyPreference, options: studyPreferences }
              ].map((filterItem, index) => (
                <div key={index} className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-base">
                      <filterItem.icon className="h-4 w-4 text-primary" />
                      {filterItem.label}
                    </span>
                  </label>
                  <select 
                    className="select select-bordered select-primary w-full"
                    value={filterItem.value}
                    onChange={(e) => setFilter({...filter, [filterItem.label.toLowerCase()]: e.target.value})}
                  >
                    <option value="">All {filterItem.label}s</option>
                    {filterItem.options.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-base-content/70 text-lg font-medium">
              Found {filteredUsers.length} potential {filteredUsers.length === 1 ? 'match' : 'matches'}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="mt-4 text-base-content/70 text-lg">Finding your perfect study buddies...</p>
            </div>
          ) : (
            /* Enhanced User Cards Grid */
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200"
                >
                  <div className="card-body p-6">
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {user.profilePic ? (
                          <img 
                            src={user.profilePic} 
                            alt={user.fullName} 
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold">{user.fullName}</h2>
                          <p className="text-base-content/70">{user.email}</p>
                        </div>
                      </div>
                      
                      {showingAIMatches && (
                        <div className="badge badge-primary badge-lg gap-2 whitespace-nowrap min-w-[100px] flex items-center justify-center px-3">
                          <Sparkles className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{Math.round(user.compatibility_score * 100)}% Match</span>
                        </div>
                      )}
                    </div>
                    
                    {/* User Details */}
                    <div className="space-y-4 mb-6">
                      {user.subjects && user.subjects.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Book className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-base-content/70 mb-1">Subjects</div>
                            <div className="flex flex-wrap gap-2">
                              {user.subjects.map((subject, idx) => (
                                <span key={idx} className="badge badge-primary badge-outline">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: Clock, label: "Available", value: user.availability },
                          { icon: Users, label: "Prefers", value: user.studyPreferences },
                          { icon: School, label: "Exam", value: user.exam },
                          { icon: Calendar, label: "Class", value: user.class }
                        ].map((detail, idx) => (
                          detail.value && (
                            <div key={idx} className="flex items-start gap-3">
                              <detail.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <div>
                                <div className="text-sm text-base-content/70 mb-1">{detail.label}</div>
                                <div className="font-medium">{detail.value}</div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                    
                    {user.sampleReview && (
                      <div 
                        className="bg-base-200 p-4 rounded-xl mb-6 cursor-pointer hover:bg-base-300 transition-colors"
                        onClick={() => handleViewReviews(user)}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm italic">"{user.sampleReview}"</p>
                          <span className="text-primary text-sm hover:underline">View all reviews</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Friend Request Button */}
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className={`btn ${user.friendRequestStatus === "pending" 
                        ? "btn-disabled" 
                        : "btn-primary"} w-full hover:scale-105 transition-transform`}
                      disabled={user.friendRequestStatus === "pending"}
                    >
                      {user.friendRequestStatus === "pending" ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Request Pending
                        </>
                      ) : (
                        "Send Friend Request"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ReviewsPreviewModal
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        reviews={userReviews}
        user={selectedUser}
      />
    </div>
  );
};

export default SearchBuddy;
