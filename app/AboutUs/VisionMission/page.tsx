import PageSidebar from "../../components/PageSidebar";

export default function VisionMissionPage() {
  const missionItems = [
    "Develop 21st century knowledge and competence in scientific research, original thinking, scholastic investigations and development of practical skills in communication, technology, arts and sciences that will enhance self-employment and job creation;",
    "Develop an understanding of ethical issues in a knowledge-driven multicultural society and be reputed as a center for thought, inquiry, dialogue, and action in matters of character and leadership;",
    "Attract, recruit and retain high quality staff that will challenge and mentor students to attain their fullest potential emphasizing the core values of integrity, scholarship, diligence, service and honor;",
    "Create a learning environment known for academic excellence, intellectual rigor, civil discourse and daring and entrepreneurial spirit;",
    "Inspire love of learning and not just learning for its sake;",
    "Gain a sophisticated level of information literacy through emphasis on technology and information literacy across the curriculum;",
    "Engage in critical thinking, teamwork, problem-solving, project-based activities, laboratories and work experience;",
    "Establish a solid base in the liberal arts and sciences; and",
    "Explore diversity, creativity and work."
  ];

  const alphabeticalLabels = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img 
          src="/images/students.jpg"
          alt="Vision & Mission"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to right, rgba(84,37,95,0.75), rgba(84,37,95,0.3))" }} />
        <div className="relative z-10 flex items-end h-full px-10 pb-10 max-w-5xl mx-auto w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl">
            Vision & Mission
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-5xl py-12 px-6 gap-12">
          
          {/* Left: Sidebar (Order-last on mobile) */}
          <div className="order-last md:order-first w-full md:w-fit">
            <PageSidebar variant="about" activePath="/AboutUs/VisionMission" />
          </div>

          {/* Right: Vision & Mission Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Our Mission</h2>
            
            <div className="space-y-6">
              {missionItems.map((item, index) => (
                <div key={index} className="flex gap-4 text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-purple-900 shrink-0">{alphabeticalLabels[index]})</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

