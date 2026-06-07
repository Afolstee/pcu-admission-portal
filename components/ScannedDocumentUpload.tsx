"use client";

import React, { useCallback, useState } from "react";
import { ApiClient } from "@/lib/api";
import {
  ScanLine,
  Upload,
  X,
  AlertTriangle,
  ZoomIn,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScanResult {
  quality_score: number;
  is_acceptable: boolean;
  issues: string[];
  sharpness: number;
  brightness: number;
  original_b64: string;
  preview_b64: string;
}

type Phase = "idle" | "scanning" | "preview" | "uploading" | "error";

interface ScannedDocumentUploadProps {
  /** Document type key (e.g. "transcript") */
  docType: string;
  /** Human-readable label */
  docDisplayName: string;
  /** The form ID needed for the upload call */
  formId: number | null;
  /** Whether a parent save is in progress */
  parentSaving?: boolean;
  /** Called after the scanned version is confirmed and uploaded */
  onUploaded: (response: any) => void;
}

// ── Quality badge ──────────────────────────────────────────────────────────────

function QualityBadge({ score }: { score: number }) {
  const level = score >= 70 ? "good" : score >= 40 ? "fair" : "poor";
  const cfg = {
    good: { label: "Good",  bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
    fair: { label: "Fair",  bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500"   },
    poor: { label: "Poor",  bg: "bg-red-50",      border: "border-red-200",     text: "text-red-700",     dot: "bg-red-500"     },
  }[level];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label} quality — {score}/100
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ScannedDocumentUpload({
  docType,
  docDisplayName,
  formId,
  parentSaving = false,
  onUploaded,
}: ScannedDocumentUploadProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Open modal + start scan ────────────────────────────────────────────────
  const handleOpenScan = useCallback(async (file: File) => {
    if (!formId) return;
    setSelectedFile(file);
    setOpen(true);
    setPhase("scanning");
    setErrorMsg("");
    setScanResult(null);

    try {
      const result = await ApiClient.scanDocument(file);
      setScanResult(result as ScanResult);
      setPhase("preview");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Scan failed. Please try again.");
      setPhase("error");
    }
  }, [formId]);

  // ── Upload scanned version ─────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!formId || !scanResult || !selectedFile) return;
    setPhase("uploading");

    try {
      // Convert the scanned base64 back to a File so the existing uploadDocument works
      const byteStr = atob(scanResult.preview_b64);
      const arr = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
      const scannedFile = new File(
        [arr],
        selectedFile.name.replace(/\.[^.]+$/, "") + "_scanned.jpg",
        { type: "image/jpeg" },
      );

      const resp = await ApiClient.uploadDocument(
        scannedFile,
        formId,
        docType,
        docDisplayName,
      );
      setOpen(false);
      setPhase("idle");
      setScanResult(null);
      setSelectedFile(null);
      onUploaded(resp);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Upload failed.");
      setPhase("error");
    }
  }, [formId, scanResult, selectedFile, docType, docDisplayName, onUploaded]);

  const handleClose = () => {
    setOpen(false);
    setPhase("idle");
    setScanResult(null);
    setSelectedFile(null);
    setErrorMsg("");
  };

  const handleTriggerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleOpenScan(file);
    }
    // reset input so the same file selection triggers change again
    if (e.target) e.target.value = "";
  };

  const disabled = parentSaving || !formId;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        onClick={handleTriggerClick}
        disabled={disabled}
        className="h-9 px-4 border-[#6b21a8]/40 text-[#6b21a8] hover:bg-violet-50 hover:border-[#6b21a8] font-semibold text-xs gap-1.5 whitespace-nowrap"
        title="Enhance this image to look like a clean scanned document"
      >
        <ScanLine className="w-3.5 h-3.5" />
        Scan
      </Button>

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={lightboxSrc}
            alt="Full-size"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Scanner modal ──────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-5 pb-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <ScanLine className="w-5 h-5 text-[#6b21a8]" />
              Document Scanner
              <span className="ml-auto text-xs font-normal text-slate-400">
                {selectedFile?.name ?? ""}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 pt-4 space-y-4">

            {/* ── Scanning spinner ───────────────────────────────────────── */}
            {phase === "scanning" && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#6b21a8] animate-spin" />
                  <ScanLine className="absolute inset-0 m-auto w-7 h-7 text-[#6b21a8]" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Scanning document…</p>
                <p className="text-xs text-slate-400">Enhancing clarity and sharpness</p>
              </div>
            )}

            {/* ── Error ─────────────────────────────────────────────────── */}
            {phase === "error" && (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="flex items-start gap-3 border border-red-200 bg-red-50 rounded-xl px-4 py-3 w-full">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700">{errorMsg}</p>
                </div>
                <Button variant="outline" onClick={() => selectedFile && handleOpenScan(selectedFile)} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Try Again
                </Button>
              </div>
            )}

            {/* ── Preview ───────────────────────────────────────────────── */}
            {phase === "preview" && scanResult && (
              <>
                {/* Quality bar */}
                <div className="flex items-center justify-between">
                  <QualityBadge score={scanResult.quality_score} />
                  <span className="text-xs text-slate-400">
                    Sharpness: {scanResult.sharpness} &nbsp;·&nbsp; Brightness: {scanResult.brightness}
                  </span>
                </div>

                {/* Issues */}
                {scanResult.issues.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 space-y-1">
                    {scanResult.issues.map((issue, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                        {issue}
                      </p>
                    ))}
                  </div>
                )}

                {/* Side-by-side images */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Original", b64: scanResult.original_b64, accent: "text-slate-500" },
                    { label: "Scanned", b64: scanResult.preview_b64, accent: "text-[#6b21a8]", icon: true },
                  ].map(({ label, b64, accent, icon }) => (
                    <div key={label} className="space-y-1.5">
                      <p className={`text-xs font-bold uppercase tracking-wide text-center ${accent} flex items-center justify-center gap-1`}>
                        {icon && <ScanLine className="w-3 h-3" />}
                        {label}
                      </p>
                      <div
                        className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[3/4] cursor-zoom-in"
                        onClick={() => setLightboxSrc(`data:image/jpeg;base64,${b64}`)}
                      >
                        <img
                          src={`data:image/jpeg;base64,${b64}`}
                          alt={label}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-all opacity-0 group-hover:opacity-100">
                          <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Click either image to zoom · The scanned version will be uploaded if you confirm
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <Button variant="outline" onClick={handleClose} className="gap-1.5 text-slate-600">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  {!scanResult.is_acceptable && (
                    <p className="text-xs text-amber-600 font-medium flex-1">
                      Low quality — consider retaking the photo.
                    </p>
                  )}
                  <Button
                    onClick={handleConfirm}
                    className="gap-2 ml-auto bg-[#6b21a8] hover:bg-purple-800 text-white font-bold"
                  >
                    <Upload className="w-4 h-4" />
                    {scanResult.is_acceptable ? "Upload Scanned Version" : "Upload Anyway"}
                  </Button>
                </div>
              </>
            )}

            {/* ── Uploading ─────────────────────────────────────────────── */}
            {phase === "uploading" && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Upload className="w-8 h-8 text-[#6b21a8] animate-bounce" />
                <p className="text-sm font-semibold text-slate-600">Uploading scanned document…</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
