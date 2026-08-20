import { ElementType, ReactNode } from "react";

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: ElementType;
  label: string;
  value: ReactNode;
}) => {
  return (
    <div className="flex items-start justify-between border-b border-slate-50 last:border-0">
      <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        {Icon && <Icon size={12} strokeWidth={1.9} />}
        {label}
      </span>

      <span className="mt-1 text-sm font-medium text-slate-800 text-right">
        {value}
      </span>
    </div>
  );
}

export default InfoRow
