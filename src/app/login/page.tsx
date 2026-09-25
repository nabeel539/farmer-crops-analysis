'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { setCurrentUser, setActiveRole } from '@/store/slices/uiSlice';
import { MOCK_USERS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wheat, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  Smartphone, 
  Loader2, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick autofill for demo / evaluation
  const setDemoCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      const msg = 'Mandatory field required: Please enter both email address and password.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      // 1. Call Backend API
      const response = await login({ email, password }).unwrap();
      
      // 2. Save credentials in Redux & localStorage
      dispatch(setCredentials({
        user: response.user,
        access_token: response.access_token,
      }));

      // 3. Sync UI Persona with User Role
      const role = response.user.role;
      const matchedMockUser = MOCK_USERS.find(u => u.email === response.user.email) || {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.mobile || '0300-0000000',
        role: role === 'ADMIN' ? 'SUPER_ADMIN' : role === 'FIELD_OFFICER' ? 'FIELD_OFFICER' : 'FARMER',
        assignedRegion: 'Karnal, Haryana',
      };

      dispatch(setCurrentUser(matchedMockUser as any));
      dispatch(setActiveRole(matchedMockUser.role));

      toast.success(`Welcome back, ${response.user.name}!`);

      // 4. Navigate to respective portal
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'FIELD_OFFICER') {
        router.push('/field-officer');
      } else {
        router.push('/farmer');
      }
    } catch (err: any) {
      console.warn('Backend login attempt:', err);

      // Check for dynamically registered farmer credentials from localStorage
      let foundRegisteredFarmer: any = null;
      try {
        const savedCreds = JSON.parse(localStorage.getItem('registered_farmer_credentials') || '[]');
        foundRegisteredFarmer = savedCreds.find(
          (c: any) =>
            (c.userId?.trim().toLowerCase() === email.trim().toLowerCase() ||
             c.mobile?.trim().toLowerCase() === email.trim().toLowerCase()) &&
            c.pass?.trim() === password.trim()
        );
      } catch (e) {
        console.error(e);
      }

      if (foundRegisteredFarmer) {
        const farmerUser = {
          id: 'farmer-' + (foundRegisteredFarmer.userId || 'custom'),
          name: foundRegisteredFarmer.name,
          email: `${foundRegisteredFarmer.userId}@krishi.local`,
          mobile: foundRegisteredFarmer.userId,
          role: 'FARMER' as any,
          is_active: true,
        };

        dispatch(setCredentials({
          user: farmerUser,
          access_token: 'farmer-local-jwt-token',
        }));

        const mockFarmerProfile = {
          id: farmerUser.id,
          name: foundRegisteredFarmer.name,
          email: farmerUser.email,
          phone: foundRegisteredFarmer.userId,
          role: 'FARMER' as const,
          assignedRegion: foundRegisteredFarmer.village || 'Karnal, Haryana',
        };

        dispatch(setCurrentUser(mockFarmerProfile as any));
        dispatch(setActiveRole('FARMER'));

        toast.success(`Welcome back, ${foundRegisteredFarmer.name}!`);
        router.push('/farmer');
        return;
      }

      // Fallback for demo users if backend is unreachable or local mock credentials used
      if (
        (email === 'admin@krishi.com' && password === 'admin1234') ||
        (email === 'officer@krishi.com' && password === 'officer1234') ||
        (email === 'ramesh@krishi.com' && password === 'farmer1234')
      ) {
        const role = email === 'admin@krishi.com' ? 'ADMIN' : email === 'officer@krishi.com' ? 'FIELD_OFFICER' : 'FARMER';
        const name = email === 'admin@krishi.com' ? 'Administrator' : email === 'officer@krishi.com' ? 'Rajesh Kumar (Field Officer)' : 'Ramesh Patel (Farmer)';
        
        const fallbackUser = {
          id: 'demo-user-id',
          name,
          email,
          mobile: '9812345678',
          role: role as any,
          is_active: true
        };

        dispatch(setCredentials({
          user: fallbackUser,
          access_token: 'demo-jwt-fallback-token'
        }));

        const matchedMock = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
        dispatch(setCurrentUser(matchedMock));
        dispatch(setActiveRole(matchedMock.role));

        toast.success(`Signed in as ${name}`);
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'FIELD_OFFICER') router.push('/field-officer');
        else router.push('/farmer');
      } else {
        setErrorMsg(err?.data?.detail || 'Invalid User ID, Mobile, or Password. Please verify and try again.');
        toast.error('Authentication failed. Please check your login credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950/20 via-background to-background flex flex-col justify-between selection:bg-primary/20">
      {/* Top Brand Header */}
      <header className="px-6 h-16 border-b border-border/70 flex items-center justify-between bg-card/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Wheat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-foreground">Krishi AgriTech</h1>
            <p className="text-[11px] text-muted-foreground">Farmer & Wheat Crop Monitoring System</p>
          </div>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-xs">
            Back to Home
          </Button>
        </Link>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/80 shadow-lg backdrop-blur-xs bg-card/90">
            <CardHeader className="space-y-2 text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
                <Wheat className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-extrabold tracking-tight">
                Sign in to Krishi AgriTech
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your credentials to access your designated agricultural dashboard
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-0">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* User ID / Mobile / Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    User ID / Mobile Number / Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="e.g. 9876543210 or admin@krishi.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 h-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 font-semibold gap-2 shadow-xs" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </form>

            <CardFooter className="flex flex-col space-y-4 pt-2 border-t border-border/60">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    One-Click Demo Access:
                  </span>
                </div>

                {/* 3 Role Quick Login Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDemoCredentials('admin@krishi.com', 'admin1234')}
                    className="flex flex-col h-auto py-2 px-1 text-center border-border/80 hover:border-primary hover:bg-primary/5"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600 mb-1" />
                    <span className="text-[11px] font-bold">Admin</span>
                    <span className="text-[9px] text-muted-foreground">Full Access</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDemoCredentials('officer@krishi.com', 'officer1234')}
                    className="flex flex-col h-auto py-2 px-1 text-center border-border/80 hover:border-blue-500 hover:bg-blue-500/5"
                  >
                    <UserCheck className="h-4 w-4 text-blue-600 mb-1" />
                    <span className="text-[11px] font-bold">Officer</span>
                    <span className="text-[9px] text-muted-foreground">Field Ops</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDemoCredentials('ramesh@krishi.com', 'farmer1234')}
                    className="flex flex-col h-auto py-2 px-1 text-center border-border/80 hover:border-amber-500 hover:bg-amber-500/5"
                  >
                    <Smartphone className="h-4 w-4 text-amber-600 mb-1" />
                    <span className="text-[11px] font-bold">Farmer</span>
                    <span className="text-[9px] text-muted-foreground">Passbook</span>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border/60">
        Krishi AgriTech &copy; 2026 &bull; Secure Agricultural Management System
      </footer>
    </div>
  );
}
