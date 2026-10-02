import { NotificationInbox } from "@/components/dashboard/notifications/NotificationInbox";
import type {
  NotificationItem,
  NotificationListMeta,
} from "@/components/dashboard/notifications/types";
import { normalizeNotification } from "@/components/dashboard/notifications/utils";
import { fetchApi } from "@/lib/fetchApi";

export const metadata = {
  title: "Notifications | Dashboard",
};

async function getNotifications(): Promise<{
  items: NotificationItem[];
  meta?: NotificationListMeta;
  error: string | null;
}> {
  try {
    const res = await fetchApi("/notifications?page=1&page_size=20", {
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        items: [],
        meta: undefined,
        error: json?.message || "Unable to load notifications.",
      };
    }

    return {
      items: Array.isArray(json?.data)
        ? json.data
            .map((item: unknown) => normalizeNotification(item))
            .filter((item: NotificationItem | null): item is NotificationItem =>
              Boolean(item),
            )
        : [],
      meta: json?.meta,
      error: null,
    };
  } catch {
    return {
      items: [],
      meta: undefined,
      error: "Unable to load notifications.",
    };
  }
}

export default async function NotificationsPage() {
  const { items, meta, error } = await getNotifications();

  return (
    <>
      {error && (
        <div className="mx-auto mb-4 max-w-[1120px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </div>
      )}
      <NotificationInbox initialItems={items} initialMeta={meta} />
    </>
  );
}
