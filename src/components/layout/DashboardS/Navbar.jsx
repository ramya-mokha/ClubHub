import { NavLink, Link, useNavigate } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { Plus } from "lucide-react";
import { logoutUser } from "@/firebase/auth";
import NavItem from "@/components/shared/NavItem";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { getStudentById } from "@/firebase/collections";

const Navbar = () => {
  //Logout
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);

  const handleLogout = async () => {
    try {
      await logoutUser(); // Firebase sign out
      navigate("/"); // Landing page
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const student = await getStudentById(user.uid);

      if (student?.avatar) {
        setAvatar(student.avatar);
      } else if (user.photoURL) {
        setAvatar(user.photoURL);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <div className="navbar bg-white shadow-sm fixed top-0 left-0 w-full backdrop-blur-md z-50 border-b border-gray-200 h-16 px-5">
      <div className="flex-1">
        <div className="logo-cnt flex items-center font-['Inter'] gap-3">
          <svg
            width="36"
            height="32"
            viewBox="0 0 36 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 2.66666L3 9.33332L18 16L33 9.33332L18 2.66666Z"
              fill="#4285F4"
            />
            <path
              d="M3 18.6667L18 25.3333L33 18.6667"
              stroke="#34A853"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 13.3333L18 20L33 13.3333"
              stroke="#FBBC05"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 22L18 28.6667L33 22"
              stroke="#EA4335"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-normal">ClubHub</span>
        </div>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 gap-3">
          <li>
            <NavItem to="/student" label="Dashboard" activeColor="blue" />
          </li>
          <li>
            <NavItem to="/student/events" label="Events" activeColor="yellow" />
          </li>
          <li>
            <NavItem to="/student/clubs" label="Clubs" activeColor="green" />
          </li>
          <li className="bg-red-500/25 rounded-full w-fit flex items-center justify-center active:bg-transparent">
            <span className="material-symbols-outlined text-red-500">
              notifications_unread
            </span>
          </li>
          <li className="bg-blue-500/25 rounded-xl w-20 flex items-center justify-center ">
            <div className="dropdown dropdown-bottom dropdown-end focus:outline-none focus:ring-0 hover:bg-transparent">
              <div tabIndex={0} role="button" className="flex items-center">
                <div className="rounded-full bg-white w-8 h-8 flex items-center justify-center overflow-hidden mr-2">
                  <img
                    src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${auth.currentUser?.displayName || "User"}`}
                    alt="profile"
                    className="w-8 h-8 object-cover rounded-full"
                  />
                </div>

                <RiArrowDropDownLine size={25}/>
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-white rounded-xs z-1 w-52 shadow-sm text-black"
              >
                <li className="text-center  text-[20px] hover:bg-blue-50 hover:rounded-xs">
                  <Link to="/student/profile">Profile</Link>
                </li>
                <li className="text-center text-[20px] hover:bg-blue-50 hover:rounded-xs">
                  <Link to="/student/settings">Settings</Link>
                </li>
                <li className="text-center text-[20px] bg-red-50 rounded-xs hover:bg-red-100 hover:rounded-xs">
                  <span
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 hover:text-red-700"
                  >
                    Logout
                  </span>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
