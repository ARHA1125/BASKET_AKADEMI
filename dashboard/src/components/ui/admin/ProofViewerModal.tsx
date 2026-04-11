'use client';

import { ProofViewerModalProps } from '@/types/verification';
import { CheckCircle, Loader2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { FC, useState } from 'react';
import { createPortal } from 'react-dom';

import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export const ProofViewerModal: FC<ProofViewerModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onVerify,
  apiUrl
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [scale, setScale] = useState(1);

  const minScale = 1;
  const maxScale = 3;
  const scaleStep = 0.25;

  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy], cancel }) => {
      // Swipe down to dismiss
      if (my > 150 && vy > 0.5 && !down) {
        setScale(1);
        onClose();
        // Reset immediately so next open starts fresh
        api.start({ y: 0, immediate: true });
        return;
      }
      
      api.start({
        y: down ? Math.max(0, my) : 0,
        immediate: down,
        config: { tension: 300, friction: down ? 40 : 25 }
      });
    },
    { axis: 'y', filterTaps: true, rubberband: true }
  );

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setScale((current) => Math.min(maxScale, current + scaleStep));
  };

  const handleZoomOut = () => {
    setScale((current) => Math.max(minScale, current - scaleStep));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handleClose = () => {
    handleResetZoom();
    onClose();
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await onVerify(invoice.id, 'TRANSFER', invoice.uniqueAmount || invoice.amount);
      handleClose();
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <animated.div 
        {...bind()}
        style={{ y, touchAction: 'none' }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex will-change-transform cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-8 flex flex-col overflow-hidden">
          {invoice.photoUrl ? (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:bg-slate-800/80">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Payment Proof</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Zoom to inspect the uploaded transfer proof.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= minScale}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="min-w-14 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= maxScale}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  disabled={scale === 1}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Reset zoom"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-1 items-center justify-center overflow-auto pointer-events-none">
            {invoice.photoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`${apiUrl}/${invoice.photoUrl}`}
                  alt="Payment Proof"
                  className="max-w-full h-auto rounded-lg shadow-lg pointer-events-auto transition-transform duration-200 ease-out"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
                />
              </>
            ) : (
              <p className="text-slate-500">No proof image available</p>
            )}
          </div>
        </div>
        
        <div className="w-96 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bukti Pembayaran</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Invoice ID</p>
              <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{invoice.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Siswa</p>
              <p className="font-semibold text-slate-900 dark:text-white">{invoice.student}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Jumlah</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(invoice.amount)}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tanggal Invoice</p>
              <p className="font-semibold text-slate-900 dark:text-white">{formatDate(invoice.date)}</p>
            </div>

            {invoice.isVerified && invoice.verifiedAt && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Terverifikasi</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                  {formatDate(invoice.verifiedAt)}
                </p>
              </div>
            )}
          </div>

          {!invoice.isVerified && (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Verifikasi Pembayaran</span>
                </>
              )}
            </button>
          )}
        </div>
      </animated.div>
    </div>
  );

  return createPortal(modal, document.body);
};
