# Admission Portal - Complete Setup Guide

A full-stack university admission portal with separate interfaces for applicants and administrators.

## Project Overview

### Features

#### Applicant Interface
- User registration and login with automatic redirect after signup
- Program selection (Undergraduate, Postgraduate, HND, Part-time, Jupeb)
- Dynamic application form based on selected program
- Document upload with automatic compression (target 5KB, max 15MB)
- Application tracking and status updates
- Payment page (framework for future integration)
- Admission documents printing (framework)

#### Admin Interface
- Application review and approval dashboard
- Single and batch admission letter generation
- Auto-generated admission letters with templates
- Application recommendation for other programs
- Admission revocation capability
- Statistics and analytics dashboard
- Application filtering by status and program

#### Backend Features
- MySQL database with comprehensive schema
- JWT authentication with role-based access
- Document compression using PIL (Pillow)
- File storage on local filesystem
- RESTful API with proper error handling
- Admin and applicant role separation

## Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend)
- MySQL 5.7+ or MySQL 8.0
- pip (Python package manager)
- npm or yarn (Node package manager)

## Installation & Setup

### 1. Backend Setup

#### Step 1: Create MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database and tables
source backend/database_schema.sql
```

Or if you have the database file:
```bash
mysql -u root -p admission_portal < backend/database_schema.sql
```

#### Step 2: Setup Python Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
.\venv\Scripts\Activate.ps1

# On macOS/Linux
source venv/bin/activate
```

#### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your configuration
# Important: Update MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT
```

Example .env:
```
FLASK_ENV=development
FLASK_DEBUG=True

MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=admission_portal

SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret-key
```

#### Step 5: Run the Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# The default API URL is already set:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Step 3: Run the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Project Structure

```
admission-portal/
├── backend/
│   ├── app.py                    # Flask application factory
│   ├── config.py                 # Configuration settings
│   ├── database.py               # Database connection
│   ├── database_schema.sql       # MySQL schema
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment template
│   ├── utils/
│   │   ├── auth.py              # JWT and password handling
│   │   └── document_handler.py  # File upload and compression
│   └── routes/
│       ├── auth.py              # Authentication endpoints
│       ├── applicant.py         # Applicant endpoints
│       └── admin.py             # Admin endpoints
│
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with providers
│   ├── providers.tsx            # Auth provider wrapper
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── applicant/
│   │   ├── dashboard/page.tsx
│   │   ├── select-program/page.tsx
│   │   ├── application/page.tsx
│   │   └── payment/page.tsx
│   └── admin/
│       ├── dashboard/page.tsx
│       ├── applications/page.tsx
│       ├── application/[id]/page.tsx
│       └── send-letters/page.tsx
│
├── components/
│   └── ApplicationForm.tsx       # Reusable form component
│
├── context/
│   └── AuthContext.tsx           # Authentication context
│
├── lib/
│   └── api.ts                    # API client with all endpoints
│
└── public/                       # Static assets
```

## Database Schema

### Key Tables

- **users** - User accounts with roles (applicant/admin)
- **programs** - Available programs for admission
- **applicants** - Applicant-specific data and status
- **application_forms** - Detailed application form submissions
- **documents** - Uploaded documents with compression info
- **admission_letters** - Generated admission letters
- **application_reviews** - Admin review records
- **payment_transactions** - Payment tracking (for future integration)
- **letter_templates** - Admission letter templates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-token` - Token validation
- `POST /api/auth/logout` - Logout

### Applicant Endpoints
- `GET /api/applicant/programs` - Get available programs
- `POST /api/applicant/select-program` - Select a program
- `GET /api/applicant/form/<program_id>` - Get form template
- `POST /api/applicant/submit-form` - Save application form
- `POST /api/applicant/upload-document` - Upload document
- `POST /api/applicant/submit-application` - Submit for review
- `GET /api/applicant/get-applicant-status` - Get application status

### Admin Endpoints
- `GET /api/admin/applications` - Get applications list
- `GET /api/admin/application/<id>` - Get application details
- `POST /api/admin/review-application` - Review application
- `POST /api/admin/send-admission-letter` - Send single letter
- `POST /api/admin/send-batch-letters` - Send batch letters
- `POST /api/admin/revoke-admission` - Revoke admission
- `GET /api/admin/statistics` - Get statistics

## Document Compression

- **Target size**: 5KB
- **Max upload size**: 15MB
- **Supported formats**: PDF, JPG, JPEG, PNG, DOC, DOCX
- **Image compression**: Uses PIL with quality adjustment (95-10)
- **Compression algorithm**: JPEG with optimization

## Authentication & Security

- **Password hashing**: SHA256 (upgrade to bcrypt for production)
- **Token type**: JWT (JSON Web Tokens)
- **Token expiry**: 24 hours
- **Role-based access**: Admin and Applicant roles
- **CORS enabled**: All origins (configure for production)

## Future Enhancements

### Payment Integration
- Stripe integration for credit card payments
- Bank transfer options
- Mobile money support
- PayPal integration

### Email Notifications
- Application submission confirmation
- Status update emails
- Admission letter delivery
- Payment receipt emails

### Additional Features
- Email verification on signup
- Password reset functionality
- Application timeline tracking
- Bulk import of applicants
- Advanced analytics dashboard
- Document signing/verification
- Multi-language support

## Testing

### Test Users

For development, you can create test users:

```sql
-- Admin user
INSERT INTO users (name, email, password_hash, phone_number, role) 
VALUES ('Admin User', 'admin@test.com', SHA2('password123', 256), '1234567890', 'admin');

-- Applicant user
INSERT INTO users (name, email, password_hash, phone_number, role) 
VALUES ('John Doe', 'john@test.com', SHA2('password123', 256), '0987654321', 'applicant');
```

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `.env` file
- Verify database exists: `CREATE DATABASE admission_portal;`

### CORS Error
- Backend is running on `localhost:5000`
- Frontend is running on `localhost:3000`
- CORS is enabled for all origins in development

### Document Upload Failed
- Check file size (max 15MB)
- Verify file format is supported
- Ensure uploads folder exists and is writable

### Token Expiration
- Tokens expire after 24 hours
- User will need to log in again
- Consider implementing refresh token mechanism

## Deployment

### Backend Deployment
1. Use production-grade WSGI server (Gunicorn, uWSGI)
2. Enable HTTPS
3. Update SECRET_KEY and JWT_SECRET
4. Use bcrypt for password hashing
5. Configure database connection pooling
6. Set up logging and monitoring

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update NEXT_PUBLIC_API_URL to production backend URL
4. Enable analytics and error tracking

## Support

For issues or questions, please refer to:
- Backend README: `/backend/README.md`
- Check error logs in console
- Review API response messages

## License

This project is provided as-is for educational purposes.
