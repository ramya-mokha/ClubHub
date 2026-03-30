import StatsCard from "./StatsCard";
import RequestsTable from "./RequestsTable";
import { useState, useEffect } from "react";
import { getPendingClubRequests } from "@/firebase/collections";
import {doc, updateDoc, collection, getCountFromServer, getDocs, query, where} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { createClub } from "@/firebase/collections";
import { auth } from "@/firebase/firebase";
import Navbar from "@/components/layout/DashboardA/Navbar";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [approvedClubs, setApprovedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: null,
    clubs: null,
    requests: null,
    events: null,
  });

  useEffect(() => {
    const fetchRequestsAndStats = async () => {
      try {
        const [data, studentSnap, clubSnap, requestSnap, eventSnap] = await Promise.all([
          getPendingClubRequests(),
          getCountFromServer(collection(db, "students")),
          getCountFromServer(collection(db, "clubs")),
          getCountFromServer(collection(db, "clubRequests")),
          getCountFromServer(collection(db, "events")),
        ]);
        
        // Fetch approved active clubs natively
        const clubsQuery = query(collection(db, "clubs"), where("isActive", "==", true));
        const activeClubsData = await getDocs(clubsQuery);
        setApprovedClubs(activeClubsData.docs.map(d => ({id: d.id, ...d.data()})));

        setRequests(data);
        setStats({
          students: studentSnap.data().count,
          clubs: clubSnap.data().count,
          requests: data.length, // specifically pending requests
          events: eventSnap.data().count,
        });
      } catch (err) {
        console.error("Failed to fetch requests or stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestsAndStats();
  }, []);

  // Logout is now handled exclusively by the new Navbar globally

  const handleApprove = async (req) => {
    
    try {
      // 1️⃣ mark request approved
      await updateDoc(doc(db, "clubRequests", req.id), {
        status: "APPROVED",
        updatedAt: new Date(),
      });

      // 2️⃣ create club
      await createClub(req.uid, {
        clubName: req.clubName,
        presidentName: req.presidentName,
        email: req.email,
        isActive: true
      });

      // 3️⃣ approve user
      await updateDoc(doc(db, "users", req.uid), {
        isApproved: true,
      });

      // 4️⃣ remove from UI
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (err) {
      console.error("Approve failed", err);
      alert("Failed to approve club");
    }
  };


  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, "clubRequests", id), {
        status: "REJECTED",
      });

      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Reject failed", err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 pt-24">
        <h1 className="text-3xl font-semibold">Admin Panel</h1>
        <p className="text-gray-500 mt-1">
          Review and manage students clubs in college
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <StatsCard title="Total Students" value={stats.students} />
          <StatsCard title="Total Clubs" value={stats.clubs} />
          <StatsCard title="Pending Requests" value={stats.requests} />
          <StatsCard title="Total Events" value={stats.events} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-10">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded cursor-pointer transition-colors ${activeTab === "pending" ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            Pending Requests ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-2 rounded cursor-pointer transition-colors ${activeTab === "approved" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            Approved Clubs ({approvedClubs.length})
          </button>
        </div>

        {/* Filters */}
        {activeTab === "pending" && (
          <div className="flex justify-end gap-4 mt-4">
            <button className="border px-4 py-2 text-sm rounded cursor-not-allowed opacity-50">Filter</button>
            <button className="border px-4 py-2 text-sm rounded cursor-not-allowed opacity-50">Sort</button>
          </div>
        )}

        {/* Dynamic Table Rendering */}
        {loading ? (
          <p className="mt-6 text-gray-500">Loading comprehensive dashboard data...</p>
        ) : activeTab === "pending" ? (
          <RequestsTable
            data={requests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <div className="mt-8 overflow-x-auto border rounded-xl bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-600">Club Name</th>
                  <th className="px-6 py-4 font-medium text-gray-600">President</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Email Address</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {approvedClubs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">No approved clubs yet.</td>
                  </tr>
                ) : (
                  approvedClubs.map((club) => (
                    <tr key={club.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{club.clubName || "Unknown"}</td>
                      <td className="px-6 py-4 text-gray-600">{club.presidentName || "Unknown"}</td>
                      <td className="px-6 py-4 text-gray-600">{club.email || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
