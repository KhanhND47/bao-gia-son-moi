"use client";

import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";

import {
  ITEM_TYPE_LABELS,
  type VehicleSegment,
  VEHICLE_SEGMENT_LABELS,
  VEHICLE_SEGMENTS,
} from "@/lib/constants";
import { formatVnd } from "@/lib/format";

type QuoteItem = {
  id: string;
  code: string;
  name: string;
  type: "PART" | "PACKAGE";
  description: string | null;
  prices: Record<VehicleSegment, number>;
};

type QuoteAppProps = {
  items: QuoteItem[];
};

type QuoteRow = {
  id: string;
  name: string;
  price: number;
};

function toFileSlug(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "khach-hang"
  );
}

export function QuoteApp({ items }: QuoteAppProps) {
  const [customerName, setCustomerName] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<VehicleSegment | null>(null);
  const [activeTab, setActiveTab] = useState<"PART" | "PACKAGE">("PART");
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const quoteImageRef = useRef<HTMLDivElement | null>(null);

  const trimmedCustomerName = customerName.trim();
  const trimmedVehicleName = vehicleName.trim();
  const trimmedVehicleYear = vehicleYear.trim();
  const isVehicleYearValid = /^\d{4}$/.test(trimmedVehicleYear);
  const isInfoCompleted = Boolean(
    trimmedCustomerName && trimmedVehicleName && selectedSegment && isVehicleYearValid,
  );

  const partItems = useMemo(() => items.filter((item) => item.type === "PART"), [items]);
  const packageItems = useMemo(() => items.filter((item) => item.type === "PACKAGE"), [items]);

  const selectedPartItems = useMemo(
    () => partItems.filter((item) => selectedPartIds.includes(item.id)),
    [partItems, selectedPartIds],
  );

  const selectedPackage = useMemo(
    () => packageItems.find((item) => item.id === selectedPackageId) ?? null,
    [packageItems, selectedPackageId],
  );

  const partTotal = useMemo(() => {
    if (!selectedSegment) {
      return 0;
    }

    return selectedPartItems.reduce((total, item) => total + item.prices[selectedSegment], 0);
  }, [selectedPartItems, selectedSegment]);

  const packageTotal = useMemo(() => {
    if (!selectedSegment || !selectedPackage) {
      return 0;
    }

    return selectedPackage.prices[selectedSegment];
  }, [selectedPackage, selectedSegment]);

  const quoteRows = useMemo<QuoteRow[]>(() => {
    if (!selectedSegment || !isInfoCompleted) {
      return [];
    }

    if (activeTab === "PART") {
      return selectedPartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.prices[selectedSegment],
      }));
    }

    if (!selectedPackage) {
      return [];
    }

    return [
      {
        id: selectedPackage.id,
        name: selectedPackage.name,
        price: selectedPackage.prices[selectedSegment],
      },
    ];
  }, [activeTab, isInfoCompleted, selectedPackage, selectedPartItems, selectedSegment]);

  const quoteTotal = activeTab === "PART" ? partTotal : packageTotal;
  const canSelectItems = isInfoCompleted;

  function handlePartToggle(itemId: string): void {
    setSelectedPartIds((current) => {
      if (current.includes(itemId)) {
        return current.filter((id) => id !== itemId);
      }

      return [...current, itemId];
    });
  }

  function handleReset(): void {
    setSelectedPartIds([]);
    setSelectedPackageId(null);
    setDownloadError(null);
  }

  async function handleDownloadPng(): Promise<void> {
    if (!quoteImageRef.current || !selectedSegment || !canSelectItems || quoteRows.length === 0) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const exportNode = quoteImageRef.current;
      const exportWidth = exportNode.scrollWidth;
      const exportHeight = exportNode.scrollHeight;

      const dataUrl = await toPng(exportNode, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: exportWidth,
        height: exportHeight,
        style: {
          margin: "0",
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `bao-gia-son-${toFileSlug(trimmedCustomerName)}-${Date.now()}.png`;
      link.click();
    } catch {
      setDownloadError("Không thể tạo ảnh PNG, vui lòng thử lại.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-8 md:p-8 print:p-0">
      <header className="rounded-2xl bg-linear-to-r from-slate-900 to-slate-700 p-6 text-white shadow-sm print:rounded-none">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-200">Bảng báo giá</p>
        <h1 className="mt-1 text-3xl font-bold">Báo giá sơn xe ô tô</h1>
        <p className="mt-2 text-sm text-slate-200">
          Nhập đủ thông tin khách và xe trước khi bắt đầu chọn hạng mục báo giá.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 print:shadow-none">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">1. Thông tin khách hàng và xe</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Tên khách hàng *</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Ví dụ: Trần An"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 transition focus:ring-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Tên xe *</span>
            <input
              type="text"
              value={vehicleName}
              onChange={(event) => setVehicleName(event.target.value)}
              placeholder="Ví dụ: Vios"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 transition focus:ring-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Đời xe (YYYY) *</span>
            <input
              type="text"
              value={vehicleYear}
              onChange={(event) => setVehicleYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Ví dụ: 2022"
              inputMode="numeric"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-amber-500 transition focus:ring-2"
            />
          </label>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Phân khúc xe *</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
            {VEHICLE_SEGMENTS.map((segment) => {
              const isActive = selectedSegment === segment;
              return (
                <button
                  key={segment}
                  type="button"
                  onClick={() => setSelectedSegment(segment)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {VEHICLE_SEGMENT_LABELS[segment]}
                </button>
              );
            })}
          </div>
        </div>

        {!isInfoCompleted && (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            Vui lòng nhập đủ Tên khách hàng, Tên xe, Đời xe (4 số) và chọn Phân khúc trước khi chọn
            hạng mục báo giá.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 print:shadow-none">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">2. Chọn hạng mục báo giá</h2>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("PART")}
            disabled={!canSelectItems}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "PART"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            } ${!canSelectItems ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {ITEM_TYPE_LABELS.PART}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PACKAGE")}
            disabled={!canSelectItems}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === "PACKAGE"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            } ${!canSelectItems ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {ITEM_TYPE_LABELS.PACKAGE}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!canSelectItems}
            className={`ml-auto rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 ${
              canSelectItems ? "hover:bg-slate-50" : "cursor-not-allowed opacity-50"
            }`}
          >
            Làm mới lựa chọn
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={!canSelectItems || quoteRows.length === 0 || isDownloading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              !canSelectItems || quoteRows.length === 0 || isDownloading
                ? "cursor-not-allowed bg-amber-300"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {isDownloading ? "Đang tạo PNG..." : "Tải ảnh PNG"}
          </button>
        </div>

        {!canSelectItems && (
          <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            Hoàn thành bước 1 để bắt đầu chọn hạng mục hoặc gói sơn quay.
          </div>
        )}

        {downloadError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {downloadError}
          </div>
        )}

        {activeTab === "PART" ? (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2">
              {partItems.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-3 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPartIds.includes(item.id)}
                      disabled={!canSelectItems}
                      onChange={() => handlePartToggle(item.id)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedSegment ? formatVnd(item.prices[selectedSegment]) : "-"}
                  </span>
                </label>
              ))}
            </div>

            <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-700">Mục đã chọn</h3>
              <div className="mt-3 space-y-2">
                {selectedPartItems.length === 0 && (
                  <p className="text-sm text-slate-500">Chưa có hạng mục nào được chọn.</p>
                )}
                {selectedPartItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-semibold text-slate-900">
                      {selectedSegment ? formatVnd(item.prices[selectedSegment]) : "-"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">Tổng tiền hạng mục lẻ</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{formatVnd(partTotal)}</p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {packageItems.map((item) => {
              const isSelected = selectedPackageId === item.id;
              return (
                <label
                  key={item.id}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="radio"
                      name="package-selection"
                      checked={isSelected}
                      disabled={!canSelectItems}
                      onChange={() => setSelectedPackageId(item.id)}
                      className="mt-1 h-4 w-4 accent-amber-500"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                      {item.description && <p className="mt-1 text-xs text-slate-600">{item.description}</p>}
                      <p className="mt-3 text-lg font-bold text-amber-600">
                        {selectedSegment ? formatVnd(item.prices[selectedSegment]) : "-"}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}

            <div className="md:col-span-2 lg:col-span-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Giá gói sơn quay đã chọn</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{formatVnd(packageTotal)}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Gói sơn quay là nhóm độc lập và không cộng tự động với hạng mục lẻ.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 print:shadow-none">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">3. Mẫu ảnh báo giá</h2>
        <p className="mb-4 text-sm text-slate-600">
          Ảnh báo giá sẽ theo nhóm: {ITEM_TYPE_LABELS[activeTab]}. Sau khi chọn xong, bấm <strong>Tải ảnh PNG</strong> để gửi cho khách.
        </p>

        {quoteRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            Chưa có dữ liệu để xuất ảnh. Vui lòng chọn ít nhất 1 hạng mục ở tab hiện tại.
          </div>
        ) : (
          <div className="rounded-lg bg-slate-100 p-2 md:p-3">
            <div
              ref={quoteImageRef}
              className="mx-auto w-[520px] max-w-full bg-white p-3 text-slate-900 md:p-4"
            >
              <div className="rounded-md bg-white px-3 py-2 text-center text-base font-bold shadow-[0_8px_20px_rgba(15,23,42,0.12)] md:text-xl">
                BÁO GIÁ SƠN TẠI DANA 365 GARAGE
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-white p-2 text-[13px] shadow-[0_8px_20px_rgba(15,23,42,0.12)] md:text-[15px]">
                <div className="rounded bg-slate-50 px-2 py-1.5 font-semibold">
                  Khách hàng: <span className="font-medium">{trimmedCustomerName}</span>
                </div>
                <div className="rounded bg-slate-50 px-2 py-1.5 font-semibold">
                  Tên xe: <span className="font-medium">{trimmedVehicleName}</span>
                </div>
                <div className="rounded bg-slate-50 px-2 py-1.5 font-semibold">
                  Phân khúc:{" "}
                  <span className="font-medium">
                    {selectedSegment ? VEHICLE_SEGMENT_LABELS[selectedSegment] : ""}
                  </span>
                </div>
                <div className="rounded bg-slate-50 px-2 py-1.5 font-semibold">
                  Đời xe: <span className="font-medium">{trimmedVehicleYear}</span>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded-md bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                <div className="grid grid-cols-[66%_34%] bg-slate-800 px-2 py-1.5 text-[13px] font-bold text-white md:text-[15px]">
                  <p>Hạng mục</p>
                  <p className="text-right">Đơn giá</p>
                </div>
                <div className="space-y-px bg-slate-200">
                  {quoteRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[66%_34%] bg-white px-2 py-1.5 text-[13px] md:text-[15px]">
                      <p>{row.name}</p>
                      <p className="text-right">{formatVnd(row.price)}</p>
                    </div>
                  ))}
                  <div className="grid grid-cols-[66%_34%] bg-red-600 px-2 py-1.5 text-[13px] font-semibold text-white md:text-[15px]">
                    <p>Tổng cộng</p>
                    <p className="text-right">{formatVnd(quoteTotal)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded-md bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                <div className="bg-red-600 px-2 py-1.5 text-center text-sm font-bold text-white md:text-base">
                  CAM KẾT
                </div>
                <div className="space-y-1 px-2 py-2 text-[12px] leading-5 md:text-sm">
                  <p>- Bảo hành sơn bóng tróc 5 năm</p>
                  <p>- Cam kết sơn món đồng màu (Gara sẽ tiến hành sơn lại nếu pha lệch màu)</p>
                  <p>- Sử dụng sơn Cromax cao cấp chính hãng của Mỹ</p>
                  <p>- Sử dụng quy trình, thiết bị và phòng sơn chuẩn hãng</p>
                  <p>- Giao xe đúng hẹn và rửa dọn xe sạch sẽ trước khi giao xe cho khách hàng</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
