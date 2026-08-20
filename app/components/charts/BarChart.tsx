"use client";

import { useMemo } from "react";

function cn(
  ...classes: Array<string | false | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

export type BarDatum = {
  label: string;
  value: number;
  color?: string;
  logo?: string;
  flag?: string;
};

const W = 360;
const H = 220;

const BarChart = ({
  data,
  isLoading,
  title,
}: {
  data: BarDatum[];
  isLoading?: boolean;
  title?: string;
}) => {
  const { max, items } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.value));

    return { max, items: data };
  }, [data]);

  const paddingTop = 14;
  const paddingBottom = 24;
  const paddingLeft = 100;
  const paddingRight = 20;
  const barHeight = 14;
  const rowGap = 28;
  const plotW = W - paddingLeft - paddingRight;
  const maxBarWidth = 210;
  const showValue = !isLoading;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full min-w-[300px] h-auto"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <line
        x1={paddingLeft}
        y1={H - paddingBottom}
        x2={W - paddingRight}
        y2={H - paddingBottom}
        className="stroke-slate-200"
        strokeWidth={1}
      />

      {items.map((d, i) => {
        const y = paddingTop + i * (barHeight + rowGap);
        const centerY = y + barHeight / 2;

        const width = showValue
          ? (d.value / max) * maxBarWidth
          : plotW * 0.45;
        const barColor = d.color ?? "text-blue-500";

        return (
          <g key={d.label}>
            {d.logo ? (
              <>
                <image
                  href={d.logo}
                  x={0}
                  y={y + barHeight / 2 - 8}
                  width={14}
                  height={14}
                  preserveAspectRatio="xMidYMid meet"
                />

                <text
                  x={14 + 6}
                  y={y + barHeight / 2}
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {d.label}
                </text>
              </>
            ) : d.flag ? (
              <>
                <foreignObject
                  x={0}
                  y={centerY - 7}
                  width={16}
                  height={14}
                >
                  <span
                    className={`fi fi-${String(d.flag).toLowerCase()}`}
                    style={{
                      display: "block",
                      width: "16px",
                      height: "12px",
                      marginTop: "1px",
                    }}
                  />
                </foreignObject>

                <text
                  x={26}
                  y={centerY}
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {d.label}
                </text>
              </>
            ) : (
              <text
                x={paddingLeft - 8}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-500 text-[10px]"
              >
                {d.label}
              </text>
            )}

            <rect
              x={paddingLeft}
              y={y}
              width={width}
              height={barHeight}
              rx={3}
              className={cn(
                "fill-current",
                isLoading
                  ? "text-slate-200"
                  : barColor
              )}
            />

            {showValue && (
              <text
                x={paddingLeft + width + 6}
                y={y + barHeight / 2 + 5}
                className="fill-slate-600 text-[10px] font-medium"
              >
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default BarChart;
