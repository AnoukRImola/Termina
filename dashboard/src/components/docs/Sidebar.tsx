'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Layers, Code2, Plug, FlaskConical, Building2, Database } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: { title: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    title: 'Introduction',
    href: '/docs',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { title: 'Overview', href: '/docs' },
      { title: 'Why Infrastructure?', href: '/docs#why-escrow' },
    ],
  },
  {
    title: 'Use Cases',
    href: '/docs/use-cases',
    icon: <Building2 className="w-4 h-4" />,
    children: [
      { title: 'B2B Invoicing', href: '/docs/use-cases#invoicing' },
      { title: 'Supply Chain', href: '/docs/use-cases#supply-chain' },
      { title: 'Real Estate', href: '/docs/use-cases#real-estate' },
      { title: 'SaaS & Licensing', href: '/docs/use-cases#saas' },
    ],
  },
  {
    title: 'Demo & Blockchain',
    href: '/docs/demo',
    icon: <Database className="w-4 h-4" />,
    children: [
      { title: 'How the Demo Works', href: '/docs/demo#how-demo-works' },
      { title: 'On-Chain Data', href: '/docs/demo#on-chain-data' },
      { title: 'Try It Yourself', href: '/docs/demo#try-it' },
    ],
  },
  {
    title: 'How it Works',
    href: '/docs/how-it-works',
    icon: <Layers className="w-4 h-4" />,
    children: [
      { title: 'Escrow Flow', href: '/docs/how-it-works#flow' },
      { title: 'State Machine', href: '/docs/how-it-works#states' },
      { title: 'Dispute Resolution', href: '/docs/how-it-works#disputes' },
    ],
  },
  {
    title: 'Smart Contract',
    href: '/docs/smart-contract',
    icon: <Code2 className="w-4 h-4" />,
    children: [
      { title: 'Architecture', href: '/docs/smart-contract#architecture' },
      { title: 'Entry Points', href: '/docs/smart-contract#entry-points' },
      { title: 'Events', href: '/docs/smart-contract#events' },
    ],
  },
  {
    title: 'Integration',
    href: '/docs/integration',
    icon: <Plug className="w-4 h-4" />,
    children: [
      { title: 'Quick Start', href: '/docs/integration#quick-start' },
      { title: 'API Reference', href: '/docs/integration#api' },
      { title: 'SDK Usage', href: '/docs/integration#sdk' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-[var(--background-secondary)] border-r border-[var(--border)] overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/docs' && pathname.startsWith(item.href));

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--casper-red)] text-white'
                      : 'text-[var(--foreground-secondary)] hover:bg-white hover:text-[var(--foreground)]'
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
                {item.children && isActive && (
                  <div className="ml-7 mt-1 space-y-1 border-l-2 border-[var(--border)] pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-1.5 text-sm text-[var(--muted)] hover:text-[var(--casper-red)] transition-colors"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Demo CTA */}
        <div className="mt-8 p-4 bg-[var(--casper-dark)] rounded-lg">
          <FlaskConical className="w-5 h-5 text-[var(--casper-red)] mb-2" />
          <h4 className="text-white font-semibold text-sm mb-1">Try it live</h4>
          <p className="text-[var(--muted)] text-xs mb-3">
            See the escrow system in action on Casper testnet.
          </p>
          <Link
            href="/demo"
            className="block w-full text-center py-2 bg-[var(--casper-red)] text-white text-sm font-medium rounded-lg hover:bg-[var(--casper-red-dark)] transition-colors"
          >
            Launch Demo
          </Link>
        </div>
      </div>
    </aside>
  );
}
