import { useState, useEffect, useRef } from "react";
import InputField from "./InputField";
import { auth } from "@/firebase/firebase";
import { getClubById, updateClub } from "@/firebase/collections";

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
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const ProfileInfo = () => {
  const [club, setClub] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    clubName: "",
    clubHeadName: "",
    email: "",
    sinceYear: "",
    about: "",
    website: "",
    instagram: "",
    linkedin: "",
    avatar: "",
  });

  /* 🔹 Fetch club once */
  useEffect(() => {
    const fetchClub = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const data = await getClubById(user.uid);
      if (!data) return;

      setClub(data);
      setFormData({
        clubName: data.clubName || "",
        clubHeadName: data.presidentName || "",
        email: data.email || "",
        sinceYear: data.sinceYear || "",
        about: data.about || "",
        website: data.website || "",
        instagram: data.instagram || "",
        linkedin: data.linkedin || "",
        avatar:
          data.avatar || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=User",
      });
    };

    fetchClub();
  }, []);

  /* 🔹 Image preview */
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

      // Await any external update logic if present, though it doesn't seem defined locally
      if (typeof onUpdate === "function") {
        await onUpdate({ avatar: imageUrl });
      }
    } catch (err) {
      console.error("Avatar compression failed", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* 🔹 Save to Firestore */
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateClub(user.uid, {
      clubName: formData.clubName,
      presidentName: formData.clubHeadName,
      email: formData.email,
      sinceYear: formData.sinceYear,
      about: formData.about,
      website: formData.website,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      avatar: formData.avatar,
    });

    setClub((prev) => ({ ...prev, ...formData }));
    setIsEditing(false);
  };

  if (!club) return <div>Loading profile...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-green-500 text-[34px]">
          person_edit
        </span>
        <h2 className="text-[24px]">Profile Info</h2>
      </div>
      <div className="bg-white p-10 rounded-md border flex flex-col">
        <div className="self-end">
          {!isEditing ? (
            <button
              className="border px-4 py-2 rounded-sm flex gap-2 text-green-600 text-sm cursor-pointer items-center"
              onClick={() => setIsEditing(true)}
            >
              <span className="material-symbols-outlined">edit</span>
              Edit
            </button>
          ) : (
            <button
              className="border px-4 py-2 rounded-sm flex gap-2 text-blue-600 text-sm cursor-pointer items-center"
              onClick={handleSave}
            >
              <span className="material-symbols-outlined">save</span>
              Save
            </button>
          )}
        </div>

        <div className="flex gap-5">
          {/* Avatar */}
          <div className="relative w-44 h-44 shrink-0">
            <img
              src={formData.avatar}
              alt="avatar"
              className="w-44 h-44 rounded-full object-cover bg-gray-100"
            />

            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleProfileChange}
                  accept="image/*"
                />
                <span
                  className="material-symbols-outlined p-2 bg-blue-600 text-white rounded-full absolute bottom-1 right-1 cursor-pointer shadow hover:bg-blue-500"
                  onClick={() => fileInputRef.current.click()}
                >
                  photo_camera
                </span>
              </>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Club Name"
                name="clubName"
                value={formData.clubName}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputField
                label="Club Head Name"
                name="clubHeadName"
                value={formData.clubHeadName}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputField
                label="Email Address"
                name="email"
                value={formData.email}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputField
                label="Since Year"
                name="sinceYear"
                value={formData.sinceYear}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>

            {/* About */}
            <div className="mt-5">
              <label className="text-sm text-gray-500">About Club</label>
              {isEditing ? (
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded px-3 py-2 mt-1 bg-[#f8f9fa]"
                />
              ) : (
                <p className="border rounded px-3 py-2 mt-1 bg-[#f8f9fa]">
                  {club.about}
                </p>
              )}
            </div>

            {/* Social */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <InputField
                label="Website"
                name="website"
                value={formData.website}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputField
                label="Instagram"
                name="instagram"
                value={formData.instagram}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InputField
                label="LinkedIn"
                name="linkedin"
                value={formData.linkedin}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
