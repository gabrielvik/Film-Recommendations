/**
 * Enhanced Login Page using new LoginForm component
 */

import LoginForm from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

export default LoginPage;