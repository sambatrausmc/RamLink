import { SavedItemsClient } from "@/components/student/saved-items-client";
import { clubs, currentStudent, events } from "@/lib/mock-data";

export default function SavedPage() {
  return <SavedItemsClient fallbackStudent={currentStudent} clubs={clubs} events={events} />;
}