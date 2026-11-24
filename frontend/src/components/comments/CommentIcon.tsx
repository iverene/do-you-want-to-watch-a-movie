export function CommentIcon({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-muted"
      aria-label={`${count} ${count === 1 ? 'comment' : 'comments'}`}
    >
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 12 12"
        shapeRendering="crispEdges"
        fill="none"
        stroke="currentColor"
      >
        <path d="M1.5 1.5h9v6h-5l-2.5 2.5v-2.5h-1.5z" />
      </svg>
      {count}
    </span>
  );
}
