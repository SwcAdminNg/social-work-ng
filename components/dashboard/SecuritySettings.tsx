"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Mail } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import { TwoFactorSetup } from "@/components/dashboard/security/TwoFactorSetup";

type TwoFactorStatus = {
  two_factor_enabled?: boolean;
  two_factor_method?: "EMAIL" | "TOTP" | null;
};

export function SecuritySettings() {
  const queryClient = useQueryClient();
  const [switching, setSwitching] = useState(false);

  const fetchStatus = async (): Promise<TwoFactorStatus> => {
    const res = await fetch("/api/proxy/auth/2fa/status");
    if (!res.ok) {
      throw new Error("Failed to load security settings.");
    }
    const data = await res.json();
    return data.data;
  };

  const { data: status, isPending: loading } = useQuery({
    queryKey: ["two-factor-status"],
    queryFn: fetchStatus,
    staleTime: 60 * 1000,
  });

  const handleSwitched = (result: TwoFactorStatus) => {
    setSwitching(false);
    queryClient.setQueryData(["two-factor-status"], result);
    toast.success(
      `Two-factor authentication is now set to ${result.two_factor_method === "TOTP" ? "authenticator app" : "email"}.`,
    );
  };

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <IconSpinner className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  const totp = status?.two_factor_method === "TOTP";

  return (
    <section className="lms-settings-section" aria-labelledby="twofactor-head">
      <h2 id="twofactor-head" className="lms-settings-head">Two-Factor Authentication</h2>
      {switching ? (
        <div className="lms-group p-4 sm:p-6">
          <TwoFactorSetup
            api={{ kind: "authenticated" }}
            title="Switch your verification method"
            description="Changes take effect immediately, without needing to sign in again."
            currentMethod={status?.two_factor_method}
            onBack={() => setSwitching(false)}
            onComplete={(result) => handleSwitched(result)}
          />
        </div>
      ) : (
        <div className="lms-group">
          <div className="lms-form-row !gap-3">
            <span className={`lms-sym ${totp ? "lms-sym--indigo" : "lms-sym--blue"}`}>
              {totp ? <Smartphone className="h-[18px] w-[18px]" aria-hidden="true" /> : <Mail className="h-[18px] w-[18px]" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[0.92rem] font-medium text-ink">{totp ? "Authenticator app" : "Email code"}</p>
              <p className="m-0 text-[0.78rem] text-ink-3">
                {totp ? "Codes come from your authenticator app." : "A code is emailed to you each time you sign in."}
              </p>
            </div>
            <button type="button" onClick={() => setSwitching(true)} className="lms-text-btn flex-none !font-semibold">
              Change
            </button>
          </div>
        </div>
      )}
      <div className="lms-settings-foot">
        <p className="m-0">Every account uses two-factor authentication, so a password alone is never enough to sign in.</p>
      </div>
    </section>
  );
}
