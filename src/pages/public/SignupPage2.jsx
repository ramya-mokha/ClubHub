import React from 'react'
import bgImg from "@/assets/SignIn.png";
import SignUpCard2 from '@/components/layout/Signup/SignUpCard2';
import { Link, useNavigate } from 'react-router-dom';
import { googleSignIn } from "@/firebase/auth";

const SignupPage2 = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      const result = await googleSignIn();
      console.log("🔵 SignupPage2 - Google sign-in result:", result);

      // New user → go to role selection
      if (result.isNewUser) {
        console.log("🔵 NEW USER → navigating to /signup for role selection");
        navigate("/signup");
        return;
      }
      console.log("🔵 EXISTING USER → role:", result.role);

      // Existing users → route based on role
      if (result.role === "ADMIN") {
        navigate("/admin");
      } else if (result.role === "STUDENT") {
        navigate("/student");
      } else if (result.role === "CLUB") {
        if (result.isApproved === true) {
          navigate("/club");
        } else {
          navigate("/waiting-approval");
        }
      } else if (!result.role) {
        console.log("🔵 EXISTING USER BUT NO ROLE → navigating to /signup");
        navigate("/signup");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#f8f9fa]">
    <div className="relative z-10"><SignUpCard2 txt="up" onGoogleLogin={handleGoogleSignup}>
        <p className="text-center font-light">
            Already have an account ?
            <Link to="/login" className="text-blue-500"> {" "}Login</Link>
          </p>
    </SignUpCard2>
   </div>
    </div>
  )
}

export default SignupPage2
