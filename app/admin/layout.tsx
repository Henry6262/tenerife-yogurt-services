import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Bot,
  ShoppingBag,
  Package,
  Milk,
  Truck,
  Tag,
  CreditCard,
  Settings,
  CalendarX,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/calendar", label: "Calendario", icon: Calendar },
    { href: "/admin/services", label: "Servicios", icon: Scissors },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/agent", label: "AI Agent", icon: Bot },
    { href: "/admin/settings", label: "Configuración", icon: Settings },
    { href: "/admin/overrides", label: "Excepciones", icon: CalendarX },
    { href: "/admin/orders", label: "Pedidos Yogurt", icon: ShoppingBag },
    { href: "/admin/products", label: "Productos", icon: Package },
    { href: "/admin/deliveries", label: "Entregas", icon: Truck },
    { href: "/admin/promos", label: "Promos", icon: Tag },
    { href: "/admin/subscriptions", label: "Suscripciones", icon: CreditCard },
    { href: "/admin/yogurt-leads", label: "Leads", icon: Milk },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-stone-200 bg-white hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-bold text-stone-800">Bookit AI</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition"
          >
            ← Volver al sitio
          </a>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-bold text-stone-800">Bookit AI</Link>
        <MobileNav nav={nav} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

function MobileNav({ nav }: { nav: { href: string; label: string; icon: React.ElementType }[] }) {
  return (
    <details className="group relative">
      <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-stone-100">
        <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </summary>
      <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-stone-200 bg-white shadow-lg py-2 z-50">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
