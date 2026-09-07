"use client";

import { formatDate, formatTime } from "@/lib/format";
import { useEffect, useRef, useState } from "react";
import {
  ListFilter,
  MessageSquareText,
  XIcon,
  Users,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { statusFilters } from "@/app/types/style";
import BulkStatusActionBar from "@/app/components/booking-details/BulkStatusActionBar";

type Reservation = {
  id: number;
  supplierBookingId: string;
  supplierReference: string | null;
  tourName: string;
  tourOption: string | null;
  tourDate: string;
  tourTime: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  paxTotal: number;
  language: string | null;
  pickupTime: string | null;
  pickupAddress: string | null;
  customerNote: string | null;
  salePrice: number | string | null;
  netPrice: number | string | null;
  currency: string | null;
  status: string;
  channel: {
    code: string | null;
    name: string | null;
  };
  rescheduleDate: string | null;
  rescheduledFrom: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiResponse = {
  success: boolean;
  data: Reservation[];
  channelCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  dateCounts: Record<string, number>;
  pagination: Pagination;
  message?: string;
};



const channelFilters = [
  {
    value: "",
    label: "All",
    icon: ListFilter,
  },
  {
    value: "CIVITATIS",
    label: "Civitatis",
    logo: "/channels/civitatis.png",
  },
  {
    value: "GYG",
    label: "GetYourGuide",
    logo: "/channels/gyg.png",
  },
  {
    value: "VIATOR",
    label: "Viator",
    logo: "/channels/viator.png",
  },
];

const channelLogoMap: Record<string, string> = {
  CIVITATIS: "/channels/civitatis.png",
  GYG: "/channels/gyg.png",
  VIATOR: "/channels/viator.png",
};

export default function ReservationsPage() {
  const [data, setData] = useState<Reservation[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");

  const searchInitialized = useRef(false);

  const [status, setStatus] = useState("");

  const [channel, setChannel] = useState("");

  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [dateFilter, setDateFilter] = useState("THIS_WEEK");

  const [dateCounts, setDateCounts] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedIds, setSelectedIds] =
    useState<Set<number>>(new Set());

  const [bulkStatus, setBulkStatus] =
    useState("");

  const [applying, setApplying] =
    useState(false);

  async function loadReservations(page = 1) {
    setLoading(true);
    setError("");
    setSelectedIds(new Set());
    setBulkStatus("");
    setApplying(false);

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("limit", "20");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (channel) {
        params.set("channel", channel);
      }

      if (dateFilter) {
        params.set("dateFilter", dateFilter);
      }

      const response = await fetch(`/api/reservations?${params.toString()}`, {
        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(result.message ?? "Failed to load reservations.");
      }

      setData(result.data);
      setPagination(result.pagination);
      setChannelCounts(result.channelCounts);
      setStatusCounts(result.statusCounts);
      setDateCounts(result.dateCounts);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to load reservations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReservations(1);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, channel, dateFilter]);

  useEffect(() => {
    if (!searchInitialized.current) {
      searchInitialized.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      loadReservations(1);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const idsOnPage = data.map((r) => r.id);

  const allSelected =
    idsOnPage.length > 0 &&
    idsOnPage.every((id) => selectedIds.has(id));

  const someSelected =
    idsOnPage.some((id) => selectedIds.has(id)) &&
    !allSelected;

  function toggleSelect(
    id: number,
    checked: boolean
  ) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      allSelected ? new Set() : new Set(idsOnPage)
    );
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkStatus("");
  }

  async function applyBulkStatus() {
    if (!selectedIds.size || !bulkStatus || applying) {
      return;
    }

    const ids = Array.from(selectedIds);

    const before = new Map(
      data.map((r) => [r.id, r.status])
    );

    setData((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id)
          ? { ...r, status: bulkStatus }
          : r
      )
    );

    setApplying(true);

    try {
      const response = await fetch(
        "/api/reservations/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids,
            status: bulkStatus,
          }),
        }
      );

      const json = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !json.success) {
        throw new Error(
          json.message ?? "Failed to update status."
        );
      }

      clearSelection();
    } catch (err) {
      setData((prev) =>
        prev.map((r) => {
          const s = before.get(r.id);

          return s !== undefined
            ? { ...r, status: s }
            : r;
        })
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Reservations</h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage upcoming reservations.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl py-4">
        <div className="relative">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reservation, customer, tour..."
            className="
              w-full
              rounded-lg
              border
              border-[var(--border)]
              px-3
              py-2.5
              pr-10
              text-sm
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="
                absolute
                right-2
                top-1/2
                flex
                size-7
                -translate-y-1/2
                cursor-pointer
                items-center
                justify-center
                rounded-md
                text-slate-400
                transition-all
                duration-200
                hover:bg-slate-100
                hover:text-slate-600
              "
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <h2 className="text-sm text-[var(--muted)] mt-2 mb-1">
        Filter By Channel
      </h2>
      <div className="flex gap-2 overflow-x-auto py-1">
        {channelFilters.map((item) => {
          const active = channel === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setChannel(item.value)}
              title={item.label}
              aria-label={item.label}
              className={`flex
                h-9
                sm:h-10
                w-auto
                shrink-0
                cursor-pointer
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                rounded-xl
                border
                text-xs
                sm:text-sm
                font-medium
                transition-all
                duration-200
                px-2.5
                sm:px-3.5
                ${active
                  ? "border-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.18)]"
                  : "border-slate-200/70 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={item.label}
                  width={48}
                  height={48}
                  className={`
                          size-4
                          sm:size-4                         
                        `}
                />
              ) : item.icon ? (
                (() => {
                  const Icon = item.icon;

                  return (
                    <Icon
                      size={16}
                      strokeWidth={1.9}
                      className={`
                              sm:size-4                              
                            `}
                    />
                  );
                })()
              ) : null}

              <span className="hidden sm:inline">{item.label}</span>

              <span
                className={`text-xs ${active
                    ? "text-blue-600"
                    : "text-slate-400"
                  }`}
              >
                {item.value === ""
                  ? Object.values(channelCounts).reduce((sum, count) => sum + count, 0)
                  : (channelCounts[item.value] ?? 0)}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="text-sm text-[var(--muted)] mt-2 mb-1">
        Filter By Status
      </h2>
      <div className="flex gap-2 overflow-x-auto py-1">
        {statusFilters.map((item) => {
          const active = status === item.value;
          const Icon = item.icon;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value)}
              title={item.label}
              aria-label={item.label}
              className={`flex
                h-9
                sm:h-10
                w-auto
                shrink-0
                cursor-pointer
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                rounded-xl
                border
                text-xs
                sm:text-sm
                font-medium
                transition-all
                duration-200
                px-2.5
                sm:px-3.5
                ${active
                  ? "border-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.18)]"
                  : "border-slate-200/70 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                }
              `}
            >
              <Icon
                size={16}
                strokeWidth={1.9}
                className={`
                  ${item.color}
                  sm:size-4
                `}
              />

              <span className="sm:hidden">{item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>

              <span
                className={`text-xs ${active
                    ? "text-blue-600"
                    : "text-slate-400"
                  }`}
              >
                {item.value === ""
                  ? Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
                  : (statusCounts[item.value] ?? 0)}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="text-sm text-[var(--muted)] mt-2 mb-1">
        Filter By Date
      </h2>
      <div className="flex gap-2 overflow-x-auto py-1">
        {[
          {
            value: "THIS_WEEK",
            label: "This Week",
          },
          {
            value: "TODAY",
            label: "Today",
          },
          {
            value: "TOMORROW",
            label: "Tomorrow",
          },
          {
            value: "PREVIOUS",
            label: "Previous",
          }
        ].map((item) => {
          const active = dateFilter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setDateFilter(item.value)}
              title={item.label}
              aria-label={item.label}
              className={`flex
                h-9
                sm:h-10
                w-auto
                shrink-0
                cursor-pointer
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                rounded-xl
                border
                text-xs
                sm:text-sm
                font-medium
                transition-all
                duration-200
                px-2.5
                sm:px-3.5
                ${active
                  ? "border-blue-600 shadow-[0_4px_14px_rgba(37,99,235,0.18)]"
                  : "border-slate-200/70 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <span className="sm:hidden">{item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>

              <span
                className={`text-xs ${active
                    ? "text-blue-600"
                    : "text-slate-400"
                  }`}
              >
                {item.value === ""
                  ? Object.values(dateCounts).reduce((sum, count) => sum + count, 0)
                  : (dateCounts[item.value] ?? 0)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="text-sm text-[var(--muted)]">
        {loading ? "Loading..." : ``}
      </div>

      {/* Mobile list */}
      <div className="space-y-3 lg:hidden">
        {loading ? (
          <LoadingCards />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                disabled={applying}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <span className="text-sm text-slate-700">
                {allSelected ? "Deselect all" : "Select all"}
              </span>
            </div>

            <div className="space-y-4">
              {data.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  selectDisabled={applying}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk action bar */}
      {!loading && selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-12 z-40 lg:relative lg:bottom-auto lg:z-auto lg:mt-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BulkStatusActionBar
              selectedCount={selectedIds.size}
              value={bulkStatus}
              onChange={setBulkStatus}
              onApply={applyBulkStatus}
              applying={applying}
              onClear={clearSelection}
            />
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl bg-white lg:block">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            Loading reservations...
          </div>
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ReservationTable
            reservations={data}
            selectedIds={selectedIds}
            onSelectAll={toggleSelectAll}
            onToggleSelect={toggleSelect}
            selectDisabled={applying}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Pagination pagination={pagination} onPageChange={loadReservations} />
      )}
    </div>
  );
}

function ReservationCard({
  reservation,
  selectedIds,
  onToggleSelect,
  selectDisabled
}: {
  reservation: Reservation;
  selectedIds: Set<number>;
  onToggleSelect: (id: number, checked: boolean) => void;
  selectDisabled: boolean;
}) {
  console.log(reservation);
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        bg-white/90
        p-4
        shadow-[0_4px_20px_rgba(15,23,42,0.06)]
        ring-1
        ring-slate-100
        backdrop-blur
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)]
        hover:ring-blue-100
      "
    >
      {/* subtle glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          size-32
          rounded-full
          bg-blue-100/30
          blur-3xl
          transition-opacity
          duration-300
          group-hover:bg-blue-200/40
        "
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(reservation.id)}
              onChange={(event) =>
                onToggleSelect(reservation.id, event.target.checked)
              }
              disabled={selectDisabled}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {reservation.tourTime && (
                  <>
                    <span className="text-sm font-semibold text-slate-500">
                      {formatTime(reservation.tourTime)}
                    </span>

                    <span className="text-slate-300">•</span>
                  </>
                )}

                <span className="text-xs text-slate-400">
                  {formatDate(reservation.tourDate)}
                </span>
              </div>


            </div>
          </div>

          <StatusBadge status={reservation.status} />
        </div>

        {/* Tour */}
        <div className="mt-4">
          <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
            {reservation.customerName}
          </h3>
          <div className="font-medium text-slate-800">
            {reservation.tourName}
          </div>

          {reservation.tourOption && (
            <div className="mt-1 text-sm text-slate-500">
              {reservation.tourOption}
            </div>
          )}

          {reservation.rescheduledFrom && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <RefreshCcw size={12} strokeWidth={2} />
              Rescheduled from {formatDate(reservation.rescheduledFrom)} to {formatDate(reservation.tourDate)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} strokeWidth={1.9} />
            {reservation.paxTotal} pax
          </span>

          {reservation.channel.code && channelLogoMap[reservation.channel.code] ? (
            <span className="inline-flex items-center gap-1.5">
              <Image
                src={channelLogoMap[reservation.channel.code]}
                alt={reservation.channel.name ?? reservation.channel.code}
                width={16}
                height={16}
                className="size-4"
              />
              {reservation.channel.code}
            </span>
          ) : (
            <span>{reservation.channel.code ?? "-"}</span>
          )}

          <span className="text-xs font-medium text-slate-500">
            <span className={`fi fi-${reservation.language?.toLowerCase()}`} />
          </span>
        </div>

        {/* Pickup */}
        {reservation.pickupAddress && (
          <div className="mt-4 rounded-xl bg-slate-50/80 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Pickup
            </div>

            <div className="mt-0.5 truncate text-sm text-slate-700">
              {reservation.pickupAddress}
            </div>
          </div>
        )}

        {reservation.customerNote && (
          <div className="mt-3 rounded-xl bg-blue-50/70 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-blue-500">
              <MessageSquareText size={13} strokeWidth={1.9} />
              Customer note
            </div>

            <div className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-700">
              {reservation.customerNote}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3">
          <span className="text-xs text-slate-400">
            #{reservation.supplierBookingId}
          </span>

          <Link
            href={`/reservations/${reservation.id}`}
            className="
              cursor-pointer
              rounded-lg
              px-3
              py-1.5
              text-xs
              font-medium
              text-blue-600
              transition-all
              duration-200
              hover:bg-blue-50
              hover:translate-x-0.5
            "
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReservationTable({
  reservations,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  selectDisabled,
}: {
  reservations: Reservation[];
  selectedIds: Set<number>;
  onSelectAll: () => void;
  onToggleSelect: (
    id: number,
    checked: boolean
  ) => void;
  selectDisabled: boolean;
}) {
  const ids = reservations.map((r) => r.id);

  const allSelected =
    ids.length > 0 &&
    ids.every((id) => selectedIds.has(id));

  const someSelected =
    ids.some((id) => selectedIds.has(id)) &&
    !allSelected;

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someSelected;
    }
  });

  const checkboxClass =
    "h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="hidden lg:block">
      <div
        className="
        hidden
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/60
        bg-white
        shadow-[0_8px_30px_rgba(15,23,42,0.05)]
        lg:block
      "
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={allSelected}
                  onChange={() => onSelectAll()}
                  disabled={selectDisabled}
                  className={checkboxClass}
                />
              </th>

              <th className="px-5 py-4">Date</th>

              <th className="px-5 py-4">Customer</th>

              <th className="px-5 py-4">Tour</th>

              <th className="px-5 py-4">Customer note</th>

              <th className="px-5 py-4">Pax</th>

              <th className="px-5 py-4">Channel</th>
              <th className="px-5 py-4">Language</th>

              <th className="px-5 py-4">Status</th>

              <th className="px-5 py-4" />
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="
              group
              border-t
              border-slate-100/70
              transition-all
              duration-200
              hover:bg-blue-50/30
            "
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(
                      reservation.id
                    )}
                    onChange={(event) =>
                      onToggleSelect(
                        reservation.id,
                        event.target.checked
                      )
                    }
                    disabled={selectDisabled}
                    className={checkboxClass}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {formatDate(reservation.tourDate)}
                  </div>

                  {reservation.tourTime && (
                    <div className="mt-0.5 text-xs text-slate-400">
                      {formatTime(reservation.tourTime)}
                    </div>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {reservation.customerName}
                  </div>

                  <div className="mt-0.5 text-xs text-slate-400">
                    #{reservation.supplierBookingId}
                  </div>
                </td>

                <td className="max-w-sm px-5 py-4">
                  <div className="truncate font-medium text-slate-700">
                    {reservation.tourName}
                  </div>

                  {reservation.tourOption && (
                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      {reservation.tourOption}
                    </div>
                  )}

                  {reservation.rescheduledFrom && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                      <RefreshCcw size={10} strokeWidth={2} />
                      From {formatDate(reservation.rescheduledFrom)}
                    </div>
                  )}
                </td>

                <td className="max-w-xs px-5 py-4">
                  {reservation.customerNote ? (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MessageSquareText
                        size={15}
                        strokeWidth={1.9}
                        className="mt-0.5 shrink-0 text-blue-500"
                      />
                      <span className="line-clamp-2 whitespace-pre-line">
                        {reservation.customerNote}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {reservation.paxTotal}
                </td>

                <td className="px-5 py-4">
                  <span className="text-xs font-medium text-slate-500">
                    {reservation.channel.code ?? "-"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-medium text-slate-500">
                    <span className={`fi fi-${reservation.language?.toLowerCase()}`} />
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={reservation.status} />
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/reservations/${reservation.id}`}
                    className="
                    cursor-pointer
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-blue-600
                    opacity-70
                    transition-all
                    duration-200
                    group-hover:translate-x-0.5
                    group-hover:bg-blue-50
                    group-hover:opacity-100
                  "
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700",
    ASSIGNED: "bg-amber-50 text-amber-700",
    ON_PROGRESS: "bg-purple-50 text-purple-700",
    DONE: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"
        }`}
    >
      {status}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--muted)]">{label}</div>

      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-red-500/60  bg-white px-4 py-12 text-center">
      <div className="text-sm font-medium">No reservations found</div>

      <div className="mt-1 text-xs text-[var(--muted)]">
        Try changing your filters.
      </div>
    </div>
  );
}

function LoadingCards() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-48 animate-pulse rounded-xl border bg-white"
        />
      ))}
    </>
  );
}

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
      <button
        type="button"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
        className="cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-sm text-[var(--muted)]">
        {pagination.page} / {pagination.totalPages}
      </span>

      <button
        type="button"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
        className="cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
