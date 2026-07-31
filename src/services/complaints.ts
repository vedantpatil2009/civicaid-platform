import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Complaint = Tables<"complaints">;
export type ComplaintStatus = Complaint["status"];
export type ComplaintPriority = Complaint["priority"];
export type ComplaintWithDepartment = Complaint & {
  departments: Pick<Tables<"departments">, "id" | "name" | "code"> | null;
};

const SELECT_WITH_DEPT = "*, departments ( id, name, code )";

export const COMPLAINT_CATEGORIES = [
  "Roads & Potholes",
  "Water & Sewerage",
  "Garbage & Sanitation",
  "Street Lighting",
  "Water Logging",
  "Traffic",
  "Health & Sanitation",
  "Air Pollution",
  "Other",
] as const;

export async function fetchMyComplaints(userId: string): Promise<ComplaintWithDepartment[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select(SELECT_WITH_DEPT)
    .eq("citizen_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ComplaintWithDepartment[];
}

export async function fetchAllComplaints(): Promise<ComplaintWithDepartment[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select(SELECT_WITH_DEPT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ComplaintWithDepartment[];
}

export async function createComplaint(payload: TablesInsert<"complaints">): Promise<Complaint> {
  const { data, error } = await supabase.from("complaints").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateComplaint(
  id: string,
  patch: Partial<Pick<Complaint, "status" | "priority" | "department_id" | "resolution_notes">>,
): Promise<Complaint> {
  const next = {
    ...patch,
    ...(patch.status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
  };
  const { data, error } = await supabase
    .from("complaints")
    .update(next)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadComplaintPhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("complaint-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function getComplaintPhotoUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("complaint-photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw new Error(error.message);
}
