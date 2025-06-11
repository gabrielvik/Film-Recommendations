/**
 * Login Modal Component
 * Modal wrapper for the existing LoginForm
 */

import { Modal, ModalTitle, ModalDescription } from '@/components/ui/modal';
import LoginForm from './LoginForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalTitle className="sr-only">Welcome Back</ModalTitle>
      <ModalDescription className="sr-only">
        Sign in to your CinematIQ account to access personalized movie recommendations
      </ModalDescription>
      <LoginForm 
        onSuccess={handleSuccess} 
        onSwitchToRegister={onSwitchToRegister}
        className="border-0 shadow-none bg-transparent" 
      />
    </Modal>
  );
};

export default LoginModal;