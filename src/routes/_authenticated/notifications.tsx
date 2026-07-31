import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { PageShell, PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EmptyState, ListSkeleton } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { useMarkNotificationRead, useNotifications } from "@/hooks/useComplaints";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Smart City Data Platform" },
      {
        name: "description",
        content: "Live updates on complaint status changes, department assignment and resolutions.",
      },
      { property: "og:title", content: "Notifications" },
      { property: "og:description", content: "Live complaint status updates for your account." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const list = notifications.data ?? [];

  return (
    <PublicLayout>
      <PageShell className="space-y-8">
        <SectionHeading
          eyebrow="Updates"
          title="Notifications"
          description="Status changes are pushed here in real time."
        />
        {notifications.isLoading ? (
          <ListSkeleton rows={4} />
        ) : list.length === 0 ? (
          <EmptyState
            title="Nothing yet"
            description="Updates on your complaints will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {list.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "surface-card grid gap-3 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center",
                  !item.is_read && "border-primary/40",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Bell className="size-4.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(item.created_at)}</p>
                </div>
                {!item.is_read ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => markRead.mutate(item.id)}
                  >
                    <Check className="mr-1.5 size-4" aria-hidden />
                    Mark read
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </PublicLayout>
  );
}
