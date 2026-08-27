import type { BlogAttachment } from "@/lib/wp/types";

type Props = {
  attachments: BlogAttachment[];
};

function formatFilesize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DownloadResources({ attachments }: Props) {
  if (!attachments.length) return null;

  return (
    <aside className="my-12 border-y border-black/10 py-8">
      <h2 className="text-lg font-bold tracking-tight text-icc-ink">
        Ressources à télécharger
      </h2>
      <ul className="mt-4 space-y-3">
        {attachments.map((file, index) => {
          const ext = (file.extension || "PDF").toUpperCase();
          const size = formatFilesize(file.filesize);
          return (
            <li key={`${file.id}-${file.url}-${index}`}>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-icc-ink transition hover:text-icc-coral"
              >
                <span className="inline-flex h-9 min-w-9 items-center justify-center border border-icc-coral/40 px-1.5 text-[10px] font-bold tracking-wide text-icc-coral">
                  {ext}
                </span>
                <span>
                  <span className="font-medium underline-offset-4 group-hover:underline">
                    {file.title.replace(/\.[a-z0-9]+$/i, "")}
                  </span>
                  {size ? (
                    <span className="ml-2 text-sm font-normal text-icc-muted">
                      ({size})
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
