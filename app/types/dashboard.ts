export type ChannelStat = {
  code: string | null;
  name: string | null;
  count: number;
  color: string;
};

export type LanguageStat = {
  language: string;
  count: number;
};

export type DatePoint = {
  date: string;
  count: number;
};

export type Series = {
  name: string;
  color: string;
  points: DatePoint[];
};

export type Summary = {
  totalBookings: number;
  totalPax: number;
  totalRevenue: number;
  completed: number;
  cancelled: number;
};

export type DashboardStats = {
  summary: Summary;
  byChannel: ChannelStat[];
  byLanguage: LanguageStat[];
  dates: string[];
  series: Series[];
};
