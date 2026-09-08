import QRCode from 'qrcode';
import type { QrStudioConfig } from '../types';
import { APP_CONFIG } from '../config/appConfig';

export function getQRMatrix(text: string, ecLevel: 'L' | 'M' | 'Q' | 'H' = 'H'): number[][] {
  const cleanText = text.trim() || APP_CONFIG.baseUrl;
  try {
    const qr = QRCode.create(cleanText, { errorCorrectionLevel: ecLevel });
    const size = qr.modules.size;
    const matrix: number[][] = [];

    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      for (let c = 0; c < size; c++) {
        row.push(qr.modules.get(r, c) ? 1 : 0);
      }
      matrix.push(row);
    }
    return matrix;
  } catch (err) {
    console.error('Gagal generate QR matrix:', err);
    // Fallback minimal matrix
    return Array.from({ length: 25 }, () => Array(25).fill(0));
  }
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  config: QrStudioConfig
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const matrix = getQRMatrix(text, config.ecLevel);
  const size = matrix.length;

  // Clear & Solid Background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = config.bgColor || '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const padding = 14;
  const usableWidth = width - padding * 2;
  const cellSize = usableWidth / size;

  ctx.fillStyle = config.fgColor;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;

        if (config.moduleStyle === 'dot') {
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, (cellSize / 2) * 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else if (config.moduleStyle === 'squircle') {
          const rad = cellSize * 0.35;
          drawRoundedRect(ctx, x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, rad);
          ctx.fill();
        } else {
          // Chunky Block
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
}

export function generateQRSvgString(text: string, config: QrStudioConfig): string {
  const matrix = getQRMatrix(text, config.ecLevel);
  const size = matrix.length;
  const cellSize = 16;
  const padding = 24;
  const totalDim = size * cellSize + padding * 2;

  let elements = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        if (config.moduleStyle === 'dot') {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const rad = (cellSize / 2) * 0.9;
          elements += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${config.fgColor}" />\n`;
        } else if (config.moduleStyle === 'squircle') {
          elements += `<rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" rx="${cellSize * 0.35}" fill="${config.fgColor}" />\n`;
        } else {
          elements += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${config.fgColor}" />\n`;
        }
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="${totalDim}" height="${totalDim}">
  <rect width="${totalDim}" height="${totalDim}" fill="${config.bgColor || '#FFFFFF'}"/>
  ${elements}
</svg>`;
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  // Create high-res 800x800 canvas for 300 DPI ready
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 800;
  exportCanvas.height = 800;
  const expCtx = exportCanvas.getContext('2d');
  if (!expCtx) return;

  expCtx.fillStyle = '#FFFFFF';
  expCtx.fillRect(0, 0, 800, 800);
  expCtx.drawImage(canvas, 40, 40, 720, 720);

  const dataUrl = exportCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function downloadSvgString(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
