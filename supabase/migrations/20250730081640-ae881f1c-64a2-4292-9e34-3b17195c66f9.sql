-- Add trigger to create organization when user signs up (if it doesn't exist)
DROP TRIGGER IF EXISTS create_organization_on_signup ON auth.users;
CREATE TRIGGER create_organization_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_organization_for_user();