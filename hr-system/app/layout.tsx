import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "نظام إدارة الموظفين | منطقة الجهراء الصحية",
  description:
    "نظام داخلي لإدارة شؤون الموظفين: السجلات الوظيفية، الإجازات، والحضور والانصراف.",
};

const nav = [
  { href: "/", label: "لوحة المؤشرات" },
  { href: "/employees", label: "الموظفون" },
  { href: "/leaves", label: "الإجازات" },
  { href: "/attendance", label: "الحضور" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-brand text-base font-bold text-white">
                ج
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-bold">نظام إدارة الموظفين</span>
                <span className="block text-xs text-muted">منطقة الجهراء الصحية</span>
              </span>
            </Link>
            <nav className="flex flex-wrap gap-1 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-muted transition hover:bg-brand-soft hover:text-brand"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted">
          نظام داخلي — للاستخدام الرسمي داخل منطقة الجهراء الصحية
        </footer>
      </body>
    </html>
  );
}
