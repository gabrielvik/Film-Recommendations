/**
 * Register Modal Component
 * Modal wrapper for the existing RegisterForm
 */

import { Modal, ModalTitle, ModalDescription } from '@/components/ui/modal';
import RegisterForm from './RegisterForm';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalTitle className="sr-only">Create Account</ModalTitle>
      <ModalDescription className="sr-only">
        Join CinematIQ to discover amazing movies with personalized AI recommendations
      </ModalDescription>
      <RegisterForm 
        onSuccess={handleSuccess} 
        onSwitchToLogin={onSwitchToLogin}
        className="border-0 shadow-none bg-transparent" 
      />
    </Modal>
  );
};

export default RegisterModal;