'use client';

import { LogIn, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function AuthButton() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="h-10 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground/50"
      >
        Checking...
      </button>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/25"
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-foreground/70 transition hover:bg-white/[0.08] md:inline-flex"
      >
        <User className="h-4 w-4 text-purple-300" />
        Profile
      </button>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.replace('/');
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:bg-white/[0.08] md:w-auto md:gap-2 md:px-4 md:text-sm md:font-semibold"
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Logout</span>
      </button>
    </div>
  );
}