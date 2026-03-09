import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { checkInBooking } from "../services/bookingService";
import { formatDate } from "../utils/helpers";
import AdminLayout from "../components/layout/AdminLayout";
import { useAuthContext } from "../context/AuthContext";

const QRScanner = () => {
  const { user } = useAuthContext();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      setTimeout(() => {
        if (!html5QrcodeScannerRef.current) {
          html5QrcodeScannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 20,
              qrbox: { width: 300, height: 300 },
              aspectRatio: 1.0,
              disableFlip: false,
              rememberLastUsedCamera: true,
              showTorchButtonIfSupported: true,
              supportedScanTypes: [0, 1],
            },
            false
          );
        }
        html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
      }, 100);
    } catch (err) {
      setError("Camera access denied. Please allow camera permission in your browser settings.");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().then(() => {
        setScanning(false);
      }).catch(() => {});
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      stopScanning();

      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (parseErr) {
        setError("Invalid QR code format. Expected JSON data.");
        return;
      }

      if (qrData.type !== "BOOKING_CHECK_IN") {
        setError(`Invalid QR code type: ${qrData.type || "unknown"}. Expected BOOKING_CHECK_IN.`);
        return;
      }

      const bookingId = qrData.b || qrData.booking_id;
      const token = qrData.t || qrData.token;

      if (!bookingId || !token) {
        setError("Invalid QR code: Missing booking information");
        return;
      }

      setLoading(true);
      setError(null);

      const response = await checkInBooking(bookingId, token);

      if (response.success) {
        setResult({
          success: true,
          message: response.message,
          booking: response.data.booking,
          checkInType: response.data.check_in_type,
          lateMinutes: response.data.late_minutes,
        });
      } else {
        setError(response.message || "Check-in failed");
      }
    } catch (err) {
      if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to parse QR code or check-in");
      }
    } finally {
      setLoading(false);
    }
  };

  const onScanError = () => {
    // Ignore scan errors during scanning
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    startScanning();
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Page Heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Scanner
          </h1>
        </div>

        {/* Scanner Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {!scanning && !result && !error && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📷</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ready to Scan
              </h2>
              <button
                onClick={startScanning}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Scanning
              </button>
            </div>
          )}

          {scanning && (
            <div className="p-4">
              {/* QR Scanner */}
              <div id="qr-reader" ref={scannerRef} className="mb-4" style={{maxWidth: '500px', margin: '0 auto'}}></div>

              {loading && (
                <div className="text-center py-3">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-gray-300 border-t-blue-600"></div>
                  <p className="text-xs text-gray-600 mt-2">Processing...</p>
                </div>
              )}
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-xl font-bold text-green-700 mb-1">
                  Check-in Successful!
                </h2>
              </div>

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-semibold text-gray-900">
                      {result.booking.user_id?.full_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-semibold text-gray-900">
                      {result.booking.room_id?.room_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(result.booking.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-gray-900">
                      {result.booking.start_time} - {result.booking.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${
                      result.checkInType === "ON_TIME" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {result.checkInType === "ON_TIME" 
                        ? "On Time ✓" 
                        : `Late (${result.lateMinutes} min)`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={resetScanner}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Scan Next
                </button>
              </div>
            </div>
          )}

          {/* Error Result */}
          {error && (
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-4xl">❌</span>
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">
                  Failed
                </h2>
                <p className="text-sm text-gray-600">{error}</p>
              </div>

              <div className="text-center">
                <button
                  onClick={resetScanner}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QRScanner;
