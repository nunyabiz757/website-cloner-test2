-- Add analysis result columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS detection JSONB,
ADD COLUMN IF NOT EXISTS seo_analysis JSONB,
ADD COLUMN IF NOT EXISTS security_scan JSONB,
ADD COLUMN IF NOT EXISTS technology_stack JSONB;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_seo_score ON projects ((seo_analysis->>'score'));
CREATE INDEX IF NOT EXISTS idx_projects_security_score ON projects ((security_scan->>'score'));

-- Add comment to document the columns
COMMENT ON COLUMN projects.detection IS 'Component detection results from ComponentDetector service';
COMMENT ON COLUMN projects.seo_analysis IS 'SEO analysis results including score, recommendations, and metrics';
COMMENT ON COLUMN projects.security_scan IS 'Security scan results including vulnerabilities and threats';
COMMENT ON COLUMN projects.technology_stack IS 'Detected technology stack including frameworks, libraries, and tools';
