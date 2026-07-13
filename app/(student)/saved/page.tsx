import { SavedItemsClient } from "@/components/student/saved-items-client";
import { getClubs, getEvents } from "@/lib/firebase/public-data";
import { currentStudent } from "@/lib/mock-data";

export default async function SavedPage() {
  const [clubs, events] = await Promise.all([getClubs(), getEvents()]);
  return <SavedItemsClient fallbackStudent={currentStudent} clubs={clubs} events={events} />;
}
