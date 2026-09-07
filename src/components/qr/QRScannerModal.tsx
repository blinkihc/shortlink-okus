import { useState, useRef } from 'react';
import { X, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/library';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanned: (resultText: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanned }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  if (!isOpen) return null;

  const startCamera = async () => {
    setErrorMsg(null);
    setScannedResult(null);
    setIsScanning(true);

    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        setErrorMsg('Tidak ada perangkat kamera yang terdeteksi.');
        setIsScanning(false);
        return;
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const text = result.getText();
            setScannedResult(text);
            stopCamera();
            onScanned(text);
          }
          if (err && !(err.name === 'NotFoundException')) {
            // Suppress continuous not found errors
          }
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses.';
      setErrorMsg(msg);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-snip-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-snip-surface border-3 border-snip-ink rounded-lg shadow-neo-deep w-full max-w-[400px] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-snip-ink pb-2">
          <div className="font-extrabold text-sm text-snip-ink flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-snip-primary" />
            <span>Pemindai Kode QR Kamera</span>
          </div>
          <button 
            type="button" 
            onClick={handleClose}
            className="p-1 text-snip-ink hover:bg-snip-muted rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <div className="relative w-full aspect-square bg-snip-ink rounded-md overflow-hidden border-2 border-snip-ink flex items-center justify-center">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              muted 
              playsInline 
            />

            {!isScanning && !scannedResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-snip-surface/90">
                <Camera className="w-12 h-12 text-snip-ink mb-2" />
                <p className="text-xs font-bold text-snip-ink mb-3">
                  Arahkan kamera ke kode QR fisik atau cetak untuk membaca target link.
                </p>
                <button 
                  type="button" 
                  onClick={startCamera} 
                  className="btn-neo-primary btn-neo-sm"
                >
                  Aktifkan Kamera
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-4 border-2 border-dashed border-snip-accent rounded pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-bold text-white bg-snip-ink/80 px-2 py-0.5 rounded">
                  Memindai...
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="w-full bg-red-100 border border-snip-danger text-snip-danger text-xs p-2 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {scannedResult && (
            <div className="w-full bg-green-100 border border-snip-success text-snip-success text-xs p-2 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Hasil: {scannedResult}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t-2 border-snip-ink">
          {isScanning && (
            <button type="button" onClick={stopCamera} className="btn-neo-surface btn-neo-sm">
              Hentikan Kamera
            </button>
          )}
          <button type="button" onClick={handleClose} className="btn-neo-accent btn-neo-sm">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
