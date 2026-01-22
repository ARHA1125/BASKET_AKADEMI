'use client';

import { getWahaQR, getWahaStatus } from '@/hooks/waha';
import { useEffect, useState } from 'react';

export default function WhatsAppPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('LOADING');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const sessionData = await getWahaStatus();
        const currentStatus = sessionData.status || 'UNKNOWN';
        setStatus(currentStatus);

        if (currentStatus === 'SCAN_QR_CODE' && !qrCodeUrl) {
            fetchQR();
        } else if (currentStatus === 'WORKING') {
            setQrCodeUrl(null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch status');
        setStatus('ERROR');
      }
    };

    const fetchQR = async () => {
        try {
            const blob = await getWahaQR();
            const url = URL.createObjectURL(blob);
            setQrCodeUrl(url);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch QR');
        }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 3000);

    return () => {
      clearInterval(intervalId);
      if (qrCodeUrl) URL.revokeObjectURL(qrCodeUrl);
    };
  }, [qrCodeUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Connect WhatsApp</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
            ${status === 'WORKING' ? 'bg-green-100 text-green-800' : 
              status === 'SCAN_QR_CODE' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'}`}>
            Status: {status}
          </span>
        </div>

        {status === 'SCAN_QR_CODE' && qrCodeUrl && (
          <div className="flex justify-center mb-4">
            <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-64 h-64 border" />
          </div>
        )}

        {status === 'WORKING' && (
          <div className="text-green-600">
            <p className="mb-4">WhatsApp is successfully connected!</p>
          </div>
        )}
        
        {status === 'LOADING' && (
             <p>Loading status...</p>
        )}
      </div>
    </div>
  );
}
