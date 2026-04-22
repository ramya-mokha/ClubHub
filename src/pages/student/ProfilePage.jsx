import { useNavigate } from "react-router-dom";
import {
  Settings,
  Calendar,
  Tag,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { getStudentById } from "@/firebase/collections";
import Loader from "@/components/shared/Loader";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("No authenticated user found");
          setLoading(false);
          return;
        }

        const data = await getStudentById(user.uid);
        if (!data) setError("Profile data not found");
        else setStudent(data);
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return <Loader message="Loading your profile.." />;
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const interests = student.preferences?.interests || [];
  const timetableImage =
    student.preferences?.academicScheduleURL &&
    !student.preferences.academicScheduleURL.startsWith("blob:")
      ? student.preferences.academicScheduleURL
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-10"
        >
          <ArrowLeft size={18} />
          <span className="text-lg cursor-pointer font-medium">Back</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200">
          {/* Header */}
          <div className="relative px-10 pt-16 pb-12 text-center">
            <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg" />

            <div className="relative z-10">
              <div className="inline-flex p-1 bg-white rounded-full shadow-xl">
                <img
                  src={
                    student.avatar ||
                    student.profile?.photoURL ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${student.profile?.fullName || student.profile?.displayName || "User"}`
                  }
                  alt="Profile"
                  className="w-36 h-36 rounded-full border-4 border-white object-cover"
                />
              </div>

              <h1 className="mt-6 text-3xl font-medium text-gray-900">
                {student.profile?.fullName || student.profile?.displayName || "Student"}
              </h1>
              <p className="mt-1 text-gray-600">{student.profile?.email}</p>

              <span className="inline-flex mt-4 px-4 py-1.5 gap-3 rounded-sm bg-blue-100 text-blue-700 text-md font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#4285F4"
                >
                  <path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z" />
                </svg>
                STUDENT
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-10 pb-10 space-y-12">
            {/* Interests */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#4285F4"
                  >
                    <path d="m80-520 200-360 200 360H80Zm200 400q-66 0-113-47t-47-113q0-67 47-113.5T280-440q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T360-280q0-33-23.5-56.5T280-360q-33 0-56.5 23.5T200-280q0 33 23.5 56.5T280-200Zm-64-400h128l-64-115-64 115Zm304 480v-320h320v320H520Zm80-80h160v-160H600v160Zm80-320q-57-48-95.5-81T523-659q-23-25-33-47t-10-47q0-45 31.5-76t78.5-31q27 0 50.5 12.5T680-813q16-22 39.5-34.5T770-860q47 0 78.5 31t31.5 76q0 25-10 47t-33 47q-23 25-61.5 58T680-520Zm0-105q72-60 96-85t24-41q0-13-7.5-21t-20.5-8q-10 0-19.5 5.5T729-755l-49 47-49-47q-14-14-23.5-19.5T588-780q-13 0-20.5 8t-7.5 21q0 16 24 41t96 85Zm0-78Zm-400 45Zm0 378Zm400 0Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Interests
                </h2>
              </div>

              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  No interests added yet
                </div>
              )}
            </section>

            {/* Academic Schedule */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#34A853"
                  >
                    <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" />
                  </svg>{" "}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Academic Schedule
                </h2>
              </div>

              {timetableImage ? (
                <img
                  src={timetableImage}
                  alt="Timetable"
                  className="w-full rounded-2xl border"
                />
              ) : (
                <div className="h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={28} />
                  <span className="mt-2 text-sm">No schedule uploaded</span>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="pt-8 border-t flex justify-between items-center">
              <p className="text-sm text-red-500">
                * To edit profile information
              </p>

              <button
                onClick={() => navigate("/student/settings")}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 cursor-pointer text-black rounded-md hover:bg-gray-300"
              >
                <Settings size={18} />
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
