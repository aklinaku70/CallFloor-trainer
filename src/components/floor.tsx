"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { PhoneCall } from "lucide-react";
import { LEADS } from "@/lib/leads";
import { DISPOSITION_LABEL } from "@/lib/dialogue";
import { useCallStore } from "@/lib/store";
import { useCallController } from "@/lib/use-call";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadRail } from "@/components/lead-rail";
import { ClientPanel } from "@/components/client-panel";
import { Dialer } from "@/components/dialer";
import { CallHud } from "@/components/call-hud";
import { ScriptPanel } from "@/components/script-panel";
import { Briefing } from "@/components/briefing";

export function Floor() {
  const hydrate = useCallStore((s) => s.hydrate);
  const hydrated = useCallStore((s) => s.hydrated);
  const agentName = useCallStore((s) => s.agentName);
  const setAgentName = useCallStore((s) => s.setAgentName);
  const resetCampaign = useCallStore((s) => s.resetCampaign);
  const runtimes = useCallStore((s) => s.runtimes);
  const session = useCallStore((s) => s.session);
  const { startCall, markSaid, hangup } = useCallController();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const done = LEADS.filter((l) => runtimes[l.id]?.status === "done").length;
  const completed = LEADS.filter((l) => runtimes[l.id]?.disposition === "completed").length;
  const dnc = LEADS.filter((l) => runtimes[l.id]?.disposition === "dnc").length;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-accent">
            <PhoneCall className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-tight">CallFloor</p>
            <p className="text-2xs uppercase tracking-widest text-muted-foreground">
              DE survey trainer
            </p>
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            Agent
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Your name"
              className="h-9 w-32"
            />
          </label>
          <p className="hidden font-mono text-xs tabular-nums whitespace-nowrap text-muted-foreground xl:block">
            {completed} complete · {dnc} DNC · {done}/15 closed
          </p>
          <Button size="sm" variant="ghost" onClick={resetCampaign}>
            Reset shift
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12 lg:overflow-hidden">
        <div className="max-h-64 min-h-0 min-w-0 overflow-hidden border-b border-border lg:col-span-3 lg:max-h-none lg:h-full lg:border-b-0 lg:border-r">
          <LeadRail />
        </div>

        <main className="min-h-0 min-w-0 space-y-4 overflow-y-auto p-4 lg:col-span-5 sm:p-5">
          {session ? <CallHud /> : null}
          <ClientPanel compact={Boolean(session)} />
          <Dialer onCall={() => void startCall()} onHangup={hangup} />
          {session?.phase === "ended" && session.disposition ? (
            <p className="px-1 text-sm text-muted-foreground">
              Result: {DISPOSITION_LABEL[session.disposition]}. Pick the next lead.
            </p>
          ) : null}
        </main>

        <div className="min-h-0 min-w-0 overflow-hidden lg:col-span-4 lg:h-full lg:border-l lg:border-border">
          <ScriptPanel onMark={(id) => void markSaid(id)} />
        </div>
      </div>

      <Briefing />
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          className: "bg-card text-foreground shadow-[var(--shadow-border)]",
        }}
      />
      {!hydrated ? <div className="sr-only">Loading floor</div> : null}
    </div>
  );
}
