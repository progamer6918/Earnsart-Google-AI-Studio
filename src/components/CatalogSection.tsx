import * as React from "react";
import {
  FIINA_PRODUCTS,
  FiinaProduct,
  ProductCategory,
  filterProducts,
  formatRupiah,
} from "../data/products";
import { StageShape } from "../utils/panGeometry";
import { PanStudioIllustration } from "./PanStudioIllustration";

interface CatalogSectionProps {
  onAddToCart: (
    product: FiinaProduct,
    quantity: number,
    variantId?: string
  ) => void;
  onPreviewIn3D: (shape: StageShape) => void;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "all", label: "Semua Koleksi (11)" },
  { id: "set-3", label: "Set Isi 3 Reguler" },
  { id: "set-5-tebal", label: "Set Tebal Isi 5" },
  { id: "satuan", label: "Bisa Satuan" },
  { id: "grosir-kodi", label: "Grosir / Kodi" },
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  onAddToCart,
  onPreviewIn3D,
}) => {
  const [activeCategory, setActiveCategory] =
    React.useState<ProductCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedVariants, setSelectedVariants] = React.useState<
    Record<string, string>
  >({
    "loyang-segi-isi2-tinggi": "set-2pcs",
    "loyang-oven-kodi": "oven-no4",
    "loyang-lidah-kucing-kodi": "lidah-kucing-22",
  });
  const [detailProduct, setDetailProduct] =
    React.useState<FiinaProduct | null>(null);

  const visibleProducts = React.useMemo(
    () => filterProducts(FIINA_PRODUCTS, activeCategory, searchQuery),
    [activeCategory, searchQuery]
  );

  const getChosenVariant = (product: FiinaProduct) => {
    if (!product.variants || product.variants.length === 0) return undefined;
    const selId = selectedVariants[product.id];
    return (
      product.variants.find((v) => v.id === selId) ?? product.variants[0]
    );
  };

  return (
    <section
      id="katalog-produk"
      className="relative w-full py-20 px-6 md:px-12 max-w-[1360px] mx-auto"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#281C16]/12">
        <div>
          <div className="text-xs font-mono tracking-wider text-[#B84A27] uppercase">
            01. Katalog Lengkap Fiinastore
          </div>
          <h2
            className="mt-2 text-3xl md:text-4xl font-semibold text-[#281C16] tracking-tight"
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              textWrap: "balance",
            }}
          >
            Koleksi Cetakan Loyang Aluminium Presisi
          </h2>
          <p className="mt-2 text-sm md:text-base text-[#5C463A] max-w-2xl">
            Seluruh ukuran, ketebalan, dan harga di bawah ini mengacu langsung
            pada daftar produk resmi Fiinastore—mulai dari paket rumahan Set Isi
            3 hingga paket grosir per kodi untuk usaha bakery.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 shrink-0">
          <label htmlFor="catalog-search" className="sr-only">
            Cari produk loyang atau jenis kue
          </label>
          <input
            id="catalog-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari: love, bronis, pai, kodi..."
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#EFE6D4] border border-[#281C16]/20 text-[#281C16] placeholder-[#7A6254] focus:outline-none focus:border-[#B84A27]"
          />
        </div>
      </div>

      {/* Interactive Filter Tabs (Functional Segmented Buttons) */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter kategori loyang"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EFE6D4] rounded-lg border border-[#281C16]/10"
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#281C16] text-[#F6EFE2]"
                    : "text-[#5C463A] hover:text-[#281C16]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-[#5C463A] font-mono tabular-nums">
          Menampilkan {visibleProducts.length} dari {FIINA_PRODUCTS.length}{" "}
          produk
        </div>
      </div>

      {/* Empty Search State */}
      {visibleProducts.length === 0 ? (
        <div className="mt-10 p-12 text-center rounded-xl border border-[#281C16]/15 bg-[#EFE6D4]/60">
          <p className="text-base font-semibold text-[#281C16]">
            Tidak ada loyang yang cocok dengan pencarian &ldquo;{searchQuery}
            &rdquo;.
          </p>
          <p className="mt-1 text-xs text-[#5C463A]">
            Coba kata kunci lain seperti &ldquo;love&rdquo;, &ldquo;bulat&rdquo;,
            &ldquo;rigi&rdquo;, atau tampilkan semua kategori.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-[#B84A27] text-[#FAF5EC] rounded-md cursor-pointer"
          >
            Reset Filter Katalog
          </button>
        </div>
      ) : (
        /* 3-Column Product Grid */
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {visibleProducts.map((product) => {
            const chosenVariant = getChosenVariant(product);
            const displayPrice = chosenVariant
              ? chosenVariant.price
              : product.price;
            const displayUnit = chosenVariant
              ? chosenVariant.unitLabel
              : product.unit;
            const isOutOfStock = chosenVariant ? !chosenVariant.inStock : false;

            return (
              <article
                key={product.id}
                data-testid={`product-card-${product.id}`}
                className="group flex flex-col justify-between rounded-xl border border-[#281C16]/12 bg-[#FAF5EC] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  {/* 4:3 Studio Product Render */}
                  <div className="relative aspect-[4/3] w-full border-b border-[#281C16]/10 overflow-hidden">
                    <PanStudioIllustration
                      kind={product.illustrationKind}
                      sizesLabel={product.sizes.join(" · ")}
                      heightLabel={product.heightCm}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Clean Unboxed Metadata with Dot Separators */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6B5344]">
                      <span>{product.setCountLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>Tinggi {product.heightCm}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#B84A27]">
                        {product.purchaseRuleLabel}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-base font-semibold text-[#281C16] leading-snug">
                      {product.name}
                    </h3>

                    <p className="mt-1.5 text-xs text-[#5C463A] leading-relaxed line-clamp-2">
                      {product.description}
                    </p>

                    {/* Sizes & Ideal For */}
                    <div className="mt-3 pt-3 border-t border-[#281C16]/10 text-xs text-[#4A372D] space-y-1">
                      <div>
                        <span className="text-[#6B5344]">Ukuran: </span>
                        <span className="font-mono font-medium text-[#281C16]">
                          {product.sizes.join(", ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#6B5344]">Cocok untuk: </span>
                        <span>{product.idealFor.join(", ")}</span>
                      </div>
                    </div>

                    {/* Variant Selector if product has options (Satuan vs Set or Kodi sizes) */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-3 pt-2">
                        <label
                          htmlFor={`variant-${product.id}`}
                          className="block text-[11px] font-medium text-[#5C463A] mb-1"
                        >
                          Pilih Varian / Ukuran:
                        </label>
                        <select
                          id={`variant-${product.id}`}
                          value={chosenVariant?.id}
                          onChange={(e) =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [product.id]: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#EFE6D4] border border-[#281C16]/20 text-[#281C16] font-medium focus:outline-none focus:border-[#B84A27]"
                        >
                          {product.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label} — {formatRupiah(v.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Tabular Price & Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-[#281C16]/10 flex items-center justify-between gap-3 bg-[#F6EFE2]/60">
                  <div>
                    <div className="text-[11px] text-[#6B5344]">Harga</div>
                    <div className="text-base font-mono font-bold tabular-nums text-[#281C16]">
                      {formatRupiah(displayPrice)}
                      <span className="text-xs font-normal text-[#5C463A]">
                        /{displayUnit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="px-2.5 py-2 text-xs font-medium text-[#281C16] border border-[#281C16]/20 rounded-md hover:border-[#281C16] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() =>
                        onAddToCart(product, 1, chosenVariant?.id)
                      }
                      className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-transform whitespace-nowrap shrink-0 ${
                        isOutOfStock
                          ? "bg-[#D5C9B8] text-[#7A6B5E] cursor-not-allowed"
                          : "bg-[#B84A27] text-[#FAF5EC] hover:bg-[#A13D1E] active:scale-95 cursor-pointer"
                      }`}
                    >
                      {isOutOfStock ? "Stok Kosong" : "+ Keranjang"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Product Specification Modal */}
      {detailProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#281C16]/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailProduct(null);
          }}
        >
          <div className="w-full max-w-2xl max-h-[90svh] overflow-y-auto rounded-xl bg-[#FAF5EC] border border-[#281C16]/20 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b md:border-b-0 md:border-r border-[#281C16]/12">
                <PanStudioIllustration
                  kind={detailProduct.illustrationKind}
                  sizesLabel={detailProduct.sizes.join(" · ")}
                  heightLabel={detailProduct.heightCm}
                  className="w-full h-full min-h-[200px] sm:min-h-[240px]"
                />
              </div>
              <div className="p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#B84A27] font-mono">
                    {detailProduct.setCountLabel} · Tinggi{" "}
                    {detailProduct.heightCm}
                  </div>
                  <h3
                    id="modal-product-title"
                    className="mt-1 text-xl font-semibold text-[#281C16]"
                    style={{ fontFamily: '"Fraunces", Georgia, serif' }}
                  >
                    {detailProduct.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#4A372D] leading-relaxed">
                    {detailProduct.description}
                  </p>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-[#281C16]">
                      Keunggulan Konstruksi:
                    </div>
                    <ul className="mt-1.5 space-y-1 text-xs text-[#4A372D]">
                      {detailProduct.highlights.map((h) => (
                        <li key={h}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#281C16]/12 flex items-center justify-between gap-2">
                  <div className="font-mono font-bold text-lg text-[#281C16] tabular-nums">
                    {formatRupiah(detailProduct.price)}
                    <span className="text-xs font-normal text-[#5C463A]">
                      /{detailProduct.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onPreviewIn3D(detailProduct.shape3d);
                        setDetailProduct(null);
                      }}
                      className="px-3 py-2 text-xs font-medium border border-[#281C16]/25 rounded-md hover:border-[#281C16] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Putar di 3D
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(detailProduct, 1);
                        setDetailProduct(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-[#B84A27] text-[#FAF5EC] rounded-md cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-[#EFE6D4] flex justify-end">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="text-xs font-semibold text-[#281C16] hover:text-[#B84A27] cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
