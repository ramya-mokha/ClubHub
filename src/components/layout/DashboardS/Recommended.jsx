import React, { useEffect, useRef, useState } from "react";
import EventCard from "@/components/shared/eventCard";
import { auth } from "@/firebase/firebase";
import { getStudentById, getRecommendedEvents } from "@/firebase/collections";
import { Star, ChevronLeft, ChevronRight, Tag } from "lucide-react";

const RecommendedSection = () => {
  const scrollContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const student = await getStudentById(user.uid);
        const userInterests = student.preferences?.interests || [];
        setInterests(userInterests);
        
        if (userInterests.length > 0) {
          const recommended = await getRecommendedEvents(userInterests);
          setEvents(recommended);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
            <p className="text-gray-600 text-sm">Based on your interests</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select your interests</h3>
          <p className="text-gray-600 mb-4">
            Choose interests in settings to get personalized event recommendations.
          </p>
          <button
            onClick={() => window.location.href = "/student/settings"}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            Update Interests
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recommended For You</h2>
              <p className="text-gray-600 text-sm">Events matching your interests</p>
            </div>
          </div>
          
          {/* Interests Tags */}
          <div className="flex items-center gap-2">
            {interests.slice(0, 2).map((interest, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                {interest}
              </span>
            ))}
            {interests.length > 2 && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                +{interests.length - 2} more
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching events found</h3>
          <p className="text-gray-600 mb-4">
            Try updating your interests or check back later for new events.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = "/student/settings"}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              Update Interests
            </button>
            <button
              onClick={() => window.location.href = "/events"}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Browse All Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recommended For You</h2>
            <p className="text-gray-600 text-sm">Events matching your interests</p>
          </div>
        </div>

        {/* Navigation and Tags */}
        <div className="flex items-center gap-4">
          {/* Interests Tags */}
          <div className="hidden md:flex items-center gap-2">
            {interests.slice(0, 3).map((interest, index) => (
              <span key={index} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                {interest}
              </span>
            ))}
            {interests.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                +{interests.length - 3}
              </span>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Interests Tags */}
      <div className="md:hidden flex flex-wrap gap-2 mb-4">
        {interests.slice(0, 4).map((interest, index) => (
          <span key={index} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
            {interest}
          </span>
        ))}
        {interests.length > 4 && (
          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            +{interests.length - 4}
          </span>
        )}
      </div>

      {/* Events Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 pb-4 scroll-smooth hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {events.map((event) => (
          <div key={event.id} className="shrink-0 w-80">
            <EventCard
              {...event}
              variant="details"
              path={`/student/events/${event.id}`}
            />
          </div>
        ))}
      </div>

      {/* Event Count Indicator */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{events.length}</span> recommended events
        </p>
        {events.length > 0 && (
          <button
            onClick={() => window.location.href = "/events"}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            View all events →
          </button>
        )}
      </div>
    </div>
  );
};

export default RecommendedSection;