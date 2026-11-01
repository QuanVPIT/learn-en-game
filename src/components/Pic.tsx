// Hình của một từ: emoji, chữ số, hoặc ô màu
export function Pic({ pic }: { pic: string }) {
  if (pic.startsWith('#'))
    return (
      <span className="inline-block size-[1em] rounded-full border-4 border-black/10" style={{ background: pic }} />
    );
  if (/^\d+$/.test(pic)) return <span className="font-extrabold leading-none text-violet">{pic}</span>;
  return <span className="leading-none">{pic}</span>;
}
