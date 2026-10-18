import * as React from "react";
import {
  CartItem,
  CheckoutFormInput,
  SHIPPING_OPTIONS,
  calculateOrderSummary,
  formatRupiah,
  validateCheckoutForm,
} from "../data/products";
import { PanStudioIllustration } from "./PanStudioIllustration";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onClearCart: () => void;
}

type Step = "cart" | "checkout" | "confirmed";

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
}) => {
  const [step, setStep] = React.useState<Step>("cart");
  const [form, setForm] = React.useState<CheckoutFormInput>({
    fullName: "",
    whatsapp: "",
    cityDistrict: "",
    postalCode: "",
    address: "",
    notes: "",
    shippingId: "reguler-hemat",
    paymentMethod: "qris",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof CheckoutFormInput, string>>
  >({});
  const [confirmedOrder, setConfirmedOrder] = React.useState<{
    orderId: string;
    timestamp: string;
    items: CartItem[];
    summary: ReturnType<typeof calculateOrderSummary>;
    customer: CheckoutFormInput;
  } | null>(null);

  const summary = React.useMemo(
    () => calculateOrderSummary(cart, form.shippingId),
    [cart, form.shippingId]
  );

  if (!isOpen) return null;

  const handleFillSampleAddress = () => {
    setForm((prev) => ({
      ...prev,
      fullName: "Rina Wulandari (Toko Kue Rina)",
      whatsapp: "081288997766",
      cityDistrict: "Surabaya, Gubeng",
      postalCode: "60281",
      address: "Jl. Dharmawangsa No. 45 RT 03 RW 02, Kel. Airlangga",
      notes: "Tolong dipacking kardus tebal, untuk pesanan kue ulang tahun.",
    }));
    setErrors({});
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCheckoutForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const orderNum = 1040 + Math.floor(Math.random() * 890);
    setConfirmedOrder({
      orderId: `FIINA-DEMO-${orderNum}`,
      timestamp: new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      items: [...cart],
      summary,
      customer: { ...form },
    });
    onClearCart();
    setStep("confirmed");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang dan Simulasi Checkout Fiinastore"
      className="fixed inset-0 z-50 flex justify-end bg-[#281C16]/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg h-full bg-[#FAF5EC] text-[#281C16] flex flex-col justify-between border-l border-[#281C16]/15 overflow-hidden">
        {/* Drawer Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#EFE6D4] border-b border-[#281C16]/12 flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono text-[#B84A27] uppercase">
              Simulasi Belanja Langsung · Demo Mode
            </div>
            <h2
              className="text-base sm:text-lg font-semibold text-[#281C16]"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              {step === "cart" && `Keranjang Belanja (${summary.totalItems})`}
              {step === "checkout" && "Alamat Pengiriman & Pembayaran"}
              {step === "confirmed" && "Konfirmasi Pesanan Simulasi"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel keranjang"
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold border border-[#281C16]/20 rounded-md hover:border-[#281C16] cursor-pointer"
          >
            Tutup ✕
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-4 py-2 sm:px-6 sm:py-2.5 bg-[#F6EFE2] border-b border-[#281C16]/10 flex items-center gap-2 sm:gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => step !== "confirmed" && setStep("cart")}
            className={`cursor-pointer ${
              step === "cart" ? "text-[#B84A27] font-bold" : "text-[#6B5344]"
            }`}
          >
            1. Keranjang
          </button>
          <span aria-hidden="true">→</span>
          <button
            type="button"
            disabled={cart.length === 0 || step === "confirmed"}
            onClick={() => cart.length > 0 && setStep("checkout")}
            className={`cursor-pointer disabled:cursor-not-allowed ${
              step === "checkout"
                ? "text-[#B84A27] font-bold"
                : "text-[#6B5344]"
            }`}
          >
            2. Alamat &amp; Pembayaran
          </button>
          <span aria-hidden="true">→</span>
          <span
            className={
              step === "confirmed"
                ? "text-[#B84A27] font-bold"
                : "text-[#6B5344]"
            }
          >
            3. Konfirmasi Demo
          </span>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* ==== STEP 1: CART ==== */}
          {step === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-base font-semibold text-[#281C16]">
                    Keranjang belanja masih kosong.
                  </p>
                  <p className="text-xs text-[#5C463A] max-w-xs mx-auto">
                    Pilih Loyang Love Set Isi 3 (Rp42.000) atau bentuk loyang
                    lainnya di panggung 3D maupun katalog untuk mencoba alur
                    checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      data-testid={`cart-item-${item.cartItemId}`}
                      className="flex gap-3.5 p-3.5 rounded-lg border border-[#281C16]/12 bg-[#F6EFE2]"
                    >
                      <div className="w-20 h-16 rounded overflow-hidden shrink-0 border border-[#281C16]/10">
                        <PanStudioIllustration
                          kind={item.illustrationKind}
                          compact
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#281C16] truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#5C463A]">
                          {item.variantLabel} · {item.sizesSummary}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold tabular-nums text-[#B84A27]">
                            {formatRupiah(item.unitPrice * item.quantity)}
                          </span>

                          <div className="flex items-center border border-[#281C16]/20 rounded bg-[#FAF5EC]">
                            <button
                              type="button"
                              aria-label={`Kurangi ${item.name}`}
                              onClick={() =>
                                onUpdateQty(item.cartItemId, -1)
                              }
                              className="px-2.5 py-0.5 text-xs font-bold hover:bg-[#281C16]/10 cursor-pointer"
                            >
                              −
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-mono font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Tambah ${item.name}`}
                              onClick={() =>
                                onUpdateQty(item.cartItemId, 1)
                              }
                              className="px-2.5 py-0.5 text-xs font-bold hover:bg-[#281C16]/10 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ==== STEP 2: ADDRESS & PAYMENT FORM ==== */}
          {step === "checkout" && (
            <form
              id="fiina-checkout-form"
              onSubmit={handleSubmitOrder}
              noValidate
              className="space-y-4"
            >
              <div className="p-3 rounded-lg bg-[#EFE6D4] border border-[#281C16]/15 flex items-center justify-between gap-2">
                <span className="text-xs text-[#4A372D]">
                  Ingin coba cepat? Isi otomatis dengan alamat contoh:
                </span>
                <button
                  type="button"
                  onClick={handleFillSampleAddress}
                  className="px-3 py-1 text-xs font-semibold bg-[#281C16] text-[#FAF5EC] rounded cursor-pointer whitespace-nowrap shrink-0"
                >
                  Isi Contoh Alamat
                </button>
              </div>

              <div>
                <label
                  htmlFor="checkout-fullname"
                  className="block text-xs font-semibold text-[#281C16] mb-1"
                >
                  Nama Lengkap Penerima *
                </label>
                <input
                  id="checkout-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="Contoh: Rina Wulandari"
                  className="w-full px-3 py-2 text-sm rounded-md bg-[#F6EFE2] border border-[#281C16]/25 focus:outline-none focus:border-[#B84A27]"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-[#B84A27] font-medium">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="checkout-whatsapp"
                    className="block text-xs font-semibold text-[#281C16] mb-1"
                  >
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    id="checkout-whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp: e.target.value })
                    }
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 text-sm rounded-md bg-[#F6EFE2] border border-[#281C16]/25 focus:outline-none focus:border-[#B84A27]"
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-[#B84A27] font-medium">
                      {errors.whatsapp}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-xs font-semibold text-[#281C16] mb-1"
                  >
                    Kota &amp; Kecamatan *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={form.cityDistrict}
                    onChange={(e) =>
                      setForm({ ...form, cityDistrict: e.target.value })
                    }
                    placeholder="Contoh: Surabaya, Gubeng"
                    className="w-full px-3 py-2 text-sm rounded-md bg-[#F6EFE2] border border-[#281C16]/25 focus:outline-none focus:border-[#B84A27]"
                  />
                  {errors.cityDistrict && (
                    <p className="mt-1 text-xs text-[#B84A27] font-medium">
                      {errors.cityDistrict}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-semibold text-[#281C16] mb-1"
                >
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  id="checkout-address"
                  rows={2}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                  className="w-full px-3 py-2 text-sm rounded-md bg-[#F6EFE2] border border-[#281C16]/25 focus:outline-none focus:border-[#B84A27]"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-[#B84A27] font-medium">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Shipping Selector */}
              <div>
                <div className="text-xs font-semibold text-[#281C16] mb-1.5">
                  Pilih Ekspedisi Pengiriman (Estimasi {summary.estimatedKg} kg)
                </div>
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map((opt) => {
                    const selected = form.shippingId === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer ${
                          selected
                            ? "bg-[#EFE6D4] border-[#B84A27]"
                            : "bg-[#F6EFE2] border-[#281C16]/15"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="shippingId"
                            value={opt.id}
                            checked={selected}
                            onChange={() =>
                              setForm({ ...form, shippingId: opt.id })
                            }
                            className="mt-1"
                          />
                          <div>
                            <div className="text-xs font-semibold text-[#281C16]">
                              {opt.name} · {opt.eta}
                            </div>
                            <div className="text-[11px] text-[#5C463A]">
                              {opt.description}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold tabular-nums">
                          {formatRupiah(opt.pricePerKg * summary.estimatedKg)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label
                  htmlFor="checkout-payment"
                  className="block text-xs font-semibold text-[#281C16] mb-1"
                >
                  Metode Pembayaran (Simulasi Demo)
                </label>
                <select
                  id="checkout-payment"
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target
                        .value as CheckoutFormInput["paymentMethod"],
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md bg-[#F6EFE2] border border-[#281C16]/25"
                >
                  <option value="qris">QRIS Instan (Semua E-Wallet &amp; M-Banking)</option>
                  <option value="transfer-bca">Transfer Bank BCA — Rek. Fiinastore</option>
                  <option value="transfer-mandiri">Transfer Bank Mandiri — Rek. Fiinastore</option>
                  <option value="cod">COD (Bayar di Tempat Saat Kurir Tiba)</option>
                </select>
              </div>
            </form>
          )}

          {/* ==== STEP 3: CONFIRMED SIMULATION RECEIPT ==== */}
          {step === "confirmed" && confirmedOrder && (
            <div
              data-testid="order-confirmation-receipt"
              className="p-5 rounded-xl bg-[#EFE6D4] border border-[#281C16]/20 space-y-4"
            >
              <div className="pb-3 border-b border-[#281C16]/12">
                <div className="text-xs font-mono font-bold text-[#B84A27]">
                  SIMULASI DEMO BERHASIL · BELUM ADA TRANSAKSI SUNGGUHAN
                </div>
                <h3
                  className="mt-1 text-xl font-semibold text-[#281C16]"
                  style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                >
                  Pesanan #{confirmedOrder.orderId} Tercatat
                </h3>
                <p className="text-xs text-[#5C463A] mt-0.5">
                  Waktu simulasi: {confirmedOrder.timestamp}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-[#281C16]">
                  Data Penerima:
                </div>
                <div>{confirmedOrder.customer.fullName}</div>
                <div>WA: {confirmedOrder.customer.whatsapp}</div>
                <div>
                  {confirmedOrder.customer.address},{" "}
                  {confirmedOrder.customer.cityDistrict}
                </div>
              </div>

              <div className="pt-3 border-t border-[#281C16]/12 space-y-2 text-xs">
                <div className="font-semibold text-[#281C16]">
                  Rincian Pesanan Loyang:
                </div>
                {confirmedOrder.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex justify-between gap-2"
                  >
                    <span>
                      {item.quantity}x {item.name} ({item.variantLabel})
                    </span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-[#5C463A] pt-1">
                  <span>
                    Ongkir ({confirmedOrder.summary.shippingOption.name})
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatRupiah(confirmedOrder.summary.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#281C16] pt-2 border-t border-[#281C16]/15">
                  <span>Total Pembayaran Simulasi</span>
                  <span className="font-mono tabular-nums text-[#B84A27]">
                    {formatRupiah(confirmedOrder.summary.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#FAF5EC] text-[11px] text-[#5C463A] leading-relaxed">
                Catatan Demo: Halaman ini adalah simulasi alur belanja untuk
                presentasi ke calon klien Fiinastore. Integrasi payment gateway
                otomatis atau penerusan order ke WhatsApp Admin dapat diaktifkan
                setelah konfirmasi rekening &amp; kota asal pengiriman.
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-[#EFE6D4] border-t border-[#281C16]/15">
          {step !== "confirmed" && cart.length > 0 && (
            <div className="mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-[#5C463A]">
                <span>Subtotal Produk ({summary.totalItems} item)</span>
                <span className="font-mono tabular-nums">
                  {formatRupiah(summary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#5C463A]">
                <span>
                  Estimasi Ongkir ({summary.estimatedKg} kg ·{" "}
                  {summary.shippingOption.name})
                </span>
                <span className="font-mono tabular-nums">
                  {formatRupiah(summary.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#281C16] pt-1.5 border-t border-[#281C16]/12">
                <span>Total Estimasi</span>
                <span className="font-mono tabular-nums text-[#B84A27]">
                  {formatRupiah(summary.grandTotal)}
                </span>
              </div>
            </div>
          )}

          {step === "cart" && (
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setStep("checkout")}
              className="w-full py-3 text-xs font-semibold bg-[#B84A27] text-[#FAF5EC] rounded-lg hover:bg-[#A13D1E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Lanjut ke Alamat &amp; Pembayaran →
            </button>
          )}

          {step === "checkout" && (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="px-4 py-3 text-xs font-semibold border border-[#281C16]/25 rounded-lg hover:border-[#281C16] cursor-pointer"
              >
                ← Kembali
              </button>
              <button
                type="submit"
                form="fiina-checkout-form"
                className="flex-1 py-3 text-xs font-semibold bg-[#B84A27] text-[#FAF5EC] rounded-lg hover:bg-[#A13D1E] cursor-pointer"
              >
                Buat Pesanan Simulasi ({formatRupiah(summary.grandTotal)})
              </button>
            </div>
          )}

          {step === "confirmed" && (
            <button
              type="button"
              onClick={() => {
                setStep("cart");
                onClose();
              }}
              className="w-full py-3 text-xs font-semibold bg-[#281C16] text-[#FAF5EC] rounded-lg hover:bg-[#3D2B22] cursor-pointer"
            >
              Selesai &amp; Kembali ke Toko
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
