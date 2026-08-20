import { CalendarDays, Clock, FileText, User } from "lucide-react";
import { BookingDetail } from "../../types/booking-detail";
import SectionCard from "./SectionCard";
import { formatDate, formatIsoTime } from "@/lib/format";
import InfoRow from "./InfoRow";

const TourDetailsCard = ({ booking }: { booking: BookingDetail }) => {
  return (
    <SectionCard
      title="Tour Details"
      icon={CalendarDays}
    >
      <InfoRow
        icon={CalendarDays}
        label="Date"
        value={formatDate(booking.tourDate)}
      />
      <InfoRow
        icon={Clock}
        label="Start time"
        value={formatIsoTime(booking.tourTime)}
      />

      {booking.tourOption && (
        <InfoRow
          icon={FileText}
          label="Tour option"
          value={booking.tourOption}
        />
      )}
      <InfoRow
        icon={User}
        label="Pax total"
        value={`${booking.paxTotal} pax`}
      />
    </SectionCard>
  );
}

export default TourDetailsCard