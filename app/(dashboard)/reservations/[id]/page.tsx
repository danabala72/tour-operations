"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import BookingHero from "@/app/components/booking-details/BookingHero";
import TourDetailsCard from "@/app/components/booking-details/TourDetailsCard";
import CustomerCard from "@/app/components/booking-details/CustomerCard";
import PickupCard from "@/app/components/booking-details/PickupCard";
import PricingCard from "@/app/components/booking-details/PricingCard";
import NotesCard from "@/app/components/booking-details/NotesCard";
import MetadataCard from "@/app/components/booking-details/MetaDataCard";
import StatusUpdateCard from "@/app/components/booking-details/StatusUpdateCard";
import RescheduleCard from "@/app/components/booking-details/RescheduleCard";
import { BookingDetail } from "@/app/types/booking-detail";

type ApiError = {
  success: false;
  message: string;
};

type ApiSuccess = {
  success: true;
  data: BookingDetail;
};


export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/reservations/${id}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load booking.");
        }

        const json = (await response.json()) as
          | ApiSuccess
          | ApiError;

        if (!json.success) {
          throw new Error(json.message ?? "Failed to load booking.");
        }

        if (!cancelled) {
          setBooking(json.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load booking."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/reservations");
    }
  }

  async function handleStatusUpdate(
    nextStatus: string
  ) {
    if (!booking) {
      return {
        ok: false,
        message: "No booking loaded.",
      };
    }

    const previous = booking.status;

    setBooking((b) =>
      b ? { ...b, status: nextStatus } : b
    );

    try {
      const response = await fetch(
        `/api/reservations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const json = (await response.json()) as
        | ApiSuccess
        | ApiError;

      if (!json.success) {
        throw new Error(
          json.message ?? "Failed to update status."
        );
      }

      if (json.data) {
        setBooking(json.data);
      }

      return {
        ok: true,
        message: "Status updated.",
      };
    } catch (err) {
      setBooking((b) =>
        b ? { ...b, status: previous } : b
      );

      return {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Failed to update status.",
      };
    }
  }

  async function handleReschedule(
    nextDate: string
  ) {
    if (!booking) {
      return {
        ok: false,
        message: "No booking loaded.",
      };
    }

    const previous = booking.tourDate;

    setBooking((b) =>
      b ? { ...b, tourDate: nextDate, rescheduleDate: nextDate, rescheduledFrom: b.rescheduledFrom ?? b.tourDate } : b
    );

    try {
      const response = await fetch(
        `/api/reservations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: booking.status,
            rescheduleDate: nextDate,
          }),
        }
      );

      const json = (await response.json()) as
        | ApiSuccess
        | ApiError;

      if (!json.success) {
        throw new Error(
          json.message ?? "Failed to reschedule."
        );
      }

      if (json.data) {
        setBooking(json.data);
      }

      return {
        ok: true,
        message: "Booking rescheduled.",
      };
    } catch (err) {
      setBooking((b) =>
        b ? { ...b, tourDate: previous, rescheduleDate: b.rescheduleDate, rescheduledFrom: b.rescheduledFrom } : b
      );

      return {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Failed to reschedule.",
      };
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="
            flex
            size-9
            shrink-0
            cursor-pointer
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--border)]
            text-slate-600
            transition
            hover:bg-slate-100
          "
        >
          <ChevronLeft size={18} strokeWidth={1.9} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Booking Details
          </h1>

          <p className="mt-0.5 text-sm text-[var(--muted)]">
            {id ? `#${id}` : ""}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Not found (404 from API) */}
      {!loading && !error && !booking && (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <AlertCircle
            size={32}
            strokeWidth={1.5}
            className="mx-auto text-slate-400"
          />
          <div className="mt-3 text-sm font-medium text-slate-700">
            Reservation not found
          </div>
          <div className="mt-1 text-xs text-[var(--muted)]">
            The reservation you are looking for does not exist or has been
            removed.
          </div>
          <button
            type="button"
            onClick={() => router.push("/reservations")}
            className="
              mt-4
              cursor-pointer
              rounded-lg
              border
              border-blue-600
              px-4
              py-2
              text-xs
              font-medium
              text-blue-600
              transition
              hover:bg-blue-50
            "
          >
            Back to reservations
          </button>
        </div>
      )}

      {/* Content */}
      {!!booking && (
        <>
          <BookingHero booking={booking} />

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="sm:col-span-2">
              <StatusUpdateCard
                currentStatus={booking.status}
                onUpdate={handleStatusUpdate}
              />
            </section>

            <section className="sm:col-span-2">
              <RescheduleCard
                tourDate={booking.tourDate}
                rescheduledFrom={booking.rescheduledFrom}
                status={booking.status}
                onReschedule={handleReschedule}
              />
            </section>

            <TourDetailsCard booking={booking} />
            <CustomerCard booking={booking} />
            <PickupCard booking={booking} />
            <PricingCard booking={booking} />

            <section className="sm:col-span-2">
              <NotesCard booking={booking} />
            </section>

            <section className="sm:col-span-2">
              <MetadataCard booking={booking} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
