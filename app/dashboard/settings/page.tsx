import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { SecuritySettings } from "@/components/dashboard/SecuritySettings";

export const metadata = {
  title: "Settings | Social Work Nigeria",
  description: "Manage your profile and account settings.",
};

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-0 space-y-10">
      <ProfileSettings />
      <SecuritySettings />
    </div>
  );
}
