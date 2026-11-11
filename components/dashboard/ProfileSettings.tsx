"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { IconSpinner } from "@/components/auth/shared/icons";
import {
  Camera,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { PopUpMenu } from "@/components/dashboard/PopUpMenu";

type ProfileUser = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  gender?: string | null;
  username?: string | null;
  profile_picture_url?: string | null;
};

export function ProfileSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { update } = useSession();
  const profilePhotoPrompt = searchParams.has("profile_photo");
  const photoUploadCallbackUrl = searchParams.get("callbackUrl");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [failedProfilePictureUrl, setFailedProfilePictureUrl] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoSectionRef = useRef<HTMLElement>(null);
  const hasScrolledToPhotoPrompt = useRef(false);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");

  // Username State
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );

  const fetchProfile = async (): Promise<ProfileUser> => {
    const res = await fetch("/api/proxy/users/me");
    if (!res.ok) {
      throw new Error("Failed to load profile data.");
    }
    const data = await res.json();
    return data.data;
  };

  const { data: user, isPending: loading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load profile data.");
    }
  }, [isError]);

  useEffect(() => {
    if (loading || !profilePhotoPrompt || hasScrolledToPhotoPrompt.current) {
      return;
    }

    photoSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    hasScrolledToPhotoPrompt.current = true;
  }, [loading, profilePhotoPrompt]);

  useEffect(() => {
    if (user && !hasSynced) {
      const timeout = window.setTimeout(() => {
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setPhoneNumber(user.phone_number || "");
        setAddress(user.address || "");
        setGender(user.gender || "");
        setCurrentUsername(user.username || "");
        setNewUsername(user.username || "");
        setProfilePictureUrl(user.profile_picture_url || null);
        setHasSynced(true);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [user, hasSynced]);

  // Username Availability Checker (Debounced)
  useEffect(() => {
    if (!newUsername || newUsername.length < 3) {
      const timeout = window.setTimeout(() => setUsernameAvailable(null), 0);
      return () => window.clearTimeout(timeout);
    }

    if (newUsername === currentUsername) {
      const timeout = window.setTimeout(() => setUsernameAvailable(null), 0);
      return () => window.clearTimeout(timeout);
    }

    const delayDebounceFn = setTimeout(async () => {
      setCheckingUsername(true);

      try {
        const res = await fetch(
          `/api/proxy/username/availability?username=${encodeURIComponent(newUsername)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setUsernameAvailable(data.data.available);
        } else {
          setUsernameAvailable(null);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [newUsername, currentUsername]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await fetch("/api/proxy/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address: address,
          gender: gender || undefined, // Send undefined if empty so backend ignores or handles it
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername === currentUsername) return;
    if (usernameAvailable === false) {
      toast.error("This username is already taken.");
      return;
    }

    setSavingUsername(true);
    try {
      const res = await fetch("/api/proxy/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
        }),
      });

      if (res.ok) {
        toast.success("Username updated successfully!");
        setCurrentUsername(newUsername);
        setUsernameAvailable(null);
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update username.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    setUploadingPicture(true);

    try {
      const uploadUrlRes = await fetch(
        "/api/proxy/users/me/profile-picture-upload-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            content_type: file.type,
          }),
        },
      );

      const uploadUrlJson = await uploadUrlRes.json().catch(() => ({}));

      if (!uploadUrlRes.ok) {
        throw new Error(
          uploadUrlJson?.message || "Could not prepare your profile picture.",
        );
      }

      const uploadUrl = uploadUrlJson?.data?.upload_url;
      const nextProfilePictureUrl = uploadUrlJson?.data?.profile_picture_url;

      if (!uploadUrl || !nextProfilePictureUrl) {
        throw new Error("Profile picture upload data was incomplete.");
      }

      const storageRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!storageRes.ok) {
        throw new Error("Upload failed. Please try choosing the image again.");
      }

      setProfilePictureUrl(nextProfilePictureUrl);
      queryClient.setQueryData<ProfileUser | undefined>(["profile"], (current) =>
        current
          ? { ...current, profile_picture_url: nextProfilePictureUrl }
          : current,
      );
      await update({ profile_picture_url: nextProfilePictureUrl });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.refresh();
      toast.success("Profile photo updated successfully!");

      if (photoUploadCallbackUrl?.startsWith("/")) {
        router.push(photoUploadCallbackUrl);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.",
      );
    } finally {
      setUploadingPicture(false);
    }
  };

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Learner";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "L";
  const profilePictureImageUrl =
    profilePictureUrl && profilePictureUrl !== failedProfilePictureUrl
      ? profilePictureUrl
      : null;
  const hasProfilePicture = Boolean(profilePictureUrl);

  const profileDirty = Boolean(
    user &&
      (firstName !== (user.first_name || "") ||
        lastName !== (user.last_name || "") ||
        phoneNumber !== (user.phone_number || "") ||
        address !== (user.address || "") ||
        gender !== (user.gender || "")),
  );
  const usernameChanged = newUsername !== currentUsername;
  const genderLabel = GENDERS.find((option) => option.value === gender)?.label;

  if (loading) {
    return (
      <div className="flex h-[360px] items-center justify-center">
        <IconSpinner className="h-7 w-7 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Identity, after the Apple Account header */}
      <section ref={photoSectionRef} aria-label="Profile photo" className="lms-rise flex flex-col items-center pt-2 text-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPicture}
          className="group relative rounded-full"
          aria-label={hasProfilePicture ? "Change profile photo" : "Add profile photo"}
        >
          <span className="lms-rainbow lms-rainbow--lg" style={{ "--ring-bg": "var(--sw-paper)" } as React.CSSProperties}>
            <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-brand text-[2.2rem] font-semibold text-white sm:h-28 sm:w-28">
              {profilePictureImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePictureImageUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedProfilePictureUrl(profilePictureImageUrl)} />
              ) : (
                avatarInitial
              )}
            </span>
          </span>
          <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-card text-ink-2 shadow-[0_0_0_3px_var(--sw-paper),0_2px_6px_rgba(0,0,0,0.2)] transition-colors group-hover:text-ink">
            {uploadingPicture ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </span>
        </button>
        <h1 className="m-0 mt-4 text-[1.7rem] font-semibold tracking-[-0.02em] text-ink sm:text-[2rem]">{displayName}</h1>
        <p className="m-0 mt-0.5 text-[0.95rem] text-ink-3">{user?.email}</p>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPicture} className="lms-text-btn mt-2">
          {uploadingPicture ? "Uploading…" : hasProfilePicture ? "Change Photo" : "Add Photo"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleProfilePictureUpload} />
        {!hasProfilePicture && (
          <p className={`m-0 mt-3 max-w-md rounded-[14px] px-4 py-2.5 text-[0.84rem] leading-relaxed ${profilePhotoPrompt ? "bg-clay-wash text-ink" : "text-ink-3"}`}>
            A clear, professional photo is needed before a certificate can be issued. The photo on your account at that moment is saved into the certificate.
          </p>
        )}
      </section>

      {/* Personal information */}
      <form onSubmit={handleUpdateProfile} className="lms-settings-section">
        <h2 className="lms-settings-head">Personal Information</h2>
        <div className="lms-group">
          <label className="lms-form-row">
            <span className="lms-form-label">First name</span>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="Required" className="lms-form-input" />
          </label>
          <label className="lms-form-row">
            <span className="lms-form-label">Last name</span>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="Required" className="lms-form-input" />
          </label>
          <label className="lms-form-row">
            <span className="lms-form-label">Phone</span>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} autoComplete="tel" placeholder="0901 234 5678" className="lms-form-input" />
          </label>
          <div className="lms-form-row">
            <span className="lms-form-label" id="gender-label">Gender</span>
            <div className="flex flex-1 justify-end">
              <PopUpMenu
                kind="popup"
                ariaLabel="Gender"
                label={<span className={genderLabel ? "" : "text-ink-3"}>{genderLabel ?? "Not set"}</span>}
                items={GENDERS.map((option) => ({ key: option.value, label: option.label, checked: gender === option.value, onSelect: () => setGender(option.value) }))}
              />
            </div>
          </div>
          <label className="lms-form-row !items-start">
            <span className="lms-form-label pt-2.5">Address</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} autoComplete="street-address" placeholder="Home address" className="lms-form-input resize-none py-2.5 leading-snug" />
          </label>
        </div>
        <div className="lms-settings-foot">
          <p className="m-0">Used on receipts and to reach you about your courses.</p>
          <button type="submit" disabled={savingProfile || !profileDirty} className="lms-btn !min-h-9 flex-none !px-4 !text-[0.85rem] disabled:opacity-45">
            {savingProfile && <IconSpinner className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </form>

      {/* Username */}
      <section className="lms-settings-section" aria-labelledby="username-head">
        <h2 id="username-head" className="lms-settings-head">Username</h2>
        <div className="lms-group">
          <label className="lms-form-row">
            <span className="lms-form-label">@</span>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              autoComplete="username"
              spellCheck={false}
              placeholder="username"
              aria-invalid={usernameAvailable === false || undefined}
              aria-describedby="username-status"
              className="lms-form-input font-medium"
            />
            <span className="grid w-6 flex-none place-items-center" aria-hidden="true">
              {checkingUsername ? (
                <IconSpinner className="h-4 w-4 animate-spin text-ink-3" />
              ) : usernameAvailable === true ? (
                <CheckCircle2 className="h-5 w-5 text-[#34c759]" />
              ) : usernameAvailable === false ? (
                <XCircle className="h-5 w-5 text-[#ff3b30]" />
              ) : null}
            </span>
          </label>
        </div>
        <div className="lms-settings-foot">
          <p id="username-status" className="m-0" aria-live="polite">
            {usernameAvailable === true ? (
              <span className="font-medium text-[#1f8a57] dark:text-[#5fd49a]">@{newUsername} is available.</span>
            ) : usernameAvailable === false ? (
              <span className="font-medium text-[#d92d20] dark:text-[#ff6961]">@{newUsername} is already taken.</span>
            ) : newUsername.length > 0 && newUsername.length < 3 ? (
              "Use at least 3 letters, numbers or underscores."
            ) : (
              "Your public name in Community. Changing it changes your profile link, so old links stop working."
            )}
          </p>
          <button
            type="button"
            onClick={handleUpdateUsername}
            disabled={savingUsername || !usernameChanged || usernameAvailable === false || newUsername.length < 3}
            className="lms-btn !min-h-9 flex-none !px-4 !text-[0.85rem] disabled:opacity-45"
          >
            {savingUsername && <IconSpinner className="h-4 w-4 animate-spin" />}
            Update
          </button>
        </div>
      </section>
    </div>
  );
}

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];
