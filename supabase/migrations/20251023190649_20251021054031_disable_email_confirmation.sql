/*
  # Disable Email Confirmation Requirement

  1. Changes
    - Create a trigger to auto-confirm user emails on signup
    - This allows users to sign in immediately without email confirmation
  
  2. Security
    - Users can access the app immediately after signup
    - Email addresses are not verified but functionality works
*/

-- Create function to auto-confirm emails
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the email if it's not already confirmed
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();