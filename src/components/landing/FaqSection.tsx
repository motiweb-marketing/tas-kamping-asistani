const FAQ = [
  {
    q: 'Denemede kaç kişi ekleyebilirim?',
    a: 'En fazla 2 kişi: siz (organizatör) ve bir katılımcı. İkinci kişi de kullanıcı adı ve şifre ile giriş yapıp uygulamayı deneyebilir.',
  },
  {
    q: 'AI kullanmak zorunlu mu?',
    a: 'Hayır. Menü ve listeyi elle de girebilirsiniz. AI, menüden alışveriş listesi üretmeyi kolaylaştırır; OpenRouter API anahtarı organizatör panelinden girilir.',
  },
  {
    q: 'Şifremi unuttum, ne yapmalıyım?',
    a: 'Şifreleri kamp organizatörü (admin) yönetir. Organizatörünüzden yeni şifre isteyin veya chat üzerinden ulaşın.',
  },
  {
    q: 'Telefonda nasıl kullanırım?',
    a: 'Tarayıcıdan açın; ana ekrana ekleyerek uygulama gibi kullanabilirsiniz (PWA). Büyük butonlar ve alt menü mobil için tasarlandı.',
  },
  {
    q: 'Tam sürüme nasıl geçerim?',
    a: 'Deneme limitine ulaştığınızda veya daha fazla çadır/kişi gerektiğinde sayfadaki iletişim butonlarından bize ulaşın.',
  },
];

export default function FaqSection() {
  return (
    <section className="bg-white py-12 lg:py-16" id="sss">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">Sık sorulan sorular</h2>
        <dl className="mt-10 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-200 p-5">
              <dt className="text-lg font-semibold text-gray-900">{item.q}</dt>
              <dd className="mt-2 text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
