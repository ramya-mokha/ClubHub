import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import Navigation Hook
import EventCard from "@/components/shared/eventCard";
import { getUpcomingEvents } from "@/firebase/collections";
import Loader from "@/components/shared/Loader";

const UpcomingEventsSection = () => {
  const navigate = useNavigate(); // 2. Initialize Navigation

  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // 2. STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState("");
  const [allEvents, setAllEvents] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // New Filter States
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [clubFilter, setClubFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3. UPDATED to 9 items (3x3 grid)

  //Fetching firestore users
  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getUpcomingEvents();
      setAllEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // 3. FILTER

  //filter data (Helper Arrays for Dropdowns)
  const eventTypes = [
    "Workshop",
    "Seminar",
    "Club",
    "Music",
    "Tech",
    "Art",
    "Sports",
    "Coding",
  ];

  // Dynamically derive unique club names from the fetched events
  const clubNames = [
    ...new Set(
      allEvents
        .map((e) => e.clubName)
        .filter(Boolean)
    ),
  ].sort();

  // Filter logic
  const filteredEvents = allEvents.filter((event) => {
    // Search Logic
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase());

    // Type Logic
    const matchesType = typeFilter === "" || event.type === typeFilter;

    // Club Logic
    const matchesClub = clubFilter === "" || event.clubName === clubFilter;

    // Date Logic
    // Date Logic (FIXED)
    let matchesDate = true;

    if (dateFilter) {
      const filterDateObj = normalizeDate(dateFilter);
      let eventDateObj = null;

      // Firestore Timestamp
      if (event.date?.seconds) {
        eventDateObj = new Date(event.date.seconds * 1000);
      }
      // ISO format (YYYY-MM-DD)
      else if (typeof event.date === "string" && event.date.includes("-")) {
        eventDateObj = new Date(event.date);
      }
      // DD/MM/YYYY
      else if (typeof event.date === "string" && event.date.includes("/")) {
        const [day, month, year] = event.date.split("/");
        eventDateObj = new Date(year, month - 1, day);
      }

      if (eventDateObj) {
        matchesDate =
          normalizeDate(eventDateObj).getTime() === filterDateObj.getTime();
      }
    }

    return matchesSearch && matchesType && matchesClub && matchesDate;
  });

  // 4. PAGINATION LOGIC
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, typeFilter, clubFilter]);

  // Handlers
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  // Helper to clear all filters
  const clearFilters = () => {
    setDateFilter("");
    setTypeFilter("");
    setClubFilter("");
  };

  if (loading) {
    return <Loader message="Loading events..." />;
  }
  return (
    <div className="mt-16 mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#f8f9fa]">
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">
            Ready to explore what's happening on campus today?
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl bg-white rounded-3xl mx-auto p-10 shadow-sm border border-gray-100">
        {/* NEW FILTER BAR (Updated Layout) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6">
          <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
            Upcoming Events{" "}
            <span className="text-gray-400 text-sm font-normal ml-2">
              ({filteredEvents.length} found)
            </span>
          </h2>

          {/* Filter Controls Group */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full xl:w-auto">
            {/* 1. Date Picker */}
            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 cursor-text bg-gray-50 border-0 rounded-lg text-sm text-gray-600 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
              />
              {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span> */}
            </div>

            {/* 2. Type Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none w-full sm:w-40 pl-4 pr-10 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="">All Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* 3. Club Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className="appearance-none w-full sm:w-48 pl-4 pr-10 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-600 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="">All Clubs</option>
                {clubNames.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Clear Filters Link */}
            {(dateFilter || typeFilter || clubFilter) && (
              <button
                onClick={clearFilters}
                className="cursor-pointer text-sm text-gray-500 hover:text-gray-800 font-medium underline decoration-gray-300 underline-offset-4 cursor-pointer transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* THE GRID */}
        {currentEvents.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 mb-12 px-4">
            {currentEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/student/events/${event.id}`)} // 4. Navigation Handler
                className="cursor-pointer transition-transform hover:scale-[1.01]duration-200"
              >
                <EventCard {...event} variant="details" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium">No events found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your filters or search term.
            </p>
            <button
              onClick={clearFilters}
              className="cursor-pointer mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* DYNAMIC PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-gray-500 select-none border-t border-gray-100 pt-6">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 hidden sm:block hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
            >
              First
            </button>
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => handlePageClick(number)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    currentPage === number
                      ? "bg-black text-white shadow-md transform scale-105"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 hidden sm:block hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsSection;
