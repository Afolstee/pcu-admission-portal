export default function DeansSpeech() {
  return (
    <div className="py-12 px-6 md:px-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Director's Speech
      </h2>

      {/* Photo + first paragraph side by side */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="shrink-0 w-full md:w-56">
          <img
            src="e-portal/images/dean.jpg"
            alt="Director of Part Time School"
            className="w-full md:w-56 h-64 object-cover"
          />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Welcome to Precious Cornerstone University's Part Time Programmes. We
          are committed to providing flexible, high-quality education for
          working professionals and busy individuals who aspire to advance their
          careers without compromising their current commitments. Our part-time
          offerings are designed to meet the needs of the modern learner,
          combining academic excellence with practical flexibility and
          accessibility.
        </p>
      </div>

      {/* Remaining paragraphs full width */}
      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        <p>
          Our Part Time Programmes are structured to accommodate your schedule
          while maintaining the same rigorous academic standards as our
          full-time offerings. We understand that balancing work and education
          is challenging, which is why we offer evening and weekend classes,
          online learning options, and flexible assessment methods. This ensures
          that you can pursue your educational goals without disrupting your
          professional progress.
        </p>
        <p>
          At PCU, we believe that education should be accessible to everyone,
          regardless of their circumstances. Our experienced faculty members are
          dedicated to delivering engaging, relevant content that directly
          applies to real-world scenarios. We create an inclusive learning
          environment where mature students are supported and empowered to
          achieve their academic aspirations.
        </p>
        <p>
          The Part Time Programmes leverage modern teaching methodologies,
          including blended learning, interactive online platforms, and
          practical workshops. Our campus facilities, including the library,
          laboratories, and computer labs, are available to part-time students
          to ensure you have access to all the resources needed to excel in your
          studies.
        </p>
        <p>
          We are proud to offer a supportive academic community where you can
          network with peers from diverse professional backgrounds. This unique
          opportunity enriches your learning experience and expands your
          professional network. I am confident that the Part Time Programmes at
          PCU will equip you with the knowledge, skills, and credentials to
          advance your career and make meaningful contributions to society.
        </p>

        <div className="pt-2">
          <p className="font-bold text-gray-800">Dr./Prof. (To be updated)</p>
          <p className="font-bold text-gray-800">
            (Director, Part Time Programmes)
          </p>
        </div>
      </div>
    </div>
  );
}
