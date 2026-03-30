import React from 'react'
import bgImg from "@/assets/SignIn.png";
import { useNavigate } from "react-router-dom";
import { googleSignIn } from "../../firebase/auth";
import SignUpCard2 from '@/components/layout/Signup/SignUpCard2';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      console.log("🟢 LoginPage - Google sign-in result:", result);

      // 🆕 New user → go to signup flow
      if (result.isNewUser) {
        console.log("🟢 NEW USER → navigating to /signup for role selection");
        navigate("/signup");
        return;
      }
      console.log("🟢 EXISTING USER → role:", result.role);

      // ✅ Existing users routing
      if (result.role === "ADMIN") {
        navigate("/admin");
      } 
      else if (result.role === "STUDENT") {
        navigate("/student");
      } 
      else if (result.role === "CLUB") {
        if (result.isApproved === true) {
          navigate("/club");
        } else {
          navigate("/waiting-approval");
        }
      } 
      else if (!result.role) {
        // user exists but hasn't picked a role
        console.log("🟢 EXISTING USER BUT NO ROLE → navigating to /signup");
        navigate("/signup");
      } 
      else {
        // safety fallback
        navigate("/login");
      }

    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#f8f9fa]">
    <div className="relative z-10"><SignUpCard2 txt="in" onGoogleLogin={handleGoogleLogin} /></div>
    </div>
  )
}

export default LoginPage

