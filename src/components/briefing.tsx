import { Button } from "@/components/ui/button";
import { useCallStore } from "@/lib/store";

export function Briefing() {
  const briefed = useCallStore((s) => s.briefed);
  const setBriefed = useCallStore((s) => s.setBriefed);
  if (briefed) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/70 p-3 sm:items-center sm:p-4">
      <div className="enter-up flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border-hover)]">
        <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Floor briefing
          </p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
            Kitchen & Wine outbound
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Fifteen German households. Cold calls. The customer speaks. You work the
            script in order and tick each line as you say it.
          </p>
          <ol className="mt-4 space-y-1.5 text-sm text-foreground">
            <li>1. Pick a lead — name, number, address stay on the left.</li>
            <li>2. Type their number on the right, then call.</li>
            <li>3. They say Hallo. You greet and apologise for the time.</li>
            <li>4. Four questions, twenty seconds. Then spell first and last name.</li>
            <li>5. Some hang up. Some say do not call again. Log it and take the next one.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Mic is used when the browser allows it. Otherwise tap “I said this” after you
            speak the German line out loud.
          </p>
        </div>
        <div className="border-t border-border p-4">
          <Button className="w-full" onClick={setBriefed}>
            Open the floor
          </Button>
        </div>
      </div>
    </div>
  );
}
