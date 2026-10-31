import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  Flashlight,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Wifi,
  Ticket,
  Maximize2,
} from 'lucide-react';
import jsQR from 'jsqr';
import { parseQrCode, type ParsedQrResult } from '../../lib/qrParser.ts';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: ParsedQrResult) => void;
  title?: string;
  hint?: string;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan WiFi or Voucher QR Code',
  hint = 'Point camera at your voucher card, printed receipt, or router hotspot QR',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<ParsedQrResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Play audio confirmation beep via Web Audio API
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Trigger brief haptic vibration
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // ignore
      }
    }
  };

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  }, []);

  // Handle successful QR detection
  const handleDetectedCode = useCallback(
    (codeData: string) => {
      const parsed = parseQrCode(codeData);
      setScannedResult(parsed);
      playBeep();
      triggerHaptic();

      // Pause continuous scanning loop
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      // Automatically notify parent after short visual confirmation
      setTimeout(() => {
        onScan(parsed);
        stopCamera();
        onClose();
      }, 750);
    },
    [onScan, onClose, stopCamera]
  );

  // Core scanning frame tick
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim().length > 0) {
          handleDetectedCode(code.data);
          return;
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetectedCode]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage('');
    setScannedResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Camera access is not supported on this browser or platform.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check if torch/flashlight capability is present
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities = track.getCapabilities() as any;
        setTorchAvailable(Boolean(capabilities?.torch));
      } else {
        setTorchAvailable(false);
      }

      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera permission was denied. You can allow camera access in browser settings or upload an image below.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware was found on this device. Please upload a photo instead.');
      } else {
        setErrorMessage(
          err.message || 'Unable to access camera feed. Please upload an image file of the QR code.'
        );
      }
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedResult(null);
      setErrorMessage('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Toggle flashlight / torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && typeof track.applyConstraints === 'function') {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Could not toggle flashlight:', err);
      }
    }
  };

  // Flip front/back camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File Upload / Photo Snapshot Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          setIsProcessingFile(false);
          setErrorMessage('Failed to process image canvas.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsProcessingFile(false);

        if (code && code.data && code.data.trim().length > 0) {
          handleDetectedCode(code.data);
        } else {
          setErrorMessage(
            'No valid QR code was detected in this photo. Please make sure the code is clearly visible and well-lit.'
          );
        }
      };

      img.onerror = () => {
        setIsProcessingFile(false);
        setErrorMessage('Failed to load image file. Please try another photo.');
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    // Reset file input value so user can re-select same file if needed
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-400">Fast Auto-Focus Scanner</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative w-full bg-black aspect-[4/3] sm:aspect-square flex items-center justify-center overflow-hidden">
          {/* Real-time Video Stream */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              hasPermission ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Viewfinder Target Framing UI (Only shown when camera is active) */}
          {hasPermission && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer darkened vignette */}
              <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[0.5px]" />

              {/* Central scanning cutout box */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_0_9999px_rgba(2,6,23,0.55)]">
                {/* Glowing Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                {/* Animated Horizontal Laser Scanning Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#fbbf24] animate-[scanLaser_2.4s_ease-in-out_infinite]" />

                {/* Subtitle inside viewfinder */}
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-slate-950/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Align QR Inside Box
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Detected Overlay Banner */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
                QR Code Captured!
              </div>
              <div className="text-base font-black text-white mt-1 break-all max-w-xs font-mono">
                {scannedResult.voucherCode || scannedResult.displaySummary}
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-1">Applying credentials...</p>
            </div>
          )}

          {/* Error / Fallback View (Permission Denied or No Hardware) */}
          {hasPermission === false && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900/95 z-20 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Camera Feed Unavailable</h4>
                <p className="text-xs text-slate-400 max-w-xs">{errorMessage}</p>
              </div>

              <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo / Take Picture</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Retry Camera Permission
                </button>
              </div>
            </div>
          )}

          {/* On-Camera Floating Controls (Torch & Camera Flip) */}
          {hasPermission && !scannedResult && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {torchAvailable && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                    torchOn
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30'
                      : 'bg-slate-900/70 text-white border-slate-700 hover:bg-slate-800'
                  }`}
                  title={torchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                >
                  <Flashlight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={flipCamera}
                className="p-2.5 rounded-full bg-slate-900/70 text-white border border-slate-700 hover:bg-slate-800 backdrop-blur-md transition-all"
                title="Switch Camera (Front/Back)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3">
          <p className="text-xs text-center text-slate-400 font-medium">{hint}</p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="flex-1 py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>{isProcessingFile ? 'Analyzing Photo...' : 'Scan from Photo/File'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
