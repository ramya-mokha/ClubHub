import { useNavigate } from "react-router-dom";
import { deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { useState } from "react";

const DangerZoneSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      localStorage.clear(); // Flush cache manually 
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      alert("Sign out failed. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const user = auth.currentUser;
    if (!user) {
      alert("No user is signed in.");
      return;
    }

    setLoading(true);

    try {
      // Attempt re-authentication silently (can be blocked by browsers)
      try {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } catch (reauthErr) {
        console.warn("Re-auth popup blocked or failed. Proceeding to test if token is still fresh.", reauthErr);
      }

      const uid = user.uid;

      // Wipe application cache uniformly
      localStorage.clear();

      // Delete from "users" collection
      await deleteDoc(doc(db, "users", uid));

      // Delete from role-specific collection (students or clubs)
      await deleteDoc(doc(db, "students", uid)).catch(() => {});
      await deleteDoc(doc(db, "clubs", uid)).catch(() => {});
      await deleteDoc(doc(db, "clubRequests", uid)).catch(() => {});

      // Delete the Firebase Auth account
      await deleteUser(user);

      navigate("/login");
    } catch (err) {
      console.error("Account deletion failed:", err);

      if (err.code === "auth/requires-recent-login") {
        alert(
          "For security reasons, please sign out and sign back in before deleting your account."
        );
      } else {
        alert("Failed to delete account. You may need to sign out entirely and sign back in first.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-[24px] mb-3 text-red-600"></h2>

      <div className="border border-red-300 bg-white p-10 rounded-md space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-red-500">
              End your current session on this device
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="cursor-pointer px-10 py-2 border border-red-400 text-red-600 rounded-sm bg-red-100"
          >
            Sign out
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex justify-between items-center">
          <div>
            <p className=" text-red-500">
              Permanently remove your account and associated data
            </p>
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneSection;
