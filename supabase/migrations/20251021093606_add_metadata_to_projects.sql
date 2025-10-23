/*
  # Add Metadata Column to Projects Table

  1. Changes
    - Add `metadata` (jsonb) column to projects table
      - Stores website metadata including:
        - title: Website title
        - description: Meta description
        - favicon: Favicon URL
        - framework: Detected framework (React, Vue, Angular, etc.)
        - responsive: Whether the site is responsive
        - totalSize: Total size of all assets in bytes
        - assetCount: Number of assets downloaded
        - pageCount: Number of pages cloned

  2. Notes
    - Uses default empty object for existing rows
    - Allows null for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE projects ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
