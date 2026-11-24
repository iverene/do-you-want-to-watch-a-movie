export function Counter({ today, total }: { today: number | undefined; total: number | undefined }) {
  const fmt = (n: number | undefined) => (n === undefined ? '-' : n.toLocaleString('en-US'));
  return (
    <p
      className="font-caps text-[11px] uppercase text-ink"
      aria-label={`Today ${fmt(today)}, total ${fmt(total)}`}
    >
      TODAY <span className="text-red">{fmt(today)}</span> | TOTAL {fmt(total)}
    </p>
  );
}
