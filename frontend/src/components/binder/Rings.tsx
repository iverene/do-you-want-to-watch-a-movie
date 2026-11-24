const Ring = () => (
  <span className="block h-3 w-10 rounded-full border border-[#9AA0AA] bg-gradient-to-b from-white to-[#B9BEC8]" />
);

/** Two pairs of ring pills straddling the gap between the pages. */
export function Rings() {
  return (
    <div aria-hidden className="relative z-10 -mx-4 flex w-0 flex-col items-center justify-between py-14">
      {[0, 1].map((p) => (
        <div key={p} className="flex flex-col gap-2">
          <Ring />
          <Ring />
        </div>
      ))}
    </div>
  );
}
