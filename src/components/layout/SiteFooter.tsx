import { Link } from "@tanstack/react-router";
import { Building2, Mail, Phone } from "lucide-react";

const COLUMNS = [
  {
    title: "Citizen services",
    links: [
      { to: "/report", label: "Report a complaint" },
      { to: "/dashboard", label: "Track complaints" },
      { to: "/services", label: "All services" },
      { to: "/wards", label: "Ward information" },
    ],
  },
  {
    title: "City intelligence",
    links: [
      { to: "/map", label: "Live city map" },
      { to: "/map", label: "Air quality" },
      { to: "/map", label: "Traffic & mobility" },
      { to: "/map", label: "Flood monitoring" },
    ],
  },
  {
    title: "Municipality",
    links: [
      { to: "/about", label: "About the platform" },
      { to: "/contact", label: "Contact & helplines" },
      { to: "/admin", label: "Administration portal" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground">
              <Building2 className="size-5" aria-hidden />
            </span>
            <span className="text-sm font-bold text-foreground">Smart City Data Platform</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A unified municipal operating system for citizens and city authorities — civic
            reporting, environmental telemetry and department accountability in one place.
          </p>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden /> Helpline 1916 · Emergency 112
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden /> support@smartcity.gov
            </p>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Municipal Corporation · Smart City Mission</p>
          <p>Accessibility · Privacy policy · Open data licence</p>
        </div>
      </div>
    </footer>
  );
}