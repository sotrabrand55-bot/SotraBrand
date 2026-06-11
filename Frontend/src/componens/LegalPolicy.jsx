import { useEffect } from "react";
import { Link } from "react-router-dom";

const copy = {
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Your Privacy Matters",
    intro:
      "Be Radiant By Nancy respects your personal information and uses it only to support your shopping experience, order delivery, and customer care.",
    sections: [
      {
        title: "Information We Collect",
        text:
          "When you place an order or contact us, we may collect details such as your name, phone number, email, delivery address, and order preferences.",
      },
      {
        title: "How We Use It",
        text:
          "We use this information to confirm orders, arrange delivery, answer questions, improve our service, and keep your Be Radiant experience smooth.",
      },
      {
        title: "Care With Your Data",
        text:
          "We do not sell your personal information. Access is kept limited to the people and trusted services needed to complete your order or support request.",
      },
      {
        title: "Contact",
        text:
          "If you want to update, correct, or ask about your information, you can contact us anytime through the Contact page.",
      },
    ],
  },
  terms: {
    eyebrow: "Terms and Conditions",
    title: "Simple Terms For A Smooth Order",
    intro:
      "These terms help keep every Be Radiant By Nancy order clear, respectful, and easy to complete.",
    sections: [
      {
        title: "Orders",
        text:
          "Please review your product choices, quantity, phone number, and delivery address before submitting your order.",
      },
      {
        title: "Prices and Availability",
        text:
          "Prices and stock can change when products are updated. If an item becomes unavailable, we will contact you before continuing the order.",
      },
      {
        title: "Delivery",
        text:
          "Delivery follows the timing shown in our Shipping Info page. Delays may happen during busy periods or conditions outside our control.",
      },
      {
        title: "Product Care",
        text:
          "For the best experience, store products away from direct heat and sunlight, and follow the usage guidance shown on the product page.",
      },
    ],
  },
};

const LegalPolicy = ({ type = "privacy" }) => {
  const content = copy[type] || copy.privacy;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [type]);

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-black">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/45">
          {content.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          {content.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-8 text-black/65">
          {content.intro}
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-3xl divide-y divide-black/15 border-y border-black/20">
        {content.sections.map((section) => (
          <article key={section.title} className="py-7">
            <h2 className="text-sm font-black uppercase tracking-[0.18em]">
              {section.title}
            </h2>
            <p className="mt-4 text-sm font-light leading-8 text-black/65">
              {section.text}
            </p>
          </article>
        ))}
      </section>

      <div className="mt-10 text-center">
        <Link
          to="/contact"
          className="inline-flex border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.18em]"
        >
          Contact Us
        </Link>
      </div>
    </main>
  );
};

export default LegalPolicy;
