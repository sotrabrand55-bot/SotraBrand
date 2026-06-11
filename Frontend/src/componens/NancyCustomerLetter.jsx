const NancyCustomerLetter = () => (
  <section
    id="a-note-from-nancy"
    className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/15 bg-white text-black"
  >
    <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-12 lg:py-24">
      <div className="lg:border-r lg:border-black/20 lg:pr-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">
          Be Radiant By Nancy
        </p>
        <h2 className="mt-5 max-w-sm font-serif text-5xl leading-[1.05] sm:text-6xl">
          A Note From Nancy
        </h2>
        <div className="mt-8 h-px w-20 bg-black" />
        <p className="mt-8 font-serif text-3xl">Nancy Khayrallah</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-black/55">
          Founder, Be Radiant By Nancy
        </p>
      </div>

      <div className="max-w-3xl space-y-5 text-[15px] font-light leading-8 text-black/70 sm:text-base sm:leading-9">
        <p className="font-serif text-3xl leading-tight text-black">
          Dear Valued Customer,
        </p>
        <p>
          Thank you for choosing Be Radiant By Nancy for your skincare needs! We are
          thrilled to have you as part of our community and truly appreciate your trust
          in our products.
        </p>
        <p>
          We hope you enjoy using our skincare solutions and that they help you achieve
          your best skin ever. Your satisfaction is our top priority, so please do not
          hesitate to reach out with any feedback or questions.
        </p>
        <p>Thank you once again for your purchase!</p>
        <div className="pt-2 text-black">
          <p className="font-serif text-2xl">Warm regards,</p>
          <p className="mt-4 font-serif text-3xl">Nancy Khayrallah</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/55">
            Be Radiant By Nancy
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default NancyCustomerLetter;
