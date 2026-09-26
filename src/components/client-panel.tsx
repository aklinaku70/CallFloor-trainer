import { leadById, initials } from "@/lib/leads";
import { useCallStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, User } from "lucide-react";

export function ClientPanel({ compact = false }: { compact?: boolean }) {
  const selectedId = useCallStore((s) => s.selectedId);
  const setDialInput = useCallStore((s) => s.setDialInput);
  const session = useCallStore((s) => s.session);
  const lead = selectedId ? leadById(selectedId) : undefined;
  const locked = Boolean(session && session.phase !== "ended");

  if (!lead) {
    return (
      <section className="flex h-full min-h-56 flex-col justify-center rounded-2xl bg-card p-6 shadow-[var(--shadow-border)]">
        <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground">
          Lead
        </p>
        <h2 className="mt-2 max-w-sm text-xl font-medium tracking-tight text-foreground">
          Select a household on the left.
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Read the name, number and address, type the number on the dialer, then
          call. The customer will answer in German.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted font-mono text-sm text-accent">
          {initials(lead)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground">
            Household
          </p>
          <h2 className="mt-1 truncate text-xl font-medium tracking-tight text-foreground">
            {lead.lastName}, {lead.firstName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.gender === "female" ? "Female" : "Male"} · {lead.state}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {compact ? (
          <div className="rounded-xl bg-muted/70 px-3.5 py-3 sm:col-span-2">
            <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-widest text-muted-foreground">
              <Phone className="size-3.5" />
              Phone
            </dt>
            <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {lead.phoneDisplay}
            </dd>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-muted/70 px-3.5 py-3">
              <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-widest text-muted-foreground">
                <User className="size-3.5" />
                Last name
              </dt>
              <dd className="mt-1 text-sm text-foreground">{lead.lastName}</dd>
            </div>
            <div className="rounded-xl bg-muted/70 px-3.5 py-3">
              <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-widest text-muted-foreground">
                <User className="size-3.5" />
                First name
              </dt>
              <dd className="mt-1 text-sm text-foreground">{lead.firstName}</dd>
            </div>
            <div className="rounded-xl bg-muted/70 px-3.5 py-3 sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-widest text-muted-foreground">
                <Phone className="size-3.5" />
                Phone
              </dt>
              <dd className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {lead.phoneDisplay}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={locked}
                  onClick={() => setDialInput(lead.phoneDisplay)}
                >
                  Use number
                </Button>
              </dd>
            </div>
            <div className="rounded-xl bg-muted/70 px-3.5 py-3 sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-widest text-muted-foreground">
                <MapPin className="size-3.5" />
                Address
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {lead.street}
                <br />
                {lead.zip} {lead.city}
              </dd>
            </div>
          </>
        )}
      </dl>
      {compact ? null : <p className="mt-4 text-xs text-muted-foreground">{lead.crmNote}</p>}
    </section>
  );
}
