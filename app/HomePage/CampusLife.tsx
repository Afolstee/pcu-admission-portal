export default function CampusLife() {
  const items = [
    {
      title: "Academics",
      text: "We offer an outstanding and comprehensive array of academic and professional programs, preparing our students for the ever changing world.",
    },
    {
      title: "Sport",
      text: "Our world class sporting facilities enable our students stay refreshed and be physically active.",
    },
    {
      title: "Culture",
      text: "As a faith based university, we believe in imparting our students with the right ways of living through spirituality, integrity and deligence.",
    },
  ];

  return (
    <div className="bg-purple-700 text-white px-10 py-10">
      <h2 className="text-xl font-bold tracking-[3px] uppercase mb-8">
        Campus Life
      </h2>

      {items.map((item, i) => (
        <div
          key={i}
          className="border-t border-white/30 py-5 last:border-b last:border-white/30"
        >
          <h3 className="text-xs font-bold tracking-[2px] uppercase mb-3">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/85">{item.text}</p>
        </div>
      ))}

      <button className="mt-8 bg-red-500 hover:bg-red-600 text-white text-xs font-bold tracking-wider uppercase px-7 py-3 transition-colors">
        Financial Aid
      </button>
    </div>
  );
}
