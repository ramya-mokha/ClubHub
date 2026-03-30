import { Link } from "react-router-dom";
import ButtonOutline from "../../shared/button1";
import ButtonBg from "../../shared/button2";

const Navbar = () => {
  return (
    <div className="navbar fixed top-0 left-0 w-full backdrop-blur-md z-50 border-b border-gray-200 h-16 px-5 bg-white text-black shadow-sm">
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
      <div className="flex items-center gap-3">
        <ButtonOutline text="Login" url="/login" />
        <ButtonBg text="Join Platform" url="/signup2" />
      </div>
    </div>
  );
};

export default Navbar;
