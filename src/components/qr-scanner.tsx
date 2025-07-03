'use client';

import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import type { QrcodeSuccessCallback } from 'html5-qrcode/esm/core';
import { useEffect } from 'react';

const qrcodeRegionId = 'html5qr-code-full-region';

interface QrScannerProps {
  onScanSuccess: QrcodeSuccessCallback;
  onScanFailure?: (error: any) => void;
}

const QrScanner = ({ onScanSuccess, onScanFailure }: QrScannerProps) => {
  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    
    // Check if we are on the client side
    if (typeof window !== 'undefined') {
        html5QrcodeScanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              supportedScanTypes: [], // Use all supported scan types.
            },
            false /* verbose */
        );
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }


    // cleanup function when component will unmount
    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.getState() === Html5QrcodeScannerState.SCANNING) {
         html5QrcodeScanner.clear().catch(error => {
            console.error('Failed to clear html5QrcodeScanner.', error);
          });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id={qrcodeRegionId} className='w-full'/>;
};

export default QrScanner;
