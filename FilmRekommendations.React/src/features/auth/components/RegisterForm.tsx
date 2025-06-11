/**
 * Enhanced Register Form Component
 * React Hook Form with Zod validation and password strength
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { registerSchema, type RegisterFormData } from '@/features/auth/utils/validationSchemas';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { Film, User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import SocialLoginButtons from './SocialLoginButtons';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

const RegisterForm = ({ onSuccess, onSwitchToLogin, className }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const passwordValue = form.watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      onSuccess?.();
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  return (
    <Card className={cn('w-full max-w-md p-6 space-y-6', className)}>
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Film className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">Join CinematIQ to discover amazing movies</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Global Error */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register('name')}
              type="text"
              className="pl-10"
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register('email')}
              type="email"
              className="pl-10"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>
        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register('password')}
              type={showPassword ? 'text' : 'password'}
              className="pl-10 pr-10"
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthIndicator password={passwordValue} />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...form.register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="pl-10 pr-10"
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        {/* Terms Checkbox */}
        <div className="space-y-2">
          <label className="flex items-start space-x-2 text-sm">
            <input
              {...form.register('acceptTerms')}
              type="checkbox"
              className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {form.formState.errors.acceptTerms && (
            <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* Social Login Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <SocialLoginButtons onSuccess={onSuccess} />

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        {onSwitchToLogin ? (
          <button 
            type="button"
            onClick={onSwitchToLogin} 
            className="text-primary hover:underline bg-transparent border-none p-0 text-sm cursor-pointer"
          >
            Sign in
          </button>
        ) : (
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        )}
      </div>
    </Card>
  );
};

export default RegisterForm;