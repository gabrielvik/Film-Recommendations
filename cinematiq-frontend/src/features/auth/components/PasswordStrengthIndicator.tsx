/**
 * Password Strength Indicator Component
 * Visual feedback for password strength
 */

import { useMemo } from 'react';
import { getPasswordStrength } from '@/features/auth/utils/validationSchemas';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator = ({ password, className }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-orange-500';
      case 'good': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (strength.strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  const strengthPercentage = Math.min((strength.score / 6) * 100, 100);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', getStrengthColor())}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className={cn('text-sm font-medium', {
          'text-red-600': strength.strength === 'weak',
          'text-orange-600': strength.strength === 'fair',
          'text-yellow-600': strength.strength === 'good',
          'text-green-600': strength.strength === 'strong',
        })}>
          {getStrengthText()}
        </span>
      </div>
      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-current rounded-full" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;