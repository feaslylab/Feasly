import { useNavigate } from "react-router-dom";
import { AuthPage } from "@/pages/Auth";

// AuthPageWrapper to handle navigation properly
const AuthPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    console.log('Login success, navigating to dashboard');
    navigate('/dashboard', { replace: true });
  };

  return <AuthPage onSuccess={handleSuccess} />;
};

export default AuthPageWrapper;