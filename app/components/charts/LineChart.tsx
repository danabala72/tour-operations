"use client";

import { useMemo } from "react";
import type { Series } from "@/app/types/dashboard";

function cn(
  ...classes: Array<string | false | undefined | null>
) {
  return classes.filter(Boolean).join(" ");
}

const W = 640;
const H = 300;

const P_TOP = 28;
const P_BOTTOM = 56;
const P_LEFT = 48;
const P_RIGHT = 16;

const plotW = W - P_LEFT - P_RIGHT;
const plotH = H - P_TOP - P_BOTTOM;

function smoothPath(
  pts: Array<{ x: number; y: number }>,
  tension = 0.3
) {
  if (pts.length < 2) {
    if (pts.length === 1) {
      return `M ${pts[0].x} ${pts[0].y}`;
    }
    return "";
  }

  const d: string[] = [`M ${pts[0].x} ${pts[0].y}`];

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const ap = pts[i - 1] ?? a;
    const bp = pts[i + 2] ?? b;

    const c1x = a.x + (b.x - ap.x) * tension;
    const c1y = a.y + (b.y - ap.y) * tension;
    const c2x = b.x - (bp.x - a.x) * tension;
    const c2y = b.y - (bp.y - a.y) * tension;

    d.push(
      `C ${c1x} ${c1y} ${c2x} ${c2y} ${b.x} ${b.y}`
    );
  }

  return d.join(" ");
}

function niceTicks(max: number, count = 4) {
  const raw = Math.max(1, Math.ceil(max));
  const step = Math.max(1, Math.ceil(raw / count));

  const ticks: number[] = [];

  for (let i = 0; i <= count; i++) {
    ticks.push(step * i);
  }

  if (ticks[ticks.length - 1] < raw) {
    ticks.push(step * Math.ceil(raw / step));
  }

  return ticks;
}

export default function LineChart({
  dates,
  series,
  isLoading,
  title,
}: {
  dates: string[];
  series: Series[];
  isLoading?: boolean;
  title?: string;
}) {
  const n = dates.length;
  const hasData = n > 0 && !isLoading;

  const yMax = useMemo(() => {
    if (!hasData) {
      return 0;
    }

    let max = 0;

    for (const s of series) {
      for (const p of s.points) {
        if (p.count > max) {
          max = p.count;
        }
      }
    }

    return Math.max(1, max);
  }, [hasData, series]);

  const yScale = (v: number) =>
    P_TOP + plotH - (v / Math.max(1, yMax)) * plotH;

  const xScale = (i: number) =>
    n > 1
      ? P_LEFT + (i / (n - 1)) * plotW
      : P_LEFT + plotW / 2;

  const ticks = niceTicks(yMax, 4);

  const bgTicks = Array.from({ length: 5 }, () => 0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full min-w-[600px] h-auto"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <line
        x1={P_LEFT}
        y1={H - P_BOTTOM}
        x2={W - P_RIGHT}
        y2={H - P_BOTTOM}
        className="stroke-slate-300"
        strokeWidth={1}
      />

      <line
        x1={P_LEFT}
        y1={P_TOP}
        x2={P_LEFT}
        y2={H - P_BOTTOM}
        className="stroke-slate-200"
        strokeWidth={1}
      />

      {hasData ? (
        ticks.map((t) => (
          <g key={t}>
            <line
              x1={P_LEFT}
              y1={yScale(t)}
              x2={W - P_RIGHT}
              y2={yScale(t)}
              className="stroke-slate-100"
              strokeWidth={1}
            />
            <text
              x={P_LEFT - 6}
              y={yScale(t) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[10px]"
            >
              {t}
            </text>
          </g>
        ))
      ) : (
        bgTicks.map((_, i) => (
          <line
            key={i}
            x1={P_LEFT}
            y1={P_TOP + (i * plotH) / 4}
            x2={W - P_RIGHT}
            y2={P_TOP + (i * plotH) / 4}
            className="stroke-slate-100"
            strokeWidth={1}
          />
        ))
      )}

      {hasData && (
        <>
          {dates.map((date, i) => (
            <text
              key={date}
              textAnchor="end"
              className="fill-slate-400 text-[10px]"
              transform={`translate(${xScale(i)}, ${H - P_BOTTOM}) rotate(-45)`}
            >
              {date.slice(5, 10)}
            </text>
          ))}

          {series.map((s) => {
            const pts = dates.map((date, i) => {
              const point = s.points.find(
                (p) => p.date === date
              );

              return {
                x: xScale(i),
                y: yScale(point ? point.count : 0),
              };
            });

            const path = smoothPath(pts);

            return (
              <g key={s.name}>
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "drop-shadow-sm",
                    s.color
                  )}
                />

                {pts.map((p, i) => {
                  const point = s.points.find(
                    (pt) => pt.date === dates[i]
                  );

                  if (!point) {
                    return null;
                  }

                  return (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={3.5}
                        fill="currentColor"
                        className={s.color}
                      />

                      <text
                        x={p.x}
                        y={p.y - 9}
                        textAnchor="middle"
                        className={cn(
                          "fill-slate-600 text-[10px] font-medium",
                          s.color
                        )}
                      >
                        {point.count}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </>
      )}

      {!hasData && (
        <text
          x={W / 2}
          y={H / 2 + 6}
          textAnchor="middle"
          className="fill-slate-400 text-xs"
        >
          {isLoading
            ? "Loading..."
            : "No data for this period"}
        </text>
      )}
    </svg>
  );
}
