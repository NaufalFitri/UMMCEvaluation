# Admin Features & User Management Guide

## ✨ New Features Added

### 1. **Logout Functionality**
- **Location**: Sidebar (bottom section)
- **Feature**: Red logout button in the sidebar
- **Functionality**: Securely signs out the user from Clerk and returns to home page

### 2. **Admin Role & Panel**
- **Admin-Only Panel**: Access via `/admin` route
- **Features**:
  - Dashboard with system statistics
  - Student management (CRUD operations)
  - Assessor management (CRUD operations)
  - Role-based access control

### 3. **Student Management**
Create, edit, and delete student records directly from the admin panel:
- **Fields**: Student ID, Name, Email
- **Actions**: Add, Edit, Delete, View All

### 4. **Assessor Management**
Create, edit, and delete assessor accounts:
- **Fields**: Email, Name, Role (Assessor or Admin)
- **Actions**: Add, Edit, Delete, View All
- **Pre-Creation**: Assessors can be added before they sign up (will auto-link on first sign-in)

### 5. **Waitlist Approval Flow**
New sign-ups can be placed on a waitlist so users only join after admin approval:
- **Waitlist Form**: Enabled on `/sign-up` when `NEXT_PUBLIC_CLERK_WAITLIST=true`
- **Admin Review**: Pending requests appear in `/admin/waitlist` and on the admin dashboard
- **Notification**: Admin sidebar shows a badge count for new waitlist requests
- **Storage**: Local demo flow stores requests in `data/waitlist.json`
- **Production**: Use Clerk webhooks to capture waitlist events and optionally sync them into your database

---

## 🚀 Getting Started

### Step 1: Create Admin Account
Run the admin setup script to promote a user to admin:

```bash
npm run setup-admin -- --email=admin@example.com
```

**Example output:**
```
✅ New admin user created: admin@example.com

Admin Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: admin@example.com
Role: ADMIN
ID: <user-id>
```

### Step 2: Sign In as Admin
1. Go to the application's sign-in page
2. Sign in with the admin email
3. You'll be automatically redirected to your dashboard
4. Look for "Admin Panel" in the sidebar (purple indicator)

### Step 3: Manage Students & Assessors
- **Dashboard**: Overview of system statistics
- **Waitlist**: Review pending sign-up requests at `/admin/waitlist`
- **Manage Students**: `/admin/students`
  - Add students for evaluation
  - Edit student information
  - Delete archived students
  
- **Manage Assessors**: `/admin/assessors`
  - Add assessors before they sign up
  - Change assessor roles (Assessor ↔ Admin)
  - Manage assessor accounts

---

## 🔐 Role-Based Access Control

### User Roles:
- **ADMIN**: Full access to admin panel and system management
- **ASSESSOR**: Can create and manage evaluations
- **STUDENT**: Limited (for future expansion)

### Access Rules:
- Only ADMIN users can access `/admin` routes
- Only ADMIN users can access student/assessor management APIs
- All other routes require authentication but are accessible to authenticated users

---

## 📝 Waitlist Setup

### Environment Variables
Add these to `.env.local` if you want the waitlist flow enabled:

```bash
NEXT_PUBLIC_CLERK_WAITLIST=true
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### Recommended Clerk Webhooks
Configure Clerk to send webhook events to:

```bash
/api/webhooks/clerk
```

This lets you sync new waitlist approvals or user creation events into the app.

### Local Demo Flow
- Users submit the waitlist form on `/sign-up`
- Entries are stored in `data/waitlist.json`
- Admins review pending entries in `/admin/waitlist`
- Use the email link or Clerk dashboard to approve them

---

## 📊 Admin Dashboard Features

### Statistics Dashboard
Displays real-time counts:
- **Total Students**: All registered students
- **Total Assessors**: All active assessors (Assessors + Admins)
- **Total Evaluations**: All evaluations in the system
- **Completed**: Number of completed evaluations

### Quick Actions
- Link to student management
- Link to assessor management
- Easy navigation to all admin functions

---

## 👥 Student Management

### Add a Student
1. Click **"+ Add Student"** button
2. Fill in:
   - **Student ID**: Unique identifier (e.g., STU001)
   - **Name**: Student's full name
   - **Email**: Student's email address
3. Click **"Add Student"**

### Edit a Student
1. Find the student in the table
2. Click **"Edit"**
3. Modify the information
4. Click **"Update Student"**

### Delete a Student
1. Find the student in the table
2. Click **"Delete"**
3. Confirm deletion (warning: cannot be undone)

---

## 👨‍💼 Assessor Management

### Add an Assessor
1. Click **"+ Add Assessor"** button
2. Fill in:
   - **Email**: Assessor's email (required)
   - **Name**: Assessor's full name (optional)
   - **Role**: Select "Assessor" or "Admin"
3. Click **"Add Assessor"**

### Pre-Creation Workflow
- Add assessor email before they sign up
- System assigns a pending Clerk ID
- When assessor first signs in, account auto-links
- They'll immediately have full access

### Change Assessor Role
1. Find the assessor in the table
2. Click **"Edit"**
3. Change the role dropdown
4. Click **"Update Assessor"**

### Delete an Assessor
1. Find the assessor in the table
2. Click **"Delete"**
3. Confirm deletion

---

## 🔧 API Endpoints

### Students
- `GET /api/admin/students` - List all students
- `POST /api/admin/students` - Create student
- `PUT /api/admin/students/[id]` - Update student
- `DELETE /api/admin/students/[id]` - Delete student

### Assessors
- `GET /api/admin/assessors` - List all assessors
- `POST /api/admin/assessors` - Create assessor
- `PUT /api/admin/assessors/[id]` - Update assessor
- `DELETE /api/admin/assessors/[id]` - Delete assessor

All endpoints require:
- Clerk authentication
- Admin role verification

---

## 🛡️ Security Features

✅ **Clerk Integration**: All auth flows through Clerk  
✅ **Role-based Access**: Admin-only routes and APIs  
✅ **Email Validation**: Duplicate email prevention  
✅ **Pre-creation Support**: Flexible assessor onboarding  
✅ **Auto-linking**: Seamless Clerk account linking  

---

## ⚡ Quick Start Commands

```bash
# Set up first admin
npm run setup-admin -- --email=admin@your-domain.com

# Start development server
npm run dev

# Build for production
npm run build

# Run database migrations
npx prisma migrate dev
```

---

## 📝 Notes

- **Logout Button**: Appears in sidebar for all authenticated users
- **Admin Badge**: Purple indicator in sidebar for admin users
- **Auto-Creation**: New assessors from pre-creation are automatically linked on first sign-in
- **Email Uniqueness**: Student and assessor emails must be unique in the system

---

## 🆘 Troubleshooting

### Can't access Admin Panel?
- Verify user has ADMIN role: `npm run setup-admin -- --email=your@email.com`
- Clear browser cache and sign out/sign in

### Waitlist not showing?
- Ensure `NEXT_PUBLIC_CLERK_WAITLIST=true` is set
- Check that `data/waitlist.json` exists after submitting the waitlist form
- Open `/admin/waitlist` and confirm you are signed in as ADMIN

### Student/Assessor not saving?
- Check email is unique
- Verify all required fields are filled
- Check browser console for error messages

### Logout button not working?
- Ensure Clerk is properly configured
- Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set

---

For more information, see the main README.md file.
