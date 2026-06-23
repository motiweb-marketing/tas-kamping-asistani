export const ADMIN_TOUR_DONE_KEY = 'kamp-asistani-admin-tour-v2-done';
export const ADMIN_PULSE_KEY = 'kamp-asistani-show-admin-pulse';
export const LEADER_ACTIVE_KEY = 'kamp-asistani-leader-onboarding';

export interface LeaderBubble {
  step: number;
  title: string;
  body: string;
  cta?: string;
}

/** Kamp lideri konuşma balonu metinleri (0 = ilk /home karşılama) */
export const LEADER_SCRIPT: LeaderBubble[] = [
  {
    step: 0,
    title: 'Hoş geldin kamp lideri!',
    body: 'Sen bu kampın organizatörüsün. Önce katılımcıların göreceği ekrana bakacaksın; kuruluma sağ üstteki Admin düğmesinden devam edeceksin.',
    cta: 'Anladım',
  },
  {
    step: 1,
    title: '1. Adım — Kampımızı isimlendirelim',
    body: 'Kamp adı, konum ve tarihleri kontrol edin. Katılımcılar bu bilgileri görecek.',
    cta: 'Devam',
  },
  {
    step: 2,
    title: '2. Adım — Çadır ve kişiler',
    body: 'Çadır ekleyin ve her kişiyi bir çadıra yerleştirin. Herkese kullanıcı adı ve şifre vereceksiniz.',
    cta: 'Devam',
  },
  {
    step: 3,
    title: '3. Adım — Konaklama ücretleri',
    body: 'Tesis ücretini girin; bütçe sekmesinde çadırlar arası paylaşım buna göre hesaplanır.',
    cta: 'Devam',
  },
  {
    step: 4,
    title: '4. Adım — Menü ve AI listesi',
    body: 'Günleri planlayın, yemek listelerini yazın. Yapay zeka ile alışveriş listesini kolayca oluşturun.',
    cta: 'Devam',
  },
  {
    step: 5,
    title: '5. Adım — Listeleri kontrol et ve yayınla',
    body: 'Kişisel, çadır ve kamp listelerini kategorilere ayırıp son kontrol yapın; kamp listesini yayınlayın.',
    cta: 'Devam',
  },
  {
    step: 6,
    title: '6. Adım — Katılımcıları davet et',
    body: 'Kullanıcı adı ve şifreleri katılımcılarla paylaşın. Onları /login sayfasında ayrı bir panel bekliyor olacak.',
    cta: 'Kurulumu bitir',
  },
];

export function getLeaderBubble(step: number): LeaderBubble | undefined {
  return LEADER_SCRIPT.find((b) => b.step === step);
}

export function enableAdminPulse() {
  try {
    sessionStorage.setItem(ADMIN_PULSE_KEY, '1');
    sessionStorage.setItem(LEADER_ACTIVE_KEY, '1');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('kamp-admin-pulse'));
    }
  } catch {
    /* ignore */
  }
}

export function clearAdminPulse() {
  try {
    sessionStorage.removeItem(ADMIN_PULSE_KEY);
  } catch {
    /* ignore */
  }
}

export function shouldShowAdminPulse(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_PULSE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isLeaderOnboardingActive(): boolean {
  try {
    return sessionStorage.getItem(LEADER_ACTIVE_KEY) === '1';
  } catch {
    return false;
  }
}

export function completeLeaderOnboarding() {
  try {
    sessionStorage.removeItem(LEADER_ACTIVE_KEY);
    clearAdminPulse();
    markAdminTourDone();
  } catch {
    /* ignore */
  }
}

export interface TourStepTip {
  title: string;
  body: string;
  bullets?: string[];
}

export const TOUR_STEP_TIPS: Record<number, TourStepTip> = {
  1: {
    title: 'Kamp bilgileri',
    body: 'Kayıt ekranında girdiğiniz bilgiler burada. Kontrol edin; isterseniz düzenleyip kaydedin.',
    bullets: [
      'Kamp adı ve konum katılımcılara görünür',
      'Tarihler menü günlerini ve alışveriş listesini belirler',
    ],
  },
  2: {
    title: 'Çadırlar ve katılımcılar',
    body: 'Organizatör olarak siz zaten 1 kişi olarak eklendiniz. Kamplar genelde en az 2 kişiyle çalışır — şimdi ikinci katılımcıyı ekleyin.',
    bullets: [
      'Her çadır bir kart — tıklayınca içindekileri görürsünüz',
      'Her kişiye kullanıcı adı + şifre verirsiniz',
      'Katılımcılar telefonundan listeye, harcamaya ve nöbete bakar',
      'Deneme sürümünde 1 kişi daha ekleyebilirsiniz',
    ],
  },
  3: {
    title: 'Konaklama ücreti',
    body: 'Tesisin kişi başı ücretini girin. Bakiye sekmesinde çadırlar arası paylaşım buna göre hesaplanır.',
    bullets: ['Bilmiyorsanız 0 bırakın — sonra da ayarlayabilirsiniz', 'İsteğe bağlı: yetişkin / çocuk ayrımı'],
  },
  4: {
    title: 'Menü planlaması',
    body: 'Gün gün ne yeneceğini yazın. Hazır değilseniz şimdi atlayıp sonra hatırlatıcı ile tamamlayabilirsiniz.',
    bullets: [
      'Ham notlarınızı günlük kartlara yazın',
      'Menüden alışveriş listesi oluşturulur',
      'Atladıysanız sol menüden veya hatırlatıcıdan dönebilirsiniz',
    ],
  },
  5: {
    title: 'İhtiyaç listesi onayı',
    body: 'AI veya elle oluşturduğunuz listeleri kontrol edin. Kamp listesini yayınlamadan katılımcılar göremez.',
    bullets: [
      '1 — Kişisel: her katılımcının kendi çantası',
      '2 — Çadır: aile/grup ekipmanı',
      '3 — Kamp: ortak alışveriş; çok çadırda adet ile üstlenme',
      'Taslakları inceleyin → düzenleyin → yayınlayın',
    ],
  },
  6: {
    title: 'Özet ve davet',
    body: 'Kamp özetini kontrol edin, eksikleri tamamlayın ve katılımcılara giriş bilgisini gönderin.',
    bullets: [
      'Giriş adresi: sitedeki /login sayfası',
      'Her kişinin kullanıcı adı farklıdır',
      'WhatsApp veya SMS ile tek tek veya toplu kopyalayın',
    ],
  },
};

export function markAdminTourDone() {
  try {
    localStorage.setItem(ADMIN_TOUR_DONE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isAdminTourDone(): boolean {
  try {
    return !!localStorage.getItem(ADMIN_TOUR_DONE_KEY);
  } catch {
    return false;
  }
}
