import sotraLogo from "../assets/sotraBrand/Logo_Sotra_cropped.png";

const NancyPreviewLoader = () => (
  <main className="grid min-h-screen place-items-center bg-white px-6 text-black">
    <div className="flex flex-col items-center text-center">
      <div className="sotra-preview-loader-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="sotra-preview-logo-frame">
          <img src={sotraLogo} alt="" className="sotra-preview-logo" />
        </div>
      </div>

      <div className="sotra-preview-loader-line mt-10" aria-hidden="true">
        <span />
      </div>
    </div>
  </main>
);

export default NancyPreviewLoader;
