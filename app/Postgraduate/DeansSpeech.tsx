export default function DeansSpeech() {
  return (
    <div className="py-12 px-6 md:px-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dean's Speech</h2>

      {/* Photo + first paragraph side by side */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="shrink-0 w-full md:w-56">
          <img
            src="/e-portal/images/dean.jpg"
            alt="Dean of Postgraduate School"
            className="w-full md:w-56 h-64 object-cover"
          />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          It is a privilege to be a part of the family of forward-looking people
          of the Precious Cornerstone University. This University is positioned
          to provide quality education which will develop individuals with quest
          for knowledge and to develop man power at the postgraduate level to
          cater for the academic and industrial need of our country. The need for
          cutting edge research that develops solution to problems of the 21st
          century which are necessary for a developing society like ours,
          propelled our passion to develop this robust postgraduate programs.
        </p>
      </div>

      {/* Remaining paragraphs full width */}
      <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
        <p>
          I want to warmly congratulate you that you have been offered admission
          into our prestigious postgraduate program. This life-transforming
          experience will bring the very best out of you. The PCU is a place
          where you will have contact with refined teachers and researchers with
          world class finesse. No doubt, this will be a different experience from
          what you had as an undergraduate student. As you start and chart a new
          path in life, there will be challenges from our seasoned Lecturers and
          researchers, this is to bring the best out of you and to make you a
          total person.
        </p>
        <p>
          Moreover, you are regarded as a mature student that should be guided
          and not pampered, the knowledge that you will receive will enable you
          to be an independent thinker, developed to think out of the box, a
          problem solver that will form the pillars or pivot upon which the
          society rests.
        </p>
        <p>
          Our environment is conducive for learning and allows original thinking.
          The Postgraduate School is located at the Olubadan Estate, a serene,
          quiet and peaceful environment with all-inclusive chalets accommodation
          for adult students. Our Library, Laboratories, studios, internet
          facilities are such that supports you to accomplish your academic
          expectation at record time. At the point of admission, supervisors are
          allocated to students and the arrangements is such that, flexibilities
          are considered which will enable you to have good interactions with
          supervisors. Modern methods of teaching and learning are applied at the
          PCU postgraduate school, students are expected to present seminars to
          peers and supervisors alike. As much as possible, research students are
          encouraged to attend conferences (local or international) at least once
          and are expected to make presentations orally or via postal.
        </p>
        <p>
          It is my believe that you are going to have a rewarding and fruitful
          time as a postgraduate student of the Precious Cornerstone University.
          I wish you the very best.
        </p>

        <div className="pt-2">
          <p className="font-bold text-gray-800">Professor James Adeyemo Adegoke</p>
          <p className="font-bold text-gray-800">(Dean of Postgraduate School)</p>
        </div>
      </div>
    </div>
  );
}
