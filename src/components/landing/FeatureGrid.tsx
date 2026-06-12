const FEATURES = [
  { icon: '📋', title: 'Akıllı Malzeme Listesi', desc: 'Kişisel, çadır ve ortak listeler. AI ile menüden alışveriş listesi.' },
  { icon: '🤝', title: 'Adet ile Üstlenme', desc: '20 tabağı tek çadır değil — çadırlar bölüşerek üstlenir.' },
  { icon: '🧾', title: 'Harcama & Bakiye', desc: 'Market fişlerini girin; konaklama ücreti dahil adil paylaşım.' },
  { icon: '📅', title: 'Nöbet Planı', desc: 'Yemek, mangal, çay, bulaşık — çadır başına otomatik dağılım.' },
  { icon: '🍽️', title: 'Menü', desc: 'Günlük kahvaltı, yemek ve ara öğün — katılımcılara yayınlanır.' },
  { icon: '💬', title: 'Kamp Sohbeti', desc: 'WhatsApp benzeri grup chat; sistem mesajları ile bildirim.' },
  { icon: '📊', title: 'Kamp Özeti', desc: 'Kim ne getiriyor, ne eksik — tek bakışta durum.' },
  { icon: '⛺', title: 'Çadır Yönetimi', desc: 'Çadır başına kişiler, giriş bilgisi paylaşımı kolay.' },
];

const STEPS = [
  { step: '1', title: 'Ücretsiz kamp oluşturun', desc: 'Organizatör hesabı açın, tarihleri girin.' },
  { step: '2', title: 'Listeyi hazırlayın', desc: 'Menü yazın, AI alışveriş listesi üretsin, yayınlayın.' },
  { step: '3', title: 'Çadırlar bağlansın', desc: 'Her çadıra kullanıcı adı verin; üstlenme ve harcama başlasın.' },
];

export default function FeatureGrid() {
  return (
    <>
      <section className="bg-gray-50 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Her şey tek yerde
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-gray-600">
            Mobil öncelikli, büyük butonlar — kamp alanında telefondan rahat kullanım
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <span className="text-3xl" aria-hidden>
                  {f.icon}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">Nasıl çalışır?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
