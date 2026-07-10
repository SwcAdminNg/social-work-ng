"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { IconSpinner, IconCheck } from "@/components/auth/shared/icons";
import {
  Save,
  UserCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileSettings() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);

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

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/proxy/users/me");
      if (res.ok) {
        const data = await res.json();
        const user = data.data;
        if (user) {
          setFirstName(user.first_name || "");
          setLastName(user.last_name || "");
          setPhoneNumber(user.phone_number || "");
          setAddress(user.address || "");
          setGender(user.gender || "");
          setCurrentUsername(user.username || "");
          setNewUsername(user.username || "");
        }
      }
    } catch (error) {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Username Availability Checker (Debounced)
  useEffect(() => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (newUsername === currentUsername) {
      setUsernameAvailable(null); // It's their current username, no need to show available/taken
      return;
    }

    setCheckingUsername(true);
    const delayDebounceFn = setTimeout(async () => {
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
      } catch (e) {
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
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
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
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update username.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSavingUsername(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <IconSpinner className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Left Column: General Info */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-sm text-gray-500">
                Update your billing and personal details.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm transition-all focus:bg-white dark:focus:bg-gray-800 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                  placeholder="e.g. John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm transition-all focus:bg-white dark:focus:bg-gray-800 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm transition-all focus:bg-white dark:focus:bg-gray-800 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none"
                  placeholder="e.g. 09012345678"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm transition-all focus:bg-white dark:focus:bg-gray-800 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none appearance-none"
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Home Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm transition-all focus:bg-white dark:focus:bg-gray-800 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none resize-none"
                placeholder="Enter your full address"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-6 text-sm font-semibold text-white transition-all hover:bg-[#1B4332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#2D6A4F]/20"
              >
                {savingProfile ? (
                  <IconSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Username & Critical Settings */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Username
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Your unique identifier on the platform. It must be at least 3
              characters long.
            </p>

            <div className="space-y-4">
              <div className="space-y-2 relative">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400 font-medium select-none pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) =>
                      setNewUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    className={`w-full rounded-xl border bg-white dark:bg-gray-900 py-3 pl-9 pr-12 text-sm transition-all focus:outline-none focus:ring-2 outline-none font-medium ${
                      usernameAvailable === true
                        ? "border-green-500 focus:ring-green-500/20"
                        : usernameAvailable === false
                          ? "border-red-500 focus:ring-red-500/20 text-red-600"
                          : "border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                    placeholder="username"
                  />
                  <div className="absolute right-4 flex items-center justify-center">
                    {checkingUsername ? (
                      <IconSpinner className="w-4 h-4 text-indigo-500 animate-spin" />
                    ) : usernameAvailable === true ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                </div>

                {usernameAvailable === true && (
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 px-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Username is available!
                  </p>
                )}
                {usernameAvailable === false && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 px-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                    <XCircle className="w-3.5 h-3.5" />
                    This username is already taken.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleUpdateUsername}
                disabled={
                  savingUsername ||
                  newUsername === currentUsername ||
                  usernameAvailable === false ||
                  newUsername.length < 3
                }
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
              >
                {savingUsername ? (
                  <IconSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  "Claim Username"
                )}
              </button>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-400 mb-1">
                  Important Note
                </h3>
                <p className="text-xs text-orange-800/80 dark:text-orange-300/80 leading-relaxed">
                  Changing your username will alter your public profile URL. Any
                  old links pointing to your profile will break.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
