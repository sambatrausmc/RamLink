import Link from "next/link";
import { Users } from "lucide-react";

export function RamLinkLogo() {
  return (
    <Link href="/homepage" className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-[-0.02em] text-brand-ink" aria-label="RamLink home">
      <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-gradient-to-br from-brand-green to-brand-forest text-brand-goldLight shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_4px_10px_rgba(11,93,59,0.24)]">
        <Users className="h-5 w-5" />
      </span>
      <span>
        Ram<span className="text-brand-forest">Link</span>
      </span>
    </Link>
  );
}
