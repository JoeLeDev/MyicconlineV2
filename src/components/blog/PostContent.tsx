type Props = {
  html: string;
};

export function PostContent({ html }: Props) {
  return (
    <div
      className="prose-icc"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
