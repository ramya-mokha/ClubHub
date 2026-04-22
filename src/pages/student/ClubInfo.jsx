import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Search, ChevronDown, Mail } from "lucide-react";

/* ---------------- TIME AGO ---------------- */
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
};

const ClubInfo = () => {
  /* ---------------- STATE ---------------- */
  const [clubs, setClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const FALLBACK_LOGO = "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [announcementFilter, setAnnouncementFilter] = useState("ALL");

  /* ---------------- FETCH CLUBS ---------------- */
  useEffect(() => {
    const fetchClubs = async () => {
      const snap = await getDocs(collection(db, "clubs"));

      const data = snap.docs.map((doc) => {
        const c = doc.data();
        return {
          id: doc.id,
          name: c.clubName,
          description: c.about || c.description || "",
          email: c.email,
          category: c.category?.[0] || "Category",
          avatar: c.avatar,
          hiringOpen: c.hiringOpen === true,
          gFormLink: c.gFormLink,
        };
      });

      setClubs(data);
    };

    fetchClubs();
  }, []);

  /* ---------------- FETCH ANNOUNCEMENTS ---------------- */
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const snap = await getDocs(collection(db, "announcements"));
      setAnnouncements(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchAnnouncements();
  }, []);

  /* ---------------- FILTERED CLUBS ---------------- */
  const filteredClubs = useMemo(() => {
    return clubs
      .filter((c) =>
        statusFilter === "ALL"
          ? true
          : statusFilter === "OPEN"
          ? c.hiringOpen
          : !c.hiringOpen
      )
      .filter((c) =>
        activeCategory === "All" ? true : c.category === activeCategory
      )
      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [clubs, statusFilter, activeCategory, searchQuery]);

  /* ---------------- FILTERED ANNOUNCEMENTS ---------------- */
  const filteredAnnouncements = announcements.filter((a) => {
    if (!a.createdAt) return false;

    const created = a.createdAt.toDate();
    const now = new Date();

    if (announcementFilter === "ALL") return true;
    if (announcementFilter === "WEEK")
      return now - created <= 7 * 24 * 60 * 60 * 1000;
    if (announcementFilter === "MONTH")
      return now - created <= 30 * 24 * 60 * 60 * 1000;
    if (announcementFilter === "OLDER")
      return now - created > 30 * 24 * 60 * 60 * 1000;

    return true;
  });

  const categories = [
    "All",
    ...new Set(clubs.map((c) => c.category).filter(Boolean)),
  ];

  return (
    <div className="bg-[#f8f9fa] font-sans text-gray-900 mt-16 pb-12">
      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="w-[50%]">
            <h1 className="text-[32px] font-semibold mb-1">
              Club Hiring and Contact
            </h1>
            <p className="font-light">
              Explore active student organizations, view current recruitment
              status and connect with club leaders
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-[40%] md:w-96">
            <input
              type="text"
              placeholder="Search Clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200
                         rounded-xl focus:outline-none focus:ring-2
                         focus:ring-blue-100 text-sm"
            />
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* ================= CLUBS ================= */}
      <main className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-xl">
        <div className="flex items-center justify-center">
          {/* STATUS PILLS */}
          <div className="flex gap-3 mb-6">
            {[
              { key: "ALL", label: "All" },
              { key: "OPEN", label: "Hiring Open" },
              { key: "CLOSED", label: "Closed" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={`px-4 py-1.5 rounded-full text-sm border transition cursor-pointer
                ${
                  statusFilter === item.key
                    ? "bg-green-600 text-white border-gray-400"
                    : "bg-white text-gray-600 hover:bg-green-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* CATEGORY DROPDOWN */}
          <div className="relative w-48 ml-auto mb-6">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="cursor-pointer w-full appearance-none bg-gray-100 rounded-md py-3
                       pl-4 pr-10 text-sm font-medium outline-none"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* CLUB GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white border border-gray-200 rounded-lg p-6
                         hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group
                         flex flex-col"
            >
              {/* CARD HEADER */}
              <div className="flex justify-between items-start mb-5">
                <div className="w-14 h-14 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img
                      src={club.avatar || FALLBACK_LOGO}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                </div>

                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-sm
                    ${
                      club.hiringOpen
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                >
                  {club.hiringOpen ? "Hiring" : "Closed"}
                </span>
              </div>

              {/* CONTENT */}
              <h3 className="text-2xl font-medium mb-1">{club.name}</h3>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded mb-6 w-fit">
                {club.category}
              </span>

              <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
                {club.description || "No description provided"}
              </p>

              {/* FOOTER */}
              <div className="mt-auto pt-4 border-t flex items-center justify-between">
                {club.hiringOpen ? (
                  <button
                    onClick={() => window.open(club.gFormLink, "_blank")}
                    className="px-6 py-2 bg-blue-600 text-white text-sm cursor-pointer
                               rounded-sm hover:bg-blue-500 transition"
                  >
                    Apply
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">
                    Applications Closed
                  </span>
                )}

                <a
                  href={`mailto:${club.email}`}
                  className="p-2 text-gray-400 hover:text-blue-600
                             hover:bg-blue-50 rounded-full transition"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= ANNOUNCEMENTS (OLD STYLE) ================= */}
      <section className="max-w-6xl mx-auto mt-10">
        <div className="border-2 p-5 rounded-xl">
          <h1 className="text-[24px] font-semibold mb-4">Announcements</h1>

          {/* ANNOUNCEMENT FILTER */}
          <div className="flex gap-2 mb-5">
            {[
              { label: "All", value: "ALL" },
              { label: "This Week", value: "WEEK" },
              { label: "This Month", value: "MONTH" },
              { label: "Older", value: "OLDER" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setAnnouncementFilter(f.value)}
                className={`px-3 py-1 rounded-full text-sm border transition cursor-pointer
                  ${
                    announcementFilter === f.value
                      ? "bg-green-600 text-white border-gray-100"
                      : "bg-white text-gray-600 hover:bg-green-100"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredAnnouncements.map((a) => (
            <div key={a.id} className="p-4 rounded-md mb-4 bg-white border-1">
              {/* ANNOUNCEMENT TITLE */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">
                {a.title}
              </h3>

              {/* META */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 break-words">
                <span>
                  From <span className="text-green-600">{a.clubName}</span>
                </span>
                <span>•</span>
                <span>{formatTimeAgo(a.createdAt)}</span>
              </div>

              {/* MESSAGE */}
              <p className="font-light text-md text-gray-700 break-words">
                {a.message}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClubInfo;
