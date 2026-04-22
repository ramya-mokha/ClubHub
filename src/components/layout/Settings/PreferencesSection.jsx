import { useState, useEffect } from "react";
import AcademicScheduleSection from "./AcademicScheduleSection";

const ALL_INTERESTS = [
  "Workshop",
  "Seminar",
  "Club",
  "Music",
  "Tech",
  "Art",
  "Sports",
  "Coding",
];

const PreferencesSection = ({ student, onUpdate, refetchStudent }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [timetableImage, setTimetableImage] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle"); // 👈 key state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isBusy = uploadStage === "uploading" || uploadStage === "extracting";

  // Load from Firestore
  useEffect(() => {
    if (!student) return;

    setSelectedInterests(student.preferences?.interests || []);

    const url = student.preferences?.academicScheduleURL;
    if (url && !url.startsWith("blob:")) {
      setTimetableImage(url);
    }
  }, [student]);

  // 🔄 Reload after timetable fully done
  useEffect(() => {
    if (uploadStage === "done") {
      refetchStudent(); // ⬅️ fresh Firestore data
      setUploadStage("idle");
    }
  }, [uploadStage, refetchStudent]);

  const handleToggle = (interest) => {
    if (!isEditing || isBusy) return;

    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (isSaving || isBusy) return;

    setIsSaving(true);

    try {
      await onUpdate({
        "preferences.interests": selectedInterests,
      });

      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimetableSaved = async (url, { preview }) => {
    setTimetableImage(url);

    if (preview) return;

    await onUpdate({
      "preferences.academicScheduleURL": url,
    });
  };

  if (!student) return null;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 50 50" fill="none">
            <path
              d="M22.9167 43.75V31.25H27.0833V35.4167H43.75V39.5833H27.0833V43.75H22.9167ZM6.25 39.5833V35.4167H18.75V39.5833H6.25ZM14.5833 31.25V27.0833H6.25V22.9167H14.5833V18.75H18.75V31.25H14.5833ZM22.9167 27.0833V22.9167H43.75V27.0833H22.9167ZM31.25 18.75V6.25H35.4167V10.4167H43.75V14.5833H35.4167V18.75H31.25ZM6.25 14.5833V10.4167H27.0833V14.5833H6.25Z"
              fill="#4285F4"
            />
          </svg>
          <h2 className="text-[26px]">Preferences</h2>
        </div>

        <div className="bg-white px-5 pl-10 py-10 rounded-md border flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[22px] font-medium">Your Interests</h3>
              <p className="text-gray-600 text-sm">
                Select topics to personalize recommendations
              </p>
            </div>

            <div className="flex items-center justify-end">
              {!isEditing ? (
                <button
                  className="cursor-pointer border px-4 py-2 rounded-sm flex gap-2 items-center
                 text-blue-600 disabled:opacity-50"
                  onClick={() => setIsEditing(true)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
                  <span className="text-sm">Edit</span>
                </button>
              ) : (
                <button
                  className="cursor-pointer border px-4 py-2 rounded-sm flex gap-2 items-center
                 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-green-600">Saving…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px] text-green-600">
                        save
                      </span>
                      <span className="text-sm text-green-600">Save</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  disabled={!isEditing || isBusy}
                  onClick={() => handleToggle(interest)}
                  className={`px-3 py-1 rounded-full text-sm border
                    ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          {/* Academic Schedule */}
          <AcademicScheduleSection
            timetableImage={timetableImage}
            isEditing={isEditing}
            uploadStage={uploadStage}
            setUploadStage={setUploadStage}
            onTimetableSaved={handleTimetableSaved}
            onPreviewClick={() => setPreviewOpen(true)}
          />
        </div>
      </div>
      {/* Preview */}
      {previewOpen && timetableImage && (
        <div className="fixed inset-0 z-50 mb-0">
          {/* Backdrop */}
          <div
            className="absolute inset-0 h-full backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          />

          {/* Modal */}
          <div className="relative flex items-center justify-center  min-h-screen p-4">
            <div className="relative w-full max-w-6xl bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    Academic Schedule
                  </h3>
                  <p className="text-xs text-gray-700">
                    Your uploaded timetable
                  </p>
                </div>

                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              {/* Image Viewer */}
              <div
                className="relative bg-gray-50 flex items-center justify-center
                        min-h-[60vh] max-h-[70vh] overflow-auto"
              >
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Loading preview…</p>
                    </div>
                  </div>
                )}

                <img
                  src={timetableImage}
                  alt="Academic Schedule"
                  onLoad={() => setImageLoaded(true)}
                  className="transition-transform duration-200 origin-center"
                  style={{
                    transform: `scale(${zoom})`,
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
                    className="px-3 py-2 bg-white/10 text-gray-700 rounded-lg hover:bg-white/50"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="px-3 py-2 bg-white/10 text-gray-700 rounded-lg hover:bg-white/50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
                    className="px-3 py-2 bg-white/10 text-gray-700 rounded-lg hover:bg-white/50"
                  >
                    −
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex flex-wrap justify-between gap-4">
                <p className="text-sm text-gray-400">
                  Scroll to navigate • Zoom for clarity
                </p>

                <div className="flex gap-3">
                  <a
                    href={timetableImage}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Open in new tab
                  </a>

                  <a
                    href={timetableImage}
                    download
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreferencesSection;
