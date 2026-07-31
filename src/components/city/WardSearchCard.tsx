import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "ward", label: "Ward number", placeholder: "e.g. 4" },
  { id: "property", label: "Property ID", placeholder: "e.g. PRP-2201884" },
  { id: "citizen", label: "Citizen ID", placeholder: "e.g. CTZ-771204" },
] as const;

type Mode = (typeof MODES)[number]["id"];

export function WardSearchCard() {
  const [mode, setMode] = useState<Mode>("ward");
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const active = useMemo(() => MODES.find((m) => m.id === mode)!, [mode]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    void navigate({ to: "/wards", search: { q: query, mode } });
  };

  return (
    <form
      onSubmit={submit}
      className="glass-panel rounded-3xl p-5 shadow-elevated sm:p-6"
      aria-label="Search city records"
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              mode === m.id
                ? "bg-primary text-primary-foreground"
                : "bg-card/70 text-muted-foreground hover:bg-card",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Label htmlFor="ward-search" className="text-xs font-semibold text-foreground">
        Search by {active.label.toLowerCase()}
      </Label>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <Input
          id="ward-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={active.placeholder}
          className="h-11 rounded-xl bg-card"
        />
        <Button type="submit" className="h-11 rounded-xl px-5">
          <Search className="mr-1.5 size-4" aria-hidden />
          Search
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Instantly pull up ward office contacts, councillor details and live civic metrics.
      </p>
    </form>
  );
}
