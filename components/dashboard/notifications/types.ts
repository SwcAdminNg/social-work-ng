export type NotificationItem = {
  id: string;
  created_at: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  metadata_json?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
};

export type NotificationListMeta = {
  page?: number;
  page_size?: number;
  total_items?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
};

export type NotificationListResponse = {
  data?: NotificationItem[];
  message?: string;
  meta?: NotificationListMeta;
};
