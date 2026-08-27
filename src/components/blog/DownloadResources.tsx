import type { BlogAttachment } from "@/lib/wp/types";

type Props = {
  attachments: BlogAttachment[];
};

export function DownloadResources({ attachments }: Props) {
  const files = attachments.filter(
    (a) =>
      a.mimeType.includes("pdf") ||
      a.url.toLowerCase().endsWith(".pdf") ||
      a.mimeType.startsWith("application/"),
  );

  if (!files.length) return null;

  return (
    <aside className="my-12 border-y border-black/10 py-8">
      <h2 className="text-lg font-bold tracking-tight text-icc-ink">
        Ressources à télécharger
      </h2>
      <ul className="mt-4 space-y-3">
        {files.map((file, index) => (
          <li key={`${file.id}-${file.url}-${index}`}>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-icc-ink transition hover:text-icc-coral"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center border border-icc-coral/40 text-xs font-bold text-icc-coral">
                PDF
              </span>
              <span className="font-medium underline-offset-4 group-hover:underline">
                {file.title.replace(/\.pdf$/i, "")}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
