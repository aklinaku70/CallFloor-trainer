import { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { leadById, initials } from "@/lib/leads";
import { DISPOSITION_LABEL } from "@/lib/dialogue";
import { useCallStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className={cn(
            "wave-bar w-1 rounded-full bg-live",
            active ? "h-7 opacity-100" : "h-2 opacity-40",
          )}
          style={{ animationDelay: `${i * 90}ms`, animationPlayState: active ? "running" : "paused" }}
        />
      ))}
    </div>
  );
}

export function CallHud() {
  const session = useCallStore((s) => s.session);
  const transcript = useCallStore((s) => s.transcript);
  const micOn = useCallStore((s) => s.micOn);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!session || session.phase === "ended" || session.phase === "idle") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session?.phase, session?.leadId]);

  if (!session) return null;
  const lead = leadById(session.leadId);
  if (!lead) return null;

  const elapsed = session.connectedAt
    ? Math.floor((now - session.connectedAt) / 1000)
    : 0;
  const lastCustomer = [...transcript].reverse().find((l) => l.who === "customer");

  return (
    <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl bg-muted font-mono text-sm",
              session.customerSpeaking ? "pulse-live text-live" : "text-accent",
            )}
          >
            {initials(lead)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{lead.city}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm tabular-nums text-foreground">
            {session.phase === "connected" ? formatDuration(elapsed) : "--:--"}
          </p>
          <p className="text-2xs uppercase tracking-widest text-muted-foreground">
            {session.phase === "ended" && session.disposition
              ? DISPOSITION_LABEL[session.disposition]
              : session.phase}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/80 px-3 py-2.5">
        <Waveform active={session.customerSpeaking} />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {micOn ? (
            <Badge tone="live" className="gap-1">
              <Mic className="size-3" />
              Listening
            </Badge>
          ) : (
            <span className="inline-flex items-center gap-1">
              <MicOff className="size-3" />
              Mic idle
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 max-h-48 min-h-24 overflow-y-auto rounded-xl bg-background/60 p-3">
        {transcript.length === 0 ? (
          <p className="text-xs text-muted-foreground">Line is opening…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {transcript.slice(-12).map((line) => (
              <li key={line.id} className="text-sm">
                <span
                  className={cn(
                    "mr-2 text-2xs font-medium uppercase tracking-widest",
                    line.who === "customer"
                      ? "text-live"
                      : line.who === "agent"
                        ? "text-accent"
                        : "text-muted-foreground",
                  )}
                >
                  {line.who === "customer" ? "Customer" : line.who === "agent" ? "You" : "System"}
                </span>
                <span
                  className={
                    line.who === "system" ? "text-muted-foreground" : "text-foreground"
                  }
                >
                  {line.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {session.heard ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Heard: <span className="text-foreground">{session.heard}</span>
        </p>
      ) : lastCustomer && session.agentTurn ? (
        <p className="mt-3 text-xs text-muted-foreground">Your turn — say the highlighted line.</p>
      ) : null}
    </section>
  );
}
