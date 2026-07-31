import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAllComplaints,
  fetchMyComplaints,
  fetchNotifications,
  markNotificationRead,
  updateComplaint,
} from "@/services/complaints";

export function useMyComplaints() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["complaints", "mine", user?.id],
    queryFn: () => fetchMyComplaints(user!.id),
    enabled: Boolean(user?.id),
  });
}

export function useAllComplaints() {
  const { isStaff } = useAuth();
  return useQuery({
    queryKey: ["complaints", "all"],
    queryFn: fetchAllComplaints,
    enabled: isStaff,
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Parameters<typeof updateComplaint>[1]) =>
      updateComplaint(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["complaints"] });
      void queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
  });
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => void queryClient.invalidateQueries({ queryKey: ["notifications", user.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/** Live complaint feed for the admin dashboard. */
export function useRealtimeComplaints() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("complaints-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["complaints"] });
        void queryClient.invalidateQueries({ queryKey: ["map-points"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
