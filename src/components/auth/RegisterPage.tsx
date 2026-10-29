import React from 'react';
import { LoginPage } from './LoginPage.tsx';
import type { User } from '../../types/index.ts';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
  onBackToHome: () => void;
  onNavigateToPortal: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onBackToHome,
  onNavigateToPortal,
}) => {
  return (
    <LoginPage
      initialTab="register"
      onLoginSuccess={onRegisterSuccess}
      onNavigateToRegister={() => {}}
      onBackToHome={onBackToHome}
      onNavigateToPortal={onNavigateToPortal}
    />
  );
};
