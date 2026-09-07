/**
 * Utilitas untuk menghitung rasio kontras WCAG 2.1 terhadap latar putih (#FFFFFF)
 */

export interface ContrastResult {
  ratio: number;
  label: string;
  status: 'optimal' | 'good' | 'poor';
  bgColorClass: string;
  textColorClass: string;
}

export function calculateContrastAgainstWhite(hexColor: string): ContrastResult {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) {
    return {
      ratio: 1.0,
      label: 'Rendah (1.0:1)',
      status: 'poor',
      bgColorClass: 'bg-red-100 border-red-800 text-red-800',
      textColorClass: 'text-red-800'
    };
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const L1 = 1.0; // White luminance
  const L2 = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];

  const ratio = parseFloat(((L1 + 0.05) / (L2 + 0.05)).toFixed(1));

  if (ratio >= 7.0) {
    return {
      ratio,
      label: `Scan Health: Optimal (${ratio}:1)`,
      status: 'optimal',
      bgColorClass: 'bg-[#D1FAE5] border-snip-ink text-[#065F46]',
      textColorClass: 'text-[#065F46]'
    };
  } else if (ratio >= 4.5) {
    return {
      ratio,
      label: `Scan Health: Cukup Baik (${ratio}:1)`,
      status: 'good',
      bgColorClass: 'bg-[#FEF3C7] border-snip-ink text-[#92400E]',
      textColorClass: 'text-[#92400E]'
    };
  } else {
    return {
      ratio,
      label: `Scan Health: Rendah (${ratio}:1)`,
      status: 'poor',
      bgColorClass: 'bg-[#FEE2E2] border-snip-ink text-[#991B1B]',
      textColorClass: 'text-[#991B1B]'
    };
  }
}
