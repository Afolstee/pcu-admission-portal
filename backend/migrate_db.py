#!/usr/bin/env python

import mysql.connector
from mysql.connector import Error
from config import config

def migrate_database():
    """Migrate the database to the new schema"""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=config['default'].MYSQL_HOST,
            user=config['default'].MYSQL_USER,
            password=config['default'].MYSQL_PASSWORD,
            database=config['default'].MYSQL_DB,
            port=config['default'].MYSQL_PORT
        )

        cursor = connection.cursor()

        print("Starting database migration...")

        # Add program_id column to letter_templates
        try:
            cursor.execute("""
                ALTER TABLE letter_templates
                ADD COLUMN program_id INT NULL AFTER name,
                ADD CONSTRAINT fk_letter_templates_program
                FOREIGN KEY (program_id) REFERENCES programs(id)
            """)
            print("✓ Added program_id column to letter_templates")
        except Error as e:
            if "Duplicate column name" in str(e):
                print("⚠ program_id column already exists")
            else:
                print(f"Error adding program_id: {e}")

        # Rename body_text to body_html
        try:
            cursor.execute("""
                ALTER TABLE letter_templates
                CHANGE COLUMN body_text body_html LONGTEXT
            """)
            print("✓ Renamed body_text to body_html")
        except Error as e:
            if "Unknown column" in str(e) or "doesn't exist" in str(e):
                print("⚠ body_text column may already be renamed")
            else:
                print(f"Error renaming body_text: {e}")

        # Update existing templates
        # Set program_id for the Part Time template
        cursor.execute("""
            UPDATE letter_templates
            SET program_id = (SELECT id FROM programs WHERE name = 'Part time' LIMIT 1)
            WHERE name = 'Part Time Provisional Admission'
        """)
        print("✓ Updated Part Time template with program_id")

        # Update the default template to use HTML
        cursor.execute("""
            UPDATE letter_templates
            SET body_html = '<p>Dear [APPLICANT_NAME],</p><p>Congratulations! We are pleased to inform you that your application for admission to our institution has been accepted.</p><p>Program: [PROGRAM]<br>Admission Date: [ADMISSION_DATE]</p><p>Please proceed with your acceptance by paying the acceptance fee within the stipulated time.</p><p>Best regards,<br>Admissions Office</p>'
            WHERE name = 'Default'
        """)
        print("✓ Updated default template to use HTML")

        # Add the FSMS template
        cursor.execute("""
            INSERT INTO letter_templates (name, program_id, subject, body_html) VALUES
            ('Part Time Provisional Admission FSMS', 4, 'Provisional Admission – Part Time',
'<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
    font-family: "Times New Roman", serif;
    font-size: 14px;
    line-height: 1.6;
    color: #000;
}
.header {
    text-align: center;
}
.title {
    text-align: center;
    font-weight: bold;
    margin-top: 20px;
}
.section {
    margin-top: 20px;
}
.fees-table {
    width: 60%;
    margin-top: 10px;
}
.fees-table td {
    padding: 4px 0;
}
.signature {
    margin-top: 40px;
}
</style>
</head>

<body>

<div class="header">
<strong>PRECIOUS CORNERSTONE UNIVERSITY</strong><br>
Garden of Victory, Olaogun Street, Old Ife Road,<br>
P.M.B. 60, Agodi Post Office, Ibadan, Oyo State.<br>
A Tertiary Institution of The Sword of The Spirit Ministries<br><br>

<strong>OFFICE OF THE REGISTRAR</strong><br><br>

Ref: {{ref_no}}<br>
Date: {{admission_date}}
</div>

<div class="section">
Dear {{applicant_name}},
</div>

<div class="title">
OFFER OF PROVISIONAL ADMISSION INTO PART-TIME DEGREE PROGRAMME OF THE PRECIOUS CORNERSTONE UNIVERSITY FOR {{session}} SESSION
</div>

<div class="section">
I write to inform you that you have been offered a provisional admission into {{level}} undergraduate programme in {{program}} in the Department of {{department}}, Faculty of {{faculty}} at the Precious Cornerstone University (PCU), Ibadan for {{session}} academic session on part-time.
</div>

<div class="section">
Please note that this offer is on the condition that you possess the minimum requirement of admission into the programme and if it is discovered at any time that you do not possess the qualification which you claim to have obtained, you will be required to withdraw from the University.
</div>

<div class="section">
At the time of registration, you will be required to present the original and four (4) photocopies of each of the following:
<ol>
<li>Five (5) passport photographs</li>
<li>O’Level Result (WAEC/NECO SSCE)</li>
<li>OND/NCE Certificates and Academic Transcript (if applicable)</li>
<li>JAMB Registration Slip for Part-Time</li>
<li>Birth Certificate or sworn declaration of age</li>
<li>Letter of Attestation from three reputable personalities</li>
<li>Medical examination report from a Government Hospital</li>
</ol>
</div>

<div class="section">
Possession of one webcam-enabled laptop for academic activities is mandatory.
</div>

<div class="section">
The scheduled School fee is detailed below:
<table class="fees-table">
<tr>
<td>Tuition:</td>
<td>{{tuition_fee}}</td>
</tr>
<tr>
<td>Others:</td>
<td>{{other_fees}}</td>
</tr>
</table>
</div>

<div class="section">
Please ensure the payment of the Acceptance Fee of {{acceptance_fee}} within two (2) weeks upon receipt of this admission letter.
</div>

<div class="section">
All payments should be made through the authorized University portal.
</div>

<div class="section">
The date of resumption for the {{session}} academic session is slated for {{resumption_date}}.
</div>

<div class="section">
Accept my congratulations on your admission.
</div>

<div class="signature">
<strong>Mrs. Morenike F. Afolabi</strong><br>
Registrar
</div>

</body>
</html>')
        """)
        print("✓ Added FSMS Part Time template")

        connection.commit()
        print("Migration completed successfully!")

    except Error as e:
        print(f"Database error during migration: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    migrate_database()