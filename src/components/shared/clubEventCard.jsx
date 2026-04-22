import React from "react";
import { Link, useNavigate } from "react-router-dom";

const getThemeClasses = (theme) => {
  const variants = {
    yellow: {
      badge: "bg-yellow-100 text-yellow-800",
      edit: "bg-red-100 text-red-600",
    },
    blue: {
      badge: "bg-blue-100 text-blue-800",
      edit: "bg-red-100 text-red-600",
    },
  };
  return variants[theme] || variants.yellow;
};

const ClubEventCard = ({
  title,
  description,
  date,
  type,
  theme = "yellow",
  image,
  id,
  registeredMembers,
  status
}) => {
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80";
  const colors = getThemeClasses(theme);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/club/events/${id}`)}
      className="
        min-w-70 w-70 bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm flex flex-col snap-center transition-all h-90 hover:scale-[1.01] hover:shadow-xl hover:-translate-y-0.5 duration-300 group 
      "
    >
      {/* Image Section (fixed height) */}
      <div className="relative h-[45%] bg-gray-50 flex items-center justify-center border-b">
        <span
          className={`absolute top-3 left-3 px-2 py-0.5 text-xs rounded ${colors.badge}`}
        >
          {type}
        </span>

        <img src={image || FALLBACK_IMAGE} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Content (flex-1 so footer stays aligned) */}
      <div className="p-4 space-y-1 flex-1">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 truncate">
          On {date}
        </p>

        <p className="text-sm text-gray-500">
          Registered Users: {Array.isArray(registeredMembers) ? registeredMembers.length : registeredMembers ?? 0}
        </p>

      </div>

      {/* Footer (always at bottom) */}
      <div className="px-3 py-3 border-t flex justify-between items-center gap-2"  onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {/* Edit button */}
          <Link to={`/club/edit-event/${id}`}>
            <button className={`cursor-pointer px-3 py-1.5 rounded text-sm hover:-translate-y-[0.5px] ${colors.edit}`}>
              Edit
            </button>
          </Link>

          {/* View Registrations — UPCOMING ONLY */}
          {status === "upcoming" && (
            <button
              onClick={() => navigate(`/club/events/${id}/registrations`)}
              className="cursor-pointer text-sm px-3 py-1.5 rounded-sm bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              View Registrations
            </button>
          )}
        </div>

        {/* Arrow button (unchanged) */}
          {/* <button className="p-2 rounded-full hover:bg-blue-50 transition">
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
        </div> */}


        <button onClick={() => navigate(`/club/events/${id}`)} className="cursor-pointer p-2 rounded-full hover:bg-blue-50 transition">
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
      </div>
    </div>
  );
};

export default ClubEventCard;
