import { formatDate, formatTime } from "@/lib/format";
import type { BookingDetail } from "@/app/types/booking-detail";

const TEMPLATES: Record<string, string> = {
  fr: `Cher Monsieur / Madame {{name}},

Merci d'avoir réservé le {{tour}} avec nous pour le {{date}} à {{time}}. Votre réservation pour {{people}} participants est confirmée et nous sommes ravis de vous accueillir à Bali !

Pour assurer une expérience fluide et agréable, nous vous demandons aimablement de confirmer les détails suivants :

Confirmation du lieu de prise en charge
Actuellement, nous avons votre lieu de prise en charge comme :
{{pickup}}

Confirmation du numéro WhatsApp
Pour faciliter la communication de notre chauffeur avec vous le jour du tour, pourriez-vous aimablement confirmer si {{phone}} est votre numéro WhatsApp actif ? Si ce n'est pas le cas, veuillez nous fournir le numéro correct.

Votre chauffeur vous contactera au moins 24 heures avant le tour pour coordonner la prise en charge et fournir toute information supplémentaire.

Nous recommandons d'être prêt au point de prise en charge au moins 15 minutes avant l'heure prévue. N'êtes pas hésité à nous contacter si vous avez des questions. Nous espérons vous accueillir pour une expérience mémorable à Bali !

Cordialement,
Andrea
Bali Travel Awesome
info : balitravelawesome690@gmail.com | +6282146397875`,
  it: `Gentile Sig./Sig.ra {{name}},

Grazie per aver prenotato il {{tour}} con noi per il {{date}} alle {{time}}. La vostra prenotazione per {{people}} persone è confermata e siamo entusiasti di darvi il benvenuto a Bali!

Per assicurare un'esperienza fluida e piacevole, vi chiediamo cortesemente di confermare i seguenti dettagli:

Conferma del luogo di ritiro
Attualmente abbiamo il vostro luogo di ritiro come:

{{pickup}}

Per favore, confermate se questo è corretto o fateci sapere se ci sono aggiornamenti.

Conferma del numero WhatsApp
Per facilitare al nostro autista di contattarvi il giorno del tour, potete cortesemente confermare se {{phone}} è il vostro numero WhatsApp attivo? Se no, vi preghiamo di fornire quello corretto.

Il vostro autista vi contatterà almeno 24 ore prima del tour per coordinare il ritiro e fornire eventuali informazioni aggiuntive.

Raccomandiamo di essere pronti nel punto di ritiro almeno 15 minuti prima dell'orario previsto. Non esitate a contattarci se avete domande. Speriamo di ospitarvi per un'esperienza memorabile a Bali!

Cordiali saluti,
Andrea
Bali Travel Awesome
info: balitravelawesome690@gmail.com | +6282146397875`,
};

export function getTemplate(
  language: string | null | undefined
): string {
  const code = (language ?? "EN").toLowerCase();

  return TEMPLATES[code] ?? TEMPLATES.fr;
}

export function buildMessage(
  booking: BookingDetail
): string {
  const template = getTemplate(booking.language);

  const values: Record<string, string> = {
    name: booking.customerName ?? "",
    tour: booking.tourName ?? "",
    date: booking.tourDate
      ? formatDate(booking.tourDate)
      : "",
    time: booking.tourTime
      ? formatTime(booking.tourTime)
      : "",
    people: String(booking.paxTotal ?? 0),
    pickup: booking.pickupAddress ?? "",
    phone: booking.customerPhone ?? "",
  };

  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_match, key: string) => values[key] ?? ""
  );
}

export function whatsappLink(
  booking: BookingDetail
): string | null {
  if (!booking.customerPhone) {
    return null;
  }

  const digits = booking.customerPhone.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const message = buildMessage(booking);

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
