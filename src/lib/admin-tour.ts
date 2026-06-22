export const ADMIN_TOUR_DONE_KEY = 'kamp-asistani-admin-tour-v2-done';

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
