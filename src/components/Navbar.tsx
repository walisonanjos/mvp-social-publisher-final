// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ nicheId }: { nicheId: string }) {
  const pathname = usePathname();

  // Os links agora são dinâmicos, baseados no nicheId
  const navLinks = [
    { name: 'Agendamentos', href: `/niche/${nicheId}` },
    { name: 'Histórico', href: `/niche/${nicheId}/history` },
    // Futuramente, a página de conexões também usará o ID do nicho
    // { name: 'Conexões', href: `/niche/${nicheId}/connections` },
  ];

  return (
    <div className="border-b border-gray-700">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${
                pathname === link.href
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }
            `}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
