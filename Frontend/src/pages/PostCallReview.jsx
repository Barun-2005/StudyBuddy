import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const PostCallReview = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiRating, setAiRating] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const getAIFeedback = async () => {
    if (!reviewText.trim()) {
      toast.error('Please write a review before requesting AI analysis', {
        icon: '✍️',
        duration: 3000
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await fetch("http://localhost:5003/predict-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reviewText })
      });

      if (!response.ok) throw new Error("AI service unavailable");

      const data = await response.json();
      setAiRating(data.rating);
      
      toast.custom((t) => (
        <div className={`
          ${t.visible ? 'animate-enter' : 'animate-leave'}
          max-w-md w-full bg-base-100 shadow-xl rounded-lg pointer-events-auto 
          border border-secondary/20 transform transition-all duration-300
        `}>
          <div className="p-4 flex items-start space-x-4">
            <div className="flex-shrink-0 bg-secondary/10 p-2 rounded-full">
              <svg 
                className="w-6 h-6 text-secondary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-base-content">
                AI Insight Complete
              </h3>
              <p className="mt-1 text-sm text-base-content/70">
                Review analyzed and rating suggestion generated based on sentiment analysis.
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
    } catch (err) {
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
              <h3 className="font-medium text-base-content">
                AI Analysis Unavailable
              </h3>
              <p className="mt-1 text-sm text-base-content/70">
                We couldn't analyze your review at the moment. Please proceed with your own rating or try again later.
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });
      console.error(err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          partnerId,
          rating,
          reviewText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      navigate("/chat");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl max-w-lg w-full hover:shadow-2xl transition-shadow duration-300">
        <div className="card-body p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-base-content">Rate Your Study Partner</h1>
            <p className="text-base-content/70 mt-2">Your feedback helps improve the community</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">Your Rating</span>
              </label>
              <div className="flex gap-3 justify-center bg-base-200 p-4 rounded-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transform transition-all duration-200 hover:scale-110 ${
                      star <= rating 
                        ? "text-warning text-4xl" 
                        : "text-base-300 text-3xl"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-base-content/70">
                  {rating === 0 && "Select your rating"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-semibold">Your Review</span>
                <span className="label-text-alt text-base-content/70">
                  {reviewText.length}/500 characters
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered min-h-32 resize-none focus:textarea-primary"
                placeholder="Share your experience with your study partner..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                maxLength={500}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={getAIFeedback}
                  disabled={isLoadingAI || !reviewText.trim()}
                  className="relative group w-full sm:w-auto
                    btn btn-lg border-none shadow-md
                    bg-base-100 hover:bg-base-200
                    transition-all duration-300 overflow-hidden
                    disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-primary to-secondary
                    group-hover:opacity-20 transition-opacity duration-300" />

                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-3 px-4">
                    {isLoadingAI ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="loading loading-spinner loading-md text-primary"></span>
                          <span className="font-medium text-base-content">Analyzing...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-primary/10 rounded-lg p-2 group-hover:bg-primary/20 
                          transition-colors duration-300">
                          <svg 
                            className="w-5 h-5 text-primary" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-base-content">AI Analysis</span>
                          <span className="text-xs text-base-content/70">Get instant feedback</span>
                        </div>
                        <div className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                          <svg 
                            className="w-4 h-4 text-primary" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent
                    -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                </button>

                {/* Info tooltip */}
                <div className="tooltip tooltip-left sm:tooltip-top before:text-xs" 
                     data-tip="Our AI provides instant feedback on your review">
                  <button className="btn btn-circle btn-ghost btn-sm text-base-content/70 
                       hover:bg-base-200 transition-colors duration-200">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add this to your CSS */}
              <style>
                {`
                  @keyframes gradient-x {
                    0%, 100% {
                      background-position: 0% 50%;
                    }
                    50% {
                      background-position: 100% 50%;
                    }
                  }
                  .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                  }
                `}
              </style>

              {aiRating && (
                <div className="bg-base-200 rounded-xl p-4 transform transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-secondary/20 p-2 rounded-lg">
                      <svg 
                        className="w-6 h-6 text-secondary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-lg">AI Rating Analysis</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Suggested Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(aiRating)
                                ? "text-warning fill-current"
                                : "text-base-300"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 font-semibold">{aiRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70">
                      Based on your review's sentiment and content, our AI suggests this rating. Feel free to adjust it based on your experience.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="flex-1">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="btn btn-ghost btn-sm"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="card-actions justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="btn btn-ghost"
              >
                Skip Review
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCallReview;
