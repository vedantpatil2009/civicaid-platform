-- Seed data for local development
-- This file is run after migrations when using `supabase db reset`

-- Note: The main seed data is already included in the first migration file.
-- This file can be used for additional development-only test data.

-- Create the complaint-photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-photos',
  'complaint-photos',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;