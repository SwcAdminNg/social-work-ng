"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Check,
  ChevronUp,
  CircleHelp,
  FileText,
  Hash,
  ImageIcon,
  Loader2,
  MessageSquareReply,
  Paperclip,
  Radio,
  Search,
  Send,
  UsersRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/formatBytes";
import { getWsBaseUrl } from "@/lib/wsUrl";

export type Community = {
  id: string;
  type: "GENERAL" | "HELP" | "COURSE" | "CUSTOM" | string;
  name: string;
  course_id?: string;
  is_active?: boolean;
  created_at?: string;
  member_count?: number;
};

type Member = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture_url?: string;
  image?: string;
  is_online?: boolean;
};

type ResourceReference = {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  thumbnail_url?: string;
};

type Message = {
  id: string;
  community_id: string;
  sender_id: string;
  sender?: Member;
  body?: string;
  created_at: string;
  reply_to?: {
    id: string;
    sender_id: string;
    body?: string;
    attachment_file_name?: string;
  } | null;
  attachment_url?: string;
  attachment_file_name?: string;
  attachment_mime_type?: string;
  attachment_file_size_bytes?: number;
  attachment_kind?: "IMAGE" | "DOCUMENT";
  resource_reference?: ResourceReference | null;
};

type AttachmentFields = {
  attachment_storage_key: string;
  attachment_file_name: string;
  attachment_mime_type: string;
  attachment_file_size_bytes: number;
};

type InitialResourceShare = Pick<ResourceReference, "id" | "name" | "slug">;
type ConnectionState = "connecting" | "open" | "closed";
type AppSession = {
  accessToken?: string;
  user?: {
    id?: string;
  };
};
type MessageListResponse = {
  data?: Message[];
  message?: string;
  meta?: {
    has_next?: boolean;
  };
};
type DataResponse<T> = {
  data?: T;
  message?: string;
};

const PAGE_SIZE = 20;
const PING_INTERVAL_MS = 30000;
const RECONNECT_DELAY_MS = 2500;
const TYPING_EXPIRE_MS = 4500;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function displayName(member?: Member) {
  if (!member) return "Community member";
  const fullName = [member.first_name, member.last_name].filter(Boolean).join(" ");
  return fullName || member.username || "Community member";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "C") + (parts[1]?.[0] || "");
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function sortMessages(list: Message[]) {
  return [...list].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function CommunityTypeIcon({ type }: { type: Community["type"] }) {
  if (type === "GENERAL") return <Hash className="h-4 w-4" />;
  if (type === "HELP") return <CircleHelp className="h-4 w-4" />;
  if (type === "COURSE") return <BookOpen className="h-4 w-4" />;
  return <UsersRound className="h-4 w-4" />;
}

export default function CommunityChat({
  initialCommunities,
  selectedCommunityId,
  initialResourceShare,
}: {
  initialCommunities: Community[];
  selectedCommunityId?: string;
  initialResourceShare: InitialResourceShare | null;
}) {
  const { data: session } = useSession();
  const sessionWithToken = session as AppSession | null;
  const accessToken = sessionWithToken?.accessToken;
  const currentUserId = sessionWithToken?.user?.id;

  const communities = initialCommunities;
  const [activeId, setActiveId] = useState(
    selectedCommunityId || initialCommunities[0]?.id || "",
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [resourceShare, setResourceShare] =
    useState<InitialResourceShare | null>(initialResourceShare);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(
    null,
  );
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("closed");
  const [typingUsers, setTypingUsers] = useState<Map<string, number>>(
    new Map(),
  );

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingFalseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const closedByUserRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeCommunity = useMemo(
    () => communities.find((community) => community.id === activeId),
    [activeId, communities],
  );

  const filteredCommunities = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return communities;
    return communities.filter((community) =>
      `${community.name} ${community.type}`.toLowerCase().includes(normalized),
    );
  }, [communities, search]);

  const onlineMembers = useMemo(
    () => members.filter((member) => onlineIds.has(member.id) || member.is_online),
    [members, onlineIds],
  );

  const typingLine = useMemo(() => {
    const names = Array.from(typingUsers.entries())
      .map(([userId]) =>
        displayName(members.find((member) => member.id === userId)),
      )
      .slice(0, 2);

    if (names.length === 0) return "";
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.join(" and ")} are typing...`;
  }, [members, typingUsers]);

  const mergeMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return sortMessages([...prev, message]);
    });
  }, []);

  const clearAttachment = useCallback(() => {
    setAttachedFile(null);
    setAttachedPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const loadMessages = useCallback(
    async (communityId: string, nextPage = 1) => {
      if (!communityId) return;
      if (nextPage === 1) {
        setLoadingMessages(true);
      } else {
        setLoadingOlder(true);
      }

      try {
        const res = await fetch(
          `/api/proxy/community/${communityId}/messages?page=${nextPage}&page_size=${PAGE_SIZE}`,
        );
        const json = (await res
          .json()
          .catch(() => ({}))) as MessageListResponse;
        if (!res.ok) {
          throw new Error(json.message || "Failed to load messages.");
        }

        const incoming = Array.isArray(json?.data) ? json.data : [];
        setHasOlder(Boolean(json?.meta?.has_next));
        setPage(nextPage);
        setMessages((prev) => {
          if (nextPage === 1) return sortMessages(incoming);
          const ids = new Set(prev.map((message) => message.id));
          return sortMessages([
            ...incoming.filter((message: Message) => !ids.has(message.id)),
            ...prev,
          ]);
        });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to load messages."));
      } finally {
        setLoadingMessages(false);
        setLoadingOlder(false);
      }
    },
    [],
  );

  const loadMembers = useCallback(async (communityId: string) => {
    if (!communityId) return;
    try {
      const [membersRes, onlineRes] = await Promise.all([
        fetch(`/api/proxy/community/${communityId}/members?page=1&page_size=40`),
        fetch(`/api/proxy/community/${communityId}/online`),
      ]);
      const membersJson = (await membersRes
        .json()
        .catch(() => ({}))) as DataResponse<Member[]>;
      const onlineJson = (await onlineRes.json().catch(() => ({}))) as DataResponse<{
        online_user_ids?: string[];
      }>;

      if (membersRes.ok) {
        setMembers(Array.isArray(membersJson?.data) ? membersJson.data : []);
      }
      if (onlineRes.ok && Array.isArray(onlineJson?.data?.online_user_ids)) {
        setOnlineIds(new Set(onlineJson.data.online_user_ids));
      }
    } catch {
      // Presence is additive; chat should stay usable even if roster refresh fails.
    }
  }, []);

  useEffect(() => {
    if (!selectedCommunityId) return;
    setActiveId(selectedCommunityId);
  }, [selectedCommunityId]);

  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    setMembers([]);
    setTypingUsers(new Map());
    setReplyTo(null);
    clearAttachment();
    loadMessages(activeId, 1);
    loadMembers(activeId);
  }, [activeId, clearAttachment, loadMembers, loadMessages]);

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => loadMembers(activeId), 30000);
    return () => clearInterval(interval);
  }, [activeId, loadMembers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeId, messages.length, typingLine]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = new Map(prev);
        for (const [userId, expiresAt] of next) {
          if (expiresAt <= now) next.delete(userId);
        }
        return next.size === prev.size ? prev : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!accessToken || !activeId) {
      setConnection("closed");
      return;
    }

    closedByUserRef.current = false;

    function connect() {
      setConnection("connecting");
      const ws = new WebSocket(
        `${getWsBaseUrl()}/community/${activeId}/ws?token=${encodeURIComponent(
          accessToken!,
        )}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setConnection("open");
        loadMessages(activeId, 1);
        loadMembers(activeId);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "message" && payload.data) {
            mergeMessage(payload.data as Message);
          } else if (payload.type === "typing" && payload.user_id !== currentUserId) {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              if (payload.is_typing) {
                next.set(payload.user_id, Date.now() + TYPING_EXPIRE_MS);
              } else {
                next.delete(payload.user_id);
              }
              return next;
            });
          } else if (payload.type === "error") {
            toast.error(payload.detail || "Community could not process that frame.");
          }
        } catch {
          // Ignore malformed frames from a transient socket issue.
        }
      };

      ws.onclose = (event) => {
        setConnection("closed");
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        if (!closedByUserRef.current && event.code !== 4401 && event.code !== 4403 && event.code !== 4404) {
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      closedByUserRef.current = true;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [accessToken, activeId, currentUserId, loadMembers, loadMessages, mergeMessage]);

  function sendTyping(isTyping: boolean) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    sendTyping(Boolean(value.trim()));
    if (typingFalseTimeoutRef.current) clearTimeout(typingFalseTimeoutRef.current);
    typingFalseTimeoutRef.current = setTimeout(() => sendTyping(false), 1500);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Choose a file under 15MB.");
      e.target.value = "";
      return;
    }

    clearAttachment();
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      setAttachedPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function uploadAttachment(file: File): Promise<AttachmentFields> {
    const res = await fetch(
      `/api/proxy/community/${activeId}/attachments/upload-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: file.name,
          content_type: file.type || "application/octet-stream",
        }),
      },
    );
      const json = (await res.json().catch(() => ({}))) as DataResponse<{
        upload_url?: string;
        storage_key?: string;
      }>;
    if (!res.ok) {
      throw new Error(json.message || "Failed to prepare attachment upload.");
    }

    const uploadUrl = json?.data?.upload_url;
    const storageKey = json?.data?.storage_key;
    if (!uploadUrl || !storageKey) {
      throw new Error("The upload response was incomplete.");
    }

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: file.type ? { "Content-Type": file.type } : undefined,
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Attachment upload failed.");

    return {
      attachment_storage_key: storageKey,
      attachment_file_name: file.name,
      attachment_mime_type: file.type || "application/octet-stream",
      attachment_file_size_bytes: file.size,
    };
  }

  async function sendViaHttp(payload: Record<string, unknown>) {
    const res = await fetch(`/api/proxy/community/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as DataResponse<Message>;
    if (!res.ok) throw new Error(json.message || "Failed to send message.");
    if (json?.data) mergeMessage(json.data as Message);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || sending) return;

    const body = draft.trim();
    const fileToUpload = attachedFile;
    const shareToSend = resourceShare;
    if (!body && !fileToUpload && !shareToSend) return;

    setSending(true);
    setDraft("");
    setReplyTo(null);
    setResourceShare(null);
    clearAttachment();
    sendTyping(false);

    try {
      const attachmentFields = fileToUpload
        ? await uploadAttachment(fileToUpload)
        : {};
      const messagePayload = {
        body,
        reply_to_message_id: replyTo?.id ?? null,
        resource_reference_id: shareToSend?.id ?? null,
        ...attachmentFields,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "message", ...messagePayload }));
      } else {
        await sendViaHttp(messagePayload);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send message."));
      setDraft(body);
      setReplyTo(replyTo);
      setResourceShare(shareToSend);
      if (fileToUpload) {
        setAttachedFile(fileToUpload);
        if (fileToUpload.type.startsWith("image/")) {
          setAttachedPreviewUrl(URL.createObjectURL(fileToUpload));
        }
      }
    } finally {
      setSending(false);
    }
  }

  if (communities.length === 0) {
    return (
      <div className="grid min-h-[460px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
        <div>
          <UsersRound className="mx-auto h-10 w-10 text-[#2D6A4F] dark:text-[#74c69d]" />
          <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
            No communities yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Your General and Help rooms will appear here once your account has
            Community access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[680px] grid-cols-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 xl:grid-cols-[290px_minmax(0,1fr)_270px]">
      <aside className="border-b border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/45 xl:border-b-0 xl:border-r">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rooms"
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="swcl-sidebar-scroll mt-3 flex gap-2 overflow-x-auto xl:block xl:space-y-1 xl:overflow-y-auto">
          {filteredCommunities.map((community) => (
            <RoomButton
              key={community.id}
              community={community}
              active={community.id === activeId}
              onClick={() => setActiveId(community.id)}
            />
          ))}
        </div>
      </aside>

      <main className="flex min-h-[620px] min-w-0 flex-col bg-[#f8faf9] dark:bg-slate-950">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-bold text-slate-950 dark:text-white">
                {activeCommunity?.name}
              </h2>
              {activeCommunity?.type && (
                <span className="rounded-md bg-amber-100 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.05em] text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                  {activeCommunity.type.toLowerCase()}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {onlineMembers.length} online
              {members.length > 0 ? ` of ${members.length} visible members` : ""}
            </p>
          </div>
          <ConnectionIndicator state={connection} />
        </header>

        <div className="swcl-sidebar-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-5">
          {hasOlder && (
            <button
              type="button"
              onClick={() => loadMessages(activeId, page + 1)}
              disabled={loadingOlder}
              className="mx-auto mb-4 flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-[#2D6A4F]/40 hover:text-[#2D6A4F] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {loadingOlder ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
              Older messages
            </button>
          )}

          {loadingMessages ? (
            <div className="grid h-full place-items-center text-sm font-medium text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading conversation
              </span>
            </div>
          ) : messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <Radio className="mx-auto h-10 w-10 text-[#2D6A4F] dark:text-[#74c69d]" />
                <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">
                  Start the conversation
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Share a note, ask a question, or attach a useful document for
                  the room.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const own = message.sender_id === currentUserId;
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    own={own}
                    onReply={() => setReplyTo(message)}
                  />
                );
              })}
            </div>
          )}

          {typingLine && (
            <div className="mt-3 px-2 text-xs font-semibold text-[#2D6A4F] dark:text-[#74c69d]">
              {typingLine}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
        >
          {(replyTo || attachedFile || resourceShare) && (
            <div className="mb-2 flex flex-col gap-2">
              {replyTo && (
                <ComposerChip
                  icon={<MessageSquareReply className="h-4 w-4" />}
                  title={`Replying to ${displayName(replyTo.sender)}`}
                  detail={replyTo.body || replyTo.attachment_file_name || "Attachment"}
                  onClear={() => setReplyTo(null)}
                />
              )}
              {resourceShare && (
                <ComposerChip
                  icon={<BookOpen className="h-4 w-4" />}
                  title="Sharing resource"
                  detail={resourceShare.name}
                  onClear={() => setResourceShare(null)}
                />
              )}
              {attachedFile && (
                <ComposerChip
                  icon={
                    attachedPreviewUrl ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )
                  }
                  title={attachedFile.name}
                  detail={formatBytes(attachedFile.size)}
                  imageUrl={attachedPreviewUrl}
                  onClear={clearAttachment}
                />
              )}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || Boolean(attachedFile)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-[#2D6A4F] hover:text-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-[#74c69d] dark:hover:text-[#74c69d]"
              aria-label="Attach file"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              value={draft}
              onChange={(event) => handleDraftChange(event.target.value)}
              onBlur={() => sendTyping(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend(event as unknown as React.FormEvent);
                }
              }}
              rows={1}
              placeholder="Message this community"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#2D6A4F] focus:bg-white focus:ring-2 focus:ring-[#2D6A4F]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
            />
            <button
              type="submit"
              disabled={sending || (!draft.trim() && !attachedFile && !resourceShare)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#2D6A4F] text-white shadow-sm transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#74c69d] dark:text-slate-950 dark:hover:bg-[#95d5b2]"
              aria-label="Send message"
              title="Send message"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </main>

      <aside className="hidden border-l border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 xl:block">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">
            Members
          </h3>
          <span className="rounded-md bg-[#d8f3dc] px-2 py-1 text-xs font-bold text-[#1B4332] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            {onlineMembers.length} online
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {members.slice(0, 18).map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              online={onlineIds.has(member.id) || Boolean(member.is_online)}
            />
          ))}
          {members.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Member details will appear once the room roster is available.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function RoomButton({
  community,
  active,
  onClick,
}: {
  community: Community;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex min-w-[220px] items-center gap-3 rounded-lg border px-3 py-3 text-left transition xl:min-w-0 xl:w-full",
        active
          ? "border-[#2D6A4F] bg-white shadow-sm dark:border-[#74c69d] dark:bg-slate-950"
          : "border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-950",
      )}
    >
      <span
        className={cx(
          "grid h-9 w-9 shrink-0 place-items-center rounded-md",
          active
            ? "bg-[#2D6A4F] text-white dark:bg-[#74c69d] dark:text-slate-950"
            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        )}
      >
        <CommunityTypeIcon type={community.type} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">
          {community.name}
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
          {community.type === "COURSE" ? "Course room" : `${community.type.toLowerCase()} room`}
        </span>
      </span>
      {active && <Check className="h-4 w-4 text-[#2D6A4F] dark:text-[#74c69d]" />}
    </button>
  );
}

function MessageBubble({
  message,
  own,
  onReply,
}: {
  message: Message;
  own: boolean;
  onReply: () => void;
}) {
  const name = displayName(message.sender);

  return (
    <div className={cx("group flex", own ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "flex max-w-[88%] flex-col gap-1 sm:max-w-[72%]",
          own ? "items-end" : "items-start",
        )}
      >
        {!own && (
          <span className="px-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            {name}
          </span>
        )}
        <div className="flex items-end gap-2">
          {!own && <Avatar member={message.sender} size="sm" />}
          <div
            className={cx(
              "rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm",
              own
                ? "bg-[#2D6A4F] text-white dark:bg-[#74c69d] dark:text-slate-950"
                : "border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
            )}
          >
            {message.reply_to && (
              <div
                className={cx(
                  "mb-2 rounded-md border-l-2 px-2 py-1 text-xs",
                  own
                    ? "border-white/70 bg-white/10 text-white/85 dark:text-slate-900"
                    : "border-[#2D6A4F] bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300",
                )}
              >
                {message.reply_to.body ||
                  message.reply_to.attachment_file_name ||
                  "Previous message"}
              </div>
            )}
            {message.body && (
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
            )}
            {message.attachment_url && (
              <MessageAttachment message={message} own={own} />
            )}
            {message.resource_reference && (
              <ResourceCard resource={message.resource_reference} own={own} />
            )}
          </div>
          {own && (
            <button
              type="button"
              onClick={onReply}
              className="hidden h-8 w-8 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#2D6A4F] group-hover:grid dark:hover:bg-slate-800 dark:hover:text-[#74c69d]"
              aria-label="Reply to message"
              title="Reply"
            >
              <MessageSquareReply className="h-4 w-4" />
            </button>
          )}
          {!own && (
            <button
              type="button"
              onClick={onReply}
              className="hidden h-8 w-8 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#2D6A4F] group-hover:grid dark:hover:bg-slate-800 dark:hover:text-[#74c69d]"
              aria-label="Reply to message"
              title="Reply"
            >
              <MessageSquareReply className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="px-1 text-[0.68rem] font-medium text-slate-400">
          {formatMessageTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

function MessageAttachment({
  message,
  own,
}: {
  message: Message;
  own: boolean;
}) {
  if (message.attachment_kind === "IMAGE") {
    return (
      <a
        href={message.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block overflow-hidden rounded-md"
      >
        <img
          src={message.attachment_url}
          alt={message.attachment_file_name || "Attachment"}
          className="max-h-64 max-w-full object-cover transition hover:opacity-90"
        />
      </a>
    );
  }

  return (
    <a
      href={message.attachment_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        "mt-2 flex min-w-[220px] items-center gap-3 rounded-md border px-3 py-2 transition",
        own
          ? "border-white/20 bg-white/10 hover:bg-white/15"
          : "border-slate-200 bg-slate-50 hover:border-[#2D6A4F]/40 dark:border-slate-700 dark:bg-slate-950",
      )}
    >
      <FileText className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold">
          {message.attachment_file_name || "Attachment"}
        </span>
        {typeof message.attachment_file_size_bytes === "number" && (
          <span className="block text-[0.68rem] opacity-75">
            {formatBytes(message.attachment_file_size_bytes)}
          </span>
        )}
      </span>
    </a>
  );
}

function ResourceCard({
  resource,
  own,
}: {
  resource: ResourceReference;
  own: boolean;
}) {
  const content = (
    <span
      className={cx(
        "mt-2 flex min-w-[240px] items-center gap-3 rounded-md border p-2 transition",
        own
          ? "border-white/20 bg-white/10 hover:bg-white/15"
          : "border-slate-200 bg-slate-50 hover:border-[#2D6A4F]/40 dark:border-slate-700 dark:bg-slate-950",
      )}
    >
      {resource.thumbnail_url ? (
        <img
          src={resource.thumbnail_url}
          alt=""
          className="h-12 w-12 rounded-md object-cover"
        />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200">
          <BookOpen className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold">{resource.name}</span>
        <span className="block truncate text-[0.68rem] opacity-75">
          {resource.category || "Resource"}
        </span>
      </span>
    </span>
  );

  if (!resource.slug) return content;
  return (
    <Link href={`/resources/${resource.slug}`} className="block">
      {content}
    </Link>
  );
}

function ComposerChip({
  icon,
  title,
  detail,
  imageUrl,
  onClear,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  imageUrl?: string | null;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[#2D6A4F] dark:bg-slate-950 dark:text-[#74c69d]">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
          {title}
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
          {detail}
        </span>
      </span>
      <button
        type="button"
        onClick={onClear}
        className="grid h-8 w-8 place-items-center rounded-md text-slate-400 transition hover:bg-white hover:text-red-500 dark:hover:bg-slate-950"
        aria-label="Remove"
        title="Remove"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function MemberRow({
  member,
  online,
}: {
  member: Member;
  online: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2">
      <div className="relative">
        <Avatar member={member} />
        <span
          className={cx(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950",
            online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700",
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {displayName(member)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {online ? "Online now" : "Offline"}
        </p>
      </div>
    </div>
  );
}

function Avatar({
  member,
  size = "md",
}: {
  member?: Member;
  size?: "sm" | "md";
}) {
  const name = displayName(member);
  const image = member?.profile_picture_url || member?.image;
  const sizeClass = size === "sm" ? "h-7 w-7 text-[0.65rem]" : "h-9 w-9 text-xs";

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={cx("shrink-0 rounded-md object-cover", sizeClass)}
      />
    );
  }

  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-md bg-slate-200 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        sizeClass,
      )}
    >
      {initials(name).toUpperCase()}
    </span>
  );
}

function ConnectionIndicator({ state }: { state: ConnectionState }) {
  if (state === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
        <Wifi className="h-3.5 w-3.5" />
        Live
      </span>
    );
  }

  if (state === "connecting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Connecting
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
      <WifiOff className="h-3.5 w-3.5" />
      Offline
    </span>
  );
}
