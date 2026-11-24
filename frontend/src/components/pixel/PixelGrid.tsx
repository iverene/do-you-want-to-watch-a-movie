interface Props {
  rows: string[];
  palette: Record<string, string>;
  scale?: number;
  label?: string;
  className?: string;
}

/** Pixel art from data: one character per pixel, '.' is transparent. */
export function PixelGrid({ rows, palette, scale = 4, label, className }: Props) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const rects: JSX.Element[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = palette[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    });
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects}
    </svg>
  );
}
