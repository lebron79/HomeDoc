# HomeDoc - AI-Powered Medical Diagnosis Platform

A comprehensive healthcare platform that provides AI-powered symptom checking and medical guidance for patients, doctors, and administrators.

## Features

- **Patient Dashboard**: Symptom checker and health guidance
- **Doctor Dashboard**: Patient case management and medical tools
- **Admin Dashboard**: System administration and user management
- **Authentication**: Secure login/register with role-based access
- **Responsive Design**: Mobile-friendly interface

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Run the SQL migration in your Supabase project:

```sql
-- Copy the contents from supabase/migrations/20251020221032_create_homedoc_schema.sql
-- and run it in your Supabase SQL editor
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## Authentication Flow

1. **Landing Page**: Users see the homepage with "Sign In" button
2. **Authentication**: Users can switch between Login and Register forms
3. **Role Selection**: During registration, users choose between Patient and Doctor roles
4. **Dashboard Redirect**: After successful login/register, users are redirected to their appropriate dashboard
5. **Navigation**: Logged-in users see a navbar with role-specific options and can navigate back to home

## User Roles

- **Patient**: Can use symptom checker and view health guidance
- **Doctor**: Can manage patient cases and access medical tools
- **Admin**: Can manage users and system settings

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Login/Register forms
│   ├── Doctor/         # Doctor dashboard
│   ├── Patient/        # Patient dashboard
│   ├── Admin/          # Admin dashboard
│   ├── Layout/         # Navbar component
│   └── LandingPage.tsx # Homepage
├── contexts/
│   └── AuthContext.tsx # Authentication state management
├── lib/
│   └── supabase.ts     # Supabase configuration
└── App.tsx             # Main app component
```
