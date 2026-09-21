import { places, site } from '@/data/site';
import PlaceContent from './PlaceContent';

type Props = { active: boolean; hydrated: boolean; onWalk: () => void };

/**
 * The plain, scrolling version of the portfolio. It is always in the HTML
 * (so search engines and screen readers get real content) and is shown
 * when the visitor chooses "Read as a page" or prefers reduced motion.
 */
export default function PageView({ active, hydrated, onWalk }: Props) {
  return (
    <div
      data-page
      className={active ? 'min-h-screen bg-night' : 'sr-only'}
      inert={hydrated && !active}
      aria-hidden={hydrated && !active}
    >
      <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 pt-8">
        <nav aria-label="Sections" className="flex gap-5 font-display text-sm">
          {places.map((p) => (
            <a key={p.id} href={`#${p.id}`} className="text-mist transition-colors hover:text-chalk">
              {p.name}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={onWalk}
          className="font-display text-sm text-lamp underline underline-offset-4"
        >
          Walk the city
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28 pt-20">
        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
          {site.name}
        </h1>
        <p className="mt-4 font-display text-xl text-mist sm:text-2xl">{site.role}</p>

        {places.map((p) => (
          <section key={p.id} id={p.id} className="mt-24 scroll-mt-8">
            <h2 className="font-display text-3xl font-semibold tracking-tight">{p.title}</h2>
            <div className="mt-6">
              <PlaceContent id={p.id} />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
