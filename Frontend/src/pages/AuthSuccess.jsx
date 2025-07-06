import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      checkAuth().then((user) => {
        if (user?.isProfileComplete) {
          navigate('/dashboard');
        } else {
          navigate('/profile');
        }
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
};

export default AuthSuccess;