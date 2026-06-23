'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Heart,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Smartphone,
  Sparkles,
  Tent,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useState } from 'react';
import ContactCtaButtons from './ContactCtaButtons';
import LandingPreviewSection from './LandingPreviewSection';
import { BENTO_FEATURES, FAQS, HOW_STEPS, TESTIMONIALS } from './landing-data';
import { mailtoUrl, SITE, whatsAppUrl } from '@/lib/site-config';

const BENTO_ICONS = [
  CheckSquare,
  Users,
  DollarSign,
  Clock,
  UtensilsCrossed,
  MessageSquare,
  BarChart3,
  Smartphone,
];

export default function LandingPage() {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const wa = whatsAppUrl('Kamp Asistanı tam sürüm hakkında bilgi almak istiyorum.');
  const mail = mailtoUrl('Kamp Asistanı — Tam sürüm');

  return (
    <div className="min-h-screen overflow-x-hidden bg-sand-50 selection:bg-forest-200 selection:text-forest-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-forest-100 bg-sand-50/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollToSection('hero-sec')}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-800 text-sand-100 shadow-sm">
              <Tent className="h-5 w-5 text-sand-200" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display text-base font-extrabold leading-none tracking-tight text-forest-950">
                {SITE.name}
              </span>
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-forest-500">
                Outdoor Organizer
              </span>
            </div>
          </button>

          <nav className="hidden items-center gap-7 text-xs font-semibold text-forest-800 md:flex">
            {[
              ['why-sec', 'Kritik Çözümler'],
              ['features-sec', 'Özellikler'],
              ['how-sec', 'Nasıl Çalışır?'],
              ['demo-sec', 'Önizleme'],
              ['pricing-sec', 'Paketler'],
              ['faq-sec', 'S.S.S.'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="cursor-pointer transition-colors hover:text-forest-600"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-xs font-bold text-forest-800 transition-all hover:bg-forest-50 hover:text-forest-950"
            >
              Çadıra Giriş Yap
            </Link>
            <Link
              href="/setup"
              className="rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:from-forest-800 hover:to-forest-900"
            >
              Ücretsiz Dene
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-forest-800 hover:bg-forest-100 md:hidden"
            aria-label="Menü"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col justify-between border-l border-forest-100 bg-white p-6 shadow-2xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-forest-950">Menü</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-full p-1.5 text-forest-400 hover:bg-forest-50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4 text-sm font-semibold text-forest-800">
                {[
                  ['why-sec', 'Kritik Çözümler'],
                  ['features-sec', 'Özellikler'],
                  ['how-sec', 'Nasıl Çalışır?'],
                  ['demo-sec', 'Önizleme'],
                  ['pricing-sec', 'Paketler'],
                  ['faq-sec', 'S.S.S.'],
                ].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => scrollToSection(id)} className="py-1 text-left hover:text-forest-950">
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <Link href="/login" className="block w-full rounded-xl border border-forest-100 py-2.5 text-center text-xs font-bold text-forest-800">
                Çadıra Giriş Yap
              </Link>
              <Link href="/setup" className="block w-full rounded-xl bg-forest-800 py-2.5 text-center text-xs font-bold text-white">
                Ücretsiz Dene
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-20" id="hero-sec">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 text-left lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-800"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-forest-600" />
                Düzensiz WhatsApp gruplarına son verin
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl font-extrabold leading-none tracking-tight text-forest-950 sm:text-5xl lg:text-6xl"
              >
                Malzeme, nöbet, harcama ve sohbet —{' '}
                <span className="relative inline-block text-forest-600">
                  tek uygulamada
                  <span className="absolute bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-forest-400 to-forest-600" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl text-sm font-normal leading-relaxed text-forest-700 sm:text-base"
              >
                WhatsApp kalabalığında kaybolmayın. Menüyü yazın, üç katmanlı listeleri oluşturun (kişisel, çadır,
                kamp), çadırlar üstlensin, harcamaları adil bölüşün.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-3 pt-2 sm:flex-row"
              >
                <Link
                  href="/setup"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-forest-800 px-6 py-3 text-xs font-bold text-sand-100 shadow-md transition-all hover:bg-forest-900 hover:shadow-lg"
                >
                  Ücretsiz Dene
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-forest-200 bg-white px-6 py-3 text-xs font-bold text-forest-800 shadow-sm transition-all hover:bg-forest-50/50"
                >
                  Çadıra Giriş
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 pl-1 text-[11px] font-medium text-forest-500"
              >
                <span>✨ Kurulum ve kredi kartı yok</span>
                <span>•</span>
                <span>🏕️ Kullanıcı adı ile giriş</span>
                <span>•</span>
                <span>🧑‍🤝‍🧑 Deneme: 1 çadır, 2 kişi</span>
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="relative lg:col-span-5"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -left-6 -top-4 z-10 flex max-w-xs items-center gap-2.5 rounded-2xl border border-forest-100/60 bg-white p-3 shadow-xl"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  C
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-forest-400">Malzeme listesi</div>
                  <div className="text-xs font-semibold text-forest-900">Ceren: Sandalye üstlendi ✅</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: 'easeInOut' }}
                className="absolute -bottom-5 -right-2 z-10 flex max-w-xs items-center gap-2.5 rounded-2xl border border-forest-800 bg-forest-900 p-3 text-white shadow-xl"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                  ⚖️
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-forest-300">Bakiye</div>
                  <div className="text-xs font-semibold text-sand-100">Çadır A — alacaklı +120 ₺</div>
                </div>
              </motion.div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-4 border-white bg-forest-50 shadow-2xl">
                <Image
                  src="/landing/camping-hero.jpg"
                  alt="Orman içinde kamp çadırı ve ateş"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-forest-100 bg-white py-20" id="why-sec">
        <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-medium text-forest-950 sm:text-3xl">
              Kamp organizasyonu neden bu kadar zor?
            </h2>
            <p className="mx-auto max-w-xl text-sm text-forest-600">
              Aile kamplarında en çok yaşanan sorunlar — ve {SITE.name} ile çözümü
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-5 rounded-3xl border border-red-100 bg-red-50/40 p-6 text-left md:p-8">
              <h3 className="font-display text-lg font-bold text-red-900">❌ Kalabalık WhatsApp yönetimi</h3>
              <ul className="space-y-3.5 text-xs text-red-800">
                <li><strong>Kayıp listeler:</strong> Kimin ne getireceği sohbet akışında kaybolur.</li>
                <li><strong>Market karışıklığı:</strong> Aynı malzeme iki kez alınır veya kritik şey unutulur.</li>
                <li><strong>Nöbet tartışmaları:</strong> Elle yapılan planlarda adalet tartışması çıkar.</li>
                <li><strong>Bakiye çilesi:</strong> Kağıt kalemle bölüştürme saatler sürer.</li>
              </ul>
            </div>
            <div className="space-y-5 rounded-3xl border border-forest-100 bg-forest-50/50 p-6 text-left shadow-sm md:p-8">
              <h3 className="font-display text-lg font-bold text-forest-900">✅ {SITE.name} çözümü</h3>
              <ul className="space-y-3.5 text-xs text-forest-800">
                {[
                  'Üç liste: kişisel, çadır ve kamp ihtiyaçları',
                  'Menü → AI liste → düzenle → yayınla akışı',
                  'Nöbet planı — çadır başına adil dağılım',
                  'Harcama ve bakiye — otomatik paylaşım hesabı',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-sand-50 py-24" id="features-sec">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-600">Tüm arsenal</span>
            <h2 className="font-display text-3xl font-black tracking-tight text-forest-950 sm:text-4xl">
              Kamp alanındaki her şey tek yerde
            </h2>
            <p className="text-xs text-forest-600 sm:text-sm">
              Mobil öncelikli, büyük butonlar — kamp alanında telefondan rahat kullanım
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENTO_FEATURES.map((feature, index) => {
              const Icon = BENTO_ICONS[index] || CheckSquare;
              return (
                <motion.div
                  key={feature.title}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex flex-col justify-between space-y-3 rounded-2xl border border-forest-100 bg-white p-6 shadow-sm transition-colors hover:border-forest-300"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50/80">
                    <Icon className="h-5 w-5 text-forest-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xs font-extrabold uppercase tracking-wide text-forest-900">
                      {feature.title}
                    </h3>
                    <p className="text-xs font-normal leading-relaxed text-forest-700">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How */}
      <section className="border-y border-forest-100 bg-white py-24" id="how-sec">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-600">Sadece 3 adım</span>
            <h2 className="font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
              Sistem nasıl çalışır?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_STEPS.map((s) => (
              <div key={s.step} className="relative space-y-4 text-center md:text-left">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-forest-200 bg-forest-100 font-display text-lg font-bold text-forest-900 shadow-sm md:mx-0">
                  {s.step}
                </div>
                <h3 className="font-display text-base font-bold text-forest-900">{s.title}</h3>
                <p className="text-xs leading-relaxed text-forest-700">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingPreviewSection />

      {/* Pricing */}
      <section className="border-y border-forest-100 bg-white py-24" id="pricing-sec">
        <div className="mx-auto max-w-5xl space-y-14 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest-600">Esnek planlar</span>
            <h2 className="font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
              Önce deneyin, sonra karar verin
            </h2>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 items-stretch gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-between space-y-6 rounded-3xl border border-forest-100 bg-white p-8 shadow-sm transition-colors hover:border-forest-300">
              <div className="space-y-4">
                <span className="inline-flex rounded bg-sand-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-800">
                  Deneme sürümü
                </span>
                <div>
                  <span className="font-display text-4xl font-black text-forest-950">0 ₺</span>
                </div>
                <ul className="space-y-2 text-xs text-forest-700">
                  <li>✔️ 1 çadır, en fazla 2 kişi</li>
                  <li>✔️ Tüm özellikler: liste, AI, harcama, nöbet, chat</li>
                  <li>✔️ Kredi kartı gerekmez</li>
                </ul>
              </div>
              <Link
                href="/setup"
                className="w-full rounded-xl bg-forest-100 py-3 text-center text-xs font-bold text-forest-800 transition-all hover:bg-forest-200"
              >
                Hemen başla
              </Link>
            </div>

            <div className="relative flex flex-col justify-between space-y-6 overflow-hidden rounded-3xl border border-forest-800 bg-forest-950 p-8 text-white transition-colors hover:border-forest-700">
              <div className="absolute right-0 top-0 translate-x-7 translate-y-4 rotate-45 bg-amber-500 px-8 py-1.5 text-[9px] font-black uppercase tracking-widest text-forest-950">
                Popüler
              </div>
              <div className="space-y-4">
                <span className="inline-flex rounded border border-forest-800 bg-forest-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-sand-100">
                  Tam sürüm
                </span>
                <div className="font-display text-2xl font-black text-sand-100">İletişime geçin</div>
                <ul className="space-y-2 text-xs text-forest-200">
                  <li>✔️ Sınırsız çadır ve katılımcı</li>
                  <li>✔️ Büyük kamplar için tam destek</li>
                  <li>✔️ Öncelikli kurulum yardımı</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-3 text-center text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    WhatsApp
                  </a>
                ) : (
                  <span className="rounded-xl bg-forest-800 py-3 text-center text-xs text-forest-400">WhatsApp yakında</span>
                )}
                {mail ? (
                  <a
                    href={mail}
                    className="flex items-center justify-center gap-1 rounded-xl bg-white py-3 text-center text-xs font-bold text-forest-950 hover:bg-sand-100"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    E-posta
                  </a>
                ) : (
                  <span className="rounded-xl bg-forest-800 py-3 text-center text-xs text-forest-400">E-posta yakında</span>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-5 rounded-3xl border border-forest-100 bg-forest-50 p-6 shadow-sm md:flex-row">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-display text-sm font-extrabold uppercase tracking-tight text-forest-900">
                Zaten davet edildiniz mi?
              </h4>
              <p className="text-xs leading-normal text-forest-700">
                Organizatörün verdiği kullanıcı adı ve şifre ile giriş yapın.
              </p>
            </div>
            <Link
              href="/login"
              className="shrink-0 rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-bold text-sand-100 hover:bg-forest-950"
            >
              Çadıra Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-sand-50 py-24" id="testimonials-sec">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-600">Kampçılar</span>
            <h2 className="font-display text-3xl font-medium tracking-tight text-forest-950 sm:text-4xl">
              Doğa severlerin yorumları
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between space-y-4 rounded-2xl border border-forest-100 bg-white p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-500">{'★'.repeat(t.rating)}</div>
                  <p className="text-xs italic leading-relaxed text-forest-700">&ldquo;{t.comment}&rdquo;</p>
                </div>
                <div className="border-t border-forest-50 pt-3">
                  <h4 className="font-display text-xs font-bold text-forest-900">{t.name}</h4>
                  <span className="text-[10px] font-medium text-forest-400">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-forest-100 bg-white py-24" id="faq-sec">
        <div className="mx-auto max-w-4xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest-600">Merak edilenler</span>
            <h2 className="font-display text-2xl font-medium tracking-tight text-forest-950 sm:text-3xl">
              Sıkça sorulan sorular
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-forest-100 bg-sand-50/50 transition-colors hover:border-forest-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left text-xs font-bold text-forest-900 md:p-5"
                  >
                    <span>{faq.question}</span>
                    <span className="shrink-0 rounded-lg bg-white p-1 text-forest-500 shadow-sm">
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-forest-100/50"
                      >
                        <p className="bg-white p-4 text-left text-xs font-normal leading-relaxed text-forest-700 md:p-5">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-forest-100 bg-forest-50 py-16" id="iletisim">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-forest-950">Tam sürüm veya sorularınız mı var?</h2>
          <p className="mt-3 text-sm text-forest-600">{SITE.description}</p>
          <ContactCtaButtons className="mt-8 justify-center" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-950 py-14 text-white">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-forest-900 pb-8 md:flex-row md:items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-forest-800 bg-forest-900 text-sand-100 shadow-sm">
                <Tent className="h-5 w-5 text-sand-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-extrabold leading-none tracking-tight text-sand-50">
                  {SITE.name}
                </span>
                <span className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-forest-400">
                  {SITE.tagline}
                </span>
              </div>
            </div>
            <p className="max-w-sm text-xs text-forest-300">{SITE.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 text-xs text-forest-400 md:grid-cols-4">
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-sand-100">Hızlı linkler</h4>
              <ul className="space-y-1.5">
                <li><Link href="/setup" className="hover:text-white">Ücretsiz dene</Link></li>
                <li><Link href="/login" className="hover:text-white">Giriş yap</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-sand-100">Sayfa</h4>
              <ul className="space-y-1.5">
                <li><button type="button" onClick={() => scrollToSection('features-sec')} className="hover:text-white">Özellikler</button></li>
                <li><button type="button" onClick={() => scrollToSection('faq-sec')} className="hover:text-white">S.S.S.</button></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-sand-100">İletişim</h4>
              <ul className="space-y-1.5">
                {SITE.contactEmail && (
                  <li>
                    <a href={`mailto:${SITE.contactEmail}`} className="hover:text-white">
                      {SITE.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-sand-100">PWA</h4>
              <p className="text-[11px] leading-normal text-forest-500">
                Ana ekrana ekleyerek uygulama gibi kullanabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between border-t border-forest-900 pt-6 text-[10px] text-forest-500 md:flex-row">
            <span>© {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.</span>
            <span className="flex items-center gap-1">
              Doğayı severek hazırlandı <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
