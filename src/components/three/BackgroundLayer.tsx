export default function BackgroundLayer() {
  return (
    <div className="fixed inset-0 z-0 bg-[#08080A]" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#08080A_0%,#0B0912_45%,#08080A_100%)]" />
    </div>
  );
}
