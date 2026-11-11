import { ProfileSettings } from "@/components/dashboard/ProfileSettings";
import { SecuritySettings } from "@/components/dashboard/SecuritySettings";
import { PasskeySettings } from "@/components/dashboard/PasskeySettings";

export const metadata = {
  title: "Settings | Social Work Consultancy Ltd",
  description: "Manage your profile and account settings.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 pb-12">
      <ProfileSettings />
      <div className="flex flex-col gap-8">
        <p className="m-0 -mb-4 px-1 text-[1.25rem] font-bold tracking-[-0.02em] text-ink">Sign-In &amp; Security</p>
        <PasskeySettings />
        <SecuritySettings />
      </div>
    </div>
  );
}
