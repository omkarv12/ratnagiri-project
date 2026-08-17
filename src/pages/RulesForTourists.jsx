import { ShieldCheck, ExternalLink } from "lucide-react";

const rules = [
  "Respect the local culture, traditions, and religious places.",
  "Do not litter; always use designated dustbins.",
  "Follow all safety guidelines at beaches, forts, waterfalls, and trekking routes.",
  "Avoid damaging monuments, heritage sites, or natural attractions.",
  "Carry a valid ID proof while traveling.",
  "Wear appropriate clothing when visiting temples and other religious sites.",
  "Do not disturb wildlife or feed wild animals.",
  "Support local communities by purchasing local products and services.",
  "Follow traffic rules and drive responsibly.",
  "Help preserve natural and cultural heritage by practicing responsible tourism.",
];

const references = [
  {
    label: "Maharashtra Tourism Development Corporation (MTDC)",
    href: "https://www.maharashtratourism.gov.in",
  },
  {
    label: "Ministry of Tourism, Government of India",
    href: "https://tourism.gov.in",
  },
  {
    label: "Incredible India – Responsible Tourism",
    href: "https://www.incredibleindia.gov.in",
  },
];

export default function RulesForTourists() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-10 sm:mb-12">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="text-orange-600" size={22} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600 mb-2">
          Responsible Travel
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 mb-4">
          Rules for Tourists
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Tourist rules ensure visitor safety, protect natural and cultural
          heritage, and maintain the cleanliness of destinations. They
          encourage respect for local communities, support sustainable
          tourism, and help preserve tourism resources for future
          generations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 sm:p-10 mb-10">
        <ol className="space-y-4 sm:space-y-5">
          {rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-1">
                {rule}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-orange-50/60 rounded-2xl p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600 mb-4">
          Official References
        </p>
        <ul className="space-y-3">
          {references.map((ref) => (
            <li key={ref.href}>
              
                href={ref.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-slate-700 hover:text-orange-700 transition-colors duration-200"
              
                <span className="underline decoration-orange-300 underline-offset-2 group-hover:decoration-orange-500">
                  {ref.label}
                </span>
                <ExternalLink size={13} className="text-slate-400 group-hover:text-orange-600 shrink-0" />
              
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}