import Image from "next/image";
import { BookingDetail } from "../../types/booking-detail";
import { channelLogoMap } from "../../types/channel";
import { ExternalLink, User, RefreshCcw } from "lucide-react";
import { formatDate, formatIsoTime } from "@/lib/format";
import StatusBadge from "./StatusBadge";

const BookingHero = ({ booking }: { booking: BookingDetail }) => {
  const logo = booking.channel?.code
    ? channelLogoMap[booking.channel.code]
    : undefined;

  return (
    <div
      className="
        relative
        rounded-2xl
        bg-white
        p-6
        shadow-[0_4px_20px_rgba(15,23,42,0.05)]
        ring-1
        ring-slate-100
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          size-44
          rounded-full
          bg-blue-100/30
          blur-3xl
        "
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              size-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
            "
          >
            {logo ? (
              <Image
                src={logo}
                alt={booking.channel?.name ?? booking.channel?.code ?? "Channel"}
                width={28}
                height={28}
                className="size-6"
              />
            ) : (
              <User size={20} strokeWidth={1.9} className="text-slate-600" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500">
              Booking #{booking.supplierBookingId}
            </div>

            {booking.supplierReference && (
              <div className="mt-0.5 text-sm text-slate-500">
                Supplier Ref: {booking.supplierReference}
              </div>
            )}

            <div className="mt-1.5 text-xs text-slate-500">
              Channel:{" "}
              <span className="font-medium text-slate-700">
                {booking.channel?.name ??
                  booking.channel?.code ??
                  "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="self-start">
            <StatusBadge status={booking.status} />
        </div>
      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          sm:items-end
        "
      >
        <div>
          <div className="text-xs font-medium text-slate-500">
            Tour
          </div>

          <div className="mt-1 text-lg font-semibold text-slate-900">
            {booking.tourName}
          </div>

          {booking.tourOption && (
            <div className="mt-0.5 text-sm text-slate-500">
              {booking.tourOption}
            </div>
          )}
        </div>

        <div className="sm:text-right">
          <div className="text-xs font-medium text-slate-500">
            When
          </div>

          <div className="mt-1 text-lg font-semibold text-slate-900">
            {formatDate(booking.tourDate)}
          </div>

          <div className="mt-0.5 text-sm text-slate-500">
            {formatIsoTime(booking.tourTime)}
          </div>

          {booking.rescheduledFrom && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <RefreshCcw size={12} strokeWidth={2} />
              Rescheduled from {formatDate(booking.rescheduledFrom)}
            </div>
          )}
        </div>
      </div>

      {booking.bookingUrl && (
        <div
          className="
            mt-5
            border-t
            border-slate-100
            pt-3
          "
        >
          <a
            href={booking.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-1.5
              text-sm
              font-medium
              text-blue-600
              transition
              hover:underline
            "
          >
            <ExternalLink size={14} strokeWidth={1.9} />
            Open in supplier
          </a>
        </div>
      )}
    </div>
  );
}

export default BookingHero