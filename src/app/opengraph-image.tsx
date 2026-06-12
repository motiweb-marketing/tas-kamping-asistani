import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site-config';

export const runtime = 'edge';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = SITE.name;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          color: 'white',
          padding: 48,
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 24 }}>⛺</div>
        <div style={{ fontSize: 56, fontWeight: 700 }}>{SITE.name}</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.9 }}>{SITE.tagline}</div>
      </div>
    ),
    { ...size }
  );
}
