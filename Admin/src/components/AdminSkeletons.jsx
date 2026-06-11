import React from "react";

const pageClass = "mx-auto w-full max-w-[1480px] text-[#000000]";
const cardClass =
  "rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`admin-skeleton ${className}`} aria-hidden="true" />
);

const PageHeaderSkeleton = ({ actions = 2 }) => (
  <div className="mb-5 flex flex-col gap-3 border-b border-[#e5e5e5] pb-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="w-full max-w-[520px]">
      <SkeletonBlock className="h-3 w-40 rounded-full" />
      <SkeletonBlock className="mt-4 h-10 w-56 rounded-md" />
      <SkeletonBlock className="mt-3 h-4 w-full max-w-[410px] rounded-full" />
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: actions }).map((_, index) => (
        <SkeletonBlock key={index} className="h-10 w-32 rounded-full" />
      ))}
    </div>
  </div>
);

const StatGridSkeleton = ({ count = 6 }) => (
  <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={cardClass}>
        <SkeletonBlock className="h-3 w-28 rounded-full" />
        <SkeletonBlock className="mt-3 h-8 w-16 rounded-md" />
      </div>
    ))}
  </section>
);

export const AdminInlineSkeleton = ({ rows = 3, cards = 1, className = "" }) => (
  <div className={`grid gap-4 ${className}`} aria-label="Loading">
    {Array.from({ length: cards }).map((_, index) => (
      <div
        key={index}
        className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]"
      >
        <SkeletonBlock className="h-36 w-full rounded-md" />
        <SkeletonBlock className="mt-4 h-5 w-3/4 rounded-full" />
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <SkeletonBlock
            key={rowIndex}
            className="mt-3 h-4 w-full rounded-full"
          />
        ))}
      </div>
    ))}
  </div>
);

export const AdminPanelSkeleton = () => (
  <section
    className="w-full max-w-md rounded-md border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[0_14px_34px_rgba(62,45,28,0.06)]"
    aria-label="Loading"
  >
    <SkeletonBlock className="h-6 w-48 rounded-md" />
    <SkeletonBlock className="mt-4 h-4 w-full rounded-full" />
    <SkeletonBlock className="mt-3 h-12 w-full rounded-md" />
  </section>
);

export const AdminDashboardSkeleton = () => (
  <main className={pageClass} aria-label="Loading dashboard">
    <PageHeaderSkeleton actions={4} />

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={cardClass}>
          <SkeletonBlock className="h-3 w-28 rounded-full" />
          <div className="mt-3 flex items-end justify-between gap-3">
            <SkeletonBlock className="h-8 w-20 rounded-md" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
        <SkeletonBlock className="h-3 w-28 rounded-full" />
        <SkeletonBlock className="mt-3 h-8 w-64 rounded-md" />
        <div className="mt-4 h-[260px] rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
          <SkeletonBlock className="h-full w-full rounded-md" />
        </div>
      </div>

      <aside className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
        <SkeletonBlock className="h-3 w-40 rounded-full" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-3">
              <SkeletonBlock className="h-3 w-20 rounded-full" />
              <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
              <SkeletonBlock className="mt-2 h-3 w-32 rounded-full" />
            </div>
          ))}
        </div>
      </aside>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
        <SkeletonBlock className="h-3 w-32 rounded-full" />
        <SkeletonBlock className="mt-3 h-8 w-72 rounded-md" />
        <div className="mt-4 overflow-hidden rounded-md border border-[#e5e5e5] bg-[#ffffff]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[54px_minmax(0,1fr)_90px_100px] items-center gap-3 border-b border-[#e5e5e5] p-3 last:border-b-0"
            >
              <SkeletonBlock className="h-12 w-12 rounded-md" />
              <div>
                <SkeletonBlock className="h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-3 w-24 rounded-full" />
              </div>
              <SkeletonBlock className="h-4 w-10 rounded-full" />
              <SkeletonBlock className="h-4 w-20 justify-self-end rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={cardClass}>
            <SkeletonBlock className="h-3 w-32 rounded-full" />
            <SkeletonBlock className="mt-3 h-8 w-20 rounded-md" />
            <SkeletonBlock className="mt-3 h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </section>
  </main>
);

export const AdminProductsSkeleton = () => (
  <main className={pageClass} aria-label="Loading products">
    <PageHeaderSkeleton actions={2} />
    <StatGridSkeleton />

    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-md border border-[#e5e5e5] bg-[#ffffff] shadow-[0_18px_45px_rgba(62,45,28,0.08)]"
        >
          <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-7 w-4/5 rounded-md" />
                <SkeletonBlock className="mt-3 h-3 w-3/5 rounded-full" />
              </div>
              <SkeletonBlock className="h-7 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="mt-4 h-3 w-28 rounded-full" />
            <div className="mt-4 flex items-center justify-between gap-3">
              <SkeletonBlock className="h-5 w-24 rounded-full" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="mt-4 h-4 w-full rounded-full" />
            <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
            <div className="mt-4 flex flex-wrap gap-1.5">
              {Array.from({ length: 4 }).map((_, chipIndex) => (
                <SkeletonBlock key={chipIndex} className="h-6 w-16 rounded-full" />
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, buttonIndex) => (
                <SkeletonBlock key={buttonIndex} className="h-9 rounded-full" />
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  </main>
);

export const AdminFormPreviewSkeleton = () => (
  <main className={pageClass} aria-label="Loading product">
    <PageHeaderSkeleton actions={3} />

    <section className="mb-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-[360px]">
          <SkeletonBlock className="h-3 w-32 rounded-full" />
          <SkeletonBlock className="mt-3 h-7 w-56 rounded-md" />
          <SkeletonBlock className="mt-3 h-3 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:w-[520px]">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    </section>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
      <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <SkeletonBlock className="h-3 w-36 rounded-full" />
            <SkeletonBlock className="mt-3 h-7 w-56 rounded-md" />
          </div>
          <SkeletonBlock className="h-7 w-24 rounded-full" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={index === 2 ? "lg:col-span-2" : ""}>
              <SkeletonBlock className="mb-2 h-3 w-24 rounded-full" />
              <SkeletonBlock className={`${index === 2 ? "h-24" : "h-12"} rounded-md`} />
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
          <SkeletonBlock className="h-3 w-28 rounded-full" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
          <SkeletonBlock className="h-3 w-40 rounded-full" />
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 rounded-md" />
            ))}
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <SkeletonBlock className="h-3 w-40 rounded-full" />
          <div className="mt-4 overflow-hidden rounded-md border border-[#e5e5e5] bg-[#ffffff]">
            <SkeletonBlock className="aspect-[4/4.5] w-full rounded-none" />
            <div className="p-4">
              <SkeletonBlock className="h-6 w-4/5 rounded-md" />
              <SkeletonBlock className="mt-3 h-3 w-3/5 rounded-full" />
              <SkeletonBlock className="mt-4 h-4 w-full rounded-full" />
              <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
              <div className="mt-4 flex flex-wrap gap-1.5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </main>
);

export const AdminOrdersSkeleton = () => (
  <main className={pageClass} aria-label="Loading orders">
    <PageHeaderSkeleton actions={2} />
    <StatGridSkeleton />

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <SkeletonBlock className="h-3 w-32 rounded-full" />
                <SkeletonBlock className="mt-3 h-7 w-56 rounded-md" />
                <SkeletonBlock className="mt-2 h-3 w-36 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-1.5 lg:justify-end">
                {Array.from({ length: 3 }).map((_, chipIndex) => (
                  <SkeletonBlock key={chipIndex} className="h-7 w-28 rounded-full" />
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
              <div className="flex gap-2 overflow-hidden pb-1">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex min-w-[210px] items-center gap-3 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-2"
                  >
                    <SkeletonBlock className="h-14 w-14 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <SkeletonBlock className="h-4 w-full rounded-full" />
                      <SkeletonBlock className="mt-2 h-3 w-3/4 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-3">
                <SkeletonBlock className="h-3 w-full rounded-full" />
                <SkeletonBlock className="mt-3 h-3 w-full rounded-full" />
                <SkeletonBlock className="mt-5 h-7 w-24 rounded-md" />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SkeletonBlock className="h-10 w-full max-w-[220px] rounded-md" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-9 w-32 rounded-full" />
                <SkeletonBlock className="h-9 w-24 rounded-full" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SkeletonBlock className="h-3 w-28 rounded-full" />
              <SkeletonBlock className="mt-3 h-8 w-36 rounded-md" />
              <SkeletonBlock className="mt-3 h-3 w-32 rounded-full" />
            </div>
            <SkeletonBlock className="h-7 w-28 rounded-full" />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4"
            >
              <SkeletonBlock className="h-3 w-28 rounded-full" />
              <SkeletonBlock className="mt-3 h-5 w-4/5 rounded-full" />
              <SkeletonBlock className="mt-2 h-4 w-full rounded-full" />
            </div>
          ))}
        </section>
      </aside>
    </section>
  </main>
);
