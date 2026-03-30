import React from "react";
import { useNavigate } from "react-router-dom";

const getThemeClasses = (theme) => {
  const variants = {
    yellow: { badge: "bg-yellow-100 text-yellow-800" },
    red: { badge: "bg-red-100 text-red-800" },
    blue: { badge: "bg-blue-100 text-blue-800" },
    green: { badge: "bg-green-100 text-green-800" },
  };
  return variants[theme] || variants.blue;
};

const EventCard = ({
  id,
  title,
  description,
  date,
  type,
  theme,
  variant = "feedback",
  image,
  showAnalytics = false,
  feedbackFormLink,
  path
}) => {
  const colors = getThemeClasses(theme);
  const navigate = useNavigate();

  const handleFeedbackClick = (e) => {
    e.stopPropagation();
    if (feedbackFormLink && feedbackFormLink.trim()) {
      window.open(feedbackFormLink, "_blank");
    } else {
      alert("No feedback form available yet");
    }
  };

  return (
    <div className="min-w-[280px] w-[280px] h-[360px] bg-white border border-gray-200 rounded-sm overflow-hidden shadow-xs flex flex-col transition-all  hover:shadow-sm hover:-translate-y-0.5 duration-300">
      {/* IMAGE */}
      <div className="h-[50%] bg-gray-50 relative flex items-center justify-center border-b">
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded text-xs font-semibold ${colors.badge}`}
        >
          {type}
        </span>

        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-400">No Image</span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex-1">
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex items-center justify-between">
        <span className="text-xs text-gray-400">On {date}</span>

        {showAnalytics ? (
          <button
            onClick={() => navigate(`/club/events/${id}/analytics`)}
            className={`cursor-pointer px-4 py-1 rounded-lg text-sm text-white ${
              theme === "yellow"
                ? "bg-yellow-400 hover:bg-yellow-500"
                : theme === "red"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Analytics
          </button>
        ) : variant === "feedback" ? (
          <button
            onClick={handleFeedbackClick}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm text-white ${
              theme === "yellow"
                ? "bg-yellow-400 hover:bg-yellow-500"
                : theme === "red"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Feedback
          </button>
        ) : (
          <button
            onClick={() => navigate(path)}
            className="cursor-pointer p-2 rounded-full hover:bg-blue-50 transition"
          >
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
