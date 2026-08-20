import { Clock, MapPin, Navigation } from "lucide-react";
import { BookingDetail } from "../../types/booking-detail";
import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";
import { formatIsoTime } from "@/lib/format";

const PickupCard = ({ booking }: { booking: BookingDetail }) =>  {
  const hasCoordinates =
    booking.pickupLat != null && booking.pickupLng != null;

  const addressLink = booking.pickupAddress
    ? `https://maps.google.com/maps?q=${encodeURIComponent(booking.pickupAddress)}`
    : null;

  const coordsLink =
    hasCoordinates && booking.pickupLat != null && booking.pickupLng != null
      ? `https://maps.google.com/maps?q=${booking.pickupLat},${booking.pickupLng}`
      : null;

  return (
    <SectionCard
      title={hasCoordinates ? "Pickup Location" : "Pickup"}
      icon={MapPin}
    >
      <InfoRow
        icon={Clock}
        label="Pickup time"
        value={formatIsoTime(booking.pickupTime)}
      />
      <InfoRow
        icon={MapPin}
        label="Address"
        value={
          booking.pickupAddress && addressLink ? (
            <a
              href={addressLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {booking.pickupAddress}
            </a>
          ) : (
            "-"
          )
        }
      />
      {hasCoordinates && coordsLink && (
        <InfoRow
          icon={Navigation}
          label="Coordinates"
          value={
            <a
              href={coordsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {`${booking.pickupLat}, ${booking.pickupLng}`}
            </a>
          }
        />
      )}
    </SectionCard>
  );
}

export default PickupCard