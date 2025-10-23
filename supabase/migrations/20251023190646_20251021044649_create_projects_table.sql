/*
  # Create Projects Table for Website Analysis

  1. New Tables
    - `projects`
      - `id` (uuid, primary key) - Unique project identifier
      - `user_id` (uuid, foreign key) - Owner of the project
      - `source` (text) - URL or source of the website
      - `type` (text) - 'url' or 'upload'
      - `status` (text) - Current project status
      - `progress` (integer) - Progress percentage (0-100)
      - `current_step` (text) - Current processing step
      - `original_html` (text) - Original HTML content
      - `optimized_html` (text) - Optimized HTML content
      - `original_score` (integer) - Original performance score
      - `optimized_score` (integer) - Optimized performance score
      - `metrics` (jsonb) - Performance metrics data
      - `assets` (jsonb) - Array of cloned assets
      - `created_at` (timestamptz) - Project creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `projects` table
    - Add policy for authenticated users to read their own projects
    - Add policy for authenticated users to insert their own projects
    - Add policy for authenticated users to update their own projects
    - Add policy for authenticated users to delete their own projects

  3. Indexes
    - Index on user_id for faster queries
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL,
  type text NOT NULL CHECK (type IN ('url', 'upload')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cloning', 'analyzing', 'optimizing', 'completed', 'error')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step text DEFAULT '',
  original_html text,
  optimized_html text,
  original_score integer,
  optimized_score integer,
  metrics jsonb DEFAULT '{}'::jsonb,
  assets jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();