import {
  Upload,
  ClipboardEdit,
  Building2,
  CalendarClock,
  ArrowLeft,
  Plus,
  X,
  Users,
  MapPin,
  Link as LinkIcon,
  Star,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getEventById, getUserById } from "@/firebase/collections";
import { auth } from "@/firebase/firebase";

const buildDateTime = (date, time) =>
  date && time ? new Date(`${date}T${time}`) : null;

const toDateInput = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toISOString().split("T")[0];
};

const toTimeInput = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toISOString().slice(11, 16);
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (date, time) => {
  if (!date || !time) return "";
  const d = new Date(`${date}T${time}`);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function EditEventPage() {
  const { id } = useParams(); // eventId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isValid, errors },
  } = useForm({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      title: "",
      description: "",
      attendees: "",
      venue: "",
      college: "",
      area: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      highlights: [""],
      feedbackFormLink: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "highlights",
  });

  /* ---------------- FETCH EVENT ---------------- */
  useEffect(() => {
    const loadEvent = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const event = await getEventById(id);
        if (!event) {
          alert("Event not found");
          navigate(-1);
          return;
        }

        // 🔐 ownership check
        const user = auth.currentUser;
        const userDoc = await getUserById(user.uid);
        if (event.clubId !== user.uid || userDoc.role !== "CLUB") {
          alert("Unauthorized");
          navigate(-1);
          return;
        }
        reset(
          {
            title: event.title,
            description: event.description,
            attendees: event.attendees,
            venue: event.location.venue,
            college: event.location.college,
            area: event.location.area,
            startDate: toDateInput(event.startDateTime),
            startTime: toTimeInput(event.startDateTime),
            endDate: toDateInput(event.endDateTime),
            endTime: toTimeInput(event.endDateTime),
            highlights: event.highlights?.length ? event.highlights : [""],
            feedbackFormLink: event.feedbackFormLink || "",
          },
          {
            keepDirty: false,
            keepTouched: false,
          }
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load event");
      }
    };

    loadEvent();
  }, [id, navigate, reset]);

  /* ---------------- UPDATE EVENT ---------------- */
  const onSubmit = async (data) => {
    try {
      const startDateTime = buildDateTime(data.startDate, data.startTime);
      let endDateTime = buildDateTime(data.endDate, data.endTime);

      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const payload = {
        title: data.title,
        description: data.description,
        highlights: data.highlights.filter(Boolean),
        attendees: Number(data.attendees),
        location: {
          venue: data.venue,
          college: data.college,
          area: data.area,
        },
        date: formatDate(data.startDate),
        time: {
          start: formatTime(data.startDate, data.startTime),
          end: formatTime(data.endDate, data.endTime),
        },
        startDateTime,
        endDateTime,
        feedbackFormLink: data.feedbackFormLink || "",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "events", id), payload);
      alert("✅ Event updated successfully");
      navigate(-1);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update event");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* HEADER - Google Material Design Inspired */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-event-form"
                disabled={!isValid}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  isValid
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Upload className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <form
        id="edit-event-form"
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        {/* Main Card Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClipboardEdit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Event
                </h2>
                <p className="text-sm text-gray-500">
                  Update your event details
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-8">
            {/* Event Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Event Title *
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                placeholder="Enter event title"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Describe your event in detail"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 min-h-[140px] ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Attendees */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  Max Attendees *
                </label>
                <input
                  type="number"
                  {...register("attendees", {
                    required: "Number of attendees is required",
                    min: { value: 1, message: "Minimum 1 attendee" },
                  })}
                  placeholder="e.g., 100"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${
                    errors.attendees ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.attendees && (
                  <p className="text-sm text-red-600">
                    {errors.attendees.message}
                  </p>
                )}
              </div>

              {/* Feedback Form Link */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  Feedback Form Link
                </label>
                <input
                  {...register("feedbackFormLink")}
                  type="url"
                  placeholder="https://forms.google.com/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Event Highlights */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Highlights
                </label>
                <span className="text-sm text-gray-500">Optional</span>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        {...register(`highlights.${index}`)}
                        placeholder={`Highlight ${index + 1}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append("")}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Highlight
              </button>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">
                  Location Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Venue
                  </label>
                  <input
                    {...register("venue")}
                    placeholder="Conference Hall"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    College
                  </label>
                  <input
                    {...register("college")}
                    placeholder="College name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Area
                  </label>
                  <input
                    {...register("area")}
                    placeholder="City or region"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">
                  Date & Time
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date & Time */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Date</label>
                        <input
                          type="date"
                          {...register("startDate", {
                            required: "Start date is required",
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${
                            errors.startDate
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Time</label>
                        <input
                          type="time"
                          {...register("startTime", {
                            required: "Start time is required",
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${
                            errors.startTime
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                    {(errors.startDate || errors.startTime) && (
                      <p className="text-sm text-red-600 mt-2">
                        {errors.startDate?.message || errors.startTime?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Date</label>
                        <input
                          type="date"
                          {...register("endDate", {
                            required: "End date is required",
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${
                            errors.endDate
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Time</label>
                        <input
                          type="time"
                          {...register("endTime", {
                            required: "End time is required",
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 ${
                            errors.endTime
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                    {(errors.endDate || errors.endTime) && (
                      <p className="text-sm text-red-600 mt-2">
                        {errors.endDate?.message || errors.endTime?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Fields marked with * are required
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  form="edit-event-form"
                  disabled={!isValid}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    isValid
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Update Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
