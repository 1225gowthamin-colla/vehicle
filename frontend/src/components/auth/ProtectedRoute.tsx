"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'subadmin' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else {
      const roleHierarchy = {
        admin: 3,
        subadmin: 2,
        user: 1,
      };

      const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
      
      // Calculate the minimum level required for this route
      let minRequiredLevel = 0;
      if (allowedRoles) {
        const levels = allowedRoles.map(r => roleHierarchy[r as keyof typeof roleHierarchy] || 0);
        minRequiredLevel = Math.min(...levels);
      }

      // If user level is below the minimum required for any of the allowed roles, redirect
      if (allowedRoles && userLevel < minRequiredLevel && user.role !== 'admin') {
        if (user.role === 'subadmin') router.push('/subadmin');
        else router.push('/dashboard');
      }

      // Extra strict check: if it's an admin route, only allow the specific email
      if (allowedRoles?.includes('admin') && user.role === 'admin' && user.email !== 'admin@smartvehicle.com') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleHierarchy = {
    admin: 3,
    subadmin: 2,
    user: 1,
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  let minRequiredLevel = 0;
  if (allowedRoles) {
    const levels = allowedRoles.map(r => roleHierarchy[r as keyof typeof roleHierarchy] || 0);
    minRequiredLevel = Math.min(...levels);
  }

  if (allowedRoles && userLevel < minRequiredLevel && user.role !== 'admin') {
    return null;
  }

  if (allowedRoles?.includes('admin') && user.role === 'admin' && user.email !== 'admin@smartvehicle.com') {
    return null;
  }

  return <>{children}</>;
}
