import { Link, useNavigate } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { logoutUser } from "@/firebase/auth";
import NavItem from "@/components/shared/NavItem";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="navbar bg-white shadow-sm fixed top-0 left-0 w-full backdrop-blur-md z-50 border-b border-gray-200 h-16 px-5">
      <div className="flex-1">
        <Link to="/admin" className="logo-cnt flex items-center font-['Inter'] gap-3">
          <svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2.66666L3 9.33332L18 16L33 9.33332L18 2.66666Z" fill="#4285F4" />
            <path d="M3 18.6667L18 25.3333L33 18.6667" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 13.3333L18 20L33 13.3333" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 22L18 28.6667L33 22" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-normal text-gray-800">ClubHub <span className="text-blue-600 font-semibold">Admin</span></span>
        </Link>
      </div>
      <div className="flex-none">
       <div className="flex-none">
  <ul className="menu menu-horizontal px-1 gap-3">
    
    <li>
      <NavItem to="/admin" label="Dashboard" activeColor="blue" />
    </li>

    <li>
      
      <button className="border-blue-500 text-blue-500 font-medium inline-flex text-lg items-center border-b-2  pb-0.5 rounded-none" onClick={handleLogout}>
        Logout
      </button>
    </li>

  </ul>
</div>
      </div>
    </div>
  );
};

export default Navbar;
