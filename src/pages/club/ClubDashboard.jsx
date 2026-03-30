import Navbar from "@/components/layout/DashboardC/Navbar";
import React from "react";
import {
  Plus,
  BarChart3,
  Users,
  Send,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ClubEventCard from "@/components/shared/clubEventCard";
import EventCard from "@/components/shared/eventCard";
import FooterPage from "@/components/layout/landing/FooterPage";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getClubUpcomingEvents,
  getClubPastEvents,
  getUserById,
  getClubById,
} from "@/firebase/collections";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";

const ClubDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDoc = await getUserById(user.uid);
      if (userDoc?.role !== "CLUB") {
        console.error("Access denied: not a club account");
        alert(
          "This action is only available for Club accounts. Please go back"
        );
        navigate(-1);
        return;
      }

      const clubData = await getClubById(user.uid);
      setClub(clubData);

      const [upcoming, past] = await Promise.all([
        getClubUpcomingEvents(user.uid),
        getClubPastEvents(user.uid),
      ]);

      setUpcomingEvents(upcoming);
      setPastEvents(past);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const displayedUpcomingEvents = showAllUpcoming
    ? upcomingEvents
    : upcomingEvents.slice(0, 3);
  const displayedPastEvents = showAllPast ? pastEvents : pastEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Add padding-top to fix navbar overlap */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back,{" "}
            <span className="text-green-600">{club?.clubName || "Club"}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your events and track club performance
          </p>
        </div>

        {/* Top Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Club Members Card */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {club?.membersCount || 0}
                </p>
                <p className="text-gray-600">Total Members</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingEvents.length}
                </p>
                <p className="text-gray-600">Upcoming Events</p>
              </div>
            </div>
          </div>

          {/* Past Events Card */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 ">
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pastEvents.length}
                </p>
                <p className="text-gray-600">Past Events</p>
              </div>
            </div>
          </div>

          {/* Club Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Club Details</h3>
            {!club ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span> {club.clubName}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">President:</span>{" "}
                  {club.presidentName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Create Event Card - Takes 2 columns */}
            <Link to="/club/create-event" className="lg:col-span-2">
              <div className="h-full border flex items-center border-gray-200 rounded-xl p-6 hover:border-gray-300 shadow-md transition-all duration-200 hover:translate-0.5 bg-green-400 hover:bg-green-500 hover:shadow-lg">
                <div className="flex items-center gap-4 ">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center ">
                    <Plus className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-50 mb-1">
                      Create New Event
                    </h3>
                    <p className="text-gray-50 text-sm">
                      Set up your next campus event
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Analytics Card */}
            <button
              onClick={() => navigate("/club/analytics")}
              className="cursor-pointer bg-white border border-gray-200 hover:border-blue-200 rounded-xl p-5 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
                Analytics
              </h4>
            </button>

            {/* View Members Card */}
            <button
              onClick={() => navigate("/club/members")}
              className="cursor-pointer bg-white border border-gray-200 hover:border-green-200 rounded-xl p-5 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
                View Members
              </h4>
            </button>

            {/* Announcement Card */}
            <button
              onClick={() => navigate("/club/announcements")}
              className="cursor-pointer bg-white border border-gray-200 hover:border-red-200 rounded-xl p-5 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <Send className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-center">
                Announce
              </h4>
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Events
              </h2>
              <p className="text-gray-600 mt-1">
                Events scheduled for the future
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {upcomingEvents.length} event
                {upcomingEvents.length !== 1 ? "s" : ""}
              </span>
              {upcomingEvents.length > 3 && (
                <button
                  onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showAllUpcoming ? (
                    <>
                      Show less
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show all
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No upcoming events
              </h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first event
              </p>
              <Link
                to="/club/create-event"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-start gap-7">
                {displayedUpcomingEvents.map((event) => (
                  <div key={event.id} className="">
                    <ClubEventCard
                      id={event.id}
                      title={event.title}
                      description={event.description}
                      date={event.date}
                      type={event.type}
                      theme={event.theme}
                      image={event.image}
                      status={event.status}
                      registeredMembers={event.registeredUsers?.length || 0}
                    />
                  </div>
                ))}
              </div>

              {upcomingEvents.length > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {showAllUpcoming ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show less events
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show all {upcomingEvents.length} events
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Past Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Past Events</h2>
              <p className="text-gray-600 mt-1">
                Events you've already conducted
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {pastEvents.length} event{pastEvents.length !== 1 ? "s" : ""}
              </span>
              {pastEvents.length > 3 && (
                <button
                  onClick={() => setShowAllPast(!showAllPast)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                >
                  {showAllPast ? (
                    <>
                      Show less
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show all
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {pastEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No past events yet
              </h3>
              <p className="text-gray-600">
                Your event history will appear here
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-7">
                {displayedPastEvents.map((event) => (
                  <div key={event.id} className="">
                    <EventCard id={event.id} {...event} showAnalytics />
                  </div>
                ))}
              </div>

              {pastEvents.length > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllPast(!showAllPast)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    {showAllPast ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show less events
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show all {pastEvents.length} events
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Club Status Banner */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-100 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is your club hiring members?
              </h3>
              <p className="text-gray-600">
                Post your status on the clubs page to find new talented members
                for your team.
              </p>
            </div>
            <button
              onClick={() => navigate("/club/settings")}
              className="cursor-pointer px-6 py-3 bg-yellow-400 text-white font-medium rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
            >
              Update Club Status
            </button>
          </div>
        </div>
      </main>

      <FooterPage />
    </div>
  );
};

export default ClubDashboard;
