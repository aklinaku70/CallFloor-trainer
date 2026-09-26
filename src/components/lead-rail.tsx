import { LEADS, initials } from "@/lib/leads";
import { DISPOSITION_SHORT } from "@/lib/dialogue";
import { useCallStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function LeadRail() {
  const selectedId = useCallStore((s) => s.selectedId);
  const runtimes = useCallStore((s) => s.runtimes);
  const session = useCallStore((s) => s.session);
  const selectLead = useCallStore((s) => s.selectLead);
  const inCall = session && session.phase !== "ended";

  const done = LEADS.filter((l) => runtimes[l.id]?.status === "done").length;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-panel">
      <div className="flex shrink-0 items-end justify-between px-4 pb-3 pt-4">
        <div>
          <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground">
            Campaign
          </p>
          <h2 className="text-sm font-medium text-foreground">Kitchen & Wine</h2>
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {done}/15
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <ul className="flex flex-col gap-1">
          {LEADS.map((lead, index) => {
            const runtime = runtimes[lead.id];
            const selected = selectedId === lead.id;
            const live = inCall && session?.leadId === lead.id;
            const doneLead = runtime?.status === "done";
            return (
              <li key={lead.id}>
                <button
                  type="button"
                  disabled={Boolean(inCall) && !live}
                  onClick={() => {
                    if (inCall) return;
                    selectLead(lead.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-[background-color,box-shadow] duration-150",
                    selected
                      ? "bg-card shadow-[var(--shadow-border)]"
                      : "hover:bg-muted",
                    live && "shadow-[var(--shadow-border-hover)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs text-muted-foreground",
                      live && "bg-live/20 text-live",
                    )}
                  >
                    {initials(lead)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-foreground">
                        {lead.lastName}, {lead.firstName}
                      </span>
                      <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="truncate font-mono text-2xs text-muted-foreground">
                        {lead.city}
                      </span>
                      {live ? (
                        <Badge tone="live">Live</Badge>
                      ) : doneLead && runtime?.disposition ? (
                        <Badge
                          tone={
                            runtime.disposition === "dnc" ||
                            runtime.disposition === "hangup" ||
                            runtime.disposition === "refused"
                              ? "danger"
                              : runtime.disposition === "completed"
                                ? "live"
                                : "mute"
                          }
                        >
                          {DISPOSITION_SHORT[runtime.disposition]}
                        </Badge>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
