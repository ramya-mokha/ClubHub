import {
  Upload,
  Plus,
  ClipboardEdit,
  Building2,
  CalendarClock,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getUserById, getClubById } from "@/firebase/collections";
import { auth } from "@/firebase/firebase";

const compressImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.6)); // 0.6 quality for aggressive compression
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const buildDateTime = (date, time) =>
  date && time ? new Date(`${date}T${time}`) : null;

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (date, time) => {
  const d = new Date(`${date}T${time}`);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const CATEGORY_OPTIONS = [
    "Hackathon",
    "Workshop",
    "Seminar",
    "Club",
    "Music",
    "Tech",
    "Art",
    "Sports",
  ];

  // Update your useForm configuration
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange", // This should trigger validation on change
    defaultValues: {
      title: "",
      attendees: "",
      categories: [],
      description: "",
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

  // Create watched variable BEFORE using it in useEffect
  const watched = watch();
  const selectedCategories = watch("categories") || [];

  // Debug useEffect - MOVED AFTER watched is declared
  useEffect(() => {
    console.log("Form validity:", isValid);
    console.log("Current form values:", watched);
  }, [isValid, watched]);

  // Also check errors
  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);

  /* ---------------- RESTORE LOCAL DRAFT ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("eventDraft");
    if (!saved) return;

    const data = JSON.parse(saved);
    Object.entries(data).forEach(([key, value]) => {
      setValue(key, value);
    });
  }, [setValue]);

  /* ---------------- AUTOSAVE LOCAL DRAFT ---------------- */
  useEffect(() => {
    localStorage.setItem("eventDraft", JSON.stringify(watched));
  }, [watched]);

  const onSubmit = async (formData) => {
    console.log("🎯 SUBMIT CLICKED");
    console.log("Form data:", formData);
    console.log("Is valid?", isValid);

    // Add validation check
    const requiredFields = [
      "title",
      "attendees",
      "description",
      "venue",
      "college",
      "area",
      "startDate",
      "startTime",
      "endDate",
      "endTime",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      alert(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (!formData.categories || formData.categories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    try {
      const startDateTime = buildDateTime(
        formData.startDate,
        formData.startTime
      );
      let endDateTime = buildDateTime(formData.endDate, formData.endTime);

      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const user = auth.currentUser;
      if (!user) {
        alert("User not logged in");
        return;
      }

      // 🔐 check auth + approval
      const userDoc = await getUserById(user.uid);
      if (!userDoc || userDoc.role !== "CLUB" || userDoc.isApproved !== true) {
        alert("Only approved club accounts can create events");
        return;
      }

      // 🏫 fetch club profile
      const club = await getClubById(user.uid);
      if (!club) {
        alert("Club profile not found. Contact admin.");
        return;
      }

      const eventTypeThemeMap = {
        Workshop: "yellow",
        Seminar: "blue",
        Club: "green",
        Music: "red",
        Tech: "blue",
        Art: "yellow",
        Sports: "green",
        Hackathon: "yellow",
      };
      // 🖼 Process cover image (if provided) -> Base64 string to bypass Firebase Storage
      let imageURL = "https://picsum.photos/seed/event/600/400"; // fallback

      if (formData.coverImage && formData.coverImage[0]) {
        try {
          imageURL = await compressImageToBase64(formData.coverImage[0]);
        } catch (e) {
          console.error("Image compression failed", e);
        }
      }

      const payload = {
        clubId: user.uid, // ✅ auth uid
        clubName: club.clubName, // ✅ from clubs collection
        head: club.presidentName, // ✅ correct field

        title: formData.title,
        description: formData.description,
        highlights: formData.highlights.filter(Boolean),

        image: imageURL,

        location: {
          venue: formData.venue,
          college: formData.college,
          area: formData.area,
        },

        attendees: Number(formData.attendees), // Ensure it's a number
        date: formatDate(formData.startDate),

        startDateTime,
        endDateTime,

        time: {
          start: formatTime(formData.startDate, formData.startTime),
          end: formatTime(formData.endDate, formData.endTime),
        },

        registeredUsers: [],
        status: "upcoming",
        analytics: {
          views: 0,
          clicks: 0,
          registrations: 0,
        },

        categories: formData.categories,
        type: formData.categories[0],
        theme: eventTypeThemeMap[formData.categories[0]] || "green",

        feedbackFormLink: formData.feedbackFormLink || "",
        createdAt: serverTimestamp(),
      };
      console.log("WRITING EVENT...");
      await addDoc(collection(db, "events"), payload);
      console.log("WRITE SUCCESS");
      localStorage.removeItem("eventDraft");
      alert("✅ Event published successfully");
      navigate(-1);
    } catch (err) {
      console.error("🔥 FIRESTORE ERROR:", err);
      console.error("Create event failed:", err);
      alert("Failed to publish event. Check console.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-[#f8f9fa]">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 border-b z-40 shadow-sm top-0 sticky">
        <button type="button" className="" onClick={handleBack}>
          ← Back
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("eventDraft");
              navigate(-1);
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-event-form"
            disabled={!isValid}
            className={`flex gap-2 px-4 py-2 rounded ${
              isValid
                ? "bg-green-500 text-white "
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Upload /> Publish
          </button>
          {/* Debug button */}
          <button
            type="button"
            onClick={() => {
              console.log("Current form values:", watched);
              console.log("Form errors:", errors);
              console.log("Is valid?", isValid);
              console.log("Selected categories:", selectedCategories);
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded "
          >
            Debug
          </button>
        </div>
      </div>

      <form
        id="create-event-form"
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto p-6 space-y-6 bg-[#f8f9fa]"
      >
        <h1 className="text-[24px]">Create a New Event</h1>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left */}
          <div className="md:col-span-2 bg-white border-2 rounded-lg p-5 space-y-4">
            <div className="flex gap-2 items-center">
              <ClipboardEdit className="text-green-500"></ClipboardEdit>
              <h3 className="font-semibold text-[24px]">Event Details</h3>
            </div>

            <label className="font-light text-[16px]">
              EVENT TITLE <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", {
                required: "Event title is required",
                minLength: { value: 5, message: "Minimum 5 characters" },
              })}
              placeholder="Eg, Annual Tech Fest 2025"
              className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] text-[16px] placeholder:font-light ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}

            <label className="font-light text-[16px]">
              MAX ATTENDEES <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register("attendees", {
                required: "Required",
                valueAsNumber: true,
                min: { value: 1, message: "Minimum 1 attendee" },
                max: { value: 10000, message: "Maximum 10000 attendees" },
              })}
              placeholder="Eg, 200"
              className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] text-[16px] placeholder:font-light ${
                errors.attendees ? "border-red-500" : ""
              }`}
            />
            {errors.attendees && (
              <p className="text-red-500 text-sm mt-1">
                {errors.attendees.message}
              </p>
            )}

            <label className="font-light text-[16px]">
              CATEGORIES <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {/* Dropdown Trigger */}
              <div
                onClick={() => setOpen(!open)}
                className="
                  w-full border px-3 py-2 rounded bg-[#f8f9fa]
                  cursor-pointer flex justify-between items-center
                "
              >
                <span className="text-gray-500">
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : "Select categories"}
                </span>
                <span>▾</span>
              </div>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-sm max-h-48 overflow-y-auto">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...selectedCategories, cat]
                            : selectedCategories.filter((c) => c !== cat);
                          setValue("categories", newCategories, {
                            shouldValidate: true,
                          });
                        }}
                        className="accent-green-500"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categories.message}
              </p>
            )}
            {selectedCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <label className="font-light text-[16px]">
              DESCRIPTION <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: { value: 50, message: "Minimum 50 characters" },
              })}
              placeholder="Describe the event agenda, prerequisites and goals..."
              className={`w-full border px-3 py-2 rounded min-h-[100px] bg-[#f8f9fa] text-[16px] placeholder:font-light ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}

            {/* Highlights */}
            <div>
              <p className="text-[16px] font-light mb-2">HIGHLIGHTS</p>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input
                    {...register(`highlights.${index}`)}
                    className="w-full border px-3 py-2 rounded bg-[#f8f9fa]"
                    placeholder="Event highlight"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append("")}
                className="text-sm text-green-600"
              >
                + Add highlight
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Location */}
            <div className="bg-white border rounded-lg p-5 space-y-3">
              <div className="flex gap-2">
                <Building2 className="text-green-500"></Building2>
                <h3 className="font-semibold">Location</h3>
              </div>
              <label className="font-light text-[16px]">
                VENUE <span className="text-red-500">*</span>
              </label>
              <input
                {...register("venue", { required: "Venue is required" })}
                placeholder="Eg, Newton Hall"
                className={`w-full text-[16px] placeholder:font-ligjt border px-3 py-2 rounded bg-[#f8f9fa] ${
                  errors.venue ? "border-red-500" : ""
                }`}
              />
              {errors.venue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.venue.message}
                </p>
              )}

              <label className="font-light text-[16px]">
                COLLEGE <span className="text-red-500">*</span>
              </label>
              <input
                {...register("college", { required: "College is required" })}
                placeholder="Eg, VIT-AP"
                className={`w-full border px-3 py-2 text-[16px] font-light rounded bg-[#f8f9fa] ${
                  errors.college ? "border-red-500" : ""
                }`}
              />
              {errors.college && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.college.message}
                </p>
              )}

              <label className="font-light text-[16px]">
                AREA <span className="text-red-500">*</span>
              </label>
              <input
                {...register("area", { required: "Area is required" })}
                placeholder="Near Secretery, Amaravathi"
                className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] text-[16px] font-light ${
                  errors.area ? "border-red-500" : ""
                }`}
              />
              {errors.area && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.area.message}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="bg-white border rounded-lg p-5 space-y-3">
              <div className="flex gap-2 items-center">
                <CalendarClock className="text-green-500"></CalendarClock>
                <h3 className="font-semibold">Time</h3>
              </div>

              <label className="font-light text-[16px]">
                START TIME <span className="text-red-500">*</span>
              </label>

              {/* START DATE - FIXED */}
              <input
                type="date"
                {...register("startDate", {
                  required: "Start date is required",
                })}
                className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] ${
                  errors.startDate
                    ? "border-red-500 text-gray-900"
                    : "text-gray-900"
                }`}
                onChange={(e) => {
                  // Update the value in form state
                  setValue("startDate", e.target.value, {
                    shouldValidate: true,
                  });
                  // Remove gray styling
                  e.target.classList.remove("text-gray-400", "font-light");
                  e.target.classList.add("text-gray-900", "font-normal");
                }}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startDate.message}
                </p>
              )}

              {/* START TIME - FIXED */}
              <input
                type="time"
                {...register("startTime", {
                  required: "Start time is required",
                })}
                className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] ${
                  errors.startTime
                    ? "border-red-500 text-gray-900"
                    : "text-gray-900"
                }`}
                onChange={(e) => {
                  // Update the value in form state
                  setValue("startTime", e.target.value, {
                    shouldValidate: true,
                  });
                  // Remove gray styling
                  e.target.classList.remove("text-gray-400", "font-light");
                  e.target.classList.add("text-gray-900", "font-normal");
                }}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startTime.message}
                </p>
              )}

              <label className="font-light text-[16px]">
                END TIME <span className="text-red-500">*</span>
              </label>

              {/* END DATE - FIXED */}
              <input
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] ${
                  errors.endDate
                    ? "border-red-500 text-gray-900"
                    : "text-gray-900"
                }`}
                onChange={(e) => {
                  // Update the value in form state
                  setValue("endDate", e.target.value, { shouldValidate: true });
                  // Remove gray styling
                  e.target.classList.remove("text-gray-400", "font-light");
                  e.target.classList.add("text-gray-900", "font-normal");
                }}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.endDate.message}
                </p>
              )}

              {/* END TIME - FIXED */}
              <input
                type="time"
                {...register("endTime", { required: "End time is required" })}
                className={`w-full border px-3 py-2 rounded bg-[#f8f9fa] ${
                  errors.endTime
                    ? "border-red-500 text-gray-900"
                    : "text-gray-900"
                }`}
                onChange={(e) => {
                  // Update the value in form state
                  setValue("endTime", e.target.value, { shouldValidate: true });
                  // Remove gray styling
                  e.target.classList.remove("text-gray-400", "font-light");
                  e.target.classList.add("text-gray-900", "font-normal");
                }}
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.endTime.message}
                </p>
              )}
            </div>

            {/* Upload */}
            <input
              type="file"
              {...register("coverImage")}
              id="coverImage"
              className="hidden"
            />
            <label
              htmlFor="coverImage"
              className="bg-white border rounded-lg p-5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Plus className="text-green-500" size={40} />
                  <p className="text-gray-500">Upload Cover Image</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-medium text-[24px] mb-2">Feedback Form</h3>
          <p className="font-light mb-2">
            You definitely wanna hear back from the attendees, add the iframe of
            google form here
          </p>
          <input
            {...register("feedbackFormLink")}
            placeholder="Google Form link"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </form>
    </div>
  );
}
