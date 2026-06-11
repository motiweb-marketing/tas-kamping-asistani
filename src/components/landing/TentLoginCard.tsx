import Link from 'next/link';

export default function TentLoginCard() {
  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-center text-white shadow-xl sm:p-12">
          <p className="text-4xl sm:text-5xl" aria-hidden>
            ⛺
          </p>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Çadırına bağlan</h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-emerald-100">
            Organizatörün paylaştığı kamp kodu ve şifrenle giriş yap; listeni gör,
            görev al, sohbete katıl.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex min-h-[56px] w-full max-w-md items-center justify-center rounded-2xl bg-white px-8 text-xl font-bold text-emerald-800 shadow-lg transition-transform active:scale-[0.98] sm:w-auto sm:min-w-[320px]"
          >
            Çadıra Giriş Yap
          </Link>
        </div>
      </div>
    </section>
  );
}
