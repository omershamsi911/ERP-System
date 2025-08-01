# Environment Setup Guide

## 🔧 **Step 1: Create Environment File**

Create a `.env` file in the root directory of your project with the following content:

```env
VITE_SUPABASE_URL=https://xcouhnwrksibllhkgrze.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 🔑 **Step 2: Get Your Supabase Anon Key**

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "anon public" key
4. Replace `your-actual-anon-key-here` with your real anon key

## 🧪 **Step 3: Test Authentication**

1. Start the development server: `npm run dev`
2. Go to `http://localhost:5173/login`
3. Click "Create Test User" button
4. Use the test credentials to log in:
   - Email: `admin@test.com`
   - Password: `admin123`

## 🚨 **Important Notes**

- The `.env` file should be in the root directory (same level as `package.json`)
- Restart the development server after creating the `.env` file
- Never commit the `.env` file to version control (it should be in `.gitignore`)

## 🔍 **Troubleshooting**

If you still get authentication errors:
1. Check that your Supabase URL is correct
2. Verify your anon key is correct
3. Make sure your Supabase project has authentication enabled
4. Check the browser console for detailed error messages 