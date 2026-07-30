import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Building2, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/services", label: "Services" },
  { to: "/wards", label: "Ward Info" },
  { to: "/map", label: "Live Map" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, profile, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-glow">
              <Building2 className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight text-foreground">
                Smart City
              </span>
              <span className="block truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Data Platform
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === link.to && "bg-accent text-accent-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                aria-label="Notifications"
              >
                <Link to="/notifications">
                  <Bell className="size-5" aria-hidden />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full pl-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {(profile?.full_name || user.email || "C").charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden max-w-28 truncate sm:inline">
                      {profile?.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 size-4" aria-hidden /> My dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 size-4" aria-hidden /> Profile
                    </Link>
                  </DropdownMenuItem>
                  {isStaff ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Building2 className="mr-2 size-4" aria-hidden /> Admin portal
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void handleSignOut()}>
                    <LogOut className="mr-2 size-4" aria-hidden /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">Login</Link>
            </Button>
          )}
          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to="/report">Report an issue</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-card px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/report"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Report an issue
            </Link>
            {!user ? (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Login
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}