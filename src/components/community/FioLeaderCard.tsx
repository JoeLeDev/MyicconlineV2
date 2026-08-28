import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { LeaderProfile } from "@/lib/wp/fio-leaders";

type Props = {
  roleLabel: string;
  leader: LeaderProfile;
};

export function FioLeaderCard({ roleLabel, leader }: Props) {
  const initial = leader.displayName.slice(0, 1).toUpperCase();
  const inner = (
    <>
      {leader.avatar ? (
        <Image
          src={leader.avatar}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-icc-cream"
        />
      ) : (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-icc-coral/15 text-lg font-bold text-icc-coral"
          aria-hidden
        >
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-icc-muted">
          {roleLabel}
        </p>
        <p className="truncate font-semibold text-icc-ink">{leader.displayName}</p>
      </div>
    </>
  );

  const className =
    "flex items-center gap-4 rounded-xl border border-black/8 bg-white p-4 transition hover:border-icc-coral/25 hover:shadow-sm";

  if (leader.slug) {
    return (
      <Link href={`/membres/${leader.slug}`} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
