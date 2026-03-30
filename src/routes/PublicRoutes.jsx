import React from "react";
import { Routes, Route } from "react-router-dom";
import SignUpCard1 from "@/components/layout/Signup/SignUpCard1";

import LoginPage from "../pages/public/LoginPage";
import LandingPage from "../pages/public/LandingPage";
import SignupPage from "../pages/public/SignupPage1";
import SignupPage2 from "@/pages/public/SignupPage2";
import NotFoundPage from "@/pages/public/NotFoundPage";
import SignUpStudent from "@/components/layout/Signup/SignUpStudent";
import SignUpClub from "@/components/layout/Signup/SignUpClub";
import WaitingApproval from "@/pages/public/WaitingApproval";
import EventRegister from "@/pages/student/RegisterPage";
import HandbookPage from "@/pages/public/HandbookPage";
import HelpPage from "@/pages/public/HelpPage";
import ContactPage from "@/pages/public/ContactPage";
import TermsPage from "@/pages/public/TermsPage";
import PrivacyPage from "@/pages/public/PrivacyPage";

const PublicRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="signup" element={<SignUpCard1 />} />
        <Route path="login" element={<LoginPage />} />
        <Route index element={<LandingPage />} />
        <Route path="signup1" element={<SignupPage />} />
        <Route path="signup2" element={<SignupPage2 />} />
        <Route path="auth" element={<h1>Google Auth Page</h1>} />
        <Route path="signup-student" element={<SignUpStudent />} />
        <Route path="signup-club" element={<SignUpClub />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        <Route path="handbook" element={<HandbookPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Routes>
    </div>
  );
};

export default PublicRoutes;
