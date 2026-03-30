// import Toast from "@/components/shared/toast";
// import React from "react";
// import { useState } from "react";
// import { Link } from "react-router-dom";

// const SignUpCard1 = () => {
//     const [user,setUser]=useState("");
//     const [showToast,setShowToast]=useState(false);
//     const handleBtnClick=(u)=>{
//           setUser(u);
//           setShowToast(true);
//           setTimeout(()=>{
//            setShowToast(false);
//           },3000)

//     }
//   return (
//     <div className="min-h-screen flex items-center justify-center min-w-screen">
//         {showToast && <Toast msg={user}/>}
//       <div className="card w-176 h-100 bg-base-100 card-xl shadow-sm flex items-center justify-center gap-6">
//         <h2 className="card-title text-[24px] justify-center"> <svg
//             width="38"
//             height="34"
//             viewBox="0 0 36 32"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M18 2.66666L3 9.33332L18 16L33 9.33332L18 2.66666Z"
//               fill="#4285F4"
//             />
//             <path
//               d="M3 18.6667L18 25.3333L33 18.6667"
//               stroke="#34A853"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M3 13.3333L18 20L33 13.3333"
//               stroke="#FBBC05"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M3 22L18 28.6667L33 22"
//               stroke="#EA4335"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>ClubHub</h2>
//           <p className="font-extralight text-[32px]">
//             Welcome to ClubHub</p>
//           <div className="flex flex-col gap-4">
//             <p className="text-center">Who are you?</p>
//             <div className="flex gap-4">
//             <button onClick={()=>handleBtnClick("Student")} className="text-blue-500 cursor-pointer active:bg-blue-500/25 p-2 active:rounded-2xl">Student</button>
//             <button onClick={()=>handleBtnClick("ClubHead")} className="text-green-500 cursor-pointer active:bg-green-500/25 p-2 active:rounded-2xl ">Club Head</button>
//             <button onClick={()=>handleBtnClick("Admin")} className="text-red-500 active:bg-red-500/25 p-2 active:rounded-2xl cursor-pointer ">Admin</button>
//           </div>
//           <div className=" mx-auto">
//             <button className="btn btn-primary rounded-2xl w-32"><Link to="/signup2">Continue</Link></button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUpCard1;

import React from "react";
import { useNavigate } from "react-router-dom";
import bgImg from "@/assets/SignIn.png";

const SignUpCard1 = () => {
  const navigate = useNavigate();

  /* ---------------- STUDENT ---------------- */
  const handleStudent = () => {
    navigate("/signup-student");
  };

  /* ---------------- CLUB ---------------- */
  const handleClub = () => {
    navigate("/signup-club");
  };
  return (
    <div
      className="absolute inset-0 w-full h-full bg-cover"
      // style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="max-w-4xl w-full bg-white shadow-sm rounded-md p-10 text-center">
          {/* Header */}
          <h1 className="font-semibold text-3xl">Join the community</h1>
          <p className="font-light text-xl mt-2">
            Please select the role that best describes you
          </p>

          {/* Cards */}
          <div className="flex gap-10 mt-10 flex-col md:flex-row justify-center">
            {/* Student */}
            <div
              onClick={handleStudent}
              className="border rounded-sm p-6 flex flex-col gap-4 hover:shadow-md transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-blue-500 p-4 bg-blue-200 rounded-full w-fit text-[32px]">
                school
              </span>

              <h2 className="text-xl font-semibold text-left">
                I am a <span className="text-blue-500">Student</span>
              </h2>

              <p className="text-gray-600 text-left">
                Looking to join clubs, attend events and expand my network on
                campus
              </p>

              <button className="w-full border-blue-500 border-2 rounded-sm p-2 hover:bg-blue-50">
                Continue as Student
              </button>
            </div>

            {/* Club Leader */}
            <div
              onClick={handleClub}
              className="border rounded-sm p-6 flex flex-col gap-4 hover:shadow-md transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-green-500 p-4 bg-green-200 rounded-full w-fit text-[32px]">
                verified_user
              </span>

              <h2 className="text-xl font-semibold text-left">
                I am a <span className="text-green-500">Club Leader</span>
              </h2>

              <p className="text-gray-600 text-left">
                Looking to manage events, recruit members, and grow your club
                community
              </p>

              <button className="w-full bg-green-500 text-white rounded-sm p-2 hover:bg-green-600">
                Continue as Club Leader
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpCard1;
