import { Link } from "@tanstack/react-router";
import { Home, User } from "lucide-react";

export function BottomTabs() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/25 bg-black/85 backdrop-blur-sm">
      <ul className="mx-auto flex max-w-md items-stretch pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <TabItem to="/home" label="Home" icon={<Home className="h-4 w-4" />} />
        <TabItem to="/profile" label="Profile" icon={<User className="h-4 w-4" />} />
      </ul>
    </nav>
  );
}

function TabItem({
  to,
  label,
  icon,
}: {
  to: "/home" | "/profile";
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="flex-1">
      <Link
        to={to}
        activeProps={{ className: "text-foreground" }}
        inactiveProps={{ className: "text-foreground" }}
        className="flex flex-col items-center gap-1 py-2.5 transition-colors hover:text-foreground"
      >
        {icon}
        <span className="font-display text-[10px] uppercase tracking-[0.22em]">{label}</span>
      </Link>
    </li>
  );
}
