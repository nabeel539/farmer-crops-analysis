'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginMutation } from '@/store/api/authApi';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [login] = useLoginMutation();

  useEffect(() => {
    const initAuth = async () => {
      const existingToken = typeof window !== 'undefined' ? localStorage.getItem('krishi_token') : null;
      let tokenValid = false;

      if (existingToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/me`, {
            headers: { Authorization: `Bearer ${existingToken}` },
          });
          if (res.ok) {
            tokenValid = true;
            const userData = await res.json();
            dispatch(
              setCredentials({
                user: userData,
                access_token: existingToken,
              })
            );
          } else {
            localStorage.removeItem('krishi_token');
            localStorage.removeItem('krishi_user');
          }
        } catch {
          tokenValid = false;
        }
      }

      if (!tokenValid && existingToken) {
        localStorage.removeItem('krishi_token');
        localStorage.removeItem('krishi_user');
      }
    };

    initAuth();
  }, [dispatch, login]);

  return <>{children}</>;
}
