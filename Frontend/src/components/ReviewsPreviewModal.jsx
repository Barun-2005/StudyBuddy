import React from "react";
import { Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReviewsPreviewModal = ({ isOpen, onClose, reviews, user }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reviews</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-square">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview of latest 3 reviews */}
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review._id} className="border-b border-base-300 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{review.reviewer.fullName}</span>
                <div className="flex">
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
              <p className="text-sm text-base-content/80">{review.reviewText}</p>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              onClose();
              navigate(`/reviews/${user._id}`);
            }}
            className="btn btn-primary"
          >
            View All Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPreviewModal;