import { collection, getDocs, query, where, doc, getDoc ,setDoc, updateDoc, addDoc, serverTimestamp, orderBy,arrayUnion, increment, arrayRemove } from "firebase/firestore";
import {db} from "./firebase"

//get user by their id
export const getUserById = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data();
  }

  return null;
};

// USERS 

// - Create Users

export const createUser = async (uid, data) => {
  const ref = doc(db, "users", uid);
  const adminEmails = import.meta.env.VITE_ADMIN_EMAIL ? import.meta.env.VITE_ADMIN_EMAIL.split(',') : ["mokhamatamramya@gmail.com"];
  const isAdminUser = adminEmails.includes(data.email);
  await setDoc(ref, {
    uid,
    ...data,
    email: data.email,
    status: "ACTIVE",
    role: isAdminUser ? "ADMIN" : data.role,
    isAdmin: isAdminUser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// - Update Users

export const updateUser = async (uid, data) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// STUDENTS
 
// - Creating Student Profile 

export const createStudent = async (uid, data) => {
  const ref = doc(db, "students", uid);

  await setDoc(ref, {
    profile: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      photoURL: data.photoURL || null,
    },

    preferences: {
      interests: [],
      academicScheduleURL: null,
    },

    notifications: {
      eventReminders: true,
      hiringAlerts: false,
      feedbackRequests: true,
    },

    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// - get student by id

export const getStudentById = async (uid) => {
  const ref = doc(db, "students", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

// - get update student

export const updateStudent = async (uid, updates) => {
  const ref = doc(db, "students", uid);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date(),
  });
};

// CLUB REQUESTS

// - Request for Creating Club 

export const createClubRequest = async (uid, data) => {
  const requestRef = doc(db, "clubRequests", uid);

  // 1️⃣ Create the pending approval request
  await setDoc(requestRef, {
    uid,                 // club owner's auth uid
    ...data,             // clubName, presidentName, email, etc
    status: "PENDING",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2️⃣ Pre-initialize the actual club record as inactive to prevent breaking manual tests
  const clubRef = doc(db, "clubs", uid);
  await setDoc(clubRef, {
    clubId: uid,
    clubName: data.clubName || "",
    presidentName: data.presidentName || "",
    email: data.email || "",
    isActive: false,  // 🔥 Ensures it remains hidden until approved natively
    createdAt: serverTimestamp(),
  });
};

// - Get club by their id
export const getClubById = async (clubId) => {
  const ref = doc(db, "clubs", clubId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};


// - Admin's fetch pending requests

export const getPendingClubRequests = async () => {
  const q = query(
    collection(db, "clubRequests"),
    where("status", "==", "PENDING"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};


// - Admin: update request status

export const updateClubRequest = async (requestId, data) => {
  const ref = doc(db, "clubRequests", requestId);
  await updateDoc(ref, data);
};

//- admin: approve

export const approveClubRequest = async (requestId) => {
  const ref = doc(db, "clubRequests", requestId);

  await updateDoc(ref, {
    status: "APPROVED",
    reviewedAt: serverTimestamp(),
  });
};
// - admin reject

export const rejectClubRequest = async (requestId, reason = "") => {
  const ref = doc(db, "clubRequests", requestId);

  await updateDoc(ref, {
    status: "REJECTED",
    reason,
    reviewedAt: serverTimestamp(),
  });
};


// CLUBS

// - Creating Clubs only after Approval
export const createClub = async (clubId, data) => {
  if (!clubId) {
    throw new Error("Club ID is required");
  }

  const ref = doc(db, "clubs", clubId);

  const payload = {
    clubId,

    // 🔹 Basic club info
    clubName: data.clubName || "",
    description: data.description || "",
    category: data.category || [],

    // 🔹 Leadership & contact
    presidentName: data.presidentName || "",
    email: data.email || "",
    phone: data.phone || "",

    // 🔹 Media
    logo: data.logo || null,

    // 🔹 Social links
    socials: {
      linkedin: data.linkedin || "",
      instagram: data.instagram || "",
      website: data.website || "",

    },

    // 🔹 System
    isActive: true,                 // ✅ approved clubs only
    approvedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload);
};

export const updateClub = async (clubId, updates) => {
  const ref = doc(db, "clubs", clubId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};


/* Student event queries */

// student - past events (registered + completed)

export const getStudentPastEvents = async (studentUid)=>{
    try{
        const q = query(
            collection(db, "events"),
            where("status", "==","completed"),
            where("registeredUsers", "array-contains", studentUid)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    }catch (error){
        console.log("Errot fetching students past events:", error);
        return [];
    }
};

export const getStudentUpcomingEvents = async (studentUid)=>{
    try{
        const q = query(
            collection(db, "events"),
            where("status", "==", "upcoming"),
            where("registeredUsers", "array-contains", studentUid)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

    } catch (error){
        console.log("Error fetching student upcoming events:", error);
        return [];
    }
}

export const getPublicAnnouncements = async () =>{
  const q = query(
    collection(db, "announcements"),
    where("status", "==", "SENT"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getRecommendedEvents = async (interests = []) => {
  if (!interests.length) return [];

  const q = query(
    collection(db, "events"),
    where("status", "==", "upcoming"),
    
  );

  const snap = await getDocs(q);

  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((event) =>
       interests.includes(event.type));
    
};
// club announcements - 
/* ---------------- CREATE ANNOUNCEMENT ---------------- */
export const createAnnouncement = async (clubId, data) => {
  return await addDoc(collection(db, "announcements"), {
    clubId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};


/* ---------------- UPDATE ANNOUNCEMENT ---------------- */
export const updateAnnouncement = async (id, data) => {
  return await updateDoc(doc(db, "announcements", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/* ---------------- DELETE ANNOUNCEMENT ---------------- */
export const deleteAnnouncement = async (id) => {
  return await deleteDoc(doc(db, "announcements", id));
};

/* ---------------- FETCH ANNOUNCEMENTS ---------------- */
export const getClubAnnouncements = async (clubId) => {
  const q = query(
    collection(db, "announcements"),
    where("clubId", "==", clubId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};


/* Upcoming events - not registered + registered (events page) */

export const getUpcomingEvents = async ()=>{
    try{
        const q = query(
            collection(db, "events"),
            where("status", "==", "upcoming")
        )
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc =>({
            id: doc.id,
            ...doc.data(),
        }))
    }catch(error){
        console.log("Error fetching all the upcoming events: ", error);
        return[];
    }

}

// Get single event by ID
export const getEventById = async (eventId) => {
  try {
    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);
    const data = snap.data();
    if (snap.exists()) {
      return {
        id: snap.id,
        ...data,
        registeredUsers: Array.isArray(data.registeredUsers)
          ? data.registeredUsers
          : [], // ✅ GUARANTEE ARRAY
      };  
    }

    return null;
  } catch (error) {
    console.error("getEventById error:", error);
    throw error;
  }
};

// Get upcoming events registered by a user

export const getUpcomingRegisteredEvents = async (userId) =>{
    try{
        const q = query(
            collection(db, "events"),
            where("registeredUsers", "array-contains", userId),
            where("status", "==" , "upcoming")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc =>({
            id: doc.id,
            ...doc.data(),
        }));
    }catch (error){
        console.log("Error fetching registered events : ",error );
        return [];
    }
};

// Club upcoming events
export const getClubUpcomingEvents = async (clubId) => {
  try {
    const q = query(
      collection(db, "events"),
      where("clubId", "==", clubId),
      where("status", "==", "upcoming")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching club upcoming events:", err);
    return [];
  }
};

// Club past events
export const getClubPastEvents = async (clubId) => {
  try {
    const q = query(
      collection(db, "events"),
      where("clubId", "==", clubId),
      where("status", "==", "completed")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching club past events:", err);
    return [];
  }
};

// club hiring 

//club preferences 


export const updateClubPreferences = async (clubId, preferences) => {
  if (!clubId) throw new Error("Club ID missing");

  const ref = doc(db, "clubs", clubId);
  await updateDoc(ref, {
    preferences,
    updatedAt: new Date(),
  });
};

export const getPublicClubs = async () => {
  try {
    const q = query(
      collection(db, "clubs"),
      where("status", "==", "ACTIVE"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching public clubs:", error);
    return [];
  }
};

// analytics

export const trackEventView = async (eventId) => {
  const ref = doc(db, "events", eventId);

  await updateDoc(ref, {
    "analytics.views": increment(1),
  });
};

export const getClubAnalytics = async (clubId) => {
  const q = query(
    collection(db, "events"),
    where("clubId", "==", clubId)
  );

  const snapshot = await getDocs(q);

  let totalViews = 0;
  let totalClicks = 0;
  let totalRegistrations = 0;

  snapshot.forEach((doc) => {
    const analytics = doc.data().analytics || {
      views: 0,
      clicks: 0,
      registrations: 0,
    };

    totalViews += analytics.views || 0;
    totalClicks += analytics.clicks || 0;
    totalRegistrations += analytics.registrations || 0;
  });

  return { totalViews, totalClicks, totalRegistrations };
};


export const registerForEvent = async (eventId, userId) => {
  const ref = doc(db, "events", eventId);

  await updateDoc(ref, {
    registeredUsers: arrayUnion(userId),
    "analytics.registrations": increment(1),
  });
};
export const updateClubHiring = async (clubId, hiringData) => {
  console.log("🔥 updateClubHiring called");
  console.log("clubId:", clubId);
  console.log("hiringData:", hiringData);

  const ref = doc(db, "clubs", clubId);

  await updateDoc(ref, {
    ...hiringData,
    updatedAt: serverTimestamp(),
  });

  console.log("✅ Firestore update completed");
};


export const unregisterFromEvent = async (eventId, userId) => {
  const ref = doc(db, "events", eventId);

  await updateDoc(ref, {
    registeredUsers: arrayRemove(userId),
    "analytics.registrations": increment(-1),
  });
};

export const getRegisteredStudentsForEvent = async (eventId) => {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) return [];

  const registeredUsers = eventSnap.data().registeredUsers || [];
  if (registeredUsers.length === 0) return [];

  const students = await Promise.all(
    registeredUsers.map(async (uid) => {
      const studentRef = doc(db, "students", uid);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) return null;

      const data = studentSnap.data();

      return {
        uid,
        name:
          data.profile?.displayName ||
          data.fullName ||
          "Unknown",
        email: data.profile?.email || "—",
        avatar:
          data.avatar ||
          data.profile?.photoURL ||
          "https://api.dicebear.com/7.x/initials/svg",
      };
    })
  );

  return students.filter(Boolean);
};

export const getOpenHiringCount = async () => {
  const q = query(
    collection(db, "clubs"),
    where("hiringOpen", "==", true),
    where("gFormLink", "!=", "") // ensure form exists
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
};
