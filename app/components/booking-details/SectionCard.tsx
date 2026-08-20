import { ElementType, ReactNode } from "react";

const SectionCard = ({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`
        rounded-2xl
        bg-white
        p-5
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        ring-1
        ring-slate-100
        ${className ?? ""}
      `}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className="
            flex
            size-8
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
          "
        >
          <Icon size={16} strokeWidth={1.9} />
        </div>

        <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

export default SectionCard