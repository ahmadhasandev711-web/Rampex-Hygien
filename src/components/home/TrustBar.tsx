import type { Dictionary } from "@/i18n/dictionaries";

type TrustBarProps = {
  dict: Dictionary;
};

export function TrustBar({ dict }: TrustBarProps) {
  const items = [
    { title: dict.trust.quality, desc: dict.trust.qualityDesc },
    { title: dict.trust.selection, desc: dict.trust.selectionDesc },
    { title: dict.trust.support, desc: dict.trust.supportDesc },
    { title: dict.trust.delivery, desc: dict.trust.deliveryDesc },
  ];

  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="text-center sm:text-start">
            <div className="mx-auto mb-3 h-1 w-10 bg-lime sm:mx-0" />
            <h3 className="text-base font-bold text-navy">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
