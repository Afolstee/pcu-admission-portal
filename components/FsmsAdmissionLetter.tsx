import React from "react";

interface FsmsAdmissionLetterProps {
  candidateName: string;
  programme?: string;
  level?: string;
  department?: string;
  faculty?: string;
  session?: string;
  mode?: string;
  date?: string;
  resumptionDate?: string;
  acceptanceFee?: string;
  tuition?: string;
  otherFees?: string;
  reference?: string;
}

/**
 * FsmsAdmissionLetter
 *
 * Props:
 * - candidateName: string
 * - programme: string
 * - level: string
 * - department: string
 * - faculty: string
 * - session: string
 * - mode: string
 * - date: string
 * - resumptionDate: string
 * - acceptanceFee: string
 * - tuition: string
 * - otherFees: string
 * - reference: string
 */
export default function FsmsAdmissionLetter({
  candidateName,
  programme = "Mass Communication",
  level = "200 Level",
  department = "Mass Communication",
  faculty = "Faculty of Social and Management Sciences",
  session = "2025/2026",
  mode = "Part-Time",
  date = "10 October, 2025",
  resumptionDate = "Sunday, 19 October, 2025",
  acceptanceFee = "₦20,000.00",
  tuition = "₦177,000.00",
  otherFees = "₦123,000.00",
  reference = "PCU/ADM/2025",
}: FsmsAdmissionLetterProps) {
  const containerStyle: React.CSSProperties = {
    fontFamily: "Times New Roman, serif",
    fontSize: "14px",
    lineHeight: "1.6",
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
    color: "#000",
  };

  const headerCenter: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "10px",
  };

  const bold: React.CSSProperties = { fontWeight: "bold" };

  const sectionSpacing: React.CSSProperties = { marginTop: "20px" };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerCenter}>
        <div style={{ ...bold, fontSize: "18px" }}>
          PRECIOUS CORNERSTONE UNIVERSITY
        </div>
        <div>
          Garden of Victory, Olaogun Street, Old Ife Road,
          <br />
          P.M.B. 60, Agodi Post Office, Ibadan, Oyo State.
        </div>
        <div>A Tertiary Institution of The Sword of The Spirit Ministries</div>
      </div>

      <div style={sectionSpacing}>
        <div style={bold}>OFFICE OF THE REGISTRAR</div>
        <div>
          Registrar: Mrs. Morenike F. Afolabi B.A, MPA (Ife), M.ED (IB), MNIM,
          MANUPA, IPMA (UK)
        </div>
        <div>Phone: +2348033931410</div>
        <div>Email: registrar@pcu.edu.ng</div>
      </div>

      {/* Ref & Date */}
      <div
        style={{
          ...sectionSpacing,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span style={bold}>Ref:</span> {reference}
        </div>
        <div>
          <span style={bold}>Date:</span> {date}
        </div>
      </div>

      {/* Salutation */}
      <div style={sectionSpacing}>
        <div>Dear {candidateName},</div>
      </div>

      {/* Subject */}
      <div
        style={{ ...sectionSpacing, textAlign: "center", fontWeight: "bold" }}
      >
        OFFER OF PROVISIONAL ADMISSION INTO {mode.toUpperCase()} DEGREE
        PROGRAMME OF THE PRECIOUS CORNERSTONE UNIVERSITY FOR {session} SESSION
      </div>

      {/* Body */}
      <div style={sectionSpacing}>
        <p>
          I write to inform you that you have been offered provisional admission
          into {level} undergraduate programme in {programme} in the Department
          of {department}, {faculty} at the Precious Cornerstone University
          (PCU), Ibadan for the {session} academic session on {mode}.
        </p>

        <p>
          Please note that this offer is conditional upon your possession of the
          minimum admission requirements. If it is discovered at any time that
          you do not possess the qualifications claimed, you will be required to
          withdraw from the University.
        </p>
      </div>

      {/* Requirements */}
      <div style={sectionSpacing}>
        <div style={bold}>Required Documents at Registration:</div>
        <ol>
          <li>Five (5) passport photographs.</li>
          <li>O’Level Result (WAEC/NECO SSCE).</li>
          <li>OND/NCE Certificates and Academic Transcript (if applicable).</li>
          <li>JAMB Registration Slip for Part-Time.</li>
          <li>Birth Certificate or sworn declaration of age.</li>
          <li>
            Letter of Attestation from three reputable personalities vouching
            for your conduct.
          </li>
          <li>
            Medical examination report from a Government Hospital and
            certification from University Medical Centre.
          </li>
        </ol>
        <p>Possession of a webcam-enabled laptop is mandatory.</p>
      </div>

      {/* Fees */}
      <div style={sectionSpacing}>
        <div style={bold}>School Fees:</div>
        <p>Tuition: {tuition}</p>
        <p>Other Charges: {otherFees}</p>
        <p>
          Please ensure payment of the Acceptance Fee of {acceptanceFee} within
          two (2) weeks of receiving this admission letter.
        </p>
        <p>All payments must be made through the authorized portal.</p>
      </div>

      {/* Resumption */}
      <div style={sectionSpacing}>
        <p>
          The date of resumption for the {session} academic session is scheduled
          for {resumptionDate}.
        </p>
      </div>

      {/* Closing */}
      <div style={sectionSpacing}>
        <p>Accept my congratulations on your admission.</p>
        <br />
        <p style={bold}>Mrs. Morenike F. Afolabi</p>
        <p>Registrar</p>
      </div>
    </div>
  );
}
