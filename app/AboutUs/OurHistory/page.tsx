
export default function OurHistoryPage() {
  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        {/* Background Image */}
        <img 
          src="/e-portal/images/school1.png"
          alt="PCU History"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Branding Overlay */}
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to right, rgba(84,37,95,0.75), rgba(84,37,95,0.3))" }} />
        
        <div className="relative z-10 flex items-end h-full px-10 pb-10 max-w-5xl mx-auto w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl">
            About Us
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-5xl py-12 px-6 gap-12">
          
          {/* Right: History Content */}
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-4xl font-bold mb-8 leading-tight" style={{ color: "#54255F" }}>Our History</h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
              <p>
                Precious Cornerstone University is a Christian faith-based institution of The Sword of the Spirit Ministries 
                approved and licensed by the Federal Government of Nigeria on 6th December, 2017. 
                Precious Cornerstone University [PCU] is geared towards excellence in learning and research to achieve 
                intellectual development, capacity building, diligent wealth creation, biblical core values and godly 
                character enhancement.
              </p>

              <p>
                The University started academic activities in January, 2019. The University strives to serve as a model 
                of excellence that shall be different and unique by seeking to improve access and quality of higher 
                education for all and consequently raise original thinkers and job creators rather than job seekers. 
                PCU is poised to raise people with possibility thinking and dominion mentality. A people of character 
                and integrity who shall bless Nigeria, Africa and all families of the earth will emerge from Precious 
                Cornerstone University. PCU is a citadel of scholarship, research and discoveries where students are 
                raised to take their proper places in destiny, becoming precious cornerstones and pillars of Africa's 
                emancipation and development.
              </p>

              <p>
                The University is located in the ancient city of Ibadan, the capital of Oyo State of Nigeria. 
                The University took off at the temporary campus in the Garden of Victory, situated at the Old Ife 
                Road in Ibadan. The University's permanent site is located along Ibadan-Lagos Express Way in the 
                Oluyole Local Government Area, about 24 kilometers from Ibadan City Centre in Oyo State.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

