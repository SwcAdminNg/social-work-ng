"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Cloud, KeyRound, Laptop, Pencil, Plus, Trash2 } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import {
  addPasskey,
  forgetPasskeyAccount,
  listPasskeys,
  type Passkey,
  PasskeyError,
  passkeysSupported,
  rememberPasskeyAccount,
  removePasskey,
  renamePasskey,
} from "@/lib/passkeys";

const noopSubscribe = () => () => {};
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function relative(iso?: string | null) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return dateFormat.format(new Date(iso));
}

export const PASSKEYS_QUERY_KEY = ["passkeys"];

/** Settings card for the signed-in user's passkeys. */
export function PasskeySettings() {
  const queryClient = useQueryClient();
  const { data: authSession } = useSession();
  const account = {
    email: authSession?.user?.email,
    username: (authSession?.user as { username?: string | null } | undefined)?.username,
    name: authSession?.user?.name,
  };
  const supported = useSyncExternalStore(noopSubscribe, passkeysSupported, () => true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: passkeys = [], isPending, isError } = useQuery({
    queryKey: PASSKEYS_QUERY_KEY,
    queryFn: listPasskeys,
    staleTime: 30_000,
  });

  const add = useMutation({
    mutationFn: () => addPasskey(),
    onSuccess: (passkey) => {
      queryClient.setQueryData<Passkey[]>(PASSKEYS_QUERY_KEY, (current = []) => [passkey, ...current]);
      // This device now offers "Continue with fingerprint" for this account at sign-in.
      rememberPasskeyAccount(account);
      toast.success("Passkey added. Next time, sign in with your fingerprint or face.");
    },
    onError: (error: PasskeyError) => {
      if (!error.cancelled) toast.error(error.message);
    },
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renamePasskey(id, name),
    onSuccess: (passkey) => {
      queryClient.setQueryData<Passkey[]>(PASSKEYS_QUERY_KEY, (current = []) => current.map((p) => (p.id === passkey.id ? passkey : p)));
      setEditingId(null);
      toast.success("Passkey renamed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removePasskey(id),
    onSuccess: (_, id) => {
      const remaining = (queryClient.getQueryData<Passkey[]>(PASSKEYS_QUERY_KEY) || []).filter((p) => p.id !== id);
      queryClient.setQueryData<Passkey[]>(PASSKEYS_QUERY_KEY, remaining);
      // No passkeys left: stop offering fingerprint sign-in for this account here.
      if (remaining.length === 0) forgetPasskeyAccount(account.email);
      setConfirmId(null);
      toast.success("Passkey removed. It can no longer be used to sign in.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const startRename = (passkey: Passkey) => {
    setEditingId(passkey.id);
    setDraftName(passkey.name);
    setConfirmId(null);
  };

  return (
    <section className="lms-settings-section" aria-labelledby="passkeys-head">
      <h2 id="passkeys-head" className="lms-settings-head">Passkeys</h2>
      <div className="lms-group">
        {isPending ? (
          <div className="flex h-16 items-center justify-center">
            <IconSpinner className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : isError ? (
          <p className="m-0 px-4 py-3.5 text-[0.9rem] text-[#d92d20] dark:text-[#ff6961]">We could not load your passkeys. Refresh the page to try again.</p>
        ) : (
          <ul className="m-0 list-none p-0" aria-label="Your passkeys">
            {passkeys.map((passkey) => {
              const editing = editingId === passkey.id;
              const confirming = confirmId === passkey.id;
              return (
                <li key={passkey.id} className="lms-form-row !gap-3 !py-2.5">
                  <span className="lms-sym lms-sym--gray">
                    {passkey.synced ? <Cloud className="h-[18px] w-[18px]" aria-hidden="true" /> : <Laptop className="h-[18px] w-[18px]" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (draftName.trim()) rename.mutate({ id: passkey.id, name: draftName.trim() });
                        }}
                      >
                        <label htmlFor={`passkey-name-${passkey.id}`} className="sr-only">Passkey name</label>
                        <input
                          id={`passkey-name-${passkey.id}`}
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          maxLength={100}
                          autoFocus
                          onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                          className="lms-field h-9 min-w-0 flex-1 !rounded-[9px] text-[0.92rem]"
                        />
                        <button type="submit" disabled={rename.isPending} className="lms-text-btn !font-semibold">
                          {rename.isPending ? <IconSpinner className="h-4 w-4 animate-spin" /> : "Done"}
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="lms-text-btn !text-ink-3">
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <p className="m-0 truncate text-[0.92rem] font-medium text-ink">{passkey.name}</p>
                        <p className="m-0 truncate text-[0.78rem] text-ink-3">
                          {[
                            passkey.provider,
                            passkey.synced ? "Synced" : "This device only",
                            passkey.last_used_at ? `Used ${relative(passkey.last_used_at)}` : `Added ${dateFormat.format(new Date(passkey.created_at))}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </>
                    )}
                  </div>
                  {!editing && (
                    <div className="flex flex-none items-center gap-3">
                      {confirming ? (
                        <>
                          <button type="button" onClick={() => setConfirmId(null)} className="lms-text-btn !text-ink-3">
                            Keep
                          </button>
                          <button type="button" onClick={() => remove.mutate(passkey.id)} disabled={remove.isPending} className="lms-text-btn !font-semibold !text-[#d92d20] dark:!text-[#ff6961]">
                            {remove.isPending && <IconSpinner className="h-3.5 w-3.5 animate-spin" />}
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startRename(passkey)} className="lms-gpop-x !h-8 !w-8" aria-label={`Rename ${passkey.name}`} title="Rename">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmId(passkey.id);
                              setEditingId(null);
                            }}
                            className="lms-gpop-x !h-8 !w-8 hover:!text-[#d92d20]"
                            aria-label={`Remove ${passkey.name}`}
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {supported && (
              <li>
                <button type="button" onClick={() => add.mutate()} disabled={add.isPending} className="lms-form-row lms-form-action">
                  <span className="lms-sym lms-sym--green">
                    {add.isPending ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />}
                  </span>
                  <span className="flex-1 text-left">
                    {add.isPending ? "Follow your device’s prompt…" : passkeys.length ? "Add Another Passkey" : "Add a Passkey"}
                  </span>
                </button>
              </li>
            )}
            {!supported && passkeys.length === 0 && (
              <li className="lms-form-row !gap-3">
                <span className="lms-sym lms-sym--gray">
                  <KeyRound className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="text-[0.9rem] text-ink-3">No passkeys on this account.</span>
              </li>
            )}
          </ul>
        )}
      </div>
      <div className="lms-settings-foot">
        <p className="m-0">
          {supported
            ? "Sign in with your fingerprint, face or screen lock instead of a password and code. Your fingerprint never leaves your device, and passkeys saved to iCloud Keychain or Google Password Manager work on your other devices too."
            : "This browser doesn’t support passkeys. Try the latest Chrome, Safari, Edge or Firefox."}
        </p>
      </div>
    </section>
  );
}
