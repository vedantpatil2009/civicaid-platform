import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Camera, Check, Crosshair, Loader2 } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments, useWards } from "@/hooks/useCityData";
import { useMyComplaints } from "@/hooks/useComplaints";
import { COMPLAINT_CATEGORIES, createComplaint, uploadComplaintPhoto } from "@/services/complaints";
import { calculateComplaintPriority } from "@/lib/algorithms/complaintPriority";
import { findDuplicateComplaints } from "@/lib/algorithms/duplicateDetection";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "Report a Civic Issue — Smart City Data Platform" },
      {
        name: "description",
        content:
          "File a municipal complaint with category, description, GPS location and photo evidence. Auto-prioritised and routed to the right department.",
      },
      { property: "og:title", content: "Report a Civic Issue" },
      {
        property: "og:description",
        content: "File a complaint with photo evidence and track it to resolution.",
      },
    ],
  }),
  component: ReportPage,
});

const CATEGORY_DEPARTMENT: Record<string, string> = {
  "Roads & Potholes": "PWD",
  "Water & Sewerage": "WATER",
  "Garbage & Sanitation": "SWM",
  "Street Lighting": "ELEC",
  "Water Logging": "DRAIN",
  Traffic: "TRAF",
  "Health & Sanitation": "HEALTH",
  "Air Pollution": "HEALTH",
};

function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const departments = useDepartments();
  const wards = useWards();
  const myComplaints = useMyComplaints();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(COMPLAINT_CATEGORIES[0]);
  const [wardNumber, setWardNumber] = useState<string>("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [locating, setLocating] = useState(false);

  const priority = useMemo(
    () =>
      calculateComplaintPriority({
        category,
        description: `${title} ${description}`,
        hasPhoto: Boolean(file),
      }),
    [category, title, description, file],
  );

  const duplicates = useMemo(() => {
    if (title.trim().length < 6) return [];
    return findDuplicateComplaints(
      {
        title,
        description,
        category,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      },
      (myComplaints.data ?? []).map((c) => ({
        id: c.id,
        reference_code: c.reference_code,
        title: c.title,
        description: c.description,
        category: c.category,
        latitude: c.latitude,
        longitude: c.longitude,
        created_at: c.created_at,
      })),
    );
  }, [title, description, category, coords, myComplaints.data]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Could not read your location. Enter the address instead.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be signed in.");
      let photoPath: string | null = null;
      if (file) photoPath = await uploadComplaintPhoto(user.id, file);
      const deptCode = CATEGORY_DEPARTMENT[category];
      const department = departments.data?.find((d) => d.code === deptCode);
      return createComplaint({
        citizen_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        ward_number: wardNumber ? Number(wardNumber) : null,
        address: address.trim() || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        photo_url: photoPath,
        priority: priority.level,
        department_id: department?.id ?? null,
      });
    },
    onSuccess: (complaint) => {
      void queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Complaint filed · ${complaint.reference_code}`);
      void navigate({ to: "/dashboard" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canSubmit = title.trim().length >= 6 && description.trim().length >= 15;

  return (
    <PublicLayout>
      <PageShell className="space-y-8">
        <SectionHeading
          eyebrow="Citizen portal"
          title="Report a civic issue"
          description="Give us the what, where and (ideally) a photo. We handle routing, priority and follow-up."
        />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <form
            className="surface-card space-y-6 p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Issue title</Label>
              <Input
                id="title"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Large pothole outside the school gate"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_CATEGORIES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Select value={wardNumber} onValueChange={setWardNumber}>
                  <SelectTrigger id="ward" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select your ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.data?.map((ward) => (
                      <SelectItem key={ward.id} value={String(ward.ward_number)}>
                        Ward {ward.ward_number} · {ward.ward_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                maxLength={1000}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, how long it has been there and who it affects."
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Landmark / address</Label>
              <Input
                id="address"
                maxLength={200}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Near Ganesh Temple, 3rd Cross"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={locate}
                className="h-11 rounded-xl"
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <Crosshair className="mr-2 size-4" aria-hidden />
                )}
                Use my location
              </Button>
              <p className="text-sm text-muted-foreground">
                {coords
                  ? `Captured ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : "GPS coordinates help crews find the exact spot."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo evidence</Label>
              <label
                htmlFor="photo"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Camera className="size-5 shrink-0" aria-hidden />
                <span className="truncate">
                  {file ? file.name : "Attach a photo (optional, max 5 MB)"}
                </span>
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  if (next && next.size > 5 * 1024 * 1024) {
                    toast.error("Photo must be under 5 MB.");
                    return;
                  }
                  setFile(next);
                }}
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base"
              disabled={!canSubmit || submit.isPending}
            >
              {submit.isPending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                "Submit complaint"
              )}
            </Button>
          </form>

          <aside className="space-y-4">
            <div className="surface-card space-y-3 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-foreground">Estimated priority</h2>
                <PriorityBadge priority={priority.level} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary-gradient transition-all"
                  style={{ width: `${priority.score}%` }}
                />
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {priority.factors.map((factor) => (
                  <li key={factor} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {duplicates.length ? (
              <div className="surface-card space-y-3 border-warning/40 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <AlertTriangle className="size-4 text-warning-foreground" aria-hidden />
                  Possible duplicate
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {duplicates.slice(0, 3).map((match) => (
                    <li key={match.candidate.id} className="rounded-xl bg-muted p-3">
                      <p className="truncate font-medium text-foreground">
                        {match.candidate.title}
                      </p>
                      <p className="text-xs">
                        {Math.round(match.similarity * 100)}% similar
                        {match.distance != null ? ` · ${Math.round(match.distance)} m away` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="surface-card space-y-2 p-6 text-sm text-muted-foreground">
              <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
              <p>You get a reference code immediately and a notification on every status change.</p>
              <p>
                The complaint is routed to{" "}
                <span className="font-medium text-foreground">
                  {departments.data?.find((d) => d.code === CATEGORY_DEPARTMENT[category])?.name ??
                    "the general desk"}
                </span>
                .
              </p>
            </div>
          </aside>
        </div>
      </PageShell>
    </PublicLayout>
  );
}
