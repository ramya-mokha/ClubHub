import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // New user - must go through signup flow
    if (!snap.exists()) {
      return {
        firebaseUser: user,
        isNewUser: true,
      };
    }

    // Existing user
    const userData = snap.data();

    return {
      firebaseUser: user,
      isNewUser: false,
      role: userData.isAdmin ? "ADMIN" : userData.role,
      isApproved: userData.isApproved,
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};
