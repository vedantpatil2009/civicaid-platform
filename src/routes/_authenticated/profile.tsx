import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useWards } from "@/hooks/useCityData";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Smart City Data Platform" },
      {
        name: "description",
        content: "Manage your citizen profile: name, phone, ward and address details.",
      },
      { property: "og:title", content: "My Profile" },
      { property: "og:description", content: "Manage your citizen account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles, refreshProfile } = useAuth();
  const wards = useWards();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setAddress(profile?.address ?? "");
    setWardNumber(profile?.ward_number ? String(profile.ward_number) : "");
  }, [profile]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        ward_number: wardNumber ? Number(wardNumber) : null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile updated");
  };

  return (
    <PublicLayout>
      <PageShell className="space-y-8">
        <SectionHeading
          eyebrow="Account"
          title="My profile"
          description="Keeping your ward and phone current helps crews reach you faster."
        />
        <form onSubmit={save} className="surface-card max-w-2xl space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-ward">Ward</Label>
              <Select value={wardNumber} onValueChange={setWardNumber}>
                <SelectTrigger id="profile-ward" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select ward" />
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
            <Label htmlFor="profile-address">Address</Label>
            <Input
              id="profile-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="grid gap-1 rounded-xl bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              Email: <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            <p className="text-muted-foreground">
              Role:{" "}
              <span className="font-medium capitalize text-foreground">
                {roles.join(", ") || "citizen"}
              </span>
            </p>
          </div>
          <Button type="submit" disabled={saving} className="h-11 rounded-xl">
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Save changes"}
          </Button>
        </form>
      </PageShell>
    </PublicLayout>
  );
}
