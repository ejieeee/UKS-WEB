import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, Sparkles } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string | null) => void;
  hasSignature: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, hasSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!hasSignature);
  const [isSaved, setIsSaved] = useState(hasSignature);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 500;
    const height = rect.height > 0 ? rect.height : 180;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#343630'; // Charcoal ink
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (isEmpty) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setIsEmpty(false);
    setIsSaved(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
    }

    setIsDrawing(false);

    // Save signature data URL
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    setIsSaved(true);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setIsEmpty(true);
    setIsSaved(false);
    onSave(null);
  };

  const handleManualSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    setIsSaved(true);
  };

  const handleGenerateSample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = '#343630';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(45, 100);
    ctx.bezierCurveTo(75, 45, 105, 130, 145, 80);
    ctx.bezierCurveTo(165, 55, 195, 120, 235, 95);
    ctx.lineTo(285, 95);
    ctx.moveTo(65, 120);
    ctx.lineTo(265, 115);
    ctx.stroke();

    setIsEmpty(false);
    setIsSaved(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-[#343630] flex items-center gap-1.5 font-sans">
          <PenTool className="w-3.5 h-3.5 text-[#984B50]" />
          <span>Tanda Tangan Digital</span>
          <span className="text-[#984B50]">*</span>
        </label>
        <span className="text-[11px] font-editorial italic text-[#85847D]">
          Bubuhi paraf menggunakan jari atau tetikus
        </span>
      </div>

      <div className="relative border border-[#EAE3D7] rounded-xl bg-[#FFFDF8] overflow-hidden shadow-inner focus-within:border-[#984B50] transition-colors">
        <canvas
          ref={canvasRef}
          className="w-full h-44 touch-none cursor-crosshair block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[#85847D]/60 select-none">
            <PenTool className="w-6 h-6 mb-1 opacity-40 text-[#984B50]" />
            <p className="text-xs font-editorial italic">Bubuhi tanda tangan Anda di lembar ini</p>
            <p className="text-[10px] text-[#85847D]/50 mt-0.5">Area kanvas presensi</p>
          </div>
        )}

        {/* Paper signature hairline */}
        <div className="absolute bottom-6 left-8 right-8 border-b border-[#EAE3D7]/80 pointer-events-none"></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#343630] bg-[#EAE3D7] hover:bg-[#ded6c7] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5 text-[#85847D]" />
            <span>Hapus</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateSample}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#77846B] hover:text-[#343630] bg-[#FFFDF8] hover:bg-[#EAE3D7]/40 border border-[#EAE3D7] rounded-lg transition-colors cursor-pointer"
            title="Bubuhkan paraf otomatis"
          >
            <Sparkles className="w-3 h-3 text-[#A5B19B]" />
            Contoh Tanda Tangan
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && !isEmpty && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#77846B] bg-[#A5B19B]/15 px-2.5 py-1 rounded-md border border-[#A5B19B]/30">
              <Check className="w-3 h-3 text-[#77846B]" />
              Paraf Terbaca
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
