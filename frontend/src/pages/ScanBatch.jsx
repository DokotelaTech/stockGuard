import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Database,
  FileSearch,
  ImageUp,
  Pill,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  SwitchCamera,
} from "lucide-react";

import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import {
  getMedicines,
  verifyMedicineBatch,
} from "../services/inventoryService";
import { getMedicineProductInfo } from "../services/medicineInfoService";
import { getMedicineAlertState } from "../utils/stockCalculations";

const SCANNER_ELEMENT_ID = "stockguard-qr-reader";
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
];

export default function ScanBatch() {
  const [batchNumber, setBatchNumber] = useState("");
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [productInfo, setProductInfo] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [lastScanned, setLastScanned] = useState("");
  const [sampleBatches, setSampleBatches] = useState([]);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    let active = true;
    getMedicines()
      .then((items) => {
        if (!active) return;
        const batches = items
          .filter((item) => item.batchNumber)
          .slice(0, 4)
          .map((item) => ({
            batchNumber: item.batchNumber,
            medicineName: item.medicineName,
          }));
        setSampleBatches(batches);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const stopCamera = async () => {
    const instance = scannerRef.current;
    if (!instance) {
      setCameraActive(false);
      return;
    }
    try {
      if (instance.isScanning) {
        await instance.stop();
      }
      await instance.clear();
    } catch {
      // Ignore stop errors if already stopped.
    } finally {
      scannerRef.current = null;
      setCameraActive(false);
      setCameraStarting(false);
      scanLockRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      const instance = scannerRef.current;
      if (instance) {
        if (instance.isScanning) {
          instance.stop().catch(() => {});
        }
        try {
          instance.clear();
        } catch {
          // Ignore unmount clear errors.
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const loadProductPreview = async (medicineName) => {
    if (!medicineName) {
      setProductInfo(null);
      return;
    }
    setProductLoading(true);
    setImageFailed(false);
    try {
      const info = await getMedicineProductInfo(medicineName);
      setProductInfo(info);
    } catch {
      setProductInfo(null);
    } finally {
      setProductLoading(false);
    }
  };

  const verifyCode = async (codeToVerify) => {
    const normalized = String(codeToVerify ?? "").trim();
    if (!normalized) {
      setError("Please enter or scan a batch number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMedicine(null);
      setProductInfo(null);

      const results = await verifyMedicineBatch(normalized);

      if (results.length === 0) {
        setError(
          `No medicine found in your inventory matching batch "${normalized}".`,
        );
        return;
      }

      setMedicine(results);
      if (results[0]?.medicineName) {
        loadProductPreview(results[0].medicineName);
      }
    } catch (err) {
      console.error("Batch verification error:", err);
      setError(err.message || "Unable to verify this batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    await verifyCode(batchNumber);
  };

  const startCamera = async (preferredFacing = facingMode) => {
    setCameraError("");
    setError("");
    setCameraStarting(true);
    scanLockRef.current = false;

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera access is not supported in this browser or requires HTTPS.",
        );
      }

      const qrScanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      scannerRef.current = qrScanner;

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(160, Math.min(260, Math.floor(edge * 0.72)));
          return { width: size, height: size };
        },
        aspectRatio: 1.333,
      };

      const onSuccess = async (decodedText) => {
        if (scanLockRef.current) return;
        scanLockRef.current = true;
        const cleaned = decodedText.trim();
        setLastScanned(cleaned);
        setBatchNumber(cleaned);
        await stopCamera();
        await verifyCode(cleaned);
      };

      try {
        await qrScanner.start(
          { facingMode: preferredFacing },
          config,
          onSuccess,
          () => {},
        );
      } catch {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          throw new Error("No camera device was detected on this device.");
        }
        const fallbackCamera =
          preferredFacing === "environment"
            ? cameras[cameras.length - 1]
            : cameras[0];
        await qrScanner.start(fallbackCamera.id, config, onSuccess, () => {});
      }

      setCameraActive(true);
    } catch (err) {
      console.error("Camera start error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Unable to access camera. Check browser camera permissions.";
      setCameraError(message);
      await stopCamera();
    } finally {
      setCameraStarting(false);
    }
  };

  const handleSwitchCamera = async () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    if (cameraActive) {
      await startCamera(nextFacing);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCameraError("");
    setError("");
    try {
      if (cameraActive) await stopCamera();
      const fileScanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      const decodedText = await fileScanner.scanFile(file, false);
      try {
        await fileScanner.clear();
      } catch {
        // Ignore clear errors.
      }
      const cleaned = decodedText.trim();
      setLastScanned(cleaned);
      setBatchNumber(cleaned);
      await verifyCode(cleaned);
    } catch {
      setCameraError(
        "Could not detect a QR code or barcode in that image. Try a clearer photo or enter the batch number manually.",
      );
    }
  };

  const primaryMedicine = medicine?.[0] ?? null;

  return (
    <>
      <PageHeader
        title="Scan Batch"
        description="Open your camera to scan a medicine QR/barcode or enter a batch number manually."
      />

      <div className="scan-layout">
        <section className="card scan-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge emerald">
                <ScanLine size={20} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Live QR &amp; Barcode Scanner</h2>
                <p>
                  Point your camera at a batch QR code or barcode to verify
                  instantly.
                </p>
              </div>
            </div>
            {cameraActive && (
              <span className="status-pill low">
                <i aria-hidden="true" />
                Camera Live
              </span>
            )}
          </div>

          <div
            className={`scanner-stage ${cameraActive ? "scanner-stage-live" : ""}`}
          >
            <div
              id={SCANNER_ELEMENT_ID}
              className={`qr-reader-mount ${cameraActive ? "visible" : ""}`}
            />

            {!cameraActive && (
              <div
                className="scanner-view"
                role="button"
                tabIndex={0}
                onClick={() => !cameraStarting && startCamera()}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !cameraStarting) {
                    e.preventDefault();
                    startCamera();
                  }
                }}
              >
                <div className="scan-corners" />
                <QrCode size={60} strokeWidth={1.4} />
                <span>
                  {cameraStarting
                    ? "Starting camera…"
                    : "Tap to Open Camera Scanner"}
                </span>
                <small>
                  Supports QR codes &amp; standard pharmaceutical barcodes
                </small>
              </div>
            )}
          </div>

          <div className="scanner-controls">
            {!cameraActive ? (
              <Button
                type="button"
                onClick={() => startCamera()}
                disabled={cameraStarting}
              >
                <Camera size={16} strokeWidth={2} />
                {cameraStarting ? "Opening camera…" : "Open Camera"}
              </Button>
            ) : (
              <>
                <Button type="button" variant="danger" onClick={stopCamera}>
                  <CameraOff size={16} strokeWidth={2} />
                  Stop Camera
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSwitchCamera}
                >
                  <SwitchCamera size={16} strokeWidth={2} />
                  Flip Camera
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="light"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageUp size={16} strokeWidth={2} />
              Scan from Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          {cameraError && (
            <div
              className="alert-banner error"
              role="alert"
              style={{ marginTop: 14, marginBottom: 0 }}
            >
              <AlertCircle size={18} strokeWidth={2} />
              <span>{cameraError}</span>
            </div>
          )}

          {lastScanned && !error && (
            <div
              className="alert-banner success"
              role="status"
              style={{ marginTop: 14, marginBottom: 0 }}
            >
              <CheckCircle2 size={18} strokeWidth={2} />
              <span>
                Scanned code: <strong>{lastScanned}</strong>
              </span>
            </div>
          )}

          <div className="scan-divider" style={{ marginTop: 22 }}>
            <span />
            or enter batch manually
            <span />
          </div>

          <form onSubmit={handleVerify}>
            <label className="field-label" htmlFor="batch-number">
              Batch number
            </label>

            <div className="batch-entry">
              <input
                id="batch-number"
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
                placeholder="e.g. AZM-2026-014"
              />

              <Button
                type="submit"
                disabled={loading || !batchNumber.trim()}
              >
                <FileSearch size={16} strokeWidth={2} />
                {loading ? "Verifying…" : "Verify Batch"}
              </Button>
            </div>
          </form>

          {sampleBatches.length > 0 && (
            <div className="quick-batch-chips">
              <span>Quick test batches:</span>
              {sampleBatches.map((item) => (
                <button
                  key={item.batchNumber}
                  type="button"
                  className="batch-chip"
                  onClick={() => {
                    setBatchNumber(item.batchNumber);
                    verifyCode(item.batchNumber);
                  }}
                >
                  {item.batchNumber}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div
              className="alert-banner error"
              role="alert"
              style={{ marginTop: 18, marginBottom: 0 }}
            >
              <AlertCircle size={18} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {medicine && (
            <div className="scan-results">
              <div className="scan-result-header">
                <ShieldCheck size={20} strokeWidth={2} />
                <span>Batch verification successful</span>
              </div>

              {medicine.map((item) => {
                const alert = getMedicineAlertState(item);
                const pillTone =
                  alert.rowTone === "row-danger"
                    ? "high"
                    : alert.rowTone === "row-warning"
                      ? "medium"
                      : "low";
                return (
                  <article
                    key={item.id}
                    className={`batch-result-card ${alert.rowTone}`}
                  >
                    <div className="batch-result-top">
                      <h3>{item.medicineName}</h3>
                      <span className={`status-pill ${pillTone}`}>
                        <i aria-hidden="true" />
                        {alert.status}
                      </span>
                    </div>

                    <div className="batch-meta-grid">
                      <div className="batch-meta-item">
                        <span>Batch Number</span>
                        <strong>{item.batchNumber}</strong>
                      </div>
                      <div className="batch-meta-item">
                        <span>Category</span>
                        <strong>{item.category || "Not provided"}</strong>
                      </div>
                      <div className="batch-meta-item">
                        <span>Manufacturer</span>
                        <strong>{item.manufacturer || "Not provided"}</strong>
                      </div>
                      <div className="batch-meta-item">
                        <span>Quantity</span>
                        <strong>
                          {Number(item.quantity ?? 0).toLocaleString()} units
                        </strong>
                      </div>
                      <div className="batch-meta-item">
                        <span>Supplier</span>
                        <strong>{item.supplier || "Not provided"}</strong>
                      </div>
                      <div className="batch-meta-item">
                        <span>Manufacturing Date</span>
                        <strong>
                          {item.manufactureDate || "Not provided"}
                        </strong>
                      </div>
                      <div className="batch-meta-item">
                        <span>Expiry Date</span>
                        <strong>{item.expiryDate || "Not provided"}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="card scan-guide">
          {primaryMedicine ? (
            <div className="product-preview">
              <div className="product-preview-head">
                <span className="eyebrow">
                  <Sparkles size={13} strokeWidth={2.2} />
                  Medicine Overview
                </span>
                {primaryMedicine.category && (
                  <span className="category-tag">
                    {primaryMedicine.category}
                  </span>
                )}
              </div>

              {productLoading ? (
                <div className="loader-center">
                  <Loader label={`Looking up ${primaryMedicine.medicineName}…`} />
                </div>
              ) : (
                <>
                  <div className="product-image-frame">
                    {productInfo?.imageUrl && !imageFailed ? (
                      <img
                        src={productInfo.imageUrl}
                        alt={primaryMedicine.medicineName}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      <div className="product-image-fallback">
                        <Pill size={38} strokeWidth={1.6} />
                        <span>No online photo available</span>
                      </div>
                    )}
                  </div>

                  <h2>{primaryMedicine.medicineName}</h2>

                  <p className="product-description">
                    {productInfo?.description ||
                      "No online description could be retrieved for this medicine name right now."}
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="guide-icon">
                <ShieldCheck size={24} strokeWidth={1.9} />
              </div>

              <h2>Verify every batch</h2>

              <p>
                Use your phone or laptop camera to scan medicine packaging QR
                codes and barcodes directly into StockGuard.
              </p>

              <ul>
                <li>
                  <CheckCircle2 size={17} strokeWidth={2} />
                  Opens rear camera automatically on mobile phones
                </li>
                <li>
                  <CheckCircle2 size={17} strokeWidth={2} />
                  Supports QR, Code 128, EAN-13 &amp; DataMatrix
                </li>
                <li>
                  <CheckCircle2 size={17} strokeWidth={2} />
                  Displays live medicine photo &amp; description on scan
                </li>
              </ul>

              <div className="info-tag">
                <Database size={14} strokeWidth={2} />
                Firestore Connected
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
