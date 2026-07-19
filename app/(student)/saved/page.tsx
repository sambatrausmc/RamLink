import { SavedItemsClient } from "@/components/student/saved-items-client";
import { getClubs, getEvents } from "@/lib/firebase/public-data";

export default async function SavedPage() {
  const [clubs, events] = await Promise.all([getClubs(), getEvents()]);
  return <SavedItemsClient clubs={clubs} events={events} />;
}
