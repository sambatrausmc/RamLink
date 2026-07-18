import { format, isValid } from "date-fns";

const datePrefixPattern = /^(\d{4}-\d{2}-\d{2})/;
const twentyFourHourPattern = /^(\d{1,2}):(\d{2})$/;

export function toEventDateInputValue(value: string) {
  return value.match(datePrefixPattern)?.[1] ?? "";
}

export function formatEventDate(value: string) {
  const inputValue = toEventDateInputValue(value);
  if (!inputValue) return "Date TBD";

  const date = new Date(`${inputValue}T12:00:00`);
  return isValid(date) ? format(date, "MMM d, yyyy") : "Date TBD";
}

export function formatEventTime(value: string) {
  const match = value.match(twentyFourHourPattern);
  if (!match) return value;

  const hour = Number(match[1]);
  if (hour > 23) return value;

  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";
  return `${displayHour}:${match[2]} ${period}`;
}
