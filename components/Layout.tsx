'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Shield, Stethoscope } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const AUTH_CACHE_KEY = 'medical_auth_state';

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadAuthState = async () => {
      const cachedAuth = window.sessionStorage.getItem(AUTH_CACHE_KEY) === '1';
      setIsAuthenticated(cachedAuth);

      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const nextAuthState = response.ok;
        setIsAuthenticated(nextAuthState);
        window.sessionStorage.setItem(AUTH_CACHE_KEY, nextAuthState ? '1' : '0');
      } catch {
        setIsAuthenticated(false);
        window.sessionStorage.setItem(AUTH_CACHE_KEY, '0');
      }
    };

    void loadAuthState();
  }, []);

  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: <Home className="w-4 h-4" /> },
    { href: '/courses', label: 'المساقات الدراسية', icon: <BookOpen className="w-4 h-4" /> },
    ...(isAuthenticated
      ? [{ href: '/admin', label: 'لوحة التحكم', icon: <Shield className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground tracking-tight leading-tight">كلية الطب البشري</span>
                <span className="text-xs text-muted-foreground font-medium">أرشيف المساقات</span>
              </div>
            </Link>

            <nav className="hidden md:flex gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile nav */}
            <nav className="flex md:hidden gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`p-2 rounded-lg transition-all ${
                      isActive ? 'bg-primary text-white' : 'text-foreground/80 hover:bg-secondary'
                    }`}
                  >
                    {link.icon}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
        {children}
      </main>

      <footer className="border-t border-border bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Stethoscope className="w-5 h-5" />
            <span>© {new Date().getFullYear()} أرشيف كلية الطب البشري. جميع الحقوق محفوظة.</span>
          </div>
          <p className="text-sm text-muted-foreground">
            صُنع بحب لدعم مسيرة التعلم
          </p>
        </div>
        <div className="border-t text-center py-3 text-muted-foreground">
          <span className="text-xs">Created By Eng. Mahmoud Ouda</span>
        </div>
      </footer>
    </div>
  );
}
