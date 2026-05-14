"use client";


export default function SpiritualityPage() {
  const activities = [
    { label: "Early Morning Glory (EMG)", time: "Monday-Saturday 6.00am-7.00am" },
    { label: "Sunday Worship Service", time: "Every Sunday 6:00am-9:00am" },
    { label: "Mid-week Community Service", time: "Every Wednesday 12:00noon- 1:30pm" },
    { label: "Sunday School", time: "every Sunday 6:30am-7:15am" },
    { label: "Weekly Class Fellowship (WCF)", time: "for each level (100L-400L)" },
  ];

  const corePrograms = [
    {
      title: "Special Prayer Days",
      content: "1. First Working Day of each month are observed as Special Prayer Day for the entire PCU Community while University Management, prayed and fasted every first Wednesday of each month."
    },
    {
      title: "Workers Training",
      content: "2. PCU Students and those who have indicated their intention to join Christ Life Church were given special attention by taking them through commissioned Workers Training Programmes in viewing of entrenching them more in CLC doctrines and culture for subsequent family ordination to various ministerial position in future."
    },
    {
      title: "Spiritual Counselling",
      content: "2. On regular basis, the Chaplain and members of Board made available Spiritual Counselling for the students on one-on-one basis and the entire community and this arrangement had a great impact on the private spiritual life of individuals within the community."
    },
    {
      title: "Campus Evangelism",
      content: "Monthly Campus Evangelism was involved in and this had produced many converts which are currently undergoing believers class teachings at various levels."
    }
  ];

  const additionalHighlights = [
    {
      title: "Family Programme",
      content: "During the session under review, students were been transported to combined meeting with our Father-in-the-Lord at the Covenant Cathedral to partake of the grace God in the House."
    },
    {
      title: "Chancellor's Visit to the Campus",
      content: "Our Chancellor, Bishop Francis Wale Oke visited the Campus once during the session where he blessed the entire community on Wednesday 25th June, 2025."
    },
    {
      title: "Mid-Year Prayer Session",
      content: "The Second Edition of 6hours Prayer session was held on 1st of July, 2025 where the entire Community gathered together with Fasting and Prayer to seek the face of God in prayers and supplication for the entire Precious Cornerstone University Projects."
    },
    {
      title: "Improved Chapel Attendance",
      content: "During the session, the Chaplaincy introduced Bio-metric machine for chapel attendance and this had led to improved attendance by the student populace."
    },
    {
      title: "Chapel Equipment",
      content: "With the help of the Parent Forum, the Chapel was able to procure musical equipment during the session. This includes: - A drum set - A laptop - Sax and - Keyboard. All these made our services more exciting at the Chapel and the students are being trained on them."
    },
    {
      title: "All Nations Concert",
      content: "Annual Nations Concert was organised during the session where different cultural group worship and praise God in their unique dialect. It was well attended by both the students and staff of the University. We hope to have a better outing in the coming session by the grace of God."
    }
  ];

  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        {/* Background Image */}
        <img 
          src="e-portal/images/SaveClip.App_622293849_18066424685640431_5554307820396018734_n.jpg"
          alt="Spirituality at PCU"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Branding Overlay (Not too dark) */}
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to right, rgba(84,37,95,0.65), rgba(84,37,95,0.3))" }} />
        
        <div className="relative z-10 flex items-end h-full px-10 pb-10 max-w-5xl mx-auto w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl">
            Spirituality in PCU
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-5xl py-12 px-6 gap-12">
          
          {/* Right: Spirituality Content */}
          <div className="flex-1 min-w-0 space-y-12 w-full">
            
            {/* Intro & Chaplain Profile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm w-full mx-auto">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                     <img 
                        src="e-portal/images/chaplain.jpeg" 
                        alt="Pastor Adesoji Adeniji"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = "https://via.placeholder.com/300x400?text=Chaplain";
                        }}
                     />
                  </div>
                  <div className="p-4 text-center border-t border-gray-50">
                    <h3 className="font-bold" style={{ color: "#54255F" }}>Pastor Adesoji Adeniji</h3>
                    <p className="text-xs text-gray-500">(The Chaplain)</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-4 border-b pb-2" style={{ color: "#54255F" }}>Introduction</h2>
                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <p>
                      The office of the Univeristy Chaplaincy is structured for the development of the spiritual life of the entire University Community. The Chaplaincy of Precious Cornerstone University being a Faith-based Institution maintains a vibrant spiritual foundation where doctrine and discipleship programme of the Founding Father are being taught in viewing of raising the next vibrant generation of Christ Life Church Worldwide as well as Academic Excellency.
                    </p>
                    <p>
                      The Chaplaincy, headed by the Chaplain is being supported by 11-man Chapel Board Members made up of Deans of Faculty, Lecturers, Faculty Officers and Student Representatives of proven integrity. Under the session on review, the Board met regularly to discuss the activities of the Chapel. The Chaplaincy also had 16 core-chapel workers and Unit Heads (mainly students) that run the affairs of the Chapel with the Chaplain.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities Table */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold border-b pb-2" style={{ color: "#54255F" }}>Activities</h2>
              <p className="text-sm text-gray-700">
                The following daily, weekly and monthly activities were engaged to minister, teach and disciple the University Community and this includes:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {activities.map((act, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-lg transition-colors hover:bg-gray-50">
                    <span className="font-semibold text-gray-800">{act.label}</span>
                    <span className="font-bold text-sm" style={{ color: "#54255F" }}>{act.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-700 italic">
                Above activities produced converts which are further followed-up in Believers Foundation Class every Sunday between 10:00am-11:00am
              </p>
            </div>

            {/* Core Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {corePrograms.map((prog, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400">{prog.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {prog.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional Highlights */}
            <div className="space-y-12">
              {additionalHighlights.map((section, i) => (
                <div key={i} className="space-y-4">
                  <h2 className="text-2xl font-bold border-b pb-2" style={{ color: "#54255F" }}>{section.title}</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

