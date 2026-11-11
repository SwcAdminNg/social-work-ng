"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  FileText,
  Hash,
  ImageIcon,
  Info,
  Loader2,
  MessageSquareReply,
  Plus,
  Reply,
  Search,
  ShieldCheck,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/formatBytes";
import { getWsBaseUrl } from "@/lib/wsUrl";

export type Community = {
  id: string;
  type:
    | "GENERAL"
    | "INSTRUCTOR_GENERAL"
    | "ADMIN_GENERAL"
    | "HELP"
    | "COURSE"
    | "CUSTOM"
    | string;
  name: string;
  course_id?: string;
  is_active?: boolean;
  created_at?: string;
  member_count?: number;
};

type MemberProfile = {
  id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture_url?: string;
  image?: string;
  user_type?: "ADMIN" | "INSTRUCTOR" | "USER" | string;
};

type Member = MemberProfile & {
  user?: MemberProfile | null;
  student?: MemberProfile | null;
  member?: MemberProfile | null;
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
    sender?: Member | null;
    body?: string;
    attachment_file_name?: string;
  } | null;
  attachment_url?: string;
  attachment_file_name?: string;
  attachment_mime_type?: string;
  attachment_file_size_bytes?: number;
  attachment_kind?: "IMAGE" | "DOCUMENT";
  resource_reference?: ResourceReference | null;
  status?: "sending" | "sent";
};

type AttachmentFields = {
  attachment_storage_key: string;
  attachment_file_name: string;
  attachment_mime_type: string;
  attachment_file_size_bytes: number;
};

type InitialResourceShare = Pick<ResourceReference, "id" | "name" | "slug">;
type ConnectionState = "connecting" | "open" | "closed";
type MemberMode = "online" | "all";
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
  meta?: {
    total_items?: number;
    total_pages?: number;
  };
};
type UnreadCountResponse = {
  data?: { total_unread?: number };
};

const PAGE_SIZE = 20;
const MEMBER_PAGE_SIZE = 10;
const ONLINE_PREVIEW_LIMIT = 5;
// The API caps page_size at 100 on every paginated endpoint (see PaginationParams
// in the backend) - this fetches as large a batch as the API allows in one request.
const ONLINE_ROSTER_FETCH_SIZE = 100;
const PING_INTERVAL_MS = 30000;
const RECONNECT_DELAY_MS = 2500;
const TYPING_EXPIRE_MS = 4500;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function memberProfile(member?: Member | null): MemberProfile {
  return member?.user || member?.student || member?.member || member || {};
}

function memberId(member?: Member | null) {
  return memberProfile(member).id || member?.id;
}

function displayName(member?: Member | null) {
  if (!member) return "Community member";
  const profile = memberProfile(member);
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || profile.username || "Community member";
}

function memberFirstName(member?: Member | null) {
  const profile = memberProfile(member);
  return profile.first_name || displayName(member);
}

function memberUsername(member?: Member | null) {
  const profile = memberProfile(member);
  return profile.username ? `@${profile.username}` : "";
}

function staffRoleLabel(member?: Member | null) {
  const userType = memberProfile(member).user_type;
  if (userType === "ADMIN") return "Admin";
  if (userType === "INSTRUCTOR") return "Instructor";
  return null;
}

function memberRoleLabel(member?: Member | null) {
  const userType = memberProfile(member).user_type;
  if (userType === "ADMIN") return "Admin";
  if (userType === "INSTRUCTOR") return "Instructor";
  if (userType === "USER") return "Member";
  if (userType) {
    return userType
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return "Member";
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

function messageFingerprint(input: {
  body?: string | null;
  reply_to_message_id?: string | null;
  attachment_file_name?: string | null;
}) {
  return `${input.body || ""}|${input.reply_to_message_id || ""}|${
    input.attachment_file_name || ""
  }`;
}

function unreadBadgeLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

function parseTotalUnread(json: unknown): number {
  const total = (json as UnreadCountResponse)?.data?.total_unread;
  return Math.max(0, Number(total) || 0);
}

function CommunityTypeIcon({ type }: { type: Community["type"] }) {
  if (type === "GENERAL") return <Hash className="h-4 w-4" />;
  if (type === "INSTRUCTOR_GENERAL") return <UsersRound className="h-4 w-4" />;
  if (type === "ADMIN_GENERAL") return <UserCog className="h-4 w-4" />;
  if (type === "HELP") return <CircleHelp className="h-4 w-4" />;
  if (type === "COURSE") return <BookOpen className="h-4 w-4" />;
  return <UsersRound className="h-4 w-4" />;
}

function communityTypeLabel(type: Community["type"]) {
  if (type === "GENERAL") return "General room";
  if (type === "INSTRUCTOR_GENERAL") return "Instructor room";
  if (type === "ADMIN_GENERAL") return "Admin room";
  if (type === "HELP") return "Help room";
  if (type === "COURSE") return "Course room";
  if (type === "CUSTOM") return "Custom room";
  return `${type.toLowerCase().replaceAll("_", " ")} room`;
}

function communityTypeBadge(type: Community["type"]) {
  return communityTypeLabel(type).replace(/\s+room$/, "");
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
  const [memberMode, setMemberMode] = useState<MemberMode>("online");
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [memberTotalItems, setMemberTotalItems] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [rosterExpanded, setRosterExpanded] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, number>>(
    new Map(),
  );
  const [mobileScreen, setMobileScreen] = useState<"list" | "chat">("list");
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pendingSendsRef = useRef<Map<string, string>>(new Map());
  const pendingBlobUrlsRef = useRef<Map<string, string>>(new Map());
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingFalseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);
  const scrollCommunityRef = useRef<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeIdRef = useRef(activeId);
  const memberModeRef = useRef(memberMode);
  const memberPageRef = useRef(memberPage);
  const lastMemberLoadRef = useRef({ key: "", at: 0 });

  const activeCommunity = useMemo(
    () => communities.find((community) => community.id === activeId),
    [activeId, communities],
  );

  const selfMember: Member = useMemo(
    () => ({
      id: currentUserId,
      first_name: session?.user?.name || undefined,
      profile_picture_url: session?.user?.image || undefined,
    }),
    [currentUserId, session?.user?.name, session?.user?.image],
  );

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    memberModeRef.current = memberMode;
    memberPageRef.current = memberPage;
  }, [memberMode, memberPage]);

  const filteredCommunities = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return communities;
    return communities.filter((community) =>
      `${community.name} ${community.type}`.toLowerCase().includes(normalized),
    );
  }, [communities, search]);

  const onlineMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          (memberId(member) ? onlineIds.has(memberId(member) as string) : false) ||
          member.is_online,
      ),
    [members, onlineIds],
  );
  const compactOnlineMembers = onlineMembers.slice(0, ONLINE_PREVIEW_LIMIT);
  const onlineTotalPages = Math.max(
    1,
    Math.ceil(onlineMembers.length / MEMBER_PAGE_SIZE),
  );
  const rosterTotalPages =
    memberMode === "online" ? onlineTotalPages : memberTotalPages;
  const displayedMembers =
    memberMode === "online"
      ? onlineMembers.slice(
          (memberPage - 1) * MEMBER_PAGE_SIZE,
          memberPage * MEMBER_PAGE_SIZE,
        )
      : members;

  const typingLine = useMemo(() => {
    const names = Array.from(typingUsers.entries()).map(([userId]) =>
      displayName(members.find((member) => memberId(member) === userId)),
    );

    if (names.length === 0) return "";
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names.join(" and ")} are typing...`;
    const [first, second, ...rest] = names;
    return `${first}, ${second} and ${rest.length} other${
      rest.length === 1 ? "" : "s"
    } are typing...`;
  }, [members, typingUsers]);

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          !message.community_id || message.community_id === activeId,
      ),
    [activeId, messages],
  );

  const mergeMessage = useCallback(
    (message: Message) => {
      if (message.community_id && message.community_id !== activeIdRef.current) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;

        if (message.sender_id === currentUserId) {
          const fingerprint = messageFingerprint({
            body: message.body,
            reply_to_message_id: message.reply_to?.id ?? null,
            attachment_file_name: message.attachment_file_name,
          });
          const tempId = pendingSendsRef.current.get(fingerprint);
          if (tempId) {
            pendingSendsRef.current.delete(fingerprint);
            const blobUrl = pendingBlobUrlsRef.current.get(tempId);
            if (blobUrl) {
              URL.revokeObjectURL(blobUrl);
              pendingBlobUrlsRef.current.delete(tempId);
            }
            const index = prev.findIndex((item) => item.id === tempId);
            if (index === -1) return [...prev, message];
            const next = [...prev];
            next[index] = message;
            return next;
          }
        }

        return [...prev, message];
      });
    },
    [currentUserId],
  );

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/community/unread-count");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setTotalUnread(parseTotalUnread(json));
    } catch {
      // Badges are additive; the room list should stay usable if this fails.
    }
  }, []);

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 30000);
    window.addEventListener("community:unread-refresh", fetchUnreadCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener("community:unread-refresh", fetchUnreadCounts);
    };
  }, [fetchUnreadCounts]);

  const markRead = useCallback((communityId: string) => {
    if (!communityId) return;
    fetch(`/api/proxy/community/${communityId}/read`, { method: "POST" })
      .catch(() => {})
      .finally(() => {
        window.dispatchEvent(new Event("community:unread-refresh"));
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
        if (activeIdRef.current !== communityId) return;

        const scopedIncoming = incoming.filter(
          (message) =>
            !message.community_id || message.community_id === communityId,
        );
        setHasOlder(Boolean(json?.meta?.has_next));
        setPage(nextPage);
        setMessages((prev) => {
          if (nextPage === 1) return sortMessages(scopedIncoming);
          const ids = new Set(prev.map((message) => message.id));
          return sortMessages([
            ...scopedIncoming.filter((message: Message) => !ids.has(message.id)),
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

  const loadMembers = useCallback(
    async (
      communityId: string,
      nextPage = 1,
      mode: MemberMode = "online",
    ) => {
      if (!communityId) return;
      const loadKey = `${communityId}:${nextPage}:${mode}`;
      const now = Date.now();
      if (
        lastMemberLoadRef.current.key === loadKey &&
        now - lastMemberLoadRef.current.at < 1000
      ) {
        return;
      }
      lastMemberLoadRef.current = { key: loadKey, at: now };

      const pageSize =
        mode === "online" ? ONLINE_ROSTER_FETCH_SIZE : MEMBER_PAGE_SIZE;

      setLoadingMembers(true);
      try {
        const [membersRes, onlineRes] = await Promise.all([
          fetch(
            `/api/proxy/community/${communityId}/members?page=${nextPage}&page_size=${pageSize}`,
          ),
          fetch(`/api/proxy/community/${communityId}/online`),
        ]);
        const membersJson = (await membersRes
          .json()
          .catch(() => ({}))) as DataResponse<Member[]>;
        const onlineJson = (await onlineRes
          .json()
          .catch(() => ({}))) as DataResponse<{
          online_user_ids?: string[];
        }>;

        if (activeIdRef.current !== communityId) return;

        if (membersRes.ok) {
          setMembers(Array.isArray(membersJson?.data) ? membersJson.data : []);
          setMemberTotalPages(Math.max(1, membersJson.meta?.total_pages || 1));
          setMemberTotalItems(membersJson.meta?.total_items || 0);
        }
        if (onlineRes.ok && Array.isArray(onlineJson?.data?.online_user_ids)) {
          setOnlineIds(new Set(onlineJson.data.online_user_ids));
        }
      } catch {
        // Presence is additive; chat should stay usable even if roster refresh fails.
      } finally {
        setLoadingMembers(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!selectedCommunityId) return;
    setActiveId(selectedCommunityId);
    setMobileScreen("chat");
  }, [selectedCommunityId]);

  const memberStateCommunityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeId) return;
    const communityChanged = memberStateCommunityRef.current !== activeId;

    if (communityChanged) {
      memberStateCommunityRef.current = activeId;
      setMessages([]);
      setMembers([]);
      setTypingUsers(new Map());
      setReplyTo(null);
      setMemberMode("online");
      setMemberPage(1);
      setMemberTotalPages(1);
      setMemberTotalItems(0);
      setRosterExpanded(false);
      setMobileMembersOpen(false);
      clearAttachment();
      loadMessages(activeId, 1);
      loadMembers(activeId, 1, "online");
      markRead(activeId);
      return;
    }

    loadMembers(activeId, memberPage, memberMode);
  }, [
    activeId,
    clearAttachment,
    loadMembers,
    loadMessages,
    markRead,
    memberMode,
    memberPage,
  ]);

  useEffect(() => {
    if (memberPage > rosterTotalPages) {
      setMemberPage(rosterTotalPages);
    }
  }, [memberPage, rosterTotalPages]);

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(
      () => loadMembers(activeId, memberPage, memberMode),
      30000,
    );
    return () => clearInterval(interval);
  }, [activeId, loadMembers, memberMode, memberPage]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    isAtBottomRef.current = true;
    setIsAtBottom(true);
    setNewMessageCount(0);
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 120;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMessageCount(0);
  }, []);

  useEffect(() => {
    const communityChanged = scrollCommunityRef.current !== activeId;
    scrollCommunityRef.current = activeId;

    const last = visibleMessages[visibleMessages.length - 1];

    if (communityChanged) {
      lastMessageIdRef.current = last?.id ?? null;
      requestAnimationFrame(() => scrollToBottom("auto"));
      return;
    }

    if (!last || last.id === lastMessageIdRef.current) return;
    lastMessageIdRef.current = last.id;

    if (last.sender_id === currentUserId || isAtBottomRef.current) {
      scrollToBottom("smooth");
    } else {
      setNewMessageCount((count) => count + 1);
    }
  }, [visibleMessages, activeId, currentUserId, scrollToBottom]);

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

    const socketToken = accessToken;
    let hasOpenedOnce = false;
    let closedByThisEffect = false;

    function connect() {
      setConnection("connecting");
      const ws = new WebSocket(
        `${getWsBaseUrl()}/community/${activeId}/ws?token=${encodeURIComponent(
          socketToken,
        )}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setConnection("open");
        if (hasOpenedOnce) {
          loadMessages(activeId, 1);
          loadMembers(activeId, memberPageRef.current, memberModeRef.current);
        }
        hasOpenedOnce = true;
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
            if (payload.data.sender_id !== currentUserId) {
              markRead(activeId);
            }
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
        if (!closedByThisEffect && event.code !== 4401 && event.code !== 4403 && event.code !== 4404) {
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      closedByThisEffect = true;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [
    accessToken,
    activeId,
    currentUserId,
    loadMembers,
    loadMessages,
    markRead,
    mergeMessage,
  ]);

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
    const replyToSend = replyTo;
    if (!body && !fileToUpload && !shareToSend) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const isImageAttachment = Boolean(
      fileToUpload && fileToUpload.type.startsWith("image/"),
    );
    const optimisticBlobUrl = isImageAttachment
      ? URL.createObjectURL(fileToUpload as File)
      : null;
    if (optimisticBlobUrl) {
      pendingBlobUrlsRef.current.set(tempId, optimisticBlobUrl);
    }

    const fingerprint = messageFingerprint({
      body,
      reply_to_message_id: replyToSend?.id ?? null,
      attachment_file_name: fileToUpload?.name ?? null,
    });
    pendingSendsRef.current.set(fingerprint, tempId);

    const optimisticMessage: Message = {
      id: tempId,
      community_id: activeId,
      sender_id: currentUserId || "",
      sender: selfMember,
      body: body || undefined,
      created_at: new Date().toISOString(),
      reply_to: replyToSend
        ? {
            id: replyToSend.id,
            sender_id: replyToSend.sender_id,
            sender: replyToSend.sender,
            body: replyToSend.body,
            attachment_file_name: replyToSend.attachment_file_name,
          }
        : null,
      attachment_url: optimisticBlobUrl ?? undefined,
      attachment_file_name: fileToUpload?.name,
      attachment_mime_type: fileToUpload?.type,
      attachment_file_size_bytes: fileToUpload?.size,
      attachment_kind: fileToUpload
        ? isImageAttachment
          ? "IMAGE"
          : "DOCUMENT"
        : undefined,
      resource_reference: shareToSend
        ? { id: shareToSend.id, name: shareToSend.name, slug: shareToSend.slug }
        : null,
      status: "sending",
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setSending(true);
    setDraft("");
    setReplyTo(null);
    setResourceShare(null);
    clearAttachment();
    sendTyping(false);

    function discardOptimisticMessage() {
      pendingSendsRef.current.delete(fingerprint);
      const blobUrl = pendingBlobUrlsRef.current.get(tempId);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        pendingBlobUrlsRef.current.delete(tempId);
      }
      setMessages((prev) => prev.filter((item) => item.id !== tempId));
    }

    try {
      const attachmentFields = fileToUpload
        ? await uploadAttachment(fileToUpload)
        : {};
      const messagePayload = {
        body,
        reply_to_message_id: replyToSend?.id ?? null,
        resource_reference_id: shareToSend?.id ?? null,
        ...attachmentFields,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "message", ...messagePayload }));
        setMessages((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, status: "sent" } : item,
          ),
        );
      } else {
        await sendViaHttp(messagePayload);
      }
    } catch (err: unknown) {
      discardOptimisticMessage();
      toast.error(getErrorMessage(err, "Failed to send message."));
      setDraft(body);
      setReplyTo(replyToSend);
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
      <div className="lms-milk flex flex-col items-center px-6 py-16 text-center sm:py-24">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
          <UsersRound className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h2 className="m-0 mt-5 text-[1.2rem] font-bold tracking-[-0.02em] text-ink">No rooms yet</h2>
        <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
          Rooms for your courses and the wider community appear here as soon as your account has access.
        </p>
      </div>
    );
  }

  const membersPanelProps = {
    rosterExpanded,
    setRosterExpanded,
    memberMode,
    setMemberMode,
    memberPage,
    setMemberPage,
    rosterTotalPages,
    onlineMembers,
    compactOnlineMembers,
    displayedMembers,
    loadingMembers,
    memberTotalItems,
    onlineIds,
    onMemberClick: setSelectedMember,
  };

  const messagesArea = (
    <div className="relative min-h-0 flex-1">
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="lms-scroll h-full overflow-y-auto px-3 pb-4 pt-3 sm:px-5"
      >
        {hasOlder && (
          <button
            type="button"
            onClick={() => loadMessages(activeId, page + 1)}
            disabled={loadingOlder}
            className="mx-auto mb-3 flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.78rem] font-semibold text-accent transition-colors hover:bg-[color-mix(in_srgb,var(--sw-green)_10%,transparent)] disabled:opacity-60"
          >
            {loadingOlder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronUp className="h-3.5 w-3.5" />}
            Load earlier messages
          </button>
        )}

        {loadingMessages ? (
          <div className="grid h-full place-items-center">
            <span className="inline-flex items-center gap-2 text-sm text-ink-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversation
            </span>
          </div>
        ) : visibleMessages.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <RoomAvatar type={activeCommunity?.type} size="lg" />
              <h3 className="m-0 mt-4 text-[1.05rem] font-semibold text-ink">{activeCommunity?.name}</h3>
              <p className="m-0 mt-1.5 max-w-xs text-[0.88rem] leading-relaxed text-ink-3">
                No messages yet. Say hello, ask a question or share something useful with the room.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {visibleMessages.map((message, index) => {
              const previous = visibleMessages[index - 1];
              const next = visibleMessages[index + 1];
              const time = new Date(message.created_at).getTime();
              const gapBefore = previous ? time - new Date(previous.created_at).getTime() : Infinity;
              const gapAfter = next ? new Date(next.created_at).getTime() - time : Infinity;
              const showDivider = !previous || gapBefore > 30 * 60_000 || !sameLagosDay(previous.created_at, message.created_at);
              const startsGroup = showDivider || previous?.sender_id !== message.sender_id || gapBefore > 5 * 60_000;
              const endsGroup = !next || next.sender_id !== message.sender_id || gapAfter > 5 * 60_000 || !sameLagosDay(message.created_at, next.created_at) || gapAfter > 30 * 60_000;
              return (
                <div key={message.id}>
                  {showDivider && <p className="lms-chat-divider">{formatDivider(message.created_at)}</p>}
                  <MessageBubble
                    message={message}
                    own={message.sender_id === currentUserId}
                    startsGroup={startsGroup}
                    endsGroup={endsGroup}
                    onReply={() => setReplyTo(message)}
                    onMemberClick={setSelectedMember}
                  />
                </div>
              );
            })}
          </div>
        )}

        {typingLine && (
          <div className="mt-2 flex items-center gap-2 pl-9" aria-live="polite">
            <span className="lms-typing" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="text-[0.75rem] text-ink-3">{typingLine}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Scroll to latest messages"
          className="lms-glass-btn absolute bottom-3 left-1/2 !h-10 !w-10 -translate-x-1/2"
        >
          <ChevronDown className="h-5 w-5" />
          {newMessageCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sw-clay)] px-1 text-[10px] font-bold leading-none text-white">
              {newMessageCount > 99 ? "99+" : newMessageCount}
            </span>
          )}
        </button>
      )}
    </div>
  );

  const canSend = !sending && Boolean(draft.trim() || attachedFile || resourceShare);

  const composerArea = (
    <form onSubmit={handleSend} className="lms-composer">
      {(replyTo || attachedFile || resourceShare) && (
        <div className="mb-2 flex flex-col gap-1.5">
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
              title="Sharing a resource"
              detail={resourceShare.name}
              onClear={() => setResourceShare(null)}
            />
          )}
          {attachedFile && (
            <ComposerChip
              icon={attachedPreviewUrl ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
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
          className="lms-composer-plus"
          aria-label="Attach a photo or file"
          title="Attach a photo or file"
        >
          <Plus className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <div className="lms-composer-field">
          <label htmlFor="community-draft" className="sr-only">
            Message {activeCommunity?.name}
          </label>
          <textarea
            id="community-draft"
            value={draft}
            onChange={(event) => {
              handleDraftChange(event.target.value);
              const el = event.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
            onBlur={() => sendTyping(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend(event as unknown as React.FormEvent);
                event.currentTarget.style.height = "auto";
              }
            }}
            rows={1}
            placeholder={activeCommunity ? `Message ${activeCommunity.name}` : "Message"}
          />
          <button
            type="submit"
            disabled={!canSend}
            className="lms-composer-send"
            aria-label="Send message"
            title="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" strokeWidth={2.8} />}
          </button>
        </div>
      </div>
    </form>
  );

  const roomList = (
    <ul className="m-0 list-none p-0">
      {filteredCommunities.map((community) => (
        <li key={community.id}>
          <RoomRow
            community={community}
            active={community.id === activeId}
            onClick={() => {
              setActiveId(community.id);
              setMobileScreen("chat");
            }}
          />
        </li>
      ))}
      {filteredCommunities.length === 0 && (
        <li className="px-4 py-8 text-center text-[0.86rem] text-ink-3">No rooms match “{search}”.</li>
      )}
    </ul>
  );

  const roomSearch = (
    <div className="lms-search">
      <label htmlFor="room-search" className="sr-only">
        Search rooms
      </label>
      <Search aria-hidden="true" className="lms-search-glyph" strokeWidth={2.2} />
      <input
        id="room-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && search) setSearch("");
        }}
        autoComplete="off"
        placeholder="Search"
      />
      {search && (
        <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="lms-search-clear">
          <X className="h-3 w-3" strokeWidth={3} />
        </button>
      )}
    </div>
  );

  const roomSubtitle = (
    <>
      <ConnectionDot state={connection} />
      {onlineMembers.length} online
      {members.length > 0 ? ` · ${members.length} members` : ""}
    </>
  );

  return (
    <>
      {/* Phones and tablets: room list, then the conversation, then its details (as in Messages on iPhone) */}
      <div className="lg:hidden">
        <div className={cx("lms-msg-window flex flex-col", mobileScreen === "chat" && "hidden")}>
          <div className="flex flex-col gap-3 px-3 pb-2 pt-3">
            {roomSearch}
            {totalUnread > 0 && (
              <p className="m-0 px-1 text-[0.8rem] font-medium text-accent">
                {unreadBadgeLabel(totalUnread)} unread {totalUnread === 1 ? "message" : "messages"}
              </p>
            )}
          </div>
          <div className="lms-scroll flex-1 overflow-y-auto pb-2">{roomList}</div>
        </div>

        {mobileScreen === "chat" && (
          <div className="lms-msg-fullscreen">
            <header className="lms-navbar">
              <button type="button" onClick={() => setMobileScreen("list")} className="lms-navbar-back" aria-label="Back to rooms">
                <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
                <span className="hidden min-[400px]:inline">Rooms</span>
              </button>
              <button type="button" onClick={() => setMobileMembersOpen(true)} className="flex min-w-0 flex-1 flex-col items-center px-2" aria-label="Room details">
                <span className="max-w-full truncate text-[0.98rem] font-semibold text-ink">{activeCommunity?.name}</span>
                <span className="flex items-center gap-1 text-[0.72rem] text-ink-3">{roomSubtitle}</span>
              </button>
              <button type="button" onClick={() => setMobileMembersOpen(true)} className="lms-gpop-x !h-10 !w-10 text-accent" aria-label="Room details">
                <Info className="h-[21px] w-[21px]" strokeWidth={2} />
              </button>
            </header>
            {messagesArea}
            {composerArea}
          </div>
        )}

        {mobileScreen === "chat" && mobileMembersOpen && (
          <div className="lms-msg-fullscreen">
            <header className="lms-navbar">
              <button type="button" onClick={() => setMobileMembersOpen(false)} className="lms-navbar-back" aria-label="Back to conversation">
                <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
                <span>Chat</span>
              </button>
              <span className="flex-1 truncate text-center text-[0.98rem] font-semibold text-ink">Details</span>
              <span className="w-16" aria-hidden="true" />
            </header>
            <div className="lms-scroll flex-1 overflow-y-auto p-4">
              <RoomIdentity community={activeCommunity} subtitle={roomSubtitle} />
              <MembersPanel {...membersPanelProps} />
            </div>
          </div>
        )}
      </div>

      {/* Laptops and up: rooms, conversation and details side by side, as in Messages on the Mac */}
      <div className="lms-msg-window hidden lg:grid lg:h-[calc(100dvh-var(--lms-top)-11rem)] lg:min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px]">
        <aside className="lms-msg-rooms flex min-h-0 flex-col">
          <div className="flex flex-col gap-2.5 p-3">
            {roomSearch}
            {totalUnread > 0 && (
              <p className="m-0 px-1 text-[0.78rem] font-medium text-accent">
                {unreadBadgeLabel(totalUnread)} unread {totalUnread === 1 ? "message" : "messages"}
              </p>
            )}
          </div>
          <div className="lms-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-2">{roomList}</div>
        </aside>

        <section aria-label={activeCommunity?.name ?? "Conversation"} className="flex min-h-0 min-w-0 flex-col">
          <header className="lms-chat-head">
            <RoomAvatar type={activeCommunity?.type} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="m-0 truncate text-[0.98rem] font-semibold tracking-[-0.01em] text-ink">{activeCommunity?.name}</h2>
              <p className="m-0 flex items-center gap-1 truncate text-[0.75rem] text-ink-3">{roomSubtitle}</p>
            </div>
            {activeCommunity?.type && <span className="lms-chip-milk hidden sm:inline-flex">{communityTypeBadge(activeCommunity.type)}</span>}
          </header>
          {messagesArea}
          {composerArea}
        </section>

        <aside aria-label="Room details" className="lms-msg-details lms-scroll hidden min-h-0 overflow-y-auto p-4 xl:block">
          <RoomIdentity community={activeCommunity} subtitle={roomSubtitle} />
          <MembersPanel {...membersPanelProps} />
        </aside>
      </div>

      <UserProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </>
  );
}

const LAGOS_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" });

function sameLagosDay(a: string, b: string) {
  return LAGOS_DAY.format(new Date(a)) === LAGOS_DAY.format(new Date(b));
}

/** "Today 3:42 PM", "Yesterday 9:10 AM", "Monday 2:05 PM", "12 Oct 2026 4:00 PM", as Messages labels a new burst. */
function formatDivider(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" }).format(date);
  const now = Date.now();
  const key = LAGOS_DAY.format(date);
  if (key === LAGOS_DAY.format(new Date(now))) return `Today ${time}`;
  if (key === LAGOS_DAY.format(new Date(now - 86_400_000))) return `Yesterday ${time}`;
  if (now - date.getTime() < 6 * 86_400_000) {
    return `${new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Africa/Lagos" }).format(date)} ${time}`;
  }
  return `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(date)} ${time}`;
}

const ROOM_TONE: Record<string, string> = {
  GENERAL: "green",
  COURSE: "blue",
  HELP: "orange",
  INSTRUCTOR_GENERAL: "indigo",
  ADMIN_GENERAL: "gray",
  CUSTOM: "gold",
};

function RoomAvatar({ type, size = "md" }: { type?: Community["type"]; size?: "sm" | "md" | "lg" }) {
  const tone = ROOM_TONE[type ?? ""] ?? "green";
  return (
    <span className={cx("lms-room-avatar", `lms-sym--${tone}`, size === "sm" && "lms-room-avatar--sm", size === "lg" && "lms-room-avatar--lg")} aria-hidden="true">
      <CommunityTypeIcon type={type ?? "GENERAL"} />
    </span>
  );
}

function RoomIdentity({ community, subtitle }: { community?: Community; subtitle: React.ReactNode }) {
  if (!community) return null;
  return (
    <div className="mb-5 flex flex-col items-center text-center">
      <RoomAvatar type={community.type} size="lg" />
      <h2 className="m-0 mt-3 text-[1.1rem] font-semibold tracking-[-0.01em] text-ink">{community.name}</h2>
      <p className="m-0 mt-0.5 flex items-center gap-1 text-[0.8rem] text-ink-3">{subtitle}</p>
      <span className="lms-chip-milk mt-2.5">{communityTypeLabel(community.type)}</span>
    </div>
  );
}

function MembersPanel({
  rosterExpanded,
  setRosterExpanded,
  memberMode,
  setMemberMode,
  memberPage,
  setMemberPage,
  rosterTotalPages,
  onlineMembers,
  compactOnlineMembers,
  displayedMembers,
  loadingMembers,
  memberTotalItems,
  onlineIds,
  onMemberClick,
}: {
  rosterExpanded: boolean;
  setRosterExpanded: (value: boolean) => void;
  memberMode: MemberMode;
  setMemberMode: (value: MemberMode) => void;
  memberPage: number;
  setMemberPage: (value: number | ((current: number) => number)) => void;
  rosterTotalPages: number;
  onlineMembers: Member[];
  compactOnlineMembers: Member[];
  displayedMembers: Member[];
  loadingMembers: boolean;
  memberTotalItems: number;
  onlineIds: Set<string>;
  onMemberClick: (member: Member) => void;
}) {
  const list = rosterExpanded ? displayedMembers : compactOnlineMembers;
  return (
    <section aria-label="Members">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-ink-3">
          {rosterExpanded ? (memberMode === "online" ? "Online now" : "All members") : "Online now"}
        </h3>
        <span className="text-[0.75rem] font-semibold text-accent">{onlineMembers.length} online</span>
      </div>

      {rosterExpanded && (
        <div role="tablist" aria-label="Members" className="lms-segmented mb-3 grid w-full grid-cols-2">
          {(["online", "all"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={memberMode === mode}
              onClick={() => {
                setMemberMode(mode);
                setMemberPage(1);
              }}
              className="lms-segment justify-center"
            >
              {mode === "online" ? "Online" : "Everyone"}
            </button>
          ))}
        </div>
      )}

      <div className="lms-group">
        {loadingMembers && (
          <p className="m-0 flex items-center gap-2 px-4 py-3 text-[0.82rem] text-ink-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating members
          </p>
        )}
        {!loadingMembers && list.length === 0 && (
          <p className="m-0 px-4 py-4 text-[0.85rem] text-ink-3">
            {memberMode === "online" || !rosterExpanded ? "Nobody is online right now." : "No members found for this room."}
          </p>
        )}
        <ul className="m-0 list-none p-0">
          {list.map((member, index) => (
            <li key={memberId(member) ? `${memberId(member)}-${index}` : `member-${index}`}>
              <MemberRow
                member={member}
                online={(memberId(member) ? onlineIds.has(memberId(member) as string) : false) || Boolean(member.is_online)}
                onClick={() => onMemberClick(member)}
              />
            </li>
          ))}
        </ul>
      </div>

      {!rosterExpanded ? (
        <button
          type="button"
          onClick={() => {
            setRosterExpanded(true);
            setMemberMode("online");
            setMemberPage(1);
          }}
          className="lms-text-btn mt-2 w-full justify-center"
        >
          Show all members
        </button>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-2">
          {rosterTotalPages > 1 && (
            <nav className="lms-pager" aria-label="Member pages">
              <button type="button" onClick={() => setMemberPage((current) => Math.max(1, current - 1))} disabled={memberPage <= 1} aria-label="Previous members page" className="lms-page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-1 text-[0.8rem] tabular-nums text-ink-3">
                {memberPage} of {rosterTotalPages}
              </span>
              <button type="button" onClick={() => setMemberPage((current) => Math.min(rosterTotalPages, current + 1))} disabled={memberPage >= rosterTotalPages} aria-label="Next members page" className="lms-page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
          {memberMode === "all" && memberTotalItems > 0 && (
            <p className="m-0 text-[0.75rem] text-ink-3">{memberTotalItems} members in this room</p>
          )}
          <button
            type="button"
            onClick={() => {
              setRosterExpanded(false);
              setMemberMode("online");
              setMemberPage(1);
            }}
            className="lms-text-btn"
          >
            Show less
          </button>
        </div>
      )}
    </section>
  );
}

function RoomRow({ community, active, onClick }: { community: Community; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? "true" : undefined} className="lms-room-row group">
      <RoomAvatar type={community.type} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.92rem] font-semibold tracking-[-0.01em]">{community.name}</span>
        <span className="lms-room-sub block truncate text-[0.78rem]">
          {communityTypeLabel(community.type)}
          {typeof community.member_count === "number" ? ` · ${community.member_count} members` : ""}
        </span>
      </span>
      <ChevronRight className="lms-room-chev h-4 w-4 flex-none lg:hidden" aria-hidden="true" />
    </button>
  );
}

function MessageBubble({
  message,
  own,
  startsGroup,
  endsGroup,
  onReply,
  onMemberClick,
}: {
  message: Message;
  own: boolean;
  startsGroup: boolean;
  endsGroup: boolean;
  onReply: () => void;
  onMemberClick: (member: Member) => void;
}) {
  const name = displayName(message.sender);
  const staffLabel = staffRoleLabel(message.sender);
  const onlyMedia = !message.body && !message.reply_to && message.attachment_kind === "IMAGE";

  return (
    <div className={cx("group flex items-end gap-2", own ? "justify-end" : "justify-start", startsGroup ? "mt-3" : "mt-0.5")}>
      {!own && (
        <span className="w-7 flex-none">
          {endsGroup && (
            <button
              type="button"
              onClick={() => message.sender && onMemberClick(message.sender)}
              className="block rounded-full"
              aria-label={`View ${name}'s profile`}
              title={name}
            >
              <Avatar member={message.sender} size="sm" />
            </button>
          )}
        </span>
      )}
      <div className={cx("flex max-w-[82%] flex-col sm:max-w-[68%]", own ? "items-end" : "items-start")}>
        {!own && startsGroup && (
          <button
            type="button"
            onClick={() => message.sender && onMemberClick(message.sender)}
            className="mb-0.5 ml-3 flex items-center gap-1.5 text-[0.72rem] font-medium text-ink-3 hover:text-ink"
          >
            {name}
            {staffLabel && <StaffBadge label={staffLabel} />}
          </button>
        )}
        <div className="flex items-center gap-1.5">
          {own && <ReplyButton onReply={onReply} />}
          <div
            className={cx(
              "lms-bubble",
              own ? "lms-bubble--own" : "lms-bubble--them",
              endsGroup && "lms-bubble--tail",
              onlyMedia && "lms-bubble--media",
            )}
            title={formatMessageTime(message.created_at)}
          >
            {message.reply_to && (
              <div className="lms-bubble-quote">
                <span className="block text-[0.72rem] font-semibold">{displayName(message.reply_to.sender ?? undefined)}</span>
                <span className="block truncate text-[0.78rem]">
                  {message.reply_to.body || message.reply_to.attachment_file_name || "Previous message"}
                </span>
              </div>
            )}
            {message.body && <p className="m-0 whitespace-pre-wrap break-words">{message.body}</p>}
            {message.attachment_url && <MessageAttachment message={message} own={own} />}
            {message.resource_reference && <ResourceCard resource={message.resource_reference} own={own} />}
          </div>
          {!own && <ReplyButton onReply={onReply} />}
        </div>
        {endsGroup && (
          <span className={cx("mt-1 flex items-center gap-1 text-[0.68rem] text-ink-3", own ? "mr-2" : "ml-3")}>
            {formatMessageTime(message.created_at)}
            {own && (message.status === "sending" ? " · Sending…" : " · Delivered")}
          </span>
        )}
      </div>
    </div>
  );
}

function ReplyButton({ onReply }: { onReply: () => void }) {
  return (
    <button
      type="button"
      onClick={onReply}
      className="grid h-7 w-7 flex-none place-items-center rounded-full text-ink-3 opacity-0 transition-opacity hover:bg-ink/[0.06] hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-60"
      aria-label="Reply to message"
      title="Reply"
    >
      <Reply className="h-4 w-4" />
    </button>
  );
}

function MessageAttachment({ message, own }: { message: Message; own: boolean }) {
  if (message.attachment_kind === "IMAGE") {
    return (
      <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className={cx("block overflow-hidden rounded-[14px]", message.body && "mt-1.5")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={message.attachment_url} alt={message.attachment_file_name || "Image"} className="max-h-72 max-w-full object-cover transition-opacity hover:opacity-90" />
      </a>
    );
  }

  return (
    <a
      href={message.attachment_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cx("lms-bubble-file", own ? "lms-bubble-file--own" : "", message.body && "mt-1.5")}
    >
      <span className="lms-sym lms-sym--blue !h-9 !w-9 !rounded-[9px]">
        <FileText className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.82rem] font-semibold">{message.attachment_file_name || "Attachment"}</span>
        {typeof message.attachment_file_size_bytes === "number" && (
          <span className="block text-[0.72rem] opacity-75">{formatBytes(message.attachment_file_size_bytes)}</span>
        )}
      </span>
    </a>
  );
}

function ResourceCard({ resource, own }: { resource: ResourceReference; own: boolean }) {
  const content = (
    <span className={cx("lms-bubble-file", own ? "lms-bubble-file--own" : "", "mt-1.5")}>
      {resource.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resource.thumbnail_url} alt="" className="h-11 w-11 flex-none rounded-[10px] object-cover" />
      ) : (
        <span className="lms-sym lms-sym--green !h-11 !w-11 !rounded-[10px]">
          <BookOpen className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.82rem] font-semibold">{resource.name}</span>
        <span className="block truncate text-[0.72rem] opacity-75">{resource.category ? resource.category.replaceAll("_", " ").toLowerCase() : "Resource"}</span>
      </span>
    </span>
  );

  if (!resource.slug) return content;
  return (
    <Link href={`/resources/${resource.slug}`} className="block text-inherit no-underline">
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
    <div className="flex items-center gap-3 rounded-[14px] bg-[var(--lms-milk)] px-3 py-2 shadow-[inset_0_0_0_1px_var(--lms-milk-line)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-9 w-9 rounded-[8px] object-cover" />
      ) : (
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[8px] bg-card text-accent dark:bg-white/[0.06]">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8rem] font-semibold text-ink">{title}</span>
        <span className="block truncate text-[0.75rem] text-ink-3">{detail}</span>
      </span>
      <button type="button" onClick={onClear} className="lms-gpop-x !h-8 !w-8" aria-label="Remove" title="Remove">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function MemberRow({ member, online, onClick }: { member: Member; online: boolean; onClick: () => void }) {
  const firstName = memberFirstName(member);
  const username = memberUsername(member);
  const staffLabel = staffRoleLabel(member);

  return (
    <button type="button" onClick={onClick} className="lms-member-row">
      <span className="relative flex-none">
        <Avatar member={member} />
        <span className={cx("lms-presence", online && "lms-presence--on")} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-1.5 truncate text-[0.88rem] font-semibold text-ink">
          {firstName}
          {staffLabel && <StaffBadge label={staffLabel} />}
        </span>
        <span className="block truncate text-[0.75rem] text-ink-3">{[username, online ? "Online" : "Offline"].filter(Boolean).join(" · ")}</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-none text-ink-3" aria-hidden="true" />
    </button>
  );
}

/** A contact card, as a sheet over the conversation. */
function UserProfileModal({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const doneRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!member) return;
    const frame = requestAnimationFrame(() => doneRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [member, onClose]);

  if (!member) return null;

  const name = displayName(member);
  const username = memberUsername(member);
  const role = memberRoleLabel(member);
  const profile = memberProfile(member);
  const image = profile.profile_picture_url || profile.image;

  return (
    <div className="lms-alert-scrim !z-[70] !place-items-end sm:!place-items-center">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <section role="dialog" aria-modal="true" aria-labelledby="community-user-profile-title" className="lms-contact">
        <div className="flex justify-end">
          <button ref={doneRef} type="button" onClick={onClose} className="lms-text-btn !font-semibold">
            Done
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#a3aab0,#868e96)] text-[2rem] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.4)]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(name).toUpperCase()
            )}
          </span>
          <h2 id="community-user-profile-title" className="m-0 mt-3 break-words text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">
            {name}
          </h2>
          {username && <p className="m-0 mt-0.5 break-words text-[0.9rem] text-ink-3">{username}</p>}
        </div>
        <dl className="lms-group mt-5">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="text-[0.9rem] text-ink-2">Role</dt>
            <dd className="m-0 flex items-center gap-1.5 text-[0.9rem] font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-accent" />
              {role}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function StaffBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex flex-none items-center gap-0.5 rounded-full bg-[color-mix(in_srgb,#2f80ed_14%,transparent)] px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-[0.04em] text-[#2f6fd6] dark:text-[#6aa8ff]" title={label}>
      <ShieldCheck className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function Avatar({ member, size = "md" }: { member?: Member; size?: "sm" | "md" }) {
  const name = displayName(member);
  const profile = memberProfile(member);
  const image = profile.profile_picture_url || profile.image;
  const sizeClass = size === "sm" ? "h-7 w-7 text-[0.62rem]" : "h-9 w-9 text-[0.75rem]";

  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={cx("flex-none rounded-full object-cover", sizeClass)} />;
  }

  // Monogram, as Contacts draws one when there is no photo.
  return (
    <span className={cx("grid flex-none place-items-center rounded-full bg-[linear-gradient(180deg,#a3aab0,#868e96)] font-semibold text-white", sizeClass)}>
      {initials(name).toUpperCase()}
    </span>
  );
}

function ConnectionDot({ state }: { state: ConnectionState }) {
  const label = state === "open" ? "Live" : state === "connecting" ? "Connecting" : "Offline";
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span className={cx("lms-presence !static !h-2 !w-2 !shadow-none", state === "open" && "lms-presence--on", state === "connecting" && "lms-presence--wait")} aria-hidden="true" />
      <span className="sr-only">{label}, </span>
    </span>
  );
}
