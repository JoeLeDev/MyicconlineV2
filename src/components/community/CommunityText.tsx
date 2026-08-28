import { PostContent } from "@/components/blog/PostContent";
import { formatCommunityText } from "@/lib/utils/community-text";

type Props = {
  text: string;
  className?: string;
};

export function CommunityText({ text, className }: Props) {
  const html = formatCommunityText(text);
  if (!html) return null;

  return (
    <div className={className}>
      <PostContent html={html} />
    </div>
  );
}
