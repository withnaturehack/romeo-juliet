import { PRIVACY } from "@/config/site";
import { COLORS } from "@/lib/theme";

export default function Privacy() {
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
            Legal
          </p>
          <h1
            className="mt-3 text-[2.2rem] leading-[1.05] sm:text-5xl"
            style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
          >
            {PRIVACY.pageTitle}
          </h1>
          <p
            className="mt-3 text-sm sm:text-base"
            style={{ color: "rgba(38,45,37,0.62)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            {PRIVACY.lastUpdated}
          </p>
        </header>

        <article className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          <section
            className="rounded-2xl border px-5 py-5 sm:px-7 sm:py-6"
            style={{ background: "rgba(255,255,255,0.42)", borderColor: "rgba(47,58,47,0.22)" }}
          >
            <p
              className="text-[1rem] leading-[1.75] sm:text-[1.06rem]"
              style={{ color: "rgba(38,45,37,0.84)", fontFamily: "var(--font-inter), sans-serif" }}
            >
              {PRIVACY.intro}
            </p>
          </section>

          {Object.entries(PRIVACY.sections).map(([key, section], index) => (
            <section
              key={key}
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
              </div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}