import { Delete, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playDtmf } from "@/lib/phone-audio";
import { useCallStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "0", "#"] as const;

type DialerProps = {
  onCall: () => void;
  onHangup: () => void;
};

export function Dialer({ onCall, onHangup }: DialerProps) {
  const dialInput = useCallStore((s) => s.dialInput);
  const appendDial = useCallStore((s) => s.appendDial);
  const backspaceDial = useCallStore((s) => s.backspaceDial);
  const setDialInput = useCallStore((s) => s.setDialInput);
  const lastError = useCallStore((s) => s.lastError);
  const session = useCallStore((s) => s.session);
  const selectedId = useCallStore((s) => s.selectedId);
  const live = Boolean(session && session.phase !== "ended");
  const ringing = session?.phase === "ringing" || session?.phase === "dialing";
  const hidePad = Boolean(session);

  return (
    <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground">
            Softphone
          </p>
          <h2 className="mt-1 text-sm font-medium text-foreground">Type the number, then call</h2>
        </div>
        {live ? (
          <span className="flex items-center gap-2 text-xs text-live">
            <span className={cn("size-1.5 rounded-full bg-live", ringing && "pulse-live")} />
            {ringing ? "Ringing" : "On line"}
          </span>
        ) : null}
      </div>

      <Input
        value={dialInput}
        onChange={(e) => setDialInput(e.target.value)}
        inputMode="tel"
        autoComplete="off"
        placeholder="+49 …"
        disabled={live}
        className="mt-4 h-12 font-mono text-lg tracking-wide"
        aria-label="Phone number"
      />
      {lastError ? <p className="mt-2 text-xs text-danger">{lastError}</p> : null}

      {hidePad ? null : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              disabled={live}
              onClick={() => {
                playDtmf(key);
                appendDial(key);
              }}
              className="flex h-12 items-center justify-center rounded-xl bg-muted font-mono text-lg text-foreground transition-[background-color,transform] duration-150 hover:bg-input active:scale-[0.96] disabled:opacity-40"
            >
              {key}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {live ? null : (
          <Button
            variant="outline"
            className="flex-1"
            disabled={!dialInput}
            onClick={backspaceDial}
          >
            <Delete className="size-4" />
            Delete
          </Button>
        )}
        {live ? (
          <Button variant="danger" className="flex-1" onClick={onHangup}>
            <PhoneOff className="size-4" />
            Hang up
          </Button>
        ) : (
          <Button
            variant="live"
            className="flex-1"
            disabled={!selectedId || dialInput.trim().length < 8}
            onClick={onCall}
          >
            <Phone className="size-4" />
            Call
          </Button>
        )}
      </div>
    </section>
  );
}
