import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { SecuritySettings } from "@/components/dashboard/SecuritySettings";
import { PasskeySettings } from "@/components/dashboard/PasskeySettings";

export const metadata = {
  title: "Settings | Social Work Consultancy Ltd",
  description: "Manage your profile and account settings.",
};

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-0 space-y-10">
      <ProfileSettings />
      <PasskeySettings />
      <SecuritySettings />
    </div>
  );
}
