/*
  # Add archived field to projects table

  1. Changes
    - Add `archived` boolean field to projects table
    - Default value is false for all new projects
    - Update existing projects to have archived = false

  2. Notes
    - This allows users to archive projects without deleting them
    - Archived projects can be moved to a "Saved Projects" section
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'archived'
  ) THEN
    ALTER TABLE projects ADD COLUMN archived boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Ensure all existing projects have archived = false
UPDATE projects SET archived = false WHERE archived IS NULL;