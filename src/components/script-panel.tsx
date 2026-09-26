import { Check, Circle } from "lucide-react";
import { SCRIPT_STEPS, type AgentStepId } from "@/lib/script";
import { useCallStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const KITCHEN = [
  { id: "classic", label: "A · Classic" },
  { id: "upscale", label: "B · Upscale" },
] as const;
const FOOD = [
  { id: "meat", label: "A · Meat" },
  { id: "fish", label: "B · Fish" },
  { id: "veg", label: "C · Veg" },
] as const;
const WINE = [
  { id: "red", label: "A · Red" },
  { id: "white", label: "B · White" },
  { id: "rose", label: "C · Rosé" },
  { id: "none", label: "None" },
] as const;
const BODY = [
  { id: "light", label: "A · Light" },
  { id: "heavy", label: "B · Heavy" },
] as const;

type ScriptPanelProps = {
  onMark: (id: AgentStepId) => void;
};

export function ScriptPanel({ onMark }: ScriptPanelProps) {
  const session = useCallStore((s) => s.session);
  const agentName = useCallStore((s) => s.agentName);
  const setCapture = useCallStore((s) => s.setCapture);

  return (
    <aside className="flex h-full min-h-0 flex-col bg-panel">
      <div className="shrink-0 px-4 pb-3 pt-4">
        <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground">
          Script
        </p>
        <h2 className="text-sm font-medium text-foreground">Say these in order</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Speak the German line, or tap check when you have said it.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <ol className="flex flex-col gap-2">
          {SCRIPT_STEPS.map((step) => {
            const state = session?.checks[step.id] ?? "pending";
            const current = session?.checks[step.id] === "current";
            const say =
              step.id === "greeting" && agentName.trim()
                ? `Guten Tag, mein Name ist ${agentName.trim()}. Entschuldigung für die Störung. Haben Sie einen kurzen Moment?`
                : step.say;
            const canMark =
              Boolean(session) &&
              session?.phase === "connected" &&
              current &&
              session.agentTurn &&
              !session.customerSpeaking;
            return (
              <li
                key={step.id}
                className={cn(
                  "rounded-xl px-3 py-3 transition-[background-color,box-shadow] duration-150",
                  current
                    ? "bg-card shadow-[var(--shadow-border-hover)]"
                    : "bg-transparent",
                  state === "skipped" && "opacity-40",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                      state === "done"
                        ? "bg-live text-live-foreground"
                        : current
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {state === "done" ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <Circle className="size-2.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                        {step.order}. {step.title}
                      </p>
                      {state === "skipped" ? (
                        <span className="text-2xs text-muted-foreground">Skipped</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-snug text-foreground">{say}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.hint}</p>
                    {canMark ? (
                      <Button
                        size="sm"
                        variant="default"
                        className="mt-2"
                        onClick={() => onMark(step.id)}
                      >
                        I said this
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {session && (session.phase === "connected" || session.phase === "ended") ? (
          <div className="mt-5 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
            <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground">
              Capture
            </p>
            <Fieldset
              label="Kitchen"
              options={KITCHEN}
              value={session.capture.kitchen}
              onChange={(v) => setCapture({ kitchen: v })}
            />
            <Fieldset
              label="Food"
              options={FOOD}
              value={session.capture.food}
              onChange={(v) => setCapture({ food: v })}
            />
            <Fieldset
              label="Wine"
              options={WINE}
              value={session.capture.wine}
              onChange={(v) => setCapture({ wine: v })}
            />
            <Fieldset
              label="2–3× / year"
              options={[
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" },
              ]}
              value={
                session.capture.frequency == null
                  ? null
                  : session.capture.frequency
                    ? "yes"
                    : "no"
              }
              onChange={(v) => setCapture({ frequency: v === "yes" })}
            />
            <Fieldset
              label="Body"
              options={BODY}
              value={session.capture.body}
              onChange={(v) => setCapture({ body: v })}
            />
            <label className="mt-3 block text-2xs uppercase tracking-wide text-muted-foreground">
              Last name heard
              <Input
                className="mt-1 h-9"
                value={session.capture.lastName}
                onChange={(e) => setCapture({ lastName: e.target.value })}
              />
            </label>
            <label className="mt-3 block text-2xs uppercase tracking-wide text-muted-foreground">
              First name heard
              <Input
                className="mt-1 h-9"
                value={session.capture.firstName}
                onChange={(e) => setCapture({ firstName: e.target.value })}
              />
            </label>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function Fieldset<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T | null | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mt-3">
      <legend className="text-2xs uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs transition-[background-color,color] duration-150",
              value === opt.id
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
