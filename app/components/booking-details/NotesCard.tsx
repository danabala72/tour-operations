import { FileText } from "lucide-react";
import { BookingDetail } from "../../types/booking-detail";
import SectionCard from "./SectionCard";

const NotesCard = ({ booking }: { booking: BookingDetail }) => {
  return (
    <SectionCard
      title="Notes"
      icon={FileText}
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Customer note
          </div>

          {booking.customerNote ? (
            <div className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
              {booking.customerNote}
            </div>
          ) : (
            <div className="mt-1 text-sm text-[var(--muted)]">
              No customer note.
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-medium text-slate-500">
            Internal note
          </div>

          {booking.internalNote ? (
            <div className="mt-1 rounded-lg bg-amber-50/80 px-3 py-2.5 text-sm text-amber-900">
              {booking.internalNote}
            </div>
          ) : (
            <div className="mt-1 text-sm text-[var(--muted)]">
              No internal note.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export default NotesCard