import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { events } from "@/lib/constants"; 

const Page = () => {
  return (
    <section className="">
      <h1 className="text-center mt-10">The Hub for Every Dev <br/> Event You Can't Miss.</h1>
      <p className="text-center mt-5">Discover upcoming tech events, workshops, and conferences tailored to your interests.</p>

      <ExploreBtn />

      <div className="container mx-auto mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events.map((event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Page;