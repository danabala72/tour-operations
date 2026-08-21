import { CheckCircle2, Clock3, ListFilter, Sparkles, UserCheck, XCircle } from "lucide-react";

export const statusStyles: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  ASSIGNED: "bg-amber-50 text-amber-700 ring-amber-200",
  ON_PROGRESS: "bg-purple-50 text-purple-700 ring-purple-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

export const statusFilters = [
  {
    value: "",
    label: "All",
    icon: ListFilter,
    color: "text-slate-500",
  },
  {
    value: "NEW",
    label: "New",
    icon: Sparkles,
    color: "text-blue-500",
  },
  {
    value: "ASSIGNED",
    label: "Assigned",
    icon: UserCheck,
    color: "text-amber-500",
  },
  {
    value: "ON_PROGRESS",
    label: "In Progress",
    icon: Clock3,
    color: "text-purple-500",
  },
  {
    value: "DONE",
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-500",
  }
];