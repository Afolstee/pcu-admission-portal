# Admission Portal - Quick Start Guide

## Overview
This is a full-stack admission portal with separate interfaces for applicants and administrators.

**Frontend:** React/Next.js 16 (TypeScript)  
**Backend:** Python Flask with MySQL  
**Database:** MySQL/MariaDB

---

## Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MySQL/MariaDB installed and running
- Git

---

## ⚙️ Backend Setup (Python)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy the `.env.example` file to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=admission_portal
DB_PORT=3306
SECRET_KEY=your_secret_key_here
```

### 5. Initialize Database
Create the MySQL database and tables:
```bash
mysql -u root -p < database_schema.sql
```

Or if you have MySQL client configured:
```bash
mysql -h localhost -u root -p -D admission_portal < database_schema.sql
```

### 6. Seed Test Data
Create test users (admin + 3 applicants):
```bash
python seed.py
```

This will output:
```
✓ Database seeding completed successfully!

📋 Test Credentials:
==================================================

ADMIN ACCESS:
  Email: admin@university.edu
  Password: admin123
  URL: http://localhost:3000/auth/login

APPLICANT ACCESS:
  Email: john.doe@example.com
  Password: password123
  ...
```

### 7. Run Backend Server
```bash
python app.py
```

The backend will start at: `http://localhost:5000`

**Verify it's running:**
```bash
curl http://localhost:5000/api/health
```

Response: `{"status": "ok"}`

---

## 🎨 Frontend Setup (React/Next.js)

### 1. Install Dependencies
From project root:
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```

Frontend will start at: `http://localhost:3000`

---

## 🚀 Using the Portal

### Admin Login
1. Go to http://localhost:3000/auth/login
2. Enter credentials:
   - **Email:** admin@university.edu
   - **Password:** admin123
3. You'll see:
   - Dashboard with application statistics
   - Applications list to review
   - Admission letter sending interface

### Applicant Flow
1. Go to http://localhost:3000/auth/login
2. Enter applicant credentials (from seed data)
3. Or create a new account via signup
4. Follow the flow:
   - Select program (Undergraduate, Postgraduate, HND, etc.)
   - Fill application form
   - Upload documents (auto-compressed to ~5KB)
   - Submit application
   - Wait for admin approval
   - Access payment page (ready for integration)

---

## 📁 Project Structure

### Backend (`/backend`)
```
backend/
├── app.py                 # Flask application entry point
├── config.py              # Configuration settings
├── database.py            # Database connection manager
├── database_schema.sql    # MySQL schema
├── seed.py                # Test data seeder
├── requirements.txt       # Python dependencies
├── utils/
│   ├── auth.py           # Authentication utilities
│   └── document_handler.py # Document compression
└── routes/
    ├── auth.py           # Login/signup endpoints
    ├── applicant.py      # Applicant endpoints
    └── admin.py          # Admin endpoints
```

### Frontend (`/app`)
```
app/
├── page.tsx              # Landing page
├── layout.tsx            # Root layout with providers
├── providers.tsx         # Auth context provider
├── auth/
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── applicant/
│   ├── dashboard/        # Applicant dashboard
│   ├── select-program/   # Program selection
│   ├── application/      # Application form
│   └── payment/          # Payment page
└── admin/
    ├── dashboard/        # Admin dashboard
    ├── applications/     # Application list
    ├── send-letters/     # Letter sending
    └── application/[id]/ # Application review
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Applicant
- `GET /api/applicant/dashboard` - Get applicant data
- `GET /api/applicant/programs` - Get available programs
- `POST /api/applicant/application` - Submit application
- `GET /api/applicant/application` - Get application status
- `POST /api/applicant/upload-document` - Upload document
- `GET /api/applicant/documents` - Get uploaded documents

### Admin
- `GET /api/admin/dashboard` - Get statistics
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/application/<id>` - Get application details
- `POST /api/admin/approve-application/<id>` - Approve application
- `POST /api/admin/recommend-program/<id>` - Recommend different program
- `POST /api/admin/send-admission-letter` - Send single letter
- `POST /api/admin/batch-send-letters` - Send batch letters
- `POST /api/admin/revoke-admission/<id>` - Revoke admission

---

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running: `mysql -u root -p -e "SELECT 1"`
- Verify `.env` file has correct credentials
- Check if port 5000 is available

### Frontend can't connect to backend
- Ensure backend is running on http://localhost:5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Database connection errors
- Verify MySQL service is running
- Check credentials in `.env` file
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES"`

### Signup/Login not working
- Run seed script: `python backend/seed.py`
- Check backend logs for errors
- Verify API endpoint is responding: `curl http://localhost:5000/api/health`

---

## 📝 Next Steps

### Ready to Integrate Payments?
The payment page is framework-ready. Add:
1. **Stripe Integration** (recommended):
   - Install: `npm install @stripe/react-stripe-js stripe`
   - Update `/app/applicant/payment/page.tsx`
   - Add `NEXT_PUBLIC_STRIPE_KEY` to `.env.local`

2. **PayPal Integration**:
   - Install: `npm install @paypal/checkout-js`
   - Similar setup to Stripe

### Production Deployment
1. Set up environment variables on hosting platform
2. Use production database
3. Configure CORS properly
4. Set `NODE_ENV=production`
5. Deploy backend (Heroku, AWS, DigitalOcean, etc.)
6. Deploy frontend (Vercel, Netlify, etc.)

---

## 📞 Support
For issues or questions, check the SETUP_GUIDE.md for more detailed information on each component.
