const newsItems = [
  {
    title: "PRECIOUS CORNERSTONE UNIVERSITY, IBADAN, BREAKING NEWS!!! 50% TUITION OFF FOR HIGH-VALUE DEGREES!",
    link: "https://pcu.edu.ng/precious-cornerstone-university-ibadan-breaking-news-50-tuition-off-for-high-value-degrees/",
    date: "December 5, 2025",
    description: "BREAKING NEWS! 50% Tuition off for High-Value Degrees! In a landmark move to empower the next generation of innovators and economic leaders, PCU is offering",
    image: "https://c.animaapp.com/mnzv1q4gFpLDSO/assets/IMG_1840-300x161.jpeg",
  },
  {
    title: "PRECIOUS CORNERSTONE UNIVERSITY, IBADAN 4th Convocation Ceremony",
    link: "https://pcu.edu.ng/precious-cornerstone-university-ibadan-4th-convocation-ceremony/",
    date: "October 24, 2025",
    description: "This is to officially inform prospective 2025 graduating students of Precious Cornerstone University, Ibadan that the 4th Convocation Ceremony will hold on Tuesday, 11 November,",
    image: "https://c.animaapp.com/mnzv1q4gFpLDSO/assets/IMG_1840-300x161.jpeg",
  },
  {
    title: "SCHEDULE OF SCHOOL FEES",
    link: "https://pcu.edu.ng/schedule-of-school-fees/",
    date: "October 7, 2025",
    description: "Download PCU School fee schedule PRECIOUS CORNERSTONE UNIVERSITY, IBADAN APPROVED REGIME OF SCHOOL FEES FOR THE 2025/2026 ACADEMIC SESSION Faculty of Pure and",
    image: "https://c.animaapp.com/mnzv1q4gFpLDSO/assets/IMG_5318-removebg-preview-300x300.png",
  },
];

export const AboutSection = () => {
  return (
    <section className="bg-white px-4 relative box-border caret-transparent break-words mt-[5px] pt-[30px] pb-[50px]">
      <div className="relative box-border caret-transparent flex flex-wrap max-w-[767px] break-words mx-auto md:flex-nowrap md:max-w-[1400px]">
        {/* Left Column */}
        <div className="relative box-border caret-transparent flex min-h-px min-w-[auto] break-words w-full md:w-[30%] lg:w-[25%]">
          <div className="relative content-start box-border caret-transparent flex flex-wrap min-h-[auto] min-w-[auto] break-words w-full mt-5">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto] break-words text-center md:text-left w-full mb-5">
              <div className="box-border caret-transparent break-words">
                <h2 className="text-black text-3xl md:text-4xl font-bold box-border caret-transparent leading-tight break-words">
                  Your Journey Begins{" "}
                  <br className="hidden md:block box-border caret-transparent outline-[3px] break-words" />
                  Here
                </h2>
              </div>
            </div>

            <div className="relative box-border caret-transparent min-h-[auto] min-w-[auto] break-words w-full">
              <div className="box-border caret-transparent break-words mt-[10px] md:mt-[30px]">
                <div className="box-border caret-transparent break-words">
                  <p className="box-border caret-transparent break-words mb-5 text-gray-700 leading-relaxed text-justify md:text-left text-sm lg:text-base">
                    Precious Cornerstone University is devoted to developing
                    skilled and ethical scholars, professionals and leaders
                    through the provision of excellent education in a conducive
                    environment. Our faculty are engaged with teaching and
                    research to push the boundaries of human knowledge, bringing
                    together talented knowledge-seekers across economic,
                    geographic, religious, linguistic and cultural divides that
                    will enrich the students&apos; education.
                  </p>

                  <div className="box-border caret-transparent break-words mb-5">
                    <img
                      src="e-portal/images/bishop-signature-300x82.png"
                      alt="Signature"
                      className="h-auto box-border caret-transparent clear-both max-w-full break-words w-[180px] md:w-[250px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Unified News Grid */}
        <div className="relative box-border caret-transparent flex min-h-px min-w-[auto] break-words w-full md:w-[70%] lg:w-[75%]">
          <div className="relative content-start box-border caret-transparent flex flex-wrap min-h-[auto] min-w-[auto] break-words w-full ml-0 pt-0 md:ml-[40px] lg:ml-[60px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {newsItems.map((item, index) => (
                <article
                  key={index}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                  }}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50"
                >
                  {/* Image Container with Zoom effect */}
                  <a
                    href={item.link}
                    className="relative block aspect-[16/10] overflow-hidden"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Darker overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded shadow-sm">
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
                        {item.date.split(',')[0]}
                      </p>
                    </div>
                  </a>

                  {/* Content Area */}
                  <div className="flex flex-col p-5 lg:p-6 grow relative">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(59,130,246,0.05)_0%,transparent_70%)]" />

                    <h3 className="text-gray-900 text-sm lg:text-base font-bold leading-tight mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      <a href={item.link} className="after:absolute after:inset-0">
                        {item.title}
                      </a>
                    </h3>

                    <p className="text-gray-500 text-[13px] leading-relaxed mb-6 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">News & Updates</span>
                      <div className="flex items-center text-blue-600 text-[10px] font-extrabold group/btn">
                        <span className="relative overflow-hidden inline-block h-3.5">
                          <span className="inline-block transition-transform duration-300 group-hover/btn:-translate-y-full">Read More</span>
                          <span className="absolute left-0 top-full inline-block transition-transform duration-300 group-hover/btn:-translate-y-full">Read More</span>
                        </span>
                        <svg 
                          className="ml-1.5 w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
