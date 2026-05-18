import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Tenerife<span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs">
              La plataforma de IA para reservas de belleza, bienestar y más en Tenerife.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/ai" className="hover:text-blue-600 transition">IA Concierge</Link></li>
              <li><Link href="/book" className="hover:text-blue-600 transition">Reservas</Link></li>
              <li><Link href="/bookings" className="hover:text-blue-600 transition">Mis Citas</Link></li>
              <li><Link href="/admin" className="hover:text-blue-600 transition">Panel Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Negocios</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/admin/agent" className="hover:text-blue-600 transition">Crear tu IA</Link></li>
              <li><Link href="/agent/bella-tenerife" className="hover:text-blue-600 transition">Demo: Bella Tenerife</Link></li>
              <li><Link href="/agent/el-barbero" className="hover:text-blue-600 transition">Demo: El Barbero</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2026 Bookit AI. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-400">
            Hecho con 💙 en Tenerife
          </p>
        </div>
      </div>
    </footer>
  );
}
