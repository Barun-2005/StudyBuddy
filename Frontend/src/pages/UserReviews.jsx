import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import UserProfileModal from "../components/UserProfileModal";

const UserReviews = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRankingLoading, setIsRankingLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { authUser } = useAuthStore();
  const [selectedReviewer, setSelectedReviewer] = useState(null);

  const rankReviews = async (reviewsData) => {
    setIsRankingLoading(true);
    try {
      const comments = reviewsData.map(review => ({
        text: review.reviewText,
        user_cred: (review.reviewer?.rating || 0) / 5
      }));

      const response = await fetch("http://localhost:5003/rank-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments })
      });

      if (!response.ok) throw new Error("Ranking service unavailable");

      const { sorted_comments } = await response.json();

      const sortedReviews = [...reviewsData].sort((a, b) => {
        const aIndex = sorted_comments.findIndex(c => c.text === a.reviewText);
        const bIndex = sorted_comments.findIndex(c => c.text === b.reviewText);
        return aIndex - bIndex;
      });

      setReviews(sortedReviews);
      
      // Single, centered, enhanced toast notification
      toast.custom((t) => (
        <div className={`
          ${t.visible ? 'animate-enter' : 'animate-leave'}
          max-w-md w-full bg-base-100 shadow-xl rounded-2xl pointer-events-auto 
          border border-primary/20 transform transition-all duration-300
          hover:shadow-2xl hover:scale-102 overflow-hidden
        `}>
          {/* Decorative gradient top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
          
          <div className="p-6">
            {/* Header with AI Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 bg-primary/10 p-2.5 rounded-xl">
                <svg 
                  className="w-6 h-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary">
                  AI-Enhanced Reviews
                </span>
                <span className="text-xs text-base-content/70">
                  Intelligent ranking system
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-base-content">
                Reviews Intelligently Ranked! ✨
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base-content/80">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Most relevant reviews prioritized</p>
                </div>
                <div className="flex items-center gap-2 text-base-content/80">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Credibility scores considered</p>
                </div>
                <div className="flex items-center gap-2 text-base-content/80">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Content quality analyzed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-base-200 h-1">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
              style={{ 
                width: `${(t.visibleDuration - t.remainingDuration) / t.visibleDuration * 100}%` 
              }}
            />
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-center',
      });

    } catch (error) {
      console.error("Error ranking reviews:", error);
      toast.custom((t) => (
        <div className={`
          ${t.visible ? 'animate-enter' : 'animate-leave'}
          max-w-md w-full bg-base-100 shadow-xl rounded-lg pointer-events-auto 
          border border-error/20 transform transition-all duration-300
        `}>
          <div className="p-4 flex items-start space-x-4">
            <div className="flex-shrink-0 bg-error/10 p-2 rounded-full">
              <svg 
                className="w-6 h-6 text-error" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-base-content">
                AI Ranking Temporarily Unavailable
              </h3>
              <p className="mt-1 text-sm text-base-content/70">
                We couldn't connect to our AI service at the moment. Your reviews are shown in chronological order instead. Please try again later.
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-base-200 h-1 rounded-b-lg overflow-hidden">
            <div 
              className="bg-error h-full transition-all duration-300"
              style={{ 
                width: `${(t.visibleDuration - t.remainingDuration) / t.visibleDuration * 100}%` 
              }}
            />
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });

      // Fallback to chronological order
      setReviews(reviewsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } finally {
      setIsRankingLoading(false);
    }
  };

  const getAIFeedback = async (reviewText) => {
    setIsLoadingAI(true);
    try {
      const response = await fetch("http://localhost:5003/predict-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reviewText })
      });

      if (!response.ok) throw new Error("AI service unavailable");

      const data = await response.json();
      return data.rating;
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      toast.error("Failed to get AI analysis");
      return null;
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Modified useEffect to prevent double ranking
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userResponse, reviewsResponse] = await Promise.all([
          axiosInstance.get(`/auth/user/${userId}`),
          axiosInstance.get(`/reviews/user/${userId}`)
        ]);

        if (!mounted) return;

        if (userResponse.data) {
          setUser(userResponse.data);
        }
        if (reviewsResponse.data?.length > 0) {
          setReviews(reviewsResponse.data);
          // Single ranking call
          await rankReviews(reviewsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (mounted) {
          toast.error("Failed to load reviews");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [userId]); // Remove rankReviews from dependencies

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-base-100 rounded-box p-6 shadow-lg">
          {/* User Info Header */}
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={user?.profilePic || "/avatar.png"} 
              alt={user?.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-5 h-5 text-warning" fill="currentColor" />
                <span className="text-lg font-semibold">{user?.rating || 0}</span>
                <span className="text-base-content/70">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Reviews List with Loading State */}
          {isRankingLoading ? (
            <div className="text-center py-4">
              <div className="loading loading-spinner loading-md"></div>
              <p className="mt-2 text-base-content/70">Ranking reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className="border border-base-300 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={review.reviewer?.profilePic || "/avatar.png"}
                        alt={review.reviewer?.fullName}
                        className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => setSelectedReviewer(review.reviewer)}
                        role="button"
                        tabIndex={0}
                      />
                      <span className="font-medium cursor-pointer hover:text-primary"
                            onClick={() => setSelectedReviewer(review.reviewer)}>
                        {review.reviewer?.fullName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? "text-warning fill-current" 
                              : "text-base-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.reviewText && (
                    <>
                      <p className="text-base-content/80 mt-2">{review.reviewText}</p>
                      <button
                        onClick={async () => {
                          const aiRating = await getAIFeedback(review.reviewText);
                          if (aiRating) {
                            toast.success(
                              <div className="flex items-center gap-3">
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                                <span>AI Rating Analysis: {aiRating.toFixed(1)}/5</span>
                              </div>
                            , {
                              duration: 3000,
                              position: 'top-center',
                              style: {
                                background: 'var(--b1)',
                                color: 'var(--bc)',
                                border: '1px solid var(--p)',
                              },
                            });
                          }
                        }}
                        className="btn btn-secondary btn-xs mt-2"
                        disabled={isLoadingAI}
                      >
                        {isLoadingAI ? "Analyzing..." : "Get AI Analysis"}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-base-content/70">No reviews yet</p>
          )}
        </div>
      </div>
      {/* User Profile Modal - Now rendered at the root level */}
      <UserProfileModal
        isOpen={!!selectedReviewer}
        onClose={() => setSelectedReviewer(null)}
        user={selectedReviewer}
      />
    </div>
  );
};

export default UserReviews;





















