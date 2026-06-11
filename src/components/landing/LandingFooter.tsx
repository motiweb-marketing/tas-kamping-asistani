export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 py-10 text-gray-400">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="text-lg font-semibold text-white">Taş Kamping Asistanı</p>
        <p className="mt-2 text-sm">
          Mobil cihazınızdan ana ekrana ekleyerek uygulama gibi kullanabilirsiniz.
        </p>
        <p className="mt-4 text-xs text-gray-500">
          Görseller:{' '}
          <a
            href="https://unsplash.com"
            className="underline hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
        </p>
      </div>
    </footer>
  );
}
