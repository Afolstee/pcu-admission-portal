"use client";

import { useState } from "react";

interface LeaderData {
  name: string;
  title: string;
  image: string;
  summary: string;
  biography: string;
  accentColor?: string;
}

const LeaderCard = ({ leader }: { leader: LeaderData }) => {
  const [showBio, setShowBio] = useState(false);
  const accent = leader.accentColor || "#54255F";

  return (
    <div className="space-y-6 border-b border-gray-100 pb-12 last:border-0">
      <div>
        <h3 className="text-xl font-bold uppercase" style={{ color: "#54255F" }}>{leader.name}</h3>
        <p className="font-bold text-gray-800">{leader.title}</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <div className="w-56 mx-auto md:mx-0 md:w-48 shrink-0 space-y-4">
          <div className="aspect-[3/4] bg-gray-200 rounded overflow-hidden shadow-sm">
            <img 
              src={leader.image} 
              alt={leader.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = `https://via.placeholder.com/200x260?text=${leader.title}`;
              }}
            />
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setShowBio(!showBio)}
              className="w-full flex items-center justify-center gap-2 font-bold text-xs px-3 py-2 rounded transition-all border"
              style={{ 
                backgroundColor: `${accent}0D`, 
                color: accent,
                borderColor: `${accent}33`
              }}
            >
              <span className={`transform transition-transform duration-200 ${showBio ? 'rotate-90' : ''}`}>&#9654;</span>
              {showBio ? "Hide Biography" : "View Biography"}
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {leader.summary}
          </p>
        </div>
      </div>
      {showBio && (
        <div className="mt-4 p-6 bg-gray-50 border-t-2 text-sm text-gray-700 leading-relaxed shadow-sm rounded-b" style={{ borderTopColor: accent }}>
          <h4 className="font-bold mb-3 uppercase tracking-wider" style={{ color: "#54255F" }}>Biography</h4>
          <p className="whitespace-pre-wrap">{leader.biography}</p>
        </div>
      )}
    </div>
  );
};

export default function LeadershipPage() {
  const [showBoard, setShowBoard] = useState(false);

  const chancellorData: LeaderData = {
    name: "Bishop Francis Wale Oke",
    title: "Proprietor",
    image: "e-portal/images/bishop.jpg",

    accentColor: "#B91C1C",
    summary: "Bishop Francis Olubowale Aderibigbe Oke, a foremost cleric of global repute and graduate of Survey Engineering, was born on September in Kasunmu Village, Egbeda Local Government Area of Oyo State.",
    biography: "Oke, a leading light in Christian faith and 1982 graduate of University of Lagos, is the son of an Anglican Church Lay Reader.\n\nPrior to his university education, he attended St Paul’s Primary School, Kasunmu; Erunmi Community Modern School; Wesley Teachers’ College and The Polytechnic of Ibadan, Ibadan where he passed out in flying colour in 1978.\n\nHe is an itinerant Pastor, a renowned Evangelist, a thorough Teacher, a distinguished Apostle and a Prophet of note. These outstanding qualities earned him positions at different times as Bible Study Secretary and President, Christian Union, UNILAG; President, Oyo State Christian Corpers Fellowship; and Vice-President, South Western Zone, Pentecostal Fellowship of Nigeria.\n\nThe Bishop launched into Ministry work with a journal entitled, ‘The Sword of the Spirit’ and the initiative translating to a full Ministry in 1980. SOTSM, which births Christ Life Church and other arms, was officially commissioned September 3, 1983. This has created tremendous impact in soul winning globally.\n\nBishop Oke’s Ministry has grown through decades and his labour in the Lord’s vineyard has positioned him as a force to reckon with in the league of God’s Generals.\n\nA quintessential prayer warrior and teacher of the word, the Bishop is married to Reverend Victoria Tokunbo, a priceless jewel and they are blessed with children."
  };

  const boardMembers = [
    "Major General Oladayo Popoola (Rtd.), OFR – Chairman",
    "His Eminence Sunday Ola Makinde, CON – Member",
    "Hon. (Deacon) Philemon Adeniran – Member",
    "Banji Osunkunle",
    "Dr. Bayo Adegoke",
    "Dr. John Fagbenro",
    "Pastor (Mrs.) Rachael Esan – Member",
    "Pastor Bestman Nnwoka – Member",
    "Pastor (Mrs.) Rose Oyedele",
    "Engr. Kehinde Ajibola",
  ];

  const management: LeaderData[] = [
    {
      name: "TIMOTHY OLUBISI ADEJUMO FISDS, FRSB (PROF)",
      title: "Vice Chancellor",
      image: "e-portal/images/pcu-vc.jpg",
      summary: "Professor Timothy Olubisi Adejumo was born in Modakeke, Ife East Local Govt., Osun State, Nigeria. He attended L.A. Primary School, Odesomi via Osu-Ilesa (1967-1972) and Modakeke High School (MHS), Modakeke (1973-1978). He holds B.Sc and M.Sc degrees in Industrial Microbiology from the University of Ilorin, Ilorin and Ph.D. in Mycology and Plant Pathology.",
      biography: "Professor Timothy Olubisi Adejumo was born in Modakeke, Ife East Local Govt., Osun State, Nigeria. He attended L.A. Primary School, Odesomi via Osu-Ilesa (1967-1972) and Modakeke High School (MHS), Modakeke (1973-1978). He holds B.Sc and M.Sc degrees in Industrial Microbiology from the University of Ilorin, Ilorin and Ph.D. in Mycology and Plant Pathology from Department of Crop Protection and Environmental Biology, Faculty of Agriculture and Forestry, University of Ibadan, Ibadan in 1985, 1988 and 1997 respectively. His area of specialization is Agricultural/Environmental Microbiology & Biotechnology, with research interests in molecular diagnostics, mycotoxicology, phytopathology, soil microbiology, biological control and microbial ecology, where he has more than 65 publications in local and international journals and books to his credit. He joined the services of Adekunle Ajasin University, Akungba-Akoko (AAUA) in 2001 as Lecturer I, and he rose through the ranks to the position of Professor in 2013. He was a former Dean, Faculty of Science (2017-2019), Director, Centre for Space, Energy and Environmental Research (2016- 2017), Head/Acting Head of the Department of Microbiology (2014- 2016, 2008- 2010), Director, Linkage and International Programmes Office (2015- 2016) and Postgraduate Coordinator (2008- 2022). Between 2010 and 2014, he was the Director of Centre for Research and Development, and presently he is a Chairman/member of more than 15 University Committees.\n\nHe worked as Research Officer I (Microbiology) at Lake Chad Research Institute, Maiduguri 1988-1989, Research Associate (Microbiology) at International Institute of Tropical Agriculture (IITA), Ibadan (1990-1997) and Senior Research Officer (Plant Pathology) at Cocoa Research Institute of Nigeria (1999- 2001). He was Adjunct Professor at Olabisi Onabanjo University (OOU), Ago-Iwoye, Ogun State in 2015; Crawford University, Igbesa, Ogun State in 2017; External Assessor of candidates for Professor, Reader and Senior Lecturer positions (2013 to date) at AAUA; Ambrose Ali University, Ekpoma, Edo State and Kwame Nkrumah University of Science and Technology, Kumasi, Ghana (2016 to date); Lagos State University, Ojo, Lagos; Babcock University, Ilishan-Remo, Ogun State; Ekiti State University, Ado-Ekiti, (2018 to date); Ladoke Akintola University of Technology, Ogbomoso, Oyo State (2021), University of Ilorin, Ilorin (2021) and OOU, Ago-Iwoye (2023); Postgraduate External Examiner at Federal University of Agriculture, Abeokuta; Federal University of Technology, Akure; University of Ibadan, Ibadan and Ambrose Ali University, Ekpoma (2015 to date), Ekiti State University, Ado-Ekiti (2018 to date) and Undergraduate External Examiner at Wellspring University, Benin City, Edo State (2021/2022 and 2022/2023 sessions).\n\nProfessor Adejumo is a seasoned researcher of international repute, widely traveled. He delivered a very interesting 9th Inaugural Lecture of AAUA titled ‘Microbes: Our Intimate Companions, Sometimes With Deadly Relationships’ on 14th June, 2016. He has attended more than 40 conferences in the USA, Canada, Germany, the United Kingdom, Italy, India, South Africa, Cameroon, Ghana and Nigeria. He has won several Fellowships, Awards and Research Grants, including the Graduate Research Fellowship of IITA, Ibadan in 1996; Georg Forster Research Fellowship of Alexander von Humboldt (AvH) Foundation, Germany and German Language Study Fellowship in 2005. He obtained the AvH Renewed Research Fellowships in 2010, 2013, 2017, 2019 and 2023 where he was a Visiting Research Fellow at Max Rübner Institute, Detmold; Georg-August University, Göttingen, and the University of Hohenheim, Stuttgart, Germany. He obtained travel grants to attend many conferences, trainings and workshops, including the Workshop on Quantitative Biology at International Centre for Theoretical Physics (ICTP), Trieste, Italy in 2005; Polymerase Chain Reaction (PCR) Training at Dept. of Plant Pathology, University of Kentucky, Lexington, USA in 2007; Advanced Skills Training in Leadership at Haggai Institute, Maui, USA in 2007. He received an Award of Outstanding Service as an Online Mentor, Minority Mentoring Program of the American Society for Microbiology, USA in 2011. Other grants obtained include the AAUA Research Grant in 2011, the Tertiary Education Trust Fund (TETFUND) Conference Grant in 2014 to attend the XIVth International Congress of Mycology and Eukaryotic Microbiology at Montréal, Canada, the TETFUND Research Grant (Institution Based) to attend he XVIII. International Plant Protection Congress (IPPC) at Free University, Berlin, Germany in 2015 and International Society for Microbial Ecology (ISME16) at Montréal, Canada in 2016. Other grants for hosting the maiden Nigerian Society for Microbial Ecology (NSME) Conference in 2019 sponsored by International Society for Microbial Ecology (ISME), The Netherlands (ISME), and Humboldt-Kolleg (an International Conference) sponsored by the Alexander von Humboldt Foundation, Germany at AAUA in 2018 and 2023.\n\nHe is a member of ten (10) professional associations. He is a Fellow of the Royal Society for Biology (United Kingdom), and a Life Fellow of the International Society for Development and Sustainability (Japan). He is the Pioneer Ambassador Scientist (Nigeria) and a member of the International Board of Ambassadors of ISME, The Netherlands. He is the Founder, President and member of the Board of Trustees of the Nigerian Society for Microbial Ecology (NSME). He is also a member of Society for General Microbiology (SGM), United Kingdom; International Society for Plant Pathology, Australia; American Society for Microbiology, Washington DC, USA; International Association for the Plant Protection Sciences (IAPPS), USA; Nigerian Society for Microbiology (NSM); Science Association of Nigeria; Nigerian Society for Plant Protection; Biotechnology Society of Nigeria; Mycotoxin Society of Nigeria and International Association of Research Scholars and Fellows (IARSAF), IITA, Ibadan.\n\nProf. Adejumo has attended many Leadership, Professional Development courses and workshops including Strenghtening Research Capacity In Nigeria, Stakeholders’ Workshop & Mentor/Mentee Roundtable, organised by Nigerian Academy of Science (NAS), Abuja (May 14 -18, 2023); Virtual Training for Mentors, Virtual Institute for Capacity Building In Higher Education: Theory, Practice and Future of Academic Planning in University Education organised by National Universities Commission (NUC) in Partnership with National Open University of Nigeria (NOUN) (1st Jan- 15th March, 2022); Leadership and Career Development Skills Workshop by Administrative Staff College of Nigeria (ASCON), Topo-Badagry, Lagos State (29th Oct.- 2nd Nov., 2018); Training Workshop on Winning- Grants Research Proposal Writing and Funding Opportunities, Faculty of Science, AAUA, 2018; American Society for Microbiology (ASM) Virtual Workshop on Scientific Writing and Publishing at Joseph Ayo Babalola University (JABU), Ikeji-Arakeji, Osun State in 2018; Educating the Next Generation of Global Problem Solvers: Effective Teaching Strategies and Techniques. AAUA/Auburn University, USA Joint Academic Workshop 2017 Organized by Faculty of Agriculture, AAUA in 2017, and Strategic Planning and Implementation by Galilee International Management Institute (GIMI), Israel in 2015.\n\nHe is Information and Communication Technology (ICT) literate, having attended several Training sessions including the Advanced Digital Appreciation For Tertiary Institutions: Digital Bridge Institute, Cappa Bus Stop, Oshodi, Lagos in 2010; Computer Training and Management Courses at IITA, Ibadan: In-house Computer Appreciation Course, Management Appreciation Course, Personal and Supervisory Effectiveness Course, Microsoft Excel improvement Course. He recently attended the sponsored Virtual Workshop on Scientific Use of Machine Learning on Low-Power Devices: Applications and Advanced Topics, organised by ICTP, Trieste, Italy (17 -21 April, 2023). He has a solid understanding of computer operations, including file management, using productivity software (word processors, spreadsheets and PowerPoint presentation tools); He is familiar with academic research tools and databases including knowledge of search engines, academic databases like JSTOR & PubMed); He uses LinkedIn Learning as a Learning Experience Platform (LXP). He is proficient in email communication, online lecturing, video conferencing tools (Zoom, Microsoft Teams, GoToWebinar and Google Meet), and collaboration platforms (Google Drive, Dropbox) as part of his teaching materials. He effectively uses social media platforms like Twitter, LinkedIn, ResearchGate and Google Scholar to facilitate networking and knowledge sharing, and he is constantly willing to adapt to new technologies by continuously improving his ICT skills.\n\nProf. Adejumo is a Volunteer indeed. He is a reviewer and editor of many journals and books. He is currently a Volunteer/Lead Mentor of the American Society for Microbiology-Future Leaders Mentoring Fellowship Program (ASM-FLMFP), and Mentor of the Research Mentorship Program of the Nigerian Academy of Science (NAS), 2023. He is the Coordinator of the MHS 1978 Set for Annual Scholarship grant/award to students of his Alma mater, and the Coordinator of the University of Ilorin 1985 Old Students Association’s platform. He has effectively supervised/currently supervising the seminars, projects/dissertations and theses of 350 undergraduates and 14 postgraduate students.\n\nHe is a Senior Pastor of Christ Life Church (CLC) Worldwide; Councillor, Marriage Councillor, Sunday School Teacher, and Chairman of the Building Committee at Glorious Life Diocese, Ibadan. He has led the Interpretation and Pre-Varsity Units of the Church, and he was the Seminar Coordinator at the 2015 Annual Holy Ghost Convention. He was a member of the resources for NUC SCOPU verification visits to Precious Cornerstone University (PCU), Facilitator of PCU 2016 Youth Empowerment/Entrepreneurship Programme, Ad-Hoc Coordinator of PCU documents, and Chairman of the Strategic Implementation Committee for the take-off of the University. He is happily married to Prof. (Mrs) Arinpe Gbekelolu Adejumo, the Deputy Provost (Academic), The Postgraduate College, University of Ibadan, and the union is blessed with three children: Toluwani, OoreOluwa, and IbukunOluwa."
    },
    {
      name: "Mrs Morenike F. Afolabi",
      title: "Registrar",
      image: "e-portal/images/Registrar.jpg",
      summary: "Mrs. Morenike F. Afolabi holds a Bachelor of Arts in French (1986), Master of Public Administration (1997) from Obafemi Awolowo University, Master of Education in Guidance and Counselling (2023), University of Ibadan.\n\nShe is a member of Association of Nigerian Universities Professional Administrators, Nigeria Institute of Management, Certified International Professional Manager (UK), Learning & Development Network International and Records Management Foundation of Africa. She has attended Conferences, Workshops, Seminars and Trainings within and outside the country.",
      biography: "Mrs. Morenike F. Afolabi holds a Bachelor of Arts in French (1986), Master of Public Administration (1997) from Obafemi Awolowo University, Master of Education in Guidance and Counselling (2023), University of Ibadan.\n\nShe is a member of Association of Nigerian Universities Professional Administrators, Nigeria Institute of Management, Certified International Professional Manager (UK), Learning & Development Network International and Records Management Foundation of Africa. She has attended Conferences, Workshops, Seminars and Trainings within and outside the country.\n\nMrs. Afolabi is a seasoned Higher Education Institution/University Administrator with over thirty years working experience. She started her career as Administrative Officer II in Adeyemi College of Education, Ondo, where she rose through the ranks to the position of Assistant Registrar in 1998.\n\nWhile at Adeyemi College of Education, Ondo, she was School Officer at various times in School of Languages, School of Arts and Social Science and School of Education. She was also Examination & Records Officer and Admission Officer. She brought some innovations into the operations in the Schools of Arts & Social Sciences and School of Languages.\n\nShe served as Secretary to many Statutory Committees as well as Ad-Hoc Committees.\n\nIn 2000, she got appointment as Administrative Officer in University of Ibadan. She started her career in the University as Administrative Officer in the Recruitment Unit of the Non-Teaching Senior Staff/Establishments.\n\nThereafter, she served in other Divisions/Units of the Registry. She rose to the position of Deputy Registrar in 2019.\n\nMrs. Afolabi assumed duty as Registrar, Precious Cornerstone University, Ibadan, on 01 December, 2023.\n\nShe is married with children."
    },
    {
      name: "Mr Reuben O. Ayanwale AAT, ACA",
      title: "Bursar",
      image: "e-portal/images/bursar.png",
      summary: "Mr. Ayanwale is the Bursar of Precious Cornerstone University, Ibadan. He assumed duty on 1st March, 2024.\n\nPrior to this appointment, he was Deputy Bursar of Ajayi Crowther University, Oyo from 2016 to 2024. He joined Ajayi Crowther University, Oyo in 2007 as Principal Accountant and rose through the ranks to become the first Deputy Bursar of the University in October 2016.\n\nMr Ayanwale hails from Asipa-Ife, in Ife North Local Government Area of Osun State though born and brought up in Modakeke in Ife East Local Government Area also in Osun State. He attended St. Stephen’s ‘A’ Primary School, Modakeke and passed out in 1979. For his Secondary Education, he attended Modakeke Islamic Grammar School, Modakeke, from 1979 to 1984.",
      biography: "Mr Ayanwale hails from Asipa-Ife, in Ife North Local Government Area of Osun State though born and brought up in Modakeke in Ife East Local Government Area also in Osun State. He attended St. Stephen’s ‘A’ Primary School, Modakeke and passed out in 1979. For his Secondary Education, he attended Modakeke Islamic Grammar School, Modakeke, from 1979 to 1984.\n\nIn 1996, Mr Ayanwale bagged a Higher National Diploma (HND) Accountancy from The Polytechnic, Ibadan. Earlier, he had successfully completed the examinations of the Accounting Technicians Scheme (ATS) of the Institute of Chartered Accountants of Nigeria (ICAN) leading to the award of the certificate of the Association of Accounting Technicians (AAT) in 1991.\n\nIn his quest for further studies, Mr Ayanwale obtained his B.Sc, and M.Sc in Accounting from Joseph Ayo Babalola University (JABU), Ikeji-Arakeji and Ajayi Crowther University, Oyo in 2013 and 2019 respectively. He became a full-fledged Chartered Accountant and got inducted as an Associate Member of the Institute of Chartered Accountants of Nigeria (ICAN) in 2016.\n\nMr Ayanwale commenced his accounting profession at All Saints’ Church School, Jericho, Ibadan where he worked as the Bursar from 1991 to 1997. Thereafter, he proceeded to the University Press Plc (UPPlc), Jericho, Ibadan where he had a brief stay from 1997 to 1999 and worked as an Accountant in charge of General Ledger and Branch Accounts. His career’s journey took him to the International Institute of Tropical Agriculture (IITA), Moniya, Ibadan where he was employed as the Fixed Assets Officer from 1999 to 2007 before joining the services of Ajayi Crowther University, Oyo. While at IITA, Mr Ayanwale served as the Secretary to the Obsolete Assets Disposal Committee.\n\nTill date, Mr Ayanwale has to his credit well over sixteen years of continuous experience in the Bursary of private University. During his career progression till date, Mr Ayanwale has served in many committees and has represented the Bursar in some others including, but not limited to: Member, Ceremonials Committee, Ajayi Crowther University – 2012-2024; Member, Sports Committee, Ajayi Crowther University. – 2010–2018; Member, Staff Audit committee, Ajayi Crowther University – April 2019; Member, Ad hoc Committee on allegation of Certificate forgery by a staff – Ajayi Crowther University – 2019; Member, Ad hoc Committee on investigation of allegation of extortion of students for academic result – Ajayi Crowther University, Oyo – 2019; Member, Ad hoc Committee on investigation of allegation of impropriety at Shepherd’s inn – Ajayi Crowther University, Oyo – 2020; Member, Salary and Tax Review Committee – Ajayi Crowther University, Oyo – 2023; Congregation representative of non-teaching staff at the Appointments & Promotions Committee (A&PC) of the Governing Council, Ajayi Crowther University, Oyo – 2023-2024.\n\nHe was elected and thus served as Chairman, Ajayi Crowther University, Oyo Staff CICS Ltd – 2017 to 2024. He is also a member of Ajayi Crowther University Unit of FRSC Special Marshall – 2020 till date. He was ordained as an associate Pastor at the King’s Chapel (Jesus Is King Ministries Inc, Ibadan) in 2001 where he has held (still holding) many positions such as Head Usher, Sunday School Teacher, Sunday School Superintendent, Evangelism Coordinator, Men’s fellowship Leader, Member of the Church Council etc.\n\nMr Ayanwale is happily married to Mrs Olufunmilola Ayanwale and the marriage is blessed with wonderful children."
    },
    {
      name: "Dr. Adebayo Afolabi Olajide",
      title: "University Librarian",
      image: "e-portal/images/librarian.jpg",
      summary: "Dr. Adebayo Afolabi Olajide attended: St. Andrew’s African Primary School, Ipetu-Ijesha; Ipetu-Ijesha Grammar School; Ladigbolu Grammar School Oyo for his Primary and Secondary School education. He later proceeded to Ladoke Akintola University of Technology, where he got B.Tech in Pure/Applied Chemistry. After this, due to his thirst for education and knowledge, he attended University of Ibadan where he got Masters in Library and information Studies. He completed his Phd program from university of Ilorin.",
      biography: "Dr. Olajide has taught in virtually all the levels of education in Nigeria from Nursery and Primary School to secondary schools and University, as class teacher, subject teacher, Head of Department, lecturer, trainer, facilitator at the University level.\n\nHis Librarianship career started at Bowen University, Iwo. He has exemplified himself in the area of electronic library, academic library, information management and social media use in the Library.\n\nHe is a prolific writer and researcher having about nineteen publications to his credit in both local and international journals. He has presented some papers at local and international conferences.\n\nHe is happily married and the union is blessed with children."
    }
  ];

  const otherOffices = [
    { name: "ICT Center", href: "#" },
    { name: "Health Service Center", href: "#" },
    { name: "Student Affairs Office", href: "#" },
    { name: "Sport Center", href: "#" },
    { name: "Academic Planning Unit", href: "#" },
    { name: "Physical Planning and Development", href: "#" },
    { name: "University Development Ventures", href: "#" },
  ];

  return (
    <div className="w-full bg-white font-sans text-gray-800">
    
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-6xl py-12 px-6 gap-12">
          
          <div className="flex-1 min-w-0 space-y-12 w-full">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight" style={{ color: "#54255F" }}>
                Leadership and Organization
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
                Precious Cornerstone University was founded by the chancellor, Bishop Francis Wale Oke 
                and it has a board of trustees, University council, the governing and policy-making body. 
                The institution is also led and supported by the University management team.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-16">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Chancellor and Board</h2>
                  <LeaderCard leader={chancellorData} />
                </section>

                <section className="space-y-4">
                  <button 
                    onClick={() => setShowBoard(!showBoard)}
                    className="w-full flex items-center justify-between py-4 border-b border-gray-200 group hover:border-[#B91C1C] transition-colors"
                  >
                    <h2 className="text-2xl font-bold text-gray-900">Board of Trustees</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 group-hover:text-[#B91C1C]">
                        {showBoard ? "CLOSE" : "VIEW MEMBERS"}
                      </span>
                      <span className={`text-xl transition-transform duration-300 ${showBoard ? 'rotate-180' : ''}`}>
                        &#9662;
                      </span>
                    </div>
                  </button>
                  
                  {showBoard && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      {boardMembers.map((member, i) => (
                        <div key={i} className="flex gap-4 text-sm text-gray-700 py-1.5 border-b border-gray-50 md:border-0">
                          <span className="font-bold shrink-0" style={{ color: "#B91C1C" }}>{i + 1}.</span>
                          <p>{member}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-12">
                  <h2 className="text-3xl font-bold text-gray-900 border-b pb-4">University Management</h2>
                  <div className="space-y-16">
                    {management.map((leader, i) => (
                      <LeaderCard key={i} leader={leader} />
                    ))}
                  </div>
                </section>

                <section className="space-y-8 pt-8 pb-12">
                  <h2 className="text-3xl font-bold text-center" style={{ color: "#54255F" }}>Other Offices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherOffices.map((office, i) => (
                      <a key={i} href={office.href} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <span className="font-bold text-gray-700 group-hover:text-[#B91C1C] transition-colors">{office.name}</span>
                        <span className="text-[#B91C1C] transition-transform group-hover:translate-x-1">&rarr;</span>
                      </a>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-1">
                 <div className="sticky top-40 space-y-8">
                    <div className="bg-white border-t-4 shadow-lg border border-gray-100 p-8 rounded-sm" style={{ borderTopColor: "#54255F" }}>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Academic Calendar</h3>
                      <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-6" />
                      <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">View all dates of key PCU academic activities and events.</p>
                      <div className="flex justify-center">
                        <a href="#" className="inline-flex items-center gap-2 border border-gray-300 px-6 py-2.5 text-sm font-bold rounded-sm hover:bg-gray-50 transition-colors">View Calendar &rarr;</a>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

