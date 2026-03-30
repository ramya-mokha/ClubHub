import { useState, useRef, useEffect } from "react";
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
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
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

const ProfileInfoSection = ({ student, onUpdate }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // 🔹 Sync Firestore → UI
  useEffect(() => {
    if (!student) return;

    setFormData({
      fullName: student.profile.displayName || "",
      email: student.profile.email || "",
      phone: student.phone || "",
      avatar:
        student.avatar ||
        "https://api.dicebear.com/7.x/fun-emoji/svg?seed=User",
    });
  }, [student]);

  // 🔹 Image picker
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 🔹 Local image preview (upload later)
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const imageUrl = await compressImageToBase64(file);
      setFormData((prev) => ({
        ...prev,
        avatar: imageUrl,
      }));

      await onUpdate({ avatar: imageUrl });
    } catch (err) {
      console.error("Avatar compression failed", err);
    }
  };

  // 🔹 Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save → parent → Firestore
  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      await onUpdate({
        fullName: formData.fullName,
        phone: formData.phone,
        avatar: formData.avatar,
      });

      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!student) {
    return <div>Loading profile...</div>;
  }
  return (
    <div className=" space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-blue-500"
          style={{ fontSize: "32px" }}
        >
          person_edit
        </span>
        <h1 className="text-[26px]">Profile Info</h1>
      </div>
      <div className="bg-white p-5 rounded-md border flex flex-col">
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

        {/* Fields */}
        <div className="flex gap-5 md:flex-row md:items-center px-7 py-5 flex-col">
          <div className="relative p-2">
            <img
              src={
                formData.avatar ||
                "https://api.dicebear.com/7.x/fun-emoji/svg?seed=User"
              }
              alt="avatar"
              className="w-50 h-50 rounded-full bg-blue-100 relative"
            />
            {isEditing && (
              <div>
                <input
                  type="file"
                  className="hidden"
                  id="profileImg"
                  ref={fileInputRef}
                  onChange={handleProfileChange}
                  accept="image/*"
                />
                <span
                  className="material-symbols-outlined p-2 bg-blue-100 text-blue-500 rounded-full absolute top-37 right-2"
                  onClick={handleImageClick}
                >
                  photo_camera
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:gap-5 gap-2 w-[70%]">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-500">Display Name</label>
              {isEditing ? (
                <div className=" border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="outline-none w-full"
                  />
                </div>
              ) : (
                <p className="border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                  {student.fullName}
                </p>
              )}
            </div>

            <div className="flex md:gap-10 flex-col md:flex-row sm:gap-5 w-full">
              <div className="w-full">
                <label className="text-sm text-gray-500">Email Address</label>
                {isEditing ? (
                  <div className="w-full border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="outline-none w-full"
                    />
                  </div>
                ) : (
                  <p className="border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                    {student.profile.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="w-full">
                <label className="text-sm text-gray-500">Phone Number</label>
                {isEditing ? (
                  <div className="w-full border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full outline-none"
                    />
                  </div>
                ) : (
                  <p className="border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                    {student.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoSection;
