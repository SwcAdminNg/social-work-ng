"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageShell } from "./shared/AuthPageShell";
import { PasswordChecklist, PASSWORD_MIN } from "./shared/PasswordChecklist";
import { FloatingInput } from "./shared/FloatingInput";
import { PhoneField } from "@/components/site/form";
import { phoneProblem } from "@/lib/phone";
import { PasswordToggle } from "./shared/PasswordToggle";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { Check, X } from "lucide-react";
import { AuthAlert, AuthButton, AuthHeader, ChevronLink, LegalNote, Spinner } from "./shared/ui";
import { errorMessage, type SessionData } from "./shared/types";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [loadedSuggestions, setSuggestions] = useState<string[]>([]);
  const suggestions = firstName && lastName ? loadedSuggestions : [];
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [availability, setUsernameAvailable] = useState<boolean | null>(null);
  // Answers from the server only count while they still fit what is typed.
  const usernameAvailable = username.length >= 3 ? availability : null;

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions when first & last name change
  useEffect(() => {
    if (!firstName || !lastName) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/proxy/username/suggestions?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.data?.suggestions) {
          setSuggestions(data.data.suggestions);
          // Fill in the username only if the visitor has not typed one.
          setUsername((current) => current || data.data.suggestions[0]);
        }
      } catch {
        // Suggestions are a convenience; failing to load them should not get in the way.
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [firstName, lastName]);

  // Check username availability when user types
  useEffect(() => {
    if (username.length < 3) return;
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/proxy/username/availability?username=${encodeURIComponent(username)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.data !== undefined) {
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
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!firstName) {
      setFieldErrors({ firstName: "Please enter your first name." });
      return firstNameRef.current?.focus();
    }
    if (!lastName) {
      setFieldErrors({ lastName: "Please enter your last name." });
      return lastNameRef.current?.focus();
    }
    if (!username) {
      setFieldErrors({ username: "Please choose a username." });
      return usernameRef.current?.focus();
    }
    if (usernameAvailable === false) {
      setFieldErrors({ username: "That username is taken. Choose another or pick a suggestion." });
      return usernameRef.current?.focus();
    }
    if (!email) {
      setFieldErrors({ email: "Please enter your email address." });
      return emailRef.current?.focus();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFieldErrors({ email: "Enter a valid email address, like name@example.com." });
      return emailRef.current?.focus();
    }
    // The phone number is optional, but if one is given it has to be a real one.
    const phoneError = phoneProblem(phone);
    if (phoneError) {
      setFieldErrors({ phone: phoneError });
      return phoneRef.current?.focus();
    }
    if (!password) {
      setFieldErrors({ password: "Please enter a password." });
      return passwordRef.current?.focus();
    }
    if (password.length < PASSWORD_MIN) {
      setFieldErrors({ password: `Use at least ${PASSWORD_MIN} characters.` });
      return passwordRef.current?.focus();
    }
    if (!confirmPassword) {
      setFieldErrors({ confirmPassword: "Please confirm your password." });
      return confirmPasswordRef.current?.focus();
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      confirmPasswordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          phone_number: phone || undefined,
          platform: "NG",
          user_type: "USER",
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      const token = data.data?.challenge?.challenge_token;
      if (!token) {
        throw new Error("Failed to create account.");
      }
      setChallengeToken(token);
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const finalizeSession = async (sessionData: SessionData) => {
    setFinalizeError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        mode: "finalize",
        session: JSON.stringify(sessionData),
      });

      if (res?.error) {
        throw new Error("Account created, but signing you in failed. Please sign in manually.");
      }

      const callbackUrl =
        searchParams.get("callbackUrl") ||
        "/dashboard/settings?profile_photo=certificate-onboarding";
      router.push(callbackUrl);
    } catch (err) {
      setFinalizeError(errorMessage(err, "Something went wrong. Please try again."));
    }
  };

  if (challengeToken) {
    return (
      <AuthPageShell variant="register" stage="secure">
        {finalizeError && <AuthAlert>{finalizeError}</AuthAlert>}
        <TwoFactorSetup
          api={{ kind: "challenge", challengeToken }}
          title="Secure your new account"
          description="Every account uses a second step at sign-in. Choose how you'd like to receive codes."
          onComplete={(sessionData) => finalizeSession(sessionData)}
        />
      </AuthPageShell>
    );
  }

  const clearError = (key: string) => {
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <AuthPageShell variant="register" stage="form" wide>
      <AuthHeader title="Create your account" subtitle="One account for courses, progress, certificates and learning resources." />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} noValidate className="au-form">
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          <FloatingInput
            ref={firstNameRef}
            id="firstName"
            label="First name"
            type="text"
            value={firstName}
            onChange={(v) => {
              setFirstName(v);
              clearError("firstName");
            }}
            autoComplete="given-name"
            required
            autoFocus
            error={fieldErrors.firstName}
          />
          <FloatingInput
            ref={lastNameRef}
            id="lastName"
            label="Last name"
            type="text"
            value={lastName}
            onChange={(v) => {
              setLastName(v);
              clearError("lastName");
            }}
            autoComplete="family-name"
            required
            error={fieldErrors.lastName}
          />
        </div>

        <div className="grid gap-2">
          <FloatingInput
            ref={usernameRef}
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={(v) => {
              setUsername(v);
              clearError("username");
            }}
            autoComplete="username"
            required
            error={fieldErrors.username}
            suffix={
              checkingUsername ? (
                <span className="au-status" data-kind="busy"><Spinner size={16} /></span>
              ) : usernameAvailable === true ? (
                <span key="ok" className="au-status" data-kind="ok"><Check size={15} strokeWidth={3} aria-hidden="true" /></span>
              ) : usernameAvailable === false ? (
                <span key="bad" className="au-status" data-kind="bad"><X size={15} strokeWidth={3} aria-hidden="true" /></span>
              ) : null
            }
          />
          <span className="au-sr" aria-live="polite">
            {usernameAvailable === true ? "Username is available" : usernameAvailable === false ? "Username is already taken" : ""}
          </span>
          {suggestions.length > 0 && (
            <div className="au-chips">
              <span>Suggestions</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="au-chip"
                  onClick={() => {
                    setUsername(s);
                    usernameRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <FloatingInput
          ref={emailRef}
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearError("email");
          }}
          autoComplete="email"
          inputMode="email"
          required
          hint="This will be your sign-in email. Codes and receipts are sent here."
          error={fieldErrors.email}
        />

        <PhoneField
          ref={phoneRef}
          id="phone"
          name="phone"
          label="Phone number"
          optional
          hint="Outside Nigeria? Choose your country, or paste the number with its code."
          value={phone}
          onChange={(value) => {
            setPhone(value);
            clearError("phone");
          }}
          error={fieldErrors.phone}
        />

        <FloatingInput
          ref={passwordRef}
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(v) => {
            setPassword(v);
            clearError("password");
          }}
          autoComplete="new-password"
          required
          capsLockWarning
          describedById={password ? "signup-password-rules" : undefined}
          error={fieldErrors.password}
          suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />
        <FloatingInput
          ref={confirmPasswordRef}
          id="confirmPassword"
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            clearError("confirmPassword");
          }}
          autoComplete="new-password"
          required
          capsLockWarning
          error={fieldErrors.confirmPassword}
          suffix={<PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />}
        />
        {password && <PasswordChecklist id="signup-password-rules" password={password} confirm={confirmPassword} />}

        <AuthAlert tone="info">
          After you sign up, add a clear professional profile photo. It appears on the certificates you earn and is needed before they can be issued.
        </AuthAlert>

        <AuthButton type="submit" busy={loading} busyLabel="Creating account…">
          Continue
        </AuthButton>
      </form>

      <div className="au-links">
        <p>
          Already have an account? <ChevronLink href="/login">Sign in</ChevronLink>
        </p>
      </div>

      <LegalNote action="creating an account" />
    </AuthPageShell>
  );
}
