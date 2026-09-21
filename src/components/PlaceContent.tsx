import { about, contactIntro, projects, site, skills, type PlaceId } from '@/data/site';

const link =
  'underline decoration-lamp/60 underline-offset-4 transition-colors hover:decoration-lamp';

export default function PlaceContent({ id }: { id: PlaceId }) {
  switch (id) {
    case 'about':
      return (
        <div className="max-w-[62ch] space-y-4 text-[1.05rem] leading-[1.75] text-chalk/90">
          {about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      );

    case 'projects':
      return (
        <ul className="space-y-8">
          {projects.map((p) => (
            <li key={p.title}>
              <h3 className="font-display text-xl font-semibold">
                <a href={p.href} className={link}>
                  {p.title}
                </a>
              </h3>
              <p className="mt-1 max-w-[62ch] leading-[1.7] text-chalk/85">{p.description}</p>
              <p className="mt-2 font-display text-sm text-mist">{p.tags.join(', ')}</p>
            </li>
          ))}
        </ul>
      );

    case 'skills':
      return (
        <dl className="space-y-6">
          {skills.map((g) => (
            <div key={g.group}>
              <dt className="font-display text-lg font-semibold">{g.group}</dt>
              <dd className="mt-1 max-w-[62ch] leading-[1.7] text-chalk/85">{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      );

    case 'contact':
      return (
        <div className="max-w-[62ch] space-y-6">
          <p className="text-[1.05rem] leading-[1.75] text-chalk/90">{contactIntro}</p>
          <p className="font-display text-2xl font-semibold sm:text-3xl">
            <a href={`mailto:${site.email}`} className={link}>
              {site.email}
            </a>
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-display">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}
