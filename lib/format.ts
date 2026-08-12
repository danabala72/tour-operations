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
    return value.toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );
  }

  const text = String(value).trim();

  if (!text) {
    return "-";
  }

  // MySQL TIME: HH:mm:ss
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(text)) {
    return text.slice(0, 5);
  }

  return "-";
}