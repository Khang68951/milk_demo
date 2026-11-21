"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Bell,
  Building2,
  Check,
  Copy,
  Cpu,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Send,
  Sliders,
} from "lucide-react";
import {
  DATE_FORMAT_OPTIONS,
  DEFAULT_WORKSPACE_SETTINGS,
  MODEL_VERSION_OPTIONS,
  TIMEZONE_OPTIONS,
  type SettingsTabId,
  type WorkspaceSettings,
} from "@/data/settings-mock";

const SETTINGS_TABS: {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: "general", label: "General", icon: Sliders },
  { id: "cv", label: "CV & Inference", icon: Cpu },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "stores", label: "Stores & API", icon: Building2 },
];

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}

function ToggleSwitch({ checked, onChange, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors duration-150 cursor-pointer ${
        checked ? "bg-[#EE730A]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
          checked ? "translate-x-[21px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [savedSettings, setSavedSettings] = useState<WorkspaceSettings>(
    DEFAULT_WORKSPACE_SETTINGS
  );
  const [draft, setDraft] = useState<WorkspaceSettings>(
    DEFAULT_WORKSPACE_SETTINGS
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedSettings),
    [draft, savedSettings]
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  const handleSave = () => {
    setSavedSettings(draft);
    showToast("Settings saved successfully");
  };

  const handleReset = () => {
    setDraft(DEFAULT_WORKSPACE_SETTINGS);
    setSavedSettings(DEFAULT_WORKSPACE_SETTINGS);
    showToast("Restored default workspace settings");
  };

  const handleExportConfig = () => {
    const { apiKeyPlain: _redacted, ...safeExport } = draft;
    void _redacted;
    const blob = new Blob([JSON.stringify(safeExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project-a-settings.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Exported workspace config JSON");
  };

  const activeStoreCount = draft.stores
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + s.storeCount, 0);

  return (
    <div className="min-h-full w-full bg-[#F7F8FA]">
      <div className="mx-auto w-full max-w-[1040px] px-4 pt-[26px] pb-12 sm:px-6 lg:px-7">
        {/* Page Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-[16px]">
          <div>
            <h1 className="text-[22px] font-normal leading-tight text-black">
              Settings
            </h1>
            <p className="mt-[4px] text-[12px] font-normal text-[#6B7280]">
              Manage workspace preferences, CV inference thresholds, store sync,
              and alert rules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-[36px] items-center gap-[6px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-[14px] w-[14px]" strokeWidth={1.9} />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`flex h-[36px] items-center gap-[6px] rounded-[8px] px-[16px] text-[13px] font-semibold transition-colors ${
                hasUnsavedChanges
                  ? "bg-[#EE730A] text-white hover:bg-[#D96504] cursor-pointer"
                  : "bg-[#EE730A]/45 text-white/90 cursor-not-allowed"
              }`}
            >
              <Check className="h-[15px] w-[15px]" strokeWidth={2.2} />
              <span>Save Changes</span>
            </button>
          </div>
        </header>

        {/* Segmented Section Tabs */}
        <div
          role="tablist"
          aria-label="Settings sections"
          className="mt-[18px] inline-flex max-w-full flex-wrap items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white p-1"
        >
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-[7px] rounded-[7px] px-3.5 py-2 text-[13px] transition-colors cursor-pointer ${
                  active
                    ? "bg-[#F3F4F6] font-semibold text-[#111827]"
                    : "font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                }`}
              >
                <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-2.5 text-[12.5px] text-[#7C2D12]">
            <span>You have unsaved changes in your workspace settings.</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDraft(savedSettings)}
                className="font-medium text-[#7C2D12] hover:underline cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="font-semibold text-[#C2560A] hover:underline cursor-pointer"
              >
                Save now
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="mt-5 space-y-5">
            {/* Workspace Profile */}
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <div className="flex flex-wrap items-center gap-4 border-b border-[#EFF0F6] pb-5">
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] border border-[#EFF0F6] bg-[#FAFAFA]">
                  <Image
                    src="/images/logo-database.png"
                    alt="Workspace logo"
                    width={32}
                    height={32}
                    className="h-[32px] w-[32px] object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-semibold text-[#111827]">
                    Workspace Profile
                  </h2>
                  <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                    Identity and regional preferences shared across Reports and
                    Products views.
                  </p>
                </div>
                <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-[11.5px] font-semibold text-[#C2560A]">
                  {draft.role}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ws-name"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Workspace Name
                  </label>
                  <input
                    id="ws-name"
                    type="text"
                    value={draft.workspaceName}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        workspaceName: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ws-email"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Account Email
                  </label>
                  <input
                    id="ws-email"
                    type="email"
                    value={draft.accountEmail}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        accountEmail: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ws-timezone"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Timezone
                  </label>
                  <select
                    id="ws-timezone"
                    value={draft.timezone}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ws-datefmt"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Timestamp Format
                  </label>
                  <select
                    id="ws-datefmt"
                    value={draft.dateFormat}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        dateFormat: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  >
                    {DATE_FORMAT_OPTIONS.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Navigation & Export Defaults */}
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Workspace Defaults
              </h2>
              <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                Choose your startup screen and default CSV export format.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ws-landing"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Default Landing Page
                  </label>
                  <select
                    id="ws-landing"
                    value={draft.defaultLanding}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        defaultLanding: e.target
                          .value as WorkspaceSettings["defaultLanding"],
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  >
                    <option value="Home">Home</option>
                    <option value="Dashboard (Reports)">
                      Dashboard (Reports)
                    </option>
                    <option value="Category (Products)">
                      Category (Products)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ws-export"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Default CV Export Format
                  </label>
                  <select
                    id="ws-export"
                    value={draft.exportFormat}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        exportFormat: e.target
                          .value as WorkspaceSettings["exportFormat"],
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  >
                    <option value="CSV (UTF-8)">CSV (UTF-8)</option>
                    <option value="Excel (.xlsx)">Excel (.xlsx)</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: CV & INFERENCE */}
        {activeTab === "cv" && (
          <div className="mt-5 space-y-5">
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Confidence Thresholds &amp; SKU Matching
              </h2>
              <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                Control how shelf detections are classified into Validated,
                Needs Review, or Unmatched Queue (`sku_id = NULL`).
              </p>

              <div className="mt-6 space-y-5">
                {/* Auto-Validated Threshold */}
                <div className="rounded-[10px] border border-[#EFF0F6] bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">
                        Auto-Validate Threshold (Green)
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        SKUs scoring at or above this threshold are marked
                        Validated automatically.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E8F5E9] px-2.5 py-1 text-[12px] font-semibold text-[#1A932E]">
                      &ge; {draft.autoValidateThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.65}
                    max={0.95}
                    step={0.01}
                    aria-label="Auto-validate confidence threshold"
                    value={draft.autoValidateThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDraft((prev) => ({
                        ...prev,
                        autoValidateThreshold: val,
                        reviewThreshold: Math.min(prev.reviewThreshold, val - 0.05),
                      }));
                    }}
                    className="mt-3 w-full accent-[#1A932E] cursor-pointer"
                  />
                </div>

                {/* Review Threshold */}
                <div className="rounded-[10px] border border-[#EFF0F6] bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">
                        Needs Review Cutoff (Yellow / Orange)
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        Detections below this threshold are flagged as Low
                        Confidence for manual audit.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[12px] font-semibold text-[#D97706]">
                      &ge; {draft.reviewThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={0.8}
                    step={0.01}
                    aria-label="Needs review confidence threshold"
                    value={draft.reviewThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDraft((prev) => ({
                        ...prev,
                        reviewThreshold: Math.min(
                          val,
                          prev.autoValidateThreshold - 0.05
                        ),
                      }));
                    }}
                    className="mt-3 w-full accent-[#EE730A] cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="divide-y divide-[#EFF0F6] rounded-[10px] border border-[#EFF0F6]">
                  <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                    <div>
                      <p className="text-[13px] font-medium text-[#111827]">
                        Auto-route unmatched products to Review Queue
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        Hold detections with `sku_id = NULL` out of main stock
                        totals until mapped.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={draft.autoRouteUnmatched}
                      onChange={(next) =>
                        setDraft((prev) => ({
                          ...prev,
                          autoRouteUnmatched: next,
                        }))
                      }
                      ariaLabel="Auto-route unmatched products"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                    <div>
                      <p className="text-[13px] font-medium text-[#111827]">
                        OCR Packaging Label Cross-Check
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        Verify predicted SKU against OCR extracted text on
                        Validation Cards.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={draft.enableOcrCrossCheck}
                      onChange={(next) =>
                        setDraft((prev) => ({
                          ...prev,
                          enableOcrCrossCheck: next,
                        }))
                      }
                      ariaLabel="OCR packaging label cross-check"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Inference Pipeline Schedule */}
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Inference Pipeline &amp; Schedule
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="cv-model"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Active Detection Model
                  </label>
                  <select
                    id="cv-model"
                    value={draft.modelVersion}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        modelVersion: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  >
                    {MODEL_VERSION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cv-time"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Nightly Batch Scan (UTC+7)
                  </label>
                  <input
                    id="cv-time"
                    type="time"
                    value={draft.nightlyScanTime}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        nightlyScanTime: e.target.value,
                      }))
                    }
                    className="mt-1.5 h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="mt-5 space-y-5">
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Shelf Activity Alert Rules
              </h2>
              <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                Choose which shelf events trigger alerts in Recent Shelf
                Activities and external channels.
              </p>

              <div className="mt-5 divide-y divide-[#EFF0F6] rounded-[10px] border border-[#EFF0F6]">
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10.5px] font-semibold text-[#DC2626]">
                        OOS
                      </span>
                      <span className="text-[13px] font-medium text-[#111827]">
                        Out-of-Stock Instant Alert
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#6B7280]">
                      Notify immediately when a monitored SKU drops to 0 cartons
                      on shelf.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={draft.alertOos}
                    onChange={(next) =>
                      setDraft((prev) => ({ ...prev, alertOos: next }))
                    }
                    ariaLabel="Out-of-stock alert"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10.5px] font-semibold text-[#D97706]">
                        LOW STOCK
                      </span>
                      <span className="text-[13px] font-medium text-[#111827]">
                        Low Stock Threshold Warning
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#6B7280]">
                      Trigger warning when remaining units drop at or below
                      threshold.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                      <span>&le;</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        aria-label="Low stock threshold cartons"
                        value={draft.lowStockCartonThreshold}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            lowStockCartonThreshold: Math.max(
                              1,
                              Number(e.target.value) || 1
                            ),
                          }))
                        }
                        className="h-[30px] w-[56px] rounded-[6px] border border-[#E5E7EB] px-2 text-center text-[12.5px] font-medium text-[#111827] outline-none focus:border-[#EE730A]"
                      />
                      <span>cartons</span>
                    </div>
                    <ToggleSwitch
                      checked={draft.alertLowStock}
                      onChange={(next) =>
                        setDraft((prev) => ({ ...prev, alertLowStock: next }))
                      }
                      ariaLabel="Low stock alert"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#FFF3E0] px-2 py-0.5 text-[10.5px] font-semibold text-[#E65100]">
                        DEPLETED
                      </span>
                      <span className="text-[13px] font-medium text-[#111827]">
                        Rapid Depletion Detection
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-[#6B7280]">
                      Flag shelves that lose more than 40% stock between
                      consecutive scans.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={draft.alertDepleted}
                    onChange={(next) =>
                      setDraft((prev) => ({ ...prev, alertDepleted: next }))
                    }
                    ariaLabel="Rapid depletion alert"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <p className="text-[13px] font-medium text-[#111827]">
                      Unmatched SKU Daily Digest
                    </p>
                    <p className="text-[12px] text-[#6B7280]">
                      Send morning summary when `sku_id = NULL` detections await
                      review.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={draft.alertUnmatchedDigest}
                    onChange={(next) =>
                      setDraft((prev) => ({
                        ...prev,
                        alertUnmatchedDigest: next,
                      }))
                    }
                    ariaLabel="Unmatched SKU daily digest"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Channels */}
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Delivery Channels
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[#EFF0F6] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#111827]">
                      Email Digest ({draft.accountEmail})
                    </p>
                    <p className="text-[12px] text-[#6B7280]">
                      Daily report summary sent after nightly shelf scan
                      completes.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={draft.emailDigestEnabled}
                    onChange={(next) =>
                      setDraft((prev) => ({
                        ...prev,
                        emailDigestEnabled: next,
                      }))
                    }
                    ariaLabel="Email digest"
                  />
                </div>

                <div>
                  <label
                    htmlFor="webhook-url"
                    className="block text-[12px] font-medium text-[#374151]"
                  >
                    Webhook Endpoint (Slack / ERP / Store Ops)
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <input
                      id="webhook-url"
                      type="url"
                      value={draft.webhookUrl}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          webhookUrl: e.target.value,
                        }))
                      }
                      className="h-[38px] min-w-[240px] flex-1 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#EE730A]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        showToast("Test alert payload dispatched (mock)")
                      }
                      className="flex h-[38px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12.5px] font-medium text-[#111827] hover:bg-[#F9FAFB] cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Test</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: STORES & API */}
        {activeTab === "stores" && (
          <div className="mt-5 space-y-5">
            {/* Store Clusters */}
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111827]">
                    Monitored Store Clusters
                  </h2>
                  <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                    Enable or pause store clusters included in Reports and
                    Products stock counts.
                  </p>
                </div>
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-semibold text-[#111827]">
                  {activeStoreCount} active stores
                </span>
              </div>

              <div className="mt-4 divide-y divide-[#EFF0F6] rounded-[10px] border border-[#EFF0F6]">
                {draft.stores.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#111827]">
                          {cluster.name}
                        </p>
                        <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
                          {cluster.storeCount} stores
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-[#6B7280]">
                        {cluster.region} &middot; {cluster.lastSynced}
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={cluster.enabled}
                      onChange={(next) =>
                        setDraft((prev) => ({
                          ...prev,
                          stores: prev.stores.map((s) =>
                            s.id === cluster.id ? { ...s, enabled: next } : s
                          ),
                        }))
                      }
                      ariaLabel={`Toggle ${cluster.name}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Pipeline API & Export Config */}
            <section className="rounded-[14px] border border-[#EFF0F6] bg-white p-6">
              <h2 className="text-[15px] font-semibold text-[#111827]">
                CV Pipeline API &amp; Configuration Backup
              </h2>
              <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                Use this key for edge camera uploads and automated CSV sync.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex h-[38px] min-w-[260px] flex-1 items-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 font-mono text-[12.5px] text-[#111827]">
                  {showApiKey ? draft.apiKeyPlain : draft.apiKeyMasked}
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKey((prev) => !prev)}
                  className="flex h-[38px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span>{showApiKey ? "Hide" : "Reveal"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(draft.apiKeyPlain);
                    showToast("API key copied to clipboard");
                  }}
                  className="flex h-[38px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EFF0F6] pt-4">
                <div>
                  <p className="text-[13px] font-medium text-[#111827]">
                    Export Workspace Settings
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    Download all thresholds, alert rules, and cluster toggles as
                    JSON (API secret excluded).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportConfig}
                  className="flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12.5px] font-medium text-[#111827] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-16 z-50 rounded-[10px] bg-[#111827] px-4 py-2.5 text-[12.5px] font-medium text-white shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
