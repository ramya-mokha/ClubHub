import { auth } from "./firebase";
import { getStudentById, getUpcomingEvents } from "./collections";
import { getAcademicSchedule } from "./academicSchedule";

/**
 * 🔹 User identity (minimal)
 */
export function getAIUserContext() {
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    role: "student",
  };
}

/**
 * 🔹 Student-specific context
 */
export async function getAIStudentContext() {
  const user = auth.currentUser;
  if (!user) return null;

  const student = await getStudentById(user.uid);
  if (!student) return null;

  const schedule = await getAcademicSchedule(user.uid);

  return {
    profile: {
      name: student.profile?.fullName || student.profile?.displayName,
      email: student.profile?.email,
    },
    preferences: {
      interests: student.preferences?.interests || [],
    },
    academicSchedule: {
      hasSchedule: !!schedule,
      data: schedule || null,
    },
  };
}

/**
 * 🔹 Event context (curated & personalized)
 */
export async function getAIEventContext(interest = []) {
  const events = await getUpcomingEvents();
  const todayStr = new Date().toDateString();

  const formatted = events.map((e) => ({
    id: e.id,
    title: e.title,

    // Human-friendly date (keep this)
    date: e.date,

    // Precise timing (for AI reasoning)
    startDateTime: e.startDateTime
      ? e.startDateTime.toDate().toISOString()
      : null,

    endDateTime: e.endDateTime ? e.endDateTime.toDate().toISOString() : null,

    type: e.type,
    tags: e.tags || [],

    club: e.clubName,

    venue: {
      name: e.location?.venue || "",
      area: e.location?.area || "",
      college: e.location?.college || "",
    },

    path: `/events/${e.id}`,
  }));

  return {
    today: formatted.filter(
      (e) => new Date(e.date).toDateString() === todayStr
    ),
    upcoming: formatted,
    byInterest: interest.length
      ? formatted.filter((e) =>
          e.tags?.some((tag) =>
            interest.some((i) => tag.toLowerCase().includes(i.toLowerCase()))
          )
        )
      : [],
  };
}
