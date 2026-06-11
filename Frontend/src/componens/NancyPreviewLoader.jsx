const NancyPreviewLoader = () => (
  <main className="grid min-h-screen place-items-center bg-white px-6 text-black">
    <div className="flex flex-col items-center text-center">
      <div className="nancy-preview-loader-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <p className="mt-7 font-serif text-4xl font-semibold uppercase tracking-[0.12em] sm:text-5xl">
        Be Radiant
      </p>
      <p className="mt-2 text-xs font-light tracking-[0.18em] text-black/45">
        by Nancy
      </p>
    </div>
  </main>
);

export default NancyPreviewLoader;
