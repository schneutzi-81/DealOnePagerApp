import { useState, useEffect } from 'react';
import { initializeAuth, getActiveAccount, login, logout } from '../services/auth';
import type { AccountInfo } from '@azure/msal-browser';

export function useAuth() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth().then(() => {
      setAccount(getActiveAccount());
      setIsLoading(false);
    });
  }, []);

  return {
    account,
    isAuthenticated: !!account,
    isLoading,
    login,
    logout,
    userName: account?.name || '',
    userEmail: account?.username || '',
  };
}
