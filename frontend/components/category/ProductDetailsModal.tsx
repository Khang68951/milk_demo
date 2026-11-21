"use client";

import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { SkuProduct } from "@/data/category-mock";

interface ProductDetailsModalProps {
  product: SkuProduct | null;
  onClose: () => void;
}

export function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (product) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [product, onClose]);

  if (!product) return null;

  const { validation } = product;

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[1px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="validation-modal-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white p-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="validation-modal-title"
              className="text-[20px] font-semibold leading-tight text-[#111827]"
            >
              Validation Card Details
            </h2>
            <p className="mt-1 text-[13px] font-normal text-[#6B7280]">
              All CSV-backed fields in one clean, readable view
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-0.5">
          {/* 4 Metric Pills */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-[10px] bg-[#F3F4F6] px-3.5 py-2.5">
              <p className="text-[11px] font-normal text-[#6B7280]">Accuracy</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#111827]">
                {validation.accuracy}
              </p>
            </div>
            <div className="rounded-[10px] bg-[#F3F4F6] px-3.5 py-2.5">
              <p className="text-[11px] font-normal text-[#6B7280]">
                Confidence
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#111827]">
                {validation.confidenceExact}
              </p>
            </div>
            <div className="rounded-[10px] bg-[#F3F4F6] px-3.5 py-2.5">
              <p className="text-[11px] font-normal text-[#6B7280]">Result</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#111827]">
                {validation.result}
              </p>
            </div>
            <div className="rounded-[10px] bg-[#F3F4F6] px-3.5 py-2.5">
              <p className="text-[11px] font-normal text-[#6B7280]">Status</p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#111827]">
                <span>{product.status}</span>
                {product.status === "Validated" && (
                  <Check
                    className="h-4 w-4 text-[#16A34A]"
                    strokeWidth={2.5}
                  />
                )}
              </p>
            </div>
          </div>

          {/* Product Information Section */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
            <h3 className="text-[13px] font-semibold text-[#111827]">
              Product Information
            </h3>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">SKU</dt>
                <dd className="font-normal text-[#111827]">{product.skuCode}</dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Product Name</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.expectedLabel}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Brand / Manufacturer</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.brandManufacturer}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Category</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.categoryPath}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Barcode</dt>
                <dd className="font-normal text-[#111827]">{product.barcode}</dd>
              </div>
            </dl>
          </div>

          {/* Validation Details Section */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
            <h3 className="text-[13px] font-semibold text-[#111827]">
              Validation Details
            </h3>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Expected Label</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.expectedLabel}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Predicted Label</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.predictedLabel}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Mismatch Type</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.mismatchType}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">OCR Extracted Text</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.ocrExtractedText}
                </dd>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Reviewed At</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.reviewedAt}
                </dd>
              </div>
            </dl>
          </div>

          {/* CSV Traceability Section */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB]/70 p-4">
            <h3 className="text-[13px] font-semibold text-[#111827]">
              CSV Traceability
            </h3>
            <dl className="mt-3 text-[13px]">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
                <dt className="text-[#6B7280]">Source Page</dt>
                <dd className="font-normal text-[#111827]">
                  {validation.sourcePage}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-[12px] text-[#6B7280]">
            Tip: keep CSV columns mapped 1:1 to these fields for complete detail
            view.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] bg-[#F3F4F6] px-4 py-2 text-[13px] font-medium text-[#111827] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-[8px] bg-[#EE730A] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#D96504] transition-colors cursor-pointer"
            >
              {savedNotice ? "Saved ✓" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
