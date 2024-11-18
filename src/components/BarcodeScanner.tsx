import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onClose: () => void;
  onDetected: (code: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onDetected }) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              facingMode: 'environment'
            }
          },
          decoder: {
            readers: ['ean_reader', 'ean_8_reader']
          }
        },
        (err) => {
          if (err) {
            console.error('Failed to initialize barcode scanner:', err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        if (result.codeResult.code) {
          onDetected(result.codeResult.code);
          Quagga.stop();
        }
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Scan Barcode</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div
          ref={scannerRef}
          className="relative bg-black aspect-video rounded-lg overflow-hidden"
        />
        <p className="mt-4 text-sm text-gray-500 text-center">
          Position the barcode within the camera view
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;