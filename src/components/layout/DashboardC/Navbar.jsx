import { Link } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/firebase/auth";
import NavItem from "@/components/shared/NavItem";
import { auth } from "@/firebase/firebase";
import { useState, useEffect } from "react";
import { getClubById } from "@/firebase/collections";

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

      const club = await getClubById(user.uid);

      if (club?.avatar) {
        setAvatar(club.avatar);
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
            <NavItem to="/club" label="Dashboard" activeColor="green" />
          </li>
          <li>
            <NavItem
              to="/club/drafts"
              label="Draft Events"
              activeColor="yellow"
            />
          </li>
          <li className="active:bg-transparent hover:bg-transparent">
            <NavItem to="/club/members" label="Members" activeColor="blue" />
          </li>
          <li className="bg-red-500/25 rounded-full w-fit flex items-center justify-center active:bg-transparent">
            <span className="material-symbols-outlined text-red-500">
              notifications_unread
            </span>
          </li>
          <li className="bg-green-500/25 rounded-xl w-20 flex items-center justify-center ">
            <div className="dropdown dropdown-bottom dropdown-end focus:outline-none focus:ring-0 hover:bg-transparent">
              <div tabIndex={0} role="button" className="flex items-center">
                <div className="rounded-full bg-white w-8 h-8 flex items-center justify-center overflow-hidden mr-2">
                  <img
                    src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${auth.currentUser?.displayName || "User"}`}
                    alt="profile"
                    className="w-8 h-8 object-cover rounded-full"
                  />
                </div>
                <RiArrowDropDownLine size={24}/>
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-white text-black rounded-xs z-1 w-52 p-2 shadow-sm"
              >
                <li className="text-center text-[20px] hover:bg-green-50 hover:rounded-xs">
                  <Link to="/profilePage">Profile</Link>
                </li>
                <li className="text-center text-[20px] hover:bg-green-50 hover:rounded-xs">
                  <Link to="/club/settings">Settings</Link>
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
