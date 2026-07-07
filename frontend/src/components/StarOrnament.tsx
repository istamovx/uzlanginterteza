/* Sakkiz qirrali girih yulduzi — o'zbek me'morchiligi naqshlaridan bezak */
export default function StarOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0l2.3 5.5 5.5-2.3-2.3 5.5L23 12l-5.5 2.3 2.3 5.5-5.5-2.3L12 23l-2.3-5.5-5.5 2.3 2.3-5.5L1 12l5.5-2.3L4.2 4.2l5.5 2.3z" />
    </svg>
  );
}
