import { CONTACT } from "@/config/site";
import { COLORS } from "@/lib/theme";

export default function Contact() {
  return (
    <main className="min-h-screen px-5 py-12 sm:px-8 sm:py-16 lg:px-10" style={{ background: COLORS.cream }}>
      <div className="mx-auto max-w-5xl">
        <header
          className="rounded-[30px] border px-6 py-10 text-center sm:px-10 sm:py-12"
          style={{
            background: "linear-gradient(180deg, rgba(47,58,47,0.08) 0%, rgba(248,237,227,0.95) 100%)",
            borderColor: "rgba(47,58,47,0.28)",
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.2em] sm:text-sm"
            style={{ color: "rgba(38,45,37,0.55)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Support
          </p>
          <h1
            className="mt-3 text-[2.2rem] leading-[1.05] sm:text-5xl"
            style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
          >
            {CONTACT.pageTitle}
          </h1>
          <p
            className="mt-3 text-sm sm:text-base"
            style={{ color: "rgba(38,45,37,0.62)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            {CONTACT.subtitle}
          </p>
        </header>

        <article className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          {[
            CONTACT.sections.generalSupport,
            CONTACT.sections.careersPartnerships,
            CONTACT.sections.privacyRequests,
            CONTACT.sections.responseTime,
            CONTACT.sections.philosophy,
          ].map((section, index) => (
            <section
              key={section.title}
              className="rounded-2xl border px-5 py-5 sm:px-7 sm:py-6"
              style={{ background: "rgba(255,255,255,0.42)", borderColor: "rgba(47,58,47,0.22)" }}
            >
              <div className="mb-3 flex items-center gap-3 sm:mb-4">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs"
                  style={{
                    backgroundColor: COLORS.sage,
                    color: "rgba(248,237,227,0.95)",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {index + 1}
                </span>
                <h2
                  className="text-[1.4rem] leading-tight sm:text-[1.7rem]"
                  style={{ color: "#2D2F2C", fontFamily: "var(--font-playfair), serif" }}
                >
                  {section.title}
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-3.5">
                {section.content.map((text, i) => (
                  <p
                    key={i}
                    className="text-[0.98rem] leading-[1.75] sm:text-[1.03rem]"
                    style={{ color: "rgba(38,45,37,0.84)", fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {text}
                  </p>
                ))}

                {("email" in section) && typeof section.email === "string" && (
                  <p
                    className="pt-1 text-[0.98rem] font-semibold sm:text-[1.03rem]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    <a
                      href={`mailto:${section.email}`}
                      className="underline underline-offset-2 transition-opacity hover:opacity-70"
                      style={{ color: "rgba(38,45,37,0.9)" }}
                    >
                      {section.email}
                    </a>
                  </p>
                )}

                {("footer" in section) && typeof section.footer === "string" && (
                  <p
                    className="pt-1 text-[0.98rem] font-semibold sm:text-[1.03rem]"
                    style={{ color: "rgba(38,45,37,0.9)", fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {section.footer}
                  </p>
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}