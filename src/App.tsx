/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import LycorisSpecimen from "./components/ui/lycoris-specimen";
import { CatalogSection } from "./components/CatalogSection";
import { CheckoutDrawer } from "./components/CheckoutDrawer";
import {
  CartItem,
  FIINA_PRODUCTS,
  FiinaProduct,
  addOrUpdateCartItem,
  formatRupiah,
  updateCartItemQuantity,
} from "./data/products";
import { StageShape } from "./utils/panGeometry";

export default function App() {
  // Pre-seed cart with 1 Loyang Love Set Isi 3 so the user can test checkout immediately or modify it
  const [cart, setCart] = React.useState<CartItem[]>(() =>
    addOrUpdateCartItem([], FIINA_PRODUCTS[0], 1)
  );
  const [activeShape, setActiveShape] = React.useState<StageShape>("love");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const totalItems = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalSubtotal = React.useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const handleAddToCart = React.useCallback(
    (product: FiinaProduct, quantity: number, variantId?: string) => {
      setCart((prev) => addOrUpdateCartItem(prev, product, quantity, variantId));
      setToastMessage(`${quantity}x ${product.shortName} ditambahkan ke keranjang`);
    },
    []
  );

  React.useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleUpdateQty = React.useCallback(
    (cartItemId: string, delta: number) => {
      setCart((prev) => updateCartItemQuantity(prev, cartItemId, delta));
    },
    []
  );

  const handleClearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePreviewIn3D = (shape: StageShape) => {
    setActiveShape(shape);
    scrollToElement("panggung-3d");
  };

  return (
    <div className="min-h-screen w-full bg-[#F6EFE2] text-[#281C16]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-12 md:h-14 flex items-center justify-between gap-3 sm:gap-8 px-4 sm:px-6 md:px-10 bg-[#F6EFE2]/95 border-b border-[#281C16]/12">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#panggung-3d"
          className="text-lg sm:text-xl font-bold tracking-tight text-[#281C16] whitespace-nowrap shrink-0"
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        >
          Fiinastore
        </a>

        {/* Zone 2: Navigation links (compact on mobile, full on desktop) */}
        <nav
          aria-label="Navigasi Utama"
          className="flex items-center gap-3.5 md:gap-7 text-xs md:text-sm font-medium text-[#5C463A]"
        >
          <a
            href="#panggung-3d"
            className="hidden sm:inline-block hover:text-[#281C16] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Panggung 3D
          </a>
          <a
            href="#katalog-produk"
            className="hover:text-[#281C16] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Katalog Set
          </a>
          <a
            href="#panduan-spesifikasi"
            className="hidden md:inline-block hover:text-[#281C16] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Panduan Ukuran
          </a>
          <a
            href="#kemitraan-grosir"
            className="hidden lg:inline-block hover:text-[#281C16] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Grosir Kodi
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            data-testid="open-cart-button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#FAF5EC] bg-[#281C16] hover:bg-[#3B2A22] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono tabular-nums"
          >
            Keranjang ({totalItems}) · {formatRupiah(totalSubtotal)}
          </button>
        </div>
      </header>

      <main>
        {/* Scroll-Scrubbed 6-Frame 3D Baking Pan Stage (Adapted from Lycoris Specimen) */}
        <LycorisSpecimen
          name="Fiinastore"
          studio="Fiinastore Bakeware"
          year="2026"
          activeShape={activeShape}
          onShapeChange={setActiveShape}
          onAddToCart={(product, qty) => handleAddToCart(product, qty)}
          onOpenCheckout={() => setIsDrawerOpen(true)}
          onScrollToCatalog={() => scrollToElement("katalog-produk")}
        />

        {/* Complete 10-Product Catalog Section */}
        <CatalogSection
          onAddToCart={handleAddToCart}
          onPreviewIn3D={handlePreviewIn3D}
        />

        {/* Section 3: Craftsmanship, Sizing & Wholesale Kemitraan Guide */}
        <section
          id="panduan-spesifikasi"
          className="w-full py-16 px-6 md:px-12 border-t border-[#281C16]/12 bg-[#EFE6D4]"
        >
          <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-[#B84A27] uppercase tracking-wider">
                  02. Panduan Ukuran &amp; Konstruksi
                </div>
                <h2
                  className="mt-2 text-2xl md:text-3xl font-semibold text-[#281C16]"
                  style={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    textWrap: "balance",
                  }}
                >
                  Mengapa Loyang Fiinastore Dijual dalam Susunan Set Berjenjang?
                </h2>
                <p className="mt-3 text-sm text-[#4A372D] leading-relaxed">
                  Mayoritas seri loyang Fiinastore dirancang dalam ukuran
                  berjenjang (18, 20, dan 22 cm untuk Set Isi 3; atau 18, 20,
                  22, 24, dan 26 cm untuk Set Tebal Isi 5). Susunan ini membuat
                  ketiga atau kelima loyang dapat masuk menyatu (*nested*) saat
                  dikemas maupun disimpan di dapur—menghemat ongkos kirim
                  sekaligus menjaga loyang tidak mudah penyok di perjalanan.
                </p>
              </div>

              <div
                id="kemitraan-grosir"
                className="mt-8 p-5 rounded-xl bg-[#FAF5EC] border border-[#281C16]/12"
              >
                <div className="text-xs font-mono text-[#B84A27]">
                  PROGRAM KEMITRAAN &amp; GROSIR PER KODI (20 PCS)
                </div>
                <div className="mt-1 text-base font-semibold text-[#281C16]">
                  Khusus Toko Bahan Kue &amp; Produksi Bakery
                </div>
                <p className="mt-1.5 text-xs text-[#4A372D] leading-relaxed">
                  Untuk Loyang Oven Kue Kering (No. 3 Rp380.000/kodi, No. 4
                  Rp350.000/kodi) dan Loyang Lidah Kucing Uk. 22
                  (Rp360.000/kodi), pemesanan dilayani per kodi dengan opsi
                  ekspedisi kargo hemat.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl bg-[#FAF5EC] border border-[#281C16]/12 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-[#6B5344]">
                    SERI REGULER · SET ISI 3 PCS
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[#281C16]">
                    Love, Bulat, Segi, Bronis &amp; Pai
                  </h3>
                  <p className="mt-2 text-xs text-[#4A372D] leading-relaxed">
                    Pilihan ekonomis untuk kreasi kue harian. Ukuran 18, 20, dan
                    22 cm dengan tinggi standar 5 cm (khusus Pai tinggi 3.5 cm).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#281C16]/10 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span>Rentang Harga Set</span>
                  <span className="font-bold text-[#B84A27]">
                    Rp32.000 – Rp42.000
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#FAF5EC] border border-[#281C16]/12 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-[#6B5344]">
                    SERI HEAVY-DUTY · SET ISI 5 PCS
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[#281C16]">
                    Bulat Tebal &amp; Segi Aluminium Tebal
                  </h3>
                  <p className="mt-2 text-xs text-[#4A372D] leading-relaxed">
                    Plat aluminium ekstra tebal dan kokoh untuk pemakaian jangka
                    panjang. Lengkap 5 ukuran: 18, 20, 22, 24, dan 26 cm.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#281C16]/10 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span>Harga Paket 5 Ukuran</span>
                  <span className="font-bold text-[#B84A27]">
                    Rp65.000 / set
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#FAF5EC] border border-[#281C16]/12 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-[#6B5344]">
                    OPSI FLEKSIBEL · BISA SATUAN
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[#281C16]">
                    Loyang Segiempat Tinggi (Isi 2)
                  </h3>
                  <p className="mt-2 text-xs text-[#4A372D] leading-relaxed">
                    Ukuran 18×18 cm dan 20×20 cm dengan dinding lebih tinggi
                    (6–7 cm). Satu-satunya varian yang dapat dibeli per set
                    maupun ecer satuan.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#281C16]/10 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span>Harga 1 Set Isi 2</span>
                  <span className="font-bold text-[#B84A27]">
                    Rp37.500 / set
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#FAF5EC] border border-[#281C16]/12 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-[#6B5344]">
                    SIMULASI CHECKOUT LANGSUNG
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-[#281C16]">
                    Uji Alur Belanja Sampai Bukti Order
                  </h3>
                  <p className="mt-2 text-xs text-[#4A372D] leading-relaxed">
                    Klik tombol di bawah untuk membuka keranjang, mengisi alamat
                    pengiriman, memilih kurir, dan melihat bukti konfirmasi
                    pesanan simulasi.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#281C16]/10">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full py-2 text-xs font-semibold bg-[#281C16] text-[#FAF5EC] rounded-md hover:bg-[#3B2A22] cursor-pointer"
                  >
                    Buka Simulasi Checkout ({totalItems} Item)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="w-full py-10 px-6 md:px-12 border-t border-[#281C16]/12 bg-[#F6EFE2] text-xs text-[#5C463A]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span
              className="font-bold text-sm text-[#281C16] mr-2"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Fiinastore
            </span>
            <span>
              Solusi Perlengkapan Dapur &amp; Cetakan Kue Aluminium Anda.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#panggung-3d" className="hover:text-[#281C16]">
              Ke Atas (Panggung 3D)
            </a>
            <span aria-hidden="true">·</span>
            <a href="#katalog-produk" className="hover:text-[#281C16]">
              Katalog 10 Produk
            </a>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="hover:text-[#B84A27] font-semibold cursor-pointer"
            >
              Keranjang &amp; Checkout Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#281C16] text-[#FAF5EC] text-xs shadow-lg border border-[#FAF5EC]/15"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setIsDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded bg-[#B84A27] text-[#FAF5EC] font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            Lihat Keranjang
          </button>
        </div>
      )}

      {/* Slide-Over Cart & 3-Step Checkout Drawer */}
      <CheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
