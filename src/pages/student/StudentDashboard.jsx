import React, { useEffect, useState, useRef } from "react";
import EventCard from "@/components/shared/eventCard";
import {
  getUpcomingRegisteredEvents,
  getStudentPastEvents,
  getOpenHiringCount,
  getStudentById,
  getRecommendedEvents,
} from "@/firebase/collections";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import Loader from "@/components/shared/Loader";
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
} from "lucide-react";

const StudentDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [studentInterests, setStudentInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [openHiringCount, setOpenHiringCount] = useState(0);

  const registeredScrollRef = useRef(null);
  const pastScrollRef = useRef(null);
  const recommendedScrollRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [upcoming, past, studentData, hiringCount] = await Promise.all([
          getUpcomingRegisteredEvents(user.uid),
          getStudentPastEvents(user.uid),
          getStudentById(user.uid),
          getOpenHiringCount(),
        ]);

        setOpenHiringCount(hiringCount);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setStudent(studentData);

        // Get recommended events based on student interests
        const interests = studentData.preferences?.interest || [];
        setStudentInterests(interests);

        if (interests.length > 0) {
          const recommended = await getRecommendedEvents(interests);
          setRecommendedEvents(recommended);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const scroll = (ref, direction) => {
    if (!ref.current) return;

    const scrollAmount = 320;
    ref.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const renderEventCarousel = (
    title,
    description,
    events,
    ref,
    emptyMessage,
    emptyIcon,
    variant
  ) => {
    if (events.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {emptyIcon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600">Check back later for new events</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(ref, "left")}
              className="cursor-pointer p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(ref, "right")}
              className="cursor-pointer p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={ref}
            className="flex overflow-x-auto gap-6 pb-4 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {events.map((event) => (
              <div key={event.id} className="shrink-0 w-70">
                <EventCard
                  {...event}
                  variant={variant}
                  path={`/student/events/${event.id}`}
                />

              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <Loader
        message="Loading your dashboard…"
        subMessage="Fetching your events"
        variant="skeleton"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back,{" "}
            <span className="text-blue-600">
              {student?.profile.fullName || student?.profile.displayName || "Student"}
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            Explore your upcoming events and give feedback on your past events
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Upcoming Events Stat */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {upcomingEvents.length}
                </p>
                <p className="text-gray-600">Upcoming Events</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Past Events Stat */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {pastEvents.length}
                </p>
                <p className="text-gray-600">Events Attended</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Club Hiring Stat */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  {openHiringCount}
                </p>
                <p className="text-gray-600">Club Hiring</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Registered Events Section */}
        <div className="mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {renderEventCarousel(
              "Registered Events",
              "Events you're signed up for",
              upcomingEvents,
              registeredScrollRef,
              "No registered events",
              <Calendar className="w-6 h-6 text-gray-400" />,
              "details"  
            )}
          </div>
        </div>

        {/* Recommended Section - Only show if student has interests */}
        {studentInterests.length > 0 && (
          <div className="mb-12">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Recommended Header with Interests */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recommended For You
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Based on your interests
                    </p>
                  </div>
                </div>

                {/* Navigation Arrows for Recommended */}
                {recommendedEvents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scroll(recommendedScrollRef, "left")}
                      className="cursor-pointer p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scroll(recommendedScrollRef, "right")}
                      className="cursor-pointer p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Interests Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {studentInterests.slice(0, 5).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
                {studentInterests.length > 5 && (
                  <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                    +{studentInterests.length - 5} more
                  </span>
                )}
              </div>

              {/* Recommended Events Carousel or Empty State */}
              {recommendedEvents.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No matching events found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No events match your current interests. Try updating your
                    preferences.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/student/settings")}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    Update Interests
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div
                    ref={recommendedScrollRef}
                    className="flex overflow-x-auto gap-6 pb-4 scroll-smooth hide-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {recommendedEvents.map((event) => (
                      <div key={event.id} className="shrink-0 w-70">
                        <EventCard
                          {...event}
                          variant="details"
                          path={`/student/events/${event.id}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Events Section */}
        <div className="mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {renderEventCarousel(
              "Past Events",
              "Events you've attended",
              pastEvents,
              pastScrollRef,
              "No past events",
              <Clock className="w-6 h-6 text-gray-400" />,
              "feedback"
            )}
          </div>
        </div>

        {/* Quick Actions Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {studentInterests.length === 0
                  ? "Set your interests to get better recommendations"
                  : "Looking for more events?"}
              </h3>
              <p className="text-gray-600">
                {studentInterests.length === 0
                  ? "Update your interests to receive personalized event recommendations."
                  : "Explore clubs that are currently hiring new members and find your perfect fit."}
              </p>
            </div>
            <button
              onClick={() => window.location.href = studentInterests.length === 0 ? "/student/settings" : "/student/clubs"}
              className="cursor-pointer px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
            >
              {studentInterests.length === 0 ? "Set Interests" : "Browse Clubs"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
