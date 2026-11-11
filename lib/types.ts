export type Step = {
  title: string;
  kind: "text" | "math" | "scene";
  content: string;
  note?: string;
};

export type Question = {
  id: string;
  subject_slug: string;
  topic_slug: string;
  year: number;
  qnum: number;
  stem: string;
  options: { label: string; text: string }[];
  answer: string;
  explanation: string;
  kind: "single" | "multi";
  steps: Step[] | null;
  difficulty: number;
  is_free: boolean;
};

export type Subject = {
  slug: string;
  name: string;
  blurb: string;
  color: string;
};

export type Topic = {
  slug: string;
  subject_slug: string;
  name: string;
  blurb: string;
};

export type Video = {
  id: string;
  subject_slug: string;
  topic_slug: string;
  youtube_id: string;
  title: string;
  channel: string;
  blurb: string;
};

export type Annotation = {
  id: string;
  video_id: string;
  t_start: number;
  t_end: number;
  title: string;
  body: string;
  kind: "note" | "sim" | "article";
  sim_slug: string | null;
  article_slug: string | null;
};

export type Sim = {
  slug: string;
  topic_slug: string;
  title: string;
  blurb: string;
  kind: "projectile" | "wave" | "ohm";
};

export type Article = {
  slug: string;
  subject_slug: string;
  topic_slug: string;
  title: string;
  summary: string;
  body: string;
  read_min: number;
};

export type ComboRow = {
  id: number;
  career: string;
  course: string;
  master_key: string;
  jamb_subjects: string[];
  olevel_note: string;
  notes: string;
};
