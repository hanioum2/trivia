# Supabase Setup Guide

## Database Schema

### Quizzes Table

Create a `quizzes` table in Supabase with the following structure:

```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  background_image_path TEXT,
  gradient_color_1 TEXT NOT NULL DEFAULT '#667eea',
  gradient_color_2 TEXT NOT NULL DEFAULT '#764ba2',
  logo_path TEXT,
  button_color_arabic TEXT NOT NULL DEFAULT '#10b981',
  button_color_english TEXT NOT NULL DEFAULT '#3b82f6',
  scoreboard_background_image_path TEXT,
  scoreboard_gradient_color_1 TEXT NOT NULL DEFAULT '#667eea',
  scoreboard_gradient_color_2 TEXT NOT NULL DEFAULT '#764ba2',
  scoreboard_logo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Questions Table

Create a `questions` table to store quiz questions:

```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  options_en TEXT[] NOT NULL, -- Array of 4 options
  options_ar TEXT[] NOT NULL, -- Array of 4 options
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer < 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
```

## Storage Buckets

Create two storage buckets in Supabase:

1. **`quiz-backgrounds`** - For storing background images
   - Make it **public** (Settings → Public bucket)
   - Upload background images here
   - Store just the filename in database (e.g., `background.jpg`) OR full path (e.g., `quiz-backgrounds/background.jpg`)

2. **`quiz-logos`** - For storing logo images
   - Make it **public** (Settings → Public bucket)
   - Upload logo images here
   - Store just the filename in database (e.g., `sf_logo.jpg`) OR full path (e.g., `quiz-logos/sf_logo.jpg`)

**Important:** The buckets MUST be set to public for the images to be accessible. You can set this in Storage → [bucket name] → Settings → toggle "Public bucket".

### Scores Table

Create a `scores` table to store quiz results:

```sql
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time INTEGER NOT NULL, -- Time in milliseconds
  language TEXT NOT NULL CHECK (language IN ('en', 'ar')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_scores_quiz_id ON scores(quiz_id);
CREATE INDEX idx_scores_ranking ON scores(quiz_id, score DESC, time ASC);

-- Enable Row Level Security (RLS) for realtime
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read scores
CREATE POLICY "Anyone can read scores" ON scores
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert scores
CREATE POLICY "Anyone can insert scores" ON scores
  FOR INSERT WITH CHECK (true);
```

**Important:** Enable Realtime for the `scores` table. You can do this in two ways:

**Option 1: Using SQL (Recommended)**
Run this SQL in the Supabase SQL Editor:

```sql
-- Enable Realtime for the scores table
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
```

**Option 2: Using the Dashboard**
1. Go to **Database** → **Replication** (or **Realtime** tab in newer versions)
2. Find the `scores` table
3. Toggle it ON to enable realtime updates

If you don't see the Replication tab, use Option 1 (SQL method) which works in all Supabase versions.

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Find These Values:

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API** (in the left sidebar)
4. You'll find:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon/public key** → This is your `VITE_SUPABASE_ANON_KEY`

### Example `.env` file:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

**Note:** Never commit your `.env` file to git! It's already in `.gitignore`.

## Authentication Setup (for Admin Panel)

To use the admin panel, you need to create an admin user in Supabase:

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter an email and password for your admin account
4. Save the credentials - you'll use them to log into the admin panel

**Note:** The admin panel requires authentication. Make sure to create at least one user before accessing `/admin`.

## Usage

### Playing Quizzes

Access a quiz by adding the `quiz` query parameter to the URL:

```
http://localhost:5173/?quiz=your-quiz-id
```

If no quiz ID is provided, the app will use default values for all configurable elements.

### Admin Panel

Access the admin panel at:

```
http://localhost:5173/admin
```

You'll be prompted to log in with your Supabase user credentials. Once logged in, you can:
- View all quizzes
- Create new quizzes
- Edit existing quizzes (including all settings and questions)
- Delete quizzes
- Upload images for backgrounds and logos
- Manage questions (add, edit, delete)

## Example Quiz Record

```sql
-- Insert a quiz
INSERT INTO quizzes (
  id,
  title,
  background_image_path,
  gradient_color_1,
  gradient_color_2,
  logo_path,
  button_color_arabic,
  button_color_english
) VALUES (
  'quiz-1',
  'My Custom Quiz',
  'quiz1-bg.jpg',  -- or 'quiz-backgrounds/quiz1-bg.jpg'
  '#ff6b6b',
  '#4ecdc4',
  'sf_logo.jpg',  -- or 'quiz-logos/sf_logo.jpg'
  '#ff6b6b',
  '#4ecdc4'
);

-- Insert questions for the quiz
INSERT INTO questions (
  quiz_id,
  question_en,
  question_ar,
  options_en,
  options_ar,
  correct_answer
) VALUES 
(
  'quiz-1',
  'What is the capital of France?',
  'ما هي عاصمة فرنسا؟',
  ARRAY['Paris', 'London', 'Berlin', 'Madrid'],
  ARRAY['باريس', 'لندن', 'برلين', 'مدريد'],
  0  -- Paris is the correct answer (first option, index 0)
),
(
  'quiz-1',
  'What is 2 + 2?',
  'ما هو 2 + 2؟',
  ARRAY['3', '4', '5', '6'],
  ARRAY['3', '4', '5', '6'],
  1  -- 4 is the correct answer (second option, index 1)
),
(
  'quiz-1',
  'Which planet is known as the Red Planet?',
  'ما هو الكوكب المعروف بالكوكب الأحمر؟',
  ARRAY['Venus', 'Mars', 'Jupiter', 'Saturn'],
  ARRAY['الزهرة', 'المريخ', 'المشتري', 'زحل'],
  1  -- Mars is the correct answer (second option, index 1)
);
```

**Note:** The `correct_answer` field is the index (0-3) of the correct option in the `options_en` and `options_ar` arrays.

