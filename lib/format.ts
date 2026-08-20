export function formatDate(
  value: string | Date | null | undefined
) {
  if (!value) {
    return "-";
  }

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else {
    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      date = new Date(`${text}T00:00:00`);
    } else {
      date = new Date(text);
    }
  }

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(
  value: string | Date | null | undefined
) {
  if (!value) {
    return "-";
  }

  if (value instanceof Date) {
    const isoTime = value.toISOString().slice(11, 16);

    if (/^\d{2}:\d{2}$/.test(isoTime)) {
      return isoTime;
    }

    return "-";
  }

  const text = String(value).trim();

  if (!text) {
    return "-";
  }

  if (/^\d{2}:\d{2}$/.test(text)) {
    return text;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) {
    return text.slice(0, 5);
  }

  return "-";
}

export const formatIsoTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return formatTime(date);
}

export const formatCurrency = (
  value: number | null | undefined,
  currency: string | null | undefined
) => {
  if (value == null) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(value);
}