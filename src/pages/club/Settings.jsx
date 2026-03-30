import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { getClubById } from "@/firebase/collections";

import HeaderSection from "@/components/layout/Settings/HeaderSection";
import ProfileInfo from "@/components/layout/SettingsC/ProfileInfo";
import PreferencesSection from "@/components/layout/SettingsC/Preferences";
import HiringManagementSection from "@/components/layout/SettingsC/HiringManagementSection";
import DangerZoneSection from "@/components/layout/Settings/DangerZoneSection";

const Settings = () => {
  const [club, setClub] = useState(null);

  useEffect(() => {
    const fetchClub = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const clubData = await getClubById(user.uid);
      setClub(clubData);
    };

    fetchClub();
  }, []);

  return (
    <div className="bg-gray-50 min-w-fit">
      <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50">
        <HeaderSection />
        <ProfileInfo />
        <PreferencesSection />

        {/* ✅ Now club exists */}
        <HiringManagementSection club={club} />

        <DangerZoneSection />
      </div>
    </div>
  );
};

export default Settings;

