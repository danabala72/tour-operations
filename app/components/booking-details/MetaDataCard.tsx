import { CalendarDays, Clock, FileText, Receipt } from "lucide-react";
import { BookingDetail } from "../../types/booking-detail";
import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";
import { formatDate } from "@/lib/format";
import StatusBadge from "./StatusBadge";

const MetadataCard = ({ booking }: { booking: BookingDetail }) => {
  return (
    <SectionCard
      title="Booking Info"
      icon={CalendarDays}
    >
      <InfoRow
        icon={CalendarDays}
        label="Created at"
        value={formatDate(booking.createdAt)}
      />
      <InfoRow
        icon={Clock}
        label="Updated at"
        value={formatDate(booking.updatedAt)}
      />
      <InfoRow
        icon={Receipt}
        label="Supplier booking ID"
        value={booking.supplierBookingId}
      />
      {booking.supplierReference && (
        <InfoRow
          icon={FileText}
          label="Supplier reference"
          value={booking.supplierReference}
        />
      )}
      <InfoRow
        label="Status"
        value={<StatusBadge status={booking.status} />}
      />
    </SectionCard>
  );
}


export default MetadataCard