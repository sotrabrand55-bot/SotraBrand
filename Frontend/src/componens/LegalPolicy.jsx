import { useEffect } from "react";
import { Link } from "react-router-dom";

const copy = {
  privacy: {
    eyebrow: "Privacy Policy",
    title: "Your Privacy Matters",
    intro:
      "SotraBrand respects your personal information and uses it only to support your shopping experience, order delivery, and customer care.",
    sections: [
      {
        title: "Information We Collect",
        text:
          "When you place an order or contact us, we may collect details such as your name, phone number, email, delivery address, and order preferences.",
      },
      {
        title: "How We Use It",
        text:
          "We use this information to confirm orders, arrange delivery, answer questions, improve our service, and keep your SotraBrand experience smooth.",
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
    eyebrow: "Exchange Policy",
    title: "Exchange Only",
    intro:
      "Exchanges are accepted only for incorrect size, incorrect color, or a manufacturing defect.",
    sections: [
      {
        title: "Exchange Policy",
        text: [
          "Exchanges are accepted only in the following cases:",
          "Incorrect size received.",
          "Incorrect color received.",
          "Manufacturing defect in the item.",
          "We do not offer refunds. Exchange only.",
        ],
      },
      {
        title: "سياسة الاستبدال",
        dir: "rtl",
        text: [
          "يمكن استبدال المنتج فقط في الحالات التالية:",
          "في حال إرسال مقاس غير صحيح.",
          "في حال إرسال لون غير صحيح.",
          "في حال وجود عيب مصنعي في القطعة.",
          "لا يوجد استرجاع للأموال، والاستبدال فقط.",
        ],
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
            {Array.isArray(section.text) ? (
              <div
                dir={section.dir || "ltr"}
                className="mt-4 space-y-3 text-sm font-light leading-8 text-black/65"
              >
                <p>{section.text[0]}</p>
                <ul className="list-disc space-y-2 pl-5 rtl:pr-5">
                  {section.text.slice(1, -1).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="font-medium text-black">{section.text.at(-1)}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm font-light leading-8 text-black/65">
                {section.text}
              </p>
            )}
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
