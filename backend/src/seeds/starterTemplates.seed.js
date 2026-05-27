export const starterTemplatesSeed = [
  {
    name: "SaaS Launch",
    description: "A focused startup landing page with hero, metrics, features, and a strong call to action.",
    category: "SaaS",
    tags: ["saas", "startup", "landing", "marketing", "hero", "features", "starter-template"],
    html: `
<main class="min-h-screen bg-slate-950 text-white">
  <section class="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-cyan-300">Product launch</p>
      <h1 class="mt-4 text-5xl font-bold leading-tight">Build the website your product deserves.</h1>
      <p class="mt-5 max-w-xl text-lg text-slate-300">A conversion-ready landing page for SaaS founders, indie hackers, and teams shipping fast.</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950" href="#">Start building</a>
        <a class="rounded-lg border border-white/20 px-5 py-3 font-semibold text-white" href="#">View demo</a>
      </div>
    </div>
    <div class="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl">
      <div class="rounded-xl bg-slate-900 p-5">
        <div class="h-3 w-24 rounded-full bg-cyan-300"></div>
        <div class="mt-8 grid gap-3">
          <div class="h-16 rounded-lg bg-white/10"></div>
          <div class="h-16 rounded-lg bg-white/10"></div>
          <div class="h-16 rounded-lg bg-white/10"></div>
        </div>
      </div>
    </div>
  </section>
</main>`,
    css: "",
  },
  {
    name: "Creative Portfolio",
    description: "A bold portfolio homepage for designers, artists, and studios.",
    category: "Portfolio",
    tags: ["portfolio", "creative", "studio", "designer", "starter-template"],
    html: `
<main class="bg-zinc-50 text-zinc-950">
  <section class="mx-auto max-w-6xl px-6 py-16">
    <div class="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
      <div>
        <p class="text-sm font-semibold uppercase text-pink-600">Selected work</p>
        <h1 class="mt-3 text-6xl font-black leading-none">Visual stories for ambitious brands.</h1>
      </div>
      <p class="text-lg leading-8 text-zinc-600">Present case studies, services, and a clear booking path with an expressive editorial layout.</p>
    </div>
    <div class="mt-10 grid gap-4 md:grid-cols-3">
      <div class="h-72 rounded-xl bg-pink-200"></div>
      <div class="h-72 rounded-xl bg-indigo-200 md:mt-10"></div>
      <div class="h-72 rounded-xl bg-amber-200"></div>
    </div>
  </section>
</main>`,
    css: "",
  },
  {
    name: "Agency Grid",
    description: "A clean agency website with services, proof points, and project cards.",
    category: "Agency",
    tags: ["agency", "services", "business", "grid", "starter-template"],
    html: `
<main class="bg-white text-neutral-950">
  <section class="mx-auto max-w-6xl px-6 py-14">
    <div class="max-w-3xl">
      <p class="text-sm font-bold uppercase text-emerald-600">Digital agency</p>
      <h1 class="mt-3 text-5xl font-bold tracking-tight">Design, build, and ship better web experiences.</h1>
      <p class="mt-4 text-lg text-neutral-600">A polished layout for service businesses that need clarity and credibility.</p>
    </div>
    <div class="mt-10 grid gap-4 md:grid-cols-3">
      <article class="rounded-xl border p-6"><h2 class="font-bold">Strategy</h2><p class="mt-2 text-sm text-neutral-600">Positioning, audits, and launch planning.</p></article>
      <article class="rounded-xl border p-6"><h2 class="font-bold">Design</h2><p class="mt-2 text-sm text-neutral-600">Interfaces, systems, and brand moments.</p></article>
      <article class="rounded-xl border p-6"><h2 class="font-bold">Build</h2><p class="mt-2 text-sm text-neutral-600">Responsive websites ready to publish.</p></article>
    </div>
  </section>
</main>`,
    css: "",
  },
  {
    name: "Event Spotlight",
    description: "A bright event page for conferences, workshops, and launches.",
    category: "Event",
    tags: ["event", "conference", "schedule", "landing", "starter-template"],
    html: `
<main class="bg-orange-50 text-stone-950">
  <section class="mx-auto max-w-5xl px-6 py-16 text-center">
    <p class="text-sm font-bold uppercase text-orange-600">June 18 / Online</p>
    <h1 class="mx-auto mt-4 max-w-4xl text-6xl font-black leading-none">A one-day summit for modern makers.</h1>
    <p class="mx-auto mt-5 max-w-2xl text-lg text-stone-600">Invite speakers, list sessions, and drive registrations with a warm event-ready layout.</p>
    <div class="mt-10 grid gap-3 rounded-2xl bg-white p-4 text-left shadow-xl md:grid-cols-3">
      <div class="rounded-xl bg-orange-100 p-5"><b>10:00</b><p>Opening keynote</p></div>
      <div class="rounded-xl bg-yellow-100 p-5"><b>13:00</b><p>Builder workshops</p></div>
      <div class="rounded-xl bg-rose-100 p-5"><b>16:00</b><p>Live demos</p></div>
    </div>
  </section>
</main>`,
    css: "",
  },
  {
    name: "Restaurant Menu",
    description: "A tasteful restaurant homepage with menu highlights and reservation CTA.",
    category: "Restaurant",
    tags: ["restaurant", "food", "menu", "booking", "starter-template"],
    html: `
<main class="bg-neutral-950 text-white">
  <section class="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
    <div>
      <p class="text-sm font-semibold uppercase text-lime-300">Open daily</p>
      <h1 class="mt-4 text-5xl font-serif font-bold">Seasonal plates, local ingredients.</h1>
      <p class="mt-5 text-lg text-neutral-300">A refined restaurant layout for menus, reservations, and signature dishes.</p>
      <button class="mt-8 rounded-lg bg-lime-300 px-5 py-3 font-semibold text-neutral-950">Reserve a table</button>
    </div>
    <div class="grid gap-4">
      <div class="rounded-xl border border-white/10 p-5"><b>Garden risotto</b><span class="float-right">$24</span></div>
      <div class="rounded-xl border border-white/10 p-5"><b>Charred salmon</b><span class="float-right">$31</span></div>
      <div class="rounded-xl border border-white/10 p-5"><b>Citrus tart</b><span class="float-right">$12</span></div>
    </div>
  </section>
</main>`,
    css: "",
  },
  {
    name: "Course Landing",
    description: "A course sales page for educators, coaches, and digital products.",
    category: "Education",
    tags: ["course", "education", "coaching", "learning", "starter-template"],
    html: `
<main class="bg-sky-50 text-slate-950">
  <section class="mx-auto max-w-6xl px-6 py-16">
    <div class="grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-center">
      <div>
        <p class="text-sm font-bold uppercase text-sky-700">Online course</p>
        <h1 class="mt-4 text-5xl font-bold tracking-tight">Teach what you know with a page that sells clearly.</h1>
        <p class="mt-5 text-lg text-slate-600">Show the outcome, modules, testimonials, and enrollment CTA in one clean flow.</p>
      </div>
      <div class="rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="text-xl font-bold">What students get</h2>
        <ul class="mt-4 space-y-3 text-slate-600">
          <li>12 focused video lessons</li>
          <li>Downloadable worksheets</li>
          <li>Private community access</li>
        </ul>
      </div>
    </div>
  </section>
</main>`,
    css: "",
  },
];
