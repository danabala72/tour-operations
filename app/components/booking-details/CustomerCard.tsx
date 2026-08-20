import { CalendarDays, Mail, Phone, User } from "lucide-react";
import { BookingDetail } from "../../types/booking-detail";
import { whatsappLink } from "@/lib/templates";
import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";

const CustomerCard = ({ booking }: { booking: BookingDetail }) => {
  return (
    <SectionCard
      title="Customer"
      icon={User}
    >
      <InfoRow
        icon={User}
        label="Name"
        value={
          <span className="text-slate-800">{booking.customerName}</span>
        }
      />
      <InfoRow
        icon={Mail}
        label="Email"
        value={
          booking.customerEmail ? (
            <a
              href={`mailto:${booking.customerEmail}`}
              className="text-blue-600 hover:underline"
            >
              {booking.customerEmail}
            </a>
          ) : (
            "-"
          )
        }
      />
      <InfoRow
        icon={Phone}
        label="Phone"
        value={
          booking.customerPhone ? (
            <a
              href={whatsappLink(booking) ?? `#${booking.customerPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {booking.customerPhone}
            </a>
          ) : (
            "-"
          )
        }
      />
      <InfoRow
        icon={CalendarDays}
        label="Language"
        value={
          booking.language ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`fi fi-${booking.language.toLowerCase()} text-xl`}
              />
              {booking.language}
            </span>
          ) : (
            "-"
          )
        }
      />
    </SectionCard>
  );
}


export default CustomerCard