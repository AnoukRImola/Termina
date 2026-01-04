'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const isDemo = pathname === '/demo';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[var(--border)]">
      <div className="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--casper-red)] rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[var(--casper-dark)]">
            Términa
          </span>
          <span className="text-xs px-2 py-0.5 bg-[var(--casper-dark)] text-white rounded-full font-medium">
            Escrow
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/docs"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/docs')
                ? 'text-[var(--casper-dark)]'
                : 'text-[var(--muted)] hover:text-[var(--casper-dark)]'
            }`}
          >
            Documentation
          </Link>
          <a
            href="https://github.com/AnoukRImola/Termina"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--casper-dark)] transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/demo"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isDemo
                ? 'bg-[var(--casper-dark)] text-white'
                : 'bg-[var(--casper-red)] text-white hover:bg-[var(--casper-red-dark)]'
            }`}
          >
            Try Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
