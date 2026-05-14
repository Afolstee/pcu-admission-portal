const events = [
  {
    title:
      "OVER 20 ELDERS ENLIGHTENED IN PCU's ONE-DAY HEALTH OUTREACH \"The knowledge I have gained is really helpful\" – says participant",
    excerpt: "Precious Cornerstone University organized a...",
    imgBg: "from-red-700 to-red-900",
    isLink: false,
  },
  {
    title: "1st University Lecture: Lifestyle Medicine, Unraveling the Unknown",
    excerpt: "In the developed world, lifestyle...",
    imgBg: "from-blue-900 to-blue-950",
    isLink: false,
  },
  {
    title: "The Impact of Covid-19 on life as we know it",
    excerpt: "1st Webinnar Series : The...",
    imgBg: "from-red-800 to-gray-900",
    isLink: true,
  },
];

export default function UpcomingEvents() {
  return (
    <div className="px-10 py-12 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-8">Upcoming Events</h2>

      <div className="space-y-4">
        {events.map((event, i) => (
          <div 
            key={i} 
            className="group flex gap-5 items-start p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-gray-50 cursor-pointer border-l-2 border-transparent hover:border-red-500"
          >
            {/* Image placeholder */}
            <div
              className={`w-28 min-w-[112px] h-20 rounded-lg bg-gradient-to-br ${event.imgBg} flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md`}
            >
              <span className="text-white/30 text-[9px] font-bold uppercase tracking-wider transition-all duration-500 group-hover:text-white/60 group-hover:scale-110">
                Photo
              </span>
            </div>

            {/* Text */}
            <div className="transition-transform duration-300 group-hover:translate-x-1">
              {event.isLink ? (
                <a
                  href="#"
                  className="text-blue-600 hover:underline text-sm font-bold leading-snug block mb-1"
                >
                  {event.title}
                </a>
              ) : (
                <h4 className="text-sm font-bold text-gray-800 leading-snug mb-1 transition-colors duration-300 group-hover:text-red-700">
                  {event.title}
                </h4>
              )}
              <p className="text-xs text-gray-500 line-clamp-2">{event.excerpt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* More Events Button */}
      <div className="flex justify-center mt-10">
        <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold tracking-wider uppercase px-10 py-3 transition-colors">
          More Events
        </button>
      </div>
    </div>
  );
}
