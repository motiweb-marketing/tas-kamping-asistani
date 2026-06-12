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
    title: 'Menü planı',
    body: 'Her gün ne yeneceğini yazın. AI ile düzenleyip katılımcılara yayınlayabilirsiniz.',
    bullets: [
      'Ham notlarınızı günlük kartlara yazın',
      'Yayınladıktan sonra herkes menüyü görür',
      'Menüden alışveriş listesi oluşturulur',
    ],
  },
  5: {
    title: 'Listeler',
    body: 'Üç liste katmanı: kişisel ihtiyaçlar, çadır ihtiyaçları ve kamp ihtiyaçları. Önce menü, sonra AI veya elle liste, en son yayın.',
    bullets: [
      '1 — Kişisel: her katılımcının kendi çantası',
      '2 — Çadır: aile/grup ekipmanı',
      '3 — Kamp: ortak alışveriş; çok çadırda adet ile üstlenme',
      'Menü → AI liste → kişisel/çadır düzenle → kamp listesini yayınla',
    ],
  },
  6: {
    title: 'Giriş bilgisini paylaş',
    body: 'Katılımcılara giriş adresini ve kendi kullanıcı adlarını gönderin. Şifreleri güvenli kanaldan iletin.',
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
