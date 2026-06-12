'use client';

import ContactCtaButtons from '@/components/landing/ContactCtaButtons';
import AuthButton from '@/components/auth/AuthButton';

interface TentUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason: 'tent' | 'user';
}

export default function TentUpgradeModal({ open, onClose, reason }: TentUpgradeModalProps) {
  if (!open) return null;

  const title =
    reason === 'tent'
      ? 'Deneme sürümünde 1 çadır hakkınız var'
      : 'Deneme sürümünde kişi limitine ulaştınız';

  const body =
    reason === 'tent'
      ? 'İkinci bir çadır eklemek için Pro sürüme geçmeniz gerekiyor. Mevcut giriş bilgileriniz aynı kalır — sadece limitler açılır.'
      : 'Daha fazla katılımcı eklemek için Pro sürüme geçin. Ödeme sonrası aynı hesabınızla devam edersiniz.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
      >
        <p className="text-2xl" aria-hidden>
          ⛺
        </p>
        <h2 id="upgrade-title" className="mt-2 font-display text-lg font-bold text-forest-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-forest-700">{body}</p>
        <ContactCtaButtons
          message="Kamp Asistanı Pro — daha fazla çadır ve kişi eklemek istiyorum."
          subject="Kamp Asistanı Pro"
          className="mt-4"
        />
        <AuthButton type="button" variant="secondary" onClick={onClose} className="mt-4 w-full">
          Tamam
        </AuthButton>
      </div>
    </div>
  );
}
