'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

const QRScannerPage: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null); // ✅ Ref for scanner instance
  const router = useRouter(); // ✅ Next.js router instance

  // ✅ Check user role on component mount
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'admin' || role === 'retailer') {
      setIsAuthorized(true);
    } else {
      setError('❌ Unauthorized Access: Admin or Retailer role required.');
    }
  }, []);

  // ✅ Set up QR Code scanner
  useEffect(() => {
    if (isAuthorized) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: 250 },
        false // verbose mode off
      );

      scanner.render(
        (decodedText: string) => {
          console.log('QR Code scanned: ', decodedText);
          const parts = decodedText.split('/');
          const extractedTeamId = parts[parts.length - 1]; // ✅ Extract last segment as teamId

          if (extractedTeamId) {
            setTeamId(extractedTeamId);
            scanner.clear(); // Stop scanner after successful scan
          } else {
            setError('❌ No valid Team ID found in QR code.');
          }
        },
        (scanError: unknown) => {
          console.warn('QR Scan Error', scanError);
        }
      );

      scannerRef.current = scanner;

      // Cleanup on unmount
      return () => {
        scanner
          .clear()
          .catch((err) => console.error('Failed to clear scanner', err));
      };
    }
  }, [isAuthorized]);

  // ✅ Redirect to winnerscan/{teamId} if teamId is detected
  useEffect(() => {
    if (teamId) {
      router.push(`/winnerscan/${teamId}`);
    }
  }, [teamId, router]);

  // 🔴 Unauthorized message
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-xl font-bold text-red-500">{error}</h2>
      </div>
    );
  }

  // ✅ Main UI with scanner and result (if not yet redirected)
  return (
    <div className="flex flex-col items-center  min-h-screen bg-gray-900 p-6 text-white">
      <h2 className="text-3xl font-bold mb-10">Scan Team QR Code</h2>
      <div id="qr-reader" style={{ width: '100%', maxWidth: '400px' }}></div>
      {error && (
        <div className="mt-4 p-2 bg-red-500 text-white rounded">{error}</div>
      )}
    </div>
  );
};

export default QRScannerPage;
