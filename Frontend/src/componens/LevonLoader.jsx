// eslint-disable-next-line no-unused-vars
import React from "react";

const LevonLoader = () => {
  const bars = [0, 1, 2, 3, 4];
  const dots = [0, 1, 2];

  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf4] px-6 text-[#1f1b17]">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex items-end gap-2" aria-hidden="true">
          {bars.map((bar) => (
            <span
              key={bar}
              className="levon-loader-bar block w-2 rounded-full bg-[#c49a5e]"
              style={{ animationDelay: `${bar * 0.12}s` }}
            />
          ))}
        </div>

        <p className="font-serif text-5xl tracking-[0.22em] text-[#1f1b17] sm:text-6xl">
          LEVON
        </p>

        <div className="mt-5 flex items-center gap-3 text-[#c49a5e]" aria-hidden="true">
          <span className="h-px w-10 bg-current" />
          <span className="h-2.5 w-2.5 rotate-45 bg-current" />
          <span className="h-px w-10 bg-current" />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            Preparing Your Scent Trail
          </span>
          <span className="flex gap-1" aria-hidden="true">
            {dots.map((dot) => (
              <span
                key={dot}
                className="levon-loader-dot h-1.5 w-1.5 rounded-full bg-[#c49a5e]"
                style={{ animationDelay: `${dot * 0.16}s` }}
              />
            ))}
          </span>
        </div>
      </div>
    </main>
  );
};

export default LevonLoader;
