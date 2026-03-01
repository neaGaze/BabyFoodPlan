"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Baby } from "@/lib/types/database";
import { CalendarDays, UtensilsCrossed, Users, LogOut, LayoutDashboard, BarChart3 } from "lucide-react";

export function BabyHeader({ baby }: { baby: Baby }) {
  const pathname = usePathname();
  const base = `/baby/${baby.id}`;

  const links = [
    { href: base, label: "Calendar", icon: CalendarDays },
    { href: `${base}/foods`, label: "Foods", icon: UtensilsCrossed },
    { href: `${base}/members`, label: "Members", icon: Users },
    { href: `${base}/statistics`, label: "Stats", icon: BarChart3 },
  ];

  return (
    <header className="border-b border-pink-200/60 sticky top-0 bg-pink-50/80 backdrop-blur-sm z-10">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">{"👶 "}{baby.name}</h1>
        </div>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5",
                  pathname === link.href && "bg-muted"
                )}
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Button>
            </Link>
          ))}
          <form action={signOut}>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
