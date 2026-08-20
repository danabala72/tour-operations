import { statusFilters, statusStyles } from "../../types/style";
import { Circle } from "lucide-react";

const StatusBadge = ({
  status,
  large,
}: {
  status: string;
  large?: boolean;
}) => {
  const base =
    "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-medium";

  const sizing = large
    ? "px-3.5 py-1.5 text-xs"
    : "px-2.5 py-0.5 text-[11px]";

  const style =
    statusStyles[status] ??
    "bg-slate-100 text-slate-700 ring-slate-200";

  const config = statusFilters.find(
    (item) => item.value === status
  );

  const Icon = config?.icon ?? Circle;
  const iconColor = config?.color ?? "text-slate-500";

  return (
    <span
      className={`${base} ${sizing} ${style} ring-1`}
      title={config?.label ?? status}
    >
      <Icon
        size={large ? 14 : 12}
        strokeWidth={2}
        className={`shrink-0 ${iconColor}`}
      />

      <span>{config?.label ?? status}</span>
    </span>
  );
};

export default StatusBadge;