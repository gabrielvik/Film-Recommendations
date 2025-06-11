/**
 * Enhanced Register Page using new RegisterForm component
 */

import RegisterForm from '@/features/auth/components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;