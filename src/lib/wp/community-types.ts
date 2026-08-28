export type WpActivityItem = {
  id: number;
  user_id: number;
  component: string;
  type: string;
  action: string;
  content: { rendered: string };
  date: string;
  link: string;
  user_name: string;
  user_avatar: { thumb: string; full: string };
  comment_count: number;
  favorite_count: number;
  favorited: boolean;
};

export type WpActivityListResponse = {
  activities: WpActivityItem[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
};

export type WpFioMembership = {
  id: number;
  name: string;
  slug: string;
  link: string;
  status: string;
  type: string;
  role_in_group: string;
  is_admin: boolean;
  is_mod: boolean;
  date_modified: string;
};

export type WpMemberSummary = {
  id: number;
  name: string;
  username: string;
  slug: string;
  email: string;
  role: string;
  avatar: string;
  link: string;
  fios: WpFioMembership[];
  primary_fio: WpFioMembership | null;
  primary_fio_id: number;
  fio: string;
  fio_id: number;
  fio_slug: string;
  fio_link: string;
  fio_role: string;
};

export type WpMemberProfile = WpMemberSummary & {
  bio: string;
  phone: string;
  ville: string;
};

export type WpFio = {
  id: number;
  nom: string;
  description: string;
  jour: string;
  horaire: string;
  pilote: string;
  pilier: string;
  membres: number;
  image: string;
  link: string;
  date_creation: string;
  slug: string;
  zoom_link: string;
  ville?: string;
  lat?: string;
  lng?: string;
  types?: string[];
  category?: string;
};

export type WpFioMember = {
  id: number;
  name: string;
  avatar: string;
};

export type CommunityMember = Omit<WpMemberSummary, "email">;

export type CommunityMemberProfile = Omit<WpMemberProfile, "email" | "phone"> & {
  phone?: string;
};

export type WpActivityComment = {
  id: number;
  user_id: number;
  content: { rendered: string };
  date: string;
  user_name: string;
  user_avatar: { thumb: string; full: string };
};

export type WpFavoriteResult = {
  favorited: boolean;
  favorite_count: number;
};

export type WpJoinFioResult = {
  success?: boolean;
  message?: string;
  fio_id?: number;
  status?: string;
};
