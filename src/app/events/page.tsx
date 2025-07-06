
import { getAllEvents } from "@/lib/events";
import EventsClient from "./events-client";

export default async function EventsPage() {
  const events = await getAllEvents();
  return <EventsClient initialEvents={events} />;
}
