import { CreditCard, DollarSign, Receipt, User } from "lucide-react";
import { BookingDetail } from "../../types/booking-detail";
import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";
import { formatCurrency } from "@/lib/format";

const PricingCard = ({ booking }: { booking: BookingDetail }) => {
  return (
    <SectionCard
      title="Pricing"
      icon={DollarSign}
    >
      <InfoRow
        icon={DollarSign}
        label="Sale price (customer)"
        value={formatCurrency(booking.salePrice, booking.currency)}
      />
      <InfoRow
        icon={CreditCard}
        label="Net price (company)"
        value={formatCurrency(booking.netPrice, booking.currency)}
      />
      <InfoRow
        icon={Receipt}
        label="Currency"
        value={booking.currency ?? "-"}
      />
      <InfoRow
        icon={User}
        label="Pax total"
        value={`${booking.paxTotal} pax`}
      />
    </SectionCard>
  );
}

export default PricingCard