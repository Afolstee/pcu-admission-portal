# Admission Portal - Troubleshooting Guide

## Issue 1: "I couldn't create an account"

### Root Cause
The Python backend is not running. The frontend is just a user interface - it needs the backend API to handle account creation, login, and data storage.

### Solution

#### Step 1: Start the Python Backend

Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

#### Step 2: Set Up the Database

Make sure MySQL is running, then create the database schema:
```bash
mysql -u root -p < database_schema.sql
```
(Enter your MySQL password when prompted)

#### Step 3: Seed Test Data

Create test users (admin account + 3 applicants):
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

APPLICANT ACCESS:
  Email: john.doe@example.com
  Password: password123
  Email: jane.smith@example.com
  Password: password123
  Email: michael.brown@example.com
  Password: password123
```

#### Step 4: Run the Backend

```bash
python app.py
```

You should see:
```
* Running on http://0.0.0.0:5000
```

#### Step 5: Return to Frontend

1. Go back to http://localhost:3000/auth/signup
2. The page will detect the backend is running
3. You can now create accounts or use the seeded credentials

**Quick Test:** Use the admin credentials to log in and explore the admin dashboard.

---

## Issue 2: "How do I access the admin page?"

### Prerequisites
1. Backend must be running (see Issue 1 above)
2. Database must be seeded with admin user (see Issue 1, Step 3)

### Admin Access

#### Method 1: Using Seeded Admin Account (Easiest)

After running `python seed.py`, you'll have an admin account:
- **Email:** admin@university.edu
- **Password:** admin123

1. Go to http://localhost:3000/auth/login
2. Enter the admin credentials above
3. You'll be automatically redirected to http://localhost:3000/admin/dashboard

#### Method 2: Create Your Own Admin Account

If you want to create a different admin account:

1. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Switch to the admission portal database:
   ```sql
   USE admission_portal;
   ```

3. Create an admin user (replace values with your own):
   ```sql
   INSERT INTO users (name, email, password, phone_number, role, created_at)
   VALUES (
     'Your Name',
     'your.email@university.edu',
     SHA2('your_password', 256),
     '+1234567890',
     'admin',
     NOW()
   );
   ```

4. Log in with those credentials at http://localhost:3000/auth/login

### Admin Dashboard Features

Once logged in as admin, you'll see:

1. **Dashboard** - View statistics:
   - Total applications
   - Pending applications
   - Approved applications
   - Admitted students

2. **Applications** - List of all applications with filters:
   - View application status
   - Review applicant details
   - Approve or recommend different program

3. **Send Admission Letters** - Generate and send letters:
   - Single letter for specific applicant
   - Batch send letters to multiple approved applicants
   - Letters auto-populated with applicant name, program, and date

### Admin Actions

**From Application Review Page:**
1. Click an application to review details
2. View uploaded documents
3. Approve the application
4. (Optional) Recommend a different program and send email
5. (Optional) Revoke admission if needed

**From Send Letters Page:**
1. Select approved applicants
2. Click "Send Admission Letter" (single)
3. Or "Batch Send Letters" for multiple applicants
4. Letters are generated and tracked

---

## Common Issues

### Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'flask'`
```bash
pip install -r requirements.txt
```

**Error:** `Can't connect to MySQL server`
- Make sure MySQL is running
- Check credentials in `backend/.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**Error:** `Address already in use (port 5000)`
- Another process is using port 5000
- Kill it: `lsof -i :5000` then `kill -9 <PID>`
- Or change port in `backend/app.py`

---

### Frontend Can't Connect to Backend

**Error:** Login/signup button clicks do nothing
1. Check browser console (F12) for error messages
2. Verify backend is running: `curl http://localhost:5000/api/health`
3. Check `NEXT_PUBLIC_API_URL` in `.env.local` points to `http://localhost:5000`

**Error:** "Network request failed"
- Backend is not running - see "Backend Won't Start" above
- Backend is running on different port - update `.env.local`

---

### Database Issues

**Error:** `Unknown database 'admission_portal'`
```bash
mysql -u root -p < backend/database_schema.sql
```

**Error:** Foreign key constraint failures
- Tables don't exist yet - run database schema
- Try importing schema again: `mysql -u root -p admission_portal < backend/database_schema.sql`

---

### Login/Signup Not Working

**Error:** "Invalid credentials" when using seeded data
1. Run seed script again: `python backend/seed.py`
2. Check if users were created: `mysql -u root -p admission_portal -e "SELECT * FROM users;"`
3. Check backend logs for specific errors

---

## Testing Checklist

- [ ] MySQL is running and accessible
- [ ] Backend virtual environment activated
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Database schema imported
- [ ] Test data seeded (`python seed.py`)
- [ ] Backend running on http://localhost:5000
- [ ] Backend health check passes: `curl http://localhost:5000/api/health`
- [ ] Frontend running on http://localhost:3000
- [ ] Can see setup guide on signup page when backend connected
- [ ] Can log in with admin@university.edu / admin123
- [ ] Can access admin dashboard at http://localhost:3000/admin/dashboard
- [ ] Can create new applicant account
- [ ] Can submit application form
- [ ] Can upload documents

---

## Getting Help

1. Check the logs:
   - **Backend:** Terminal where you ran `python app.py`
   - **Frontend:** Browser console (F12)
   - **Database:** MySQL error messages

2. Verify backend is running:
   ```bash
   curl -v http://localhost:3000/api/health
   ```

3. Check database connection:
   ```bash
   mysql -u root -p -e "USE admission_portal; SELECT COUNT(*) FROM users;"
   ```

4. See detailed setup in:
   - `QUICK_START.md` - Quick reference
   - `SETUP_GUIDE.md` - Detailed setup
   - `backend/README.md` - Backend specifics
