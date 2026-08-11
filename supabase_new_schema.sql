-- New schema for Click on Notify Quiz App
-- Run this in your Supabase SQL Editor

-- 1. Create the participants table
CREATE TABLE public.participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reg_id varchar(8) NOT NULL,
  access_code varchar(6) NOT NULL,
  name text NOT NULL,
  place text NOT NULL,
  district text NOT NULL,
  dob date NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text NOT NULL,
  payment_id text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  
  -- Primary key
  CONSTRAINT participants_pkey PRIMARY KEY (id),
  
  -- Constraints for uniqueness
  CONSTRAINT unique_reg_id UNIQUE (reg_id),
  CONSTRAINT unique_payment_id UNIQUE (payment_id),
  CONSTRAINT unique_name_dob_phone UNIQUE (name, dob, phone)
);

-- 2. Create the quizzes table (managed by Admin)
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  time_limit integer,
  time_limit_seconds integer,
  is_published boolean DEFAULT false,
  shuffle_questions boolean DEFAULT false,
  show_results boolean DEFAULT true,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT quizzes_pkey PRIMARY KEY (id)
);

-- 3. Create the questions table
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  question_text text NOT NULL,
  points integer DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE
);

-- 4. Create the options table
CREATE TABLE public.options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT options_pkey PRIMARY KEY (id),
  CONSTRAINT options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE
);

-- 5. Create the quiz_submissions table (linked to participants)
CREATE TABLE public.quiz_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  participant_id uuid NOT NULL,
  score integer NOT NULL,
  total_points integer NOT NULL,
  answers jsonb NOT NULL,
  cheat_warnings integer DEFAULT 0,
  time_taken_seconds integer DEFAULT 0,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT quiz_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_submissions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT quiz_submissions_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE,
  -- Ensure a participant can only submit once per quiz
  CONSTRAINT unique_participant_quiz UNIQUE (quiz_id, participant_id)
);

-- Indexes for performance
CREATE INDEX idx_participants_reg_id ON public.participants USING btree (reg_id);
CREATE INDEX idx_options_question_id ON public.options USING btree (question_id);
CREATE INDEX idx_questions_quiz_id ON public.questions USING btree (quiz_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON public.quiz_submissions USING btree (quiz_id);
CREATE INDEX idx_quiz_submissions_participant_id ON public.quiz_submissions USING btree (participant_id);
CREATE INDEX idx_quiz_submissions_quiz_score ON public.quiz_submissions USING btree (quiz_id, score DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Disable RLS checks temporarily or allow public insert for registration, and public read for quiz taking
-- For full dynamic behavior without complex Supabase Auth tokens for participants:
CREATE POLICY "Allow public insert on participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on participants" ON public.participants FOR SELECT USING (true); -- In a strict setup, we'd limit this via Edge Functions, but we'll control it in Next.js backend

CREATE POLICY "Allow public read on quizzes" ON public.quizzes FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read on questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read on options" ON public.options FOR SELECT USING (true);

CREATE POLICY "Allow public insert on submissions" ON public.quiz_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on own submissions" ON public.quiz_submissions FOR SELECT USING (true);

-- Admin has full access to all tables via service_role key or authenticated session
-- (Assuming Admin logs in via Supabase Auth and is the only authenticated user)
CREATE POLICY "Admin full access participants" ON public.participants FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access quizzes" ON public.quizzes FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access questions" ON public.questions FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access options" ON public.options FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access submissions" ON public.quiz_submissions FOR ALL TO authenticated USING (true);
