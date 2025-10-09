import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFED00] text-black font-medium rounded-lg hover:bg-[#E6D600] transition-colors"
        >
          <Home className="w-5 h-5" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

