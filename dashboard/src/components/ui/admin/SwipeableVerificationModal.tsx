'use client';

import { formatIDR } from '@/components/ui/notifications/Common';
import { SwipeableVerificationModalProps } from '@/types/verification';
import { formatUniqueAmount } from '@/utils/formatUniqueAmount';
import {
  Banknote,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export function SwipeableVerificationModal({
  invoices,
  startIndex = 0,
  isOpen,
  onClose,
  onVerify,
  apiUrl,
}: SwipeableVerificationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'CASH'>('TRANSFER');
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentInvoice = invoices[currentIndex];
  const totalInvoices = invoices.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      api.start({ x: 0, from: { x: -300 } });
      setCurrentIndex(currentIndex - 1);
      setPaymentMethod('TRANSFER');
    }
  }, [currentIndex, api]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalInvoices - 1) {
      api.start({ x: 0, from: { x: 300 } });
      setCurrentIndex(currentIndex + 1);
      setPaymentMethod('TRANSFER');
    }
  }, [currentIndex, totalInvoices, api]);

  const bind = useDrag(
    ({ down, movement: [mx], direction: [dx], velocity: [vx], cancel }) => {
      // Threshold for swipe
      if (down && Math.abs(mx) > 100 && vx > 0.5) {
        cancel();
        if (dx > 0 && currentIndex > 0) {
          handlePrevious();
        } else if (dx < 0 && currentIndex < totalInvoices - 1) {
          handleNext();
        } else {
          // Bounce back if at ends
          api.start({ x: 0, config: { tension: 400, friction: 25 } });
        }
        return;
      }
      
      const isOutOfBounds = 
        (currentIndex === 0 && mx > 0) || 
        (currentIndex === totalInvoices - 1 && mx < 0);
        
      api.start({
        x: down ? (isOutOfBounds ? mx * 0.2 : mx) : 0,
        immediate: down,
        config: { tension: 300, friction: down ? 40 : 25 }
      });
    },
    { axis: 'x', filterTaps: true, rubberband: true }
  );


  const handleVerify = async () => {
    if (!currentInvoice) return;

    setIsVerifying(true);
    try {
      const paidAmount = paymentMethod === 'TRANSFER' 
        ? currentInvoice.uniqueAmount 
        : currentInvoice.amount;

      await onVerify(currentInvoice.id, paymentMethod, paidAmount);

      const nextUnverifiedIndex = invoices.findIndex(
        (inv, idx) => idx > currentIndex && !inv.isVerified
      );

      if (nextUnverifiedIndex !== -1) {
        api.start({ x: 0, from: { x: 300 } });
        setCurrentIndex(nextUnverifiedIndex);
        setPaymentMethod('TRANSFER');
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' && !isVerifying) {
        e.preventDefault();
        handleVerify();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, handlePrevious, handleNext, handleVerify, isVerifying, onClose]);

  if (!isOpen || !currentInvoice || !mounted) return null;

  const { baseAmount, uniqueAmount, uniqueCode } = formatUniqueAmount(
    currentInvoice.amount,
    currentInvoice.uniqueCode
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <animated.div 
        {...bind()}
        style={{ x, touchAction: 'none' }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto will-change-transform cursor-grab active:cursor-grabbing"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10 pointer-events-none">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Invoice Verification
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentIndex + 1} of {totalInvoices} invoices
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors pointer-events-auto"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/30">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                  Invoice ID
                </p>
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                  #{currentInvoice.id.substring(0, 12)}...
                </p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                  Student
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {currentInvoice.student}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                    Base Amount
                  </p>
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                    {formatIDR(currentInvoice.amount)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                    Unique Code
                  </p>
                  <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{uniqueCode}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-2">
                  {paymentMethod === 'TRANSFER' ? '💳 Pay Exactly' : '💵 Cash Payment'}
                </p>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border-2 border-emerald-500 dark:border-emerald-600">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {paymentMethod === 'TRANSFER' 
                      ? formatIDR(Number(currentInvoice.amount) + Number(currentInvoice.uniqueCode || 0)) 
                      : formatIDR(Number(currentInvoice.amount))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {currentInvoice.photoUrl && (
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Payment Proof
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <img
                  src={`${apiUrl}/${currentInvoice.photoUrl}`}
                  alt="Payment Proof"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <CreditCard
                  size={24}
                  className={`mb-2 ${
                    paymentMethod === 'TRANSFER'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`}
                />
                <p className={`font-bold text-sm ${
                  paymentMethod === 'TRANSFER'
                    ? 'text-indigo-900 dark:text-indigo-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  Transfer Bank
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unique amount required
                </p>
              </button>

              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Banknote
                  size={24}
                  className={`mb-2 ${
                    paymentMethod === 'CASH'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                />
                <p className={`font-bold text-sm ${
                  paymentMethod === 'CASH'
                    ? 'text-emerald-900 dark:text-emerald-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  Cash Payment
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Base amount only
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <button
              onClick={handleVerify}
              disabled={isVerifying || currentInvoice.isVerified}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Verifying...
                </>
              ) : currentInvoice.isVerified ? (
                <>
                  <CheckCircle size={20} />
                  Already Verified
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Verify Payment
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalInvoices - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
            Use ← → to navigate • Enter to verify • Esc to close
          </p>
        </div>
      </animated.div>
    </div>,
    document.body
  );
}
