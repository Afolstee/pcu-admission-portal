
export default function AtAGlancePage() {
  const stats = [
    { label: "Established", value: "2017" },
    { label: "Location", value: "Ibadan, Nigeria" },
    { label: "Faculties", value: "2" },
    { label: "Departments", value: "6" },
    { label: "Courses", value: "12+" },
    { label: "Affiliation", value: "Faith-based" },
  ];

  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img 
          src="/e-portal/images/students.jpg"
          alt="PCU at a Glance"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to right, rgba(84,37,95,0.75), rgba(84,37,95,0.3))" }} />
        <div className="relative z-10 flex items-end h-full px-10 pb-10 max-w-5xl mx-auto w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl">
            PCU at a Glance
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-5xl py-12 px-6 gap-12">
          
          {/* Right: At a Glance Content */}
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-4xl font-bold mb-8 leading-tight border-b pb-4" style={{ color: "#54255F" }}>PCU at a Glance</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ color: "#54255F" }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: "#54255F" }}>Our Identity</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Precious Cornerstone University (PCU) is a world-class citadel of learning, established to 
                  produce graduates who are not only academically sound but also spiritually grounded and 
                  entrepreneurially driven.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold mb-4 border-b pb-2" style={{ color: "#54255F" }}>Core Values</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Integrity",
                    "Scholarship",
                    "Diligence",
                    "Service",
                    "Honor",
                    "Excellence"
                  ].map((value, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg font-medium" style={{ backgroundColor: "#B91C1C0D", color: "#B91C1C" }}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {value}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

