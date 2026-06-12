const PAIRS = [
  {
    problem: 'WhatsApp\'ta liste kayboluyor',
    solution: 'Tek ortak liste — kim ne getiriyor belli',
  },
  {
    problem: 'Market fişleri karışıyor',
    solution: 'Harcama kaydı ve çadır bazlı bakiye',
  },
  {
    problem: 'Nöbet kimin sırada unutuluyor',
    solution: 'Otomatik nöbet planı, çadır görev alır',
  },
  {
    problem: 'Tabak-çatal sayısı hesaplanmıyor',
    solution: 'Kişi sayısına göre standart malzemeler',
  },
];

export default function ProblemSolutionSection() {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Kamp organizasyonu neden zor?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-gray-600">
          Aile kamplarında en çok yaşanan sorunlar — ve Kamp Asistanı ile çözümü
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PAIRS.map((p) => (
            <div
              key={p.problem}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
            >
              <p className="text-sm font-medium text-red-700">✗ {p.problem}</p>
              <p className="mt-2 text-base font-semibold text-emerald-800">✓ {p.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
