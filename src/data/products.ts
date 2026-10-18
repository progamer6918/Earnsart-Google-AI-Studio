export type PanShapeId =
  | "love"
  | "bulat"
  | "segi"
  | "bronis"
  | "rigi"
  | "pai"
  | "segi-tebal"
  | "bulat-tebal"
  | "oven"
  | "lidah-kucing";

export type ProductCategory =
  | "all"
  | "set-3"
  | "set-5-tebal"
  | "satuan"
  | "grosir-kodi";

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  unitLabel: string;
  sizesSummary: string;
  inStock: boolean;
}

export interface FiinaProduct {
  id: string;
  name: string;
  shortName: string;
  shape3d: "love" | "bulat" | "segi" | "bronis" | "rigi" | "pai";
  illustrationKind: PanShapeId;
  category: Exclude<ProductCategory, "all">;
  setCountLabel: string;
  sizes: string[];
  heightCm: string;
  material: string;
  price: number;
  unit: "set" | "pcs" | "kodi";
  allowSatuan: boolean;
  purchaseRuleLabel: string;
  featuredInStage: boolean;
  tagline: string;
  description: string;
  highlights: string[];
  idealFor: string[];
  variants?: ProductVariant[];
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  sizesSummary: string;
  illustrationKind: PanShapeId;
}

export interface ShippingOption {
  id: string;
  name: string;
  eta: string;
  pricePerKg: number;
  description: string;
}

export interface CheckoutFormInput {
  fullName: string;
  whatsapp: string;
  cityDistrict: string;
  postalCode: string;
  address: string;
  notes: string;
  shippingId: string;
  paymentMethod: "qris" | "transfer-bca" | "transfer-mandiri" | "cod";
}

export interface CheckoutValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof CheckoutFormInput, string>>;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "reguler-hemat",
    name: "Reguler Hemat (J&T / SiCepat)",
    eta: "2–4 hari kerja",
    pricePerKg: 14000,
    description: "Packing kardus tebal + bubble wrap aman untuk set loyang.",
  },
  {
    id: "next-day",
    name: "Kilat Esok Sampai",
    eta: "1–2 hari kerja",
    pricePerKg: 24000,
    description: "Prioritas pengiriman cepat untuk kebutuhan produksi segera.",
  },
  {
    id: "kargo-grosir",
    name: "Kargo Kemitraan (JNE JTR / Indah Cargo)",
    eta: "3–6 hari kerja",
    pricePerKg: 9000,
    description: "Rekomendasi hemat untuk pembelian banyak set atau partai kodi.",
  },
];

export const FIINA_PRODUCTS: FiinaProduct[] = [
  {
    id: "loyang-love-set3",
    name: "Loyang Kue Love (1 Set Isi 3 Pcs)",
    shortName: "Love Set 3",
    shape3d: "love",
    illustrationKind: "love",
    category: "set-3",
    setCountLabel: "1 Set Isi 3 Pcs",
    sizes: ["18 cm", "20 cm", "22 cm"],
    heightCm: "5 cm",
    material: "Aluminium Berkualitas",
    price: 42000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set · No Satuan",
    featuredInStage: true,
    tagline: "Bentuk cinta, jadi karya kue lebih istimewa.",
    description:
      "Satu set loyang bentuk hati (Love) isi 3 ukuran berjenjang (18, 20, dan 22 cm) dengan tinggi dinding 5 cm. Sambungan sudut depan rapi, bibir atas berlipat halus, dan penghantar panas merata.",
    highlights: [
      "Tinggi loyang 5 cm proporsional",
      "Sambungan lipat rapi & kuat",
      "Panas merata, hasil matang sempurna",
      "Tersusun rapi (nested) hemat ruang simpan",
    ],
    idealFor: ["Kue Ulang Tahun", "Kue Tart Love", "Brownies Hati", "Bolu Panggang"],
  },
  {
    id: "loyang-bulat-set3",
    name: "Loyang Kue Bulat Gagang (1 Set Isi 3 Pcs)",
    shortName: "Bulat Set 3",
    shape3d: "bulat",
    illustrationKind: "bulat",
    category: "set-3",
    setCountLabel: "1 Set Isi 3 Pcs",
    sizes: ["Ø 18 cm", "Ø 20 cm", "Ø 22 cm"],
    heightCm: "5 cm",
    material: "Aluminium Berkualitas",
    price: 42000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set · No Satuan",
    featuredInStage: true,
    tagline: "Silinder klasik dengan gagang praktis di sisi loyang.",
    description:
      "Loyang bulat serbaguna satu set isi 3 ukuran (diameter 18, 20, dan 22 cm) dengan tinggi 5 cm. Dilengkapi gagang cincin praktis pada dinding samping agar mudah diangkat dari oven atau kukusan.",
    highlights: [
      "Dilengkapi gagang cincin samping praktis",
      "Tebal, kokoh & tidak mudah penyok",
      "Diameter berjenjang 18, 20 & 22 cm",
      "Mudah disimpan bertumpuk",
    ],
    idealFor: ["Bolu Klasik", "Base Cake Ulang Tahun", "Brownies Kukus", "Sponge Cake"],
  },
  {
    id: "loyang-segi-set3",
    name: "Loyang Kue Segi (1 Set Isi 3 Pcs)",
    shortName: "Segi Set 3",
    shape3d: "segi",
    illustrationKind: "segi",
    category: "set-3",
    setCountLabel: "1 Set Isi 3 Pcs",
    sizes: ["18 cm", "20 cm", "22 cm"],
    heightCm: "5 cm",
    material: "Aluminium Berkualitas",
    price: 42000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set · No Satuan",
    featuredInStage: true,
    tagline: "Sudut lipat presisi untuk potongan kue yang rapi.",
    description:
      "Set loyang persegi empat sama sisi berisi 3 ukuran (18, 20, dan 22 cm) dengan tinggi 5 cm. Sudut dikerjakan rapi tanpa tepi tajam dan permukaan dalam halus sehingga kue mudah dilepas.",
    highlights: [
      "Sudut rapi, kuat & tidak tajam",
      "Permukaan halus mudah dibersihkan",
      "Tinggi 5 cm pas untuk bolu & lapis",
      "1 set langsung dapat 3 ukuran",
    ],
    idealFor: ["Kue Bolu Persegi", "Kue Lapis", "Brownies Potong", "Cake Rumahan"],
  },
  {
    id: "loyang-bronis-polos-set3",
    name: "Loyang Kue Bronis / Persegi Panjang (1 Set Isi 3 Pcs)",
    shortName: "Bronis Set 3",
    shape3d: "bronis",
    illustrationKind: "bronis",
    category: "set-3",
    setCountLabel: "1 Set Isi 3 Pcs",
    sizes: ["P 18 cm", "P 20 cm", "P 22 cm"],
    heightCm: "5 cm",
    material: "Aluminium Berkualitas",
    price: 32000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set · No Satuan",
    featuredInStage: true,
    tagline: "Cetakan persegi panjang andalan usaha brownies.",
    description:
      "Loyang persegi panjang (loaf) dinding polos isi 3 pcs (panjang 18, 20, dan 22 cm) dengan tinggi 5 cm. Favorit pelaku UMKM baking karena harga sangat ekonomis dan hasil panggangan merata.",
    highlights: [
      "Harga hemat Rp32.000 dapat 3 ukuran",
      "Dinding polos 5 cm dengan sudut rapi",
      "Menghantarkan panas oven & kukusan merata",
      "Bisa ditumpuk ringkas setelah dicuci",
    ],
    idealFor: ["Fudgy Brownies", "Brownies Kukus", "Bolu Gulung Mini", "Roti Sobek"],
  },
  {
    id: "loyang-bronis-rigi-set3",
    name: "Loyang Bronis Rigi / Loyang Agar (1 Set Isi 3 Pcs)",
    shortName: "Bronis Rigi",
    shape3d: "rigi",
    illustrationKind: "rigi",
    category: "set-3",
    setCountLabel: "1 Set Isi 3 Pcs",
    sizes: ["P 18 cm", "P 20 cm", "P 22 cm"],
    heightCm: "5 cm",
    material: "Aluminium Food Grade",
    price: 35000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set · No Satuan",
    featuredInStage: true,
    tagline: "Dinding rigi bergelombang untuk tekstur kue & agar-agar.",
    description:
      "Loyang persegi panjang dengan desain dinding rigi (bergelombang vertikal) satu set isi 3 ukuran (18, 20, dan 22 cm). Memberikan motif garis cantik sekaligus mempermudah pelepasan agar-agar dan bronis.",
    highlights: [
      "Desain dinding rigi bergelombang",
      "Permukaan rigi meminimalkan lengket",
      "Aluminium food grade aman untuk makanan",
      "Tepi atas kokoh dan tidak melengkung",
    ],
    idealFor: ["Kue Bronis", "Agar-Agar & Puding", "Bolu Kukus", "Kue Tradisional"],
  },
  {
    id: "loyang-pai-set3",
    name: "Loyang Kue Pai / Bulat Rigi (1 Set Isi 3 Pcs)",
    shortName: "Pai Rigi Set 3",
    shape3d: "pai",
    illustrationKind: "pai",
    category: "set-3",
    setCountLabel: "1 Set Isi 3 Pcs",
    sizes: ["Ø 18 cm", "Ø 20 cm", "Ø 22 cm"],
    heightCm: "3.5 cm",
    material: "Aluminium / Stainless Tahan Karat",
    price: 40000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set · No Satuan",
    featuredInStage: true,
    tagline: "Pinggiran bergelombang klasik untuk pai, tart & puding.",
    description:
      "Loyang bulat pendek dengan tepi miring bergelombang (bulat rigi) berisi 3 ukuran (18, 20, dan 22 cm). Menciptakan pinggiran kulit pai dan tart buah yang renyah dan simetris.",
    highlights: [
      "Lekukan rigi keliling presisi & seragam",
      "Tahan karat, tidak berbau & aman untuk makanan",
      "Panas merata hingga ke dasar kulit pai",
      "Praktis untuk pemakaian berulang",
    ],
    idealFor: ["Kue Pai Susu", "Fruit Tart", "Puding Buah", "Kue Bolu Rendah"],
  },
  {
    id: "loyang-segi-isi2-tinggi",
    name: "Loyang Kue Segiempat Tinggi (Isi 2 / Bisa Satuan)",
    shortName: "Segi Tinggi",
    shape3d: "segi",
    illustrationKind: "segi",
    category: "satuan",
    setCountLabel: "1 Set Isi 2 Pcs / Satuan",
    sizes: ["18×18 cm", "20×20 cm"],
    heightCm: "6–7 cm",
    material: "Aluminium Berkualitas",
    price: 37500,
    unit: "set",
    allowSatuan: true,
    purchaseRuleLabel: "Bisa Beli Set atau Satuan",
    featuredInStage: false,
    tagline: "Dinding ekstra tinggi 6–7 cm untuk cake lebih mengembang.",
    description:
      "Varian loyang segiempat dengan dinding lebih tinggi (6–7 cm, harap konfirmasi stok ukuran tinggi saat brief akhir). Satu-satunya seri yang dapat dibeli langsung 1 set isi 2 (18×18 & 20×20 cm) maupun ecer satuan.",
    highlights: [
      "Tersedia opsi beli 1 set (hemat) atau satuan",
      "Dinding lebih tinggi (6–7 cm) untuk adonan tebal",
      "Ukuran favorit 18×18 cm dan 20×20 cm",
      "Konstruksi sudut rapat dan tahan lama",
    ],
    idealFor: ["Bolu Tinggi", "Lapis Surabaya", "Mandarin Cake", "Butter Cake"],
    variants: [
      {
        id: "set-2pcs",
        label: "1 Set Isi 2 (18×18 & 20×20 cm)",
        price: 37500,
        unitLabel: "set",
        sizesSummary: "18×18 cm & 20×20 cm · Tinggi 6–7 cm",
        inStock: true,
      },
      {
        id: "satuan-18",
        label: "Satuan Uk. 18×18 cm",
        price: 19500,
        unitLabel: "pcs",
        sizesSummary: "18×18 cm · Tinggi 6–7 cm",
        inStock: true,
      },
      {
        id: "satuan-20",
        label: "Satuan Uk. 20×20 cm",
        price: 21500,
        unitLabel: "pcs",
        sizesSummary: "20×20 cm · Tinggi 6–7 cm",
        inStock: true,
      },
    ],
  },
  {
    id: "loyang-bulat-tebal-set5",
    name: "Loyang Kue Bulat Aluminium Tebal (1 Set Isi 5 Pcs)",
    shortName: "Bulat Tebal 5",
    shape3d: "bulat",
    illustrationKind: "bulat-tebal",
    category: "set-5-tebal",
    setCountLabel: "1 Set Isi 5 Pcs",
    sizes: ["Ø 18 cm", "Ø 20 cm", "Ø 22 cm", "Ø 24 cm", "Ø 26 cm"],
    heightCm: "6 cm",
    material: "Aluminium Tebal Heavy-Duty",
    price: 65000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set 5 Pcs · No Satuan",
    featuredInStage: false,
    tagline: "Lima ukuran lengkap dengan plat aluminium ekstra tebal.",
    description:
      "Paket lengkap 5 ukuran loyang bulat (18, 20, 22, 24, hingga 26 cm) dari bahan aluminium lebih tebal dan kokoh. Cocok untuk rumah tangga maupun produksi kue tingkat (tiered cake).",
    highlights: [
      "Plat aluminium ekstra tebal & tidak mudah penyok",
      "Lengkap 5 ukuran dari 18 cm sampai 26 cm",
      "Dasar kokoh untuk adonan berat",
      "Tepi lipat rapi dan halus di tangan",
    ],
    idealFor: ["Tiered Wedding Cake", "Bolu Ukuran Besar", "Kue Tart", "Usaha Bakery"],
  },
  {
    id: "loyang-segi-tebal-set5",
    name: "Loyang Kue Segi Aluminium Tebal (1 Set Isi 5 Pcs)",
    shortName: "Segi Tebal 5",
    shape3d: "segi",
    illustrationKind: "segi-tebal",
    category: "set-5-tebal",
    setCountLabel: "1 Set Isi 5 Pcs",
    sizes: ["18 cm", "20 cm", "22 cm", "24 cm", "26 cm"],
    heightCm: "6 cm",
    material: "Aluminium Tebal Heavy-Duty",
    price: 65000,
    unit: "set",
    allowSatuan: false,
    purchaseRuleLabel: "Jual Per Set 5 Pcs · No Satuan",
    featuredInStage: false,
    tagline: "Seri persegi aluminium tebal isi 5 ukuran komplit.",
    description:
      "Satu set loyang persegi berisi 5 ukuran sekaligus (18, 20, 22, 24, dan 26 cm) berbahan aluminium tebal berkualitas. Dasar rata menjamin panggangan matang merata tanpa gosong di sudut.",
    highlights: [
      "1 set langsung dapat 5 ukuran (18–26 cm)",
      "Material aluminium tebal tahan pemakaian intensif",
      "Dasar rata, panas oven tersalur merata",
      "Mudah dibersihkan & disimpan bertumpuk",
    ],
    idealFor: ["Bolu Potong", "Lapis Legit", "Brownies Loyang Besar", "Katering Kue"],
  },
  {
    id: "loyang-oven-kodi",
    name: "Loyang Oven Aluminium Kue Kering (Grosir Per Kodi)",
    shortName: "Loyang Oven",
    shape3d: "segi",
    illustrationKind: "oven",
    category: "grosir-kodi",
    setCountLabel: "Grosir 1 Kodi (20 Pcs)",
    sizes: ["Kecil 17×17 cm", "Besar 30×30 cm"],
    heightCm: "2–3 cm",
    material: "Aluminium Berkualitas",
    price: 350000,
    unit: "kodi",
    allowSatuan: false,
    purchaseRuleLabel: "Harga Grosir Per Kodi (20 Pcs)",
    featuredInStage: false,
    tagline: "Loyang ceper khusus kue kering, nastar & cookies.",
    description:
      "Loyang oven aluminium ceper untuk memanggang kue kering, cookies, nastar, dan roti. Tersedia pembelian grosir kemitraan per kodi (No. 4 Rp350.000/kodi dan No. 3 Rp380.000/kodi).",
    highlights: [
      "Tepi rapi dan sambungan sudut kuat",
      "Permukaan halus tidak mudah lengket",
      "Tersedia ukuran No. 4 (Rp350rb/kodi) & No. 3 (Rp380rb/kodi)",
      "Cocok untuk produksi kue kering & reseller",
    ],
    idealFor: ["Nastar & Kastengel", "Cookies", "Roti Manis", "Kue Kering Lebaran"],
    variants: [
      {
        id: "oven-no4",
        label: "Loyang Oven No. 4 (1 Kodi / 20 Pcs)",
        price: 350000,
        unitLabel: "kodi",
        sizesSummary: "Ukuran Kecil 17×17 cm · 1 Kodi (20 Pcs)",
        inStock: true,
      },
      {
        id: "oven-no3",
        label: "Loyang Oven No. 3 (1 Kodi / 20 Pcs)",
        price: 380000,
        unitLabel: "kodi",
        sizesSummary: "Ukuran Besar 30×30 cm · 1 Kodi (20 Pcs)",
        inStock: true,
      },
    ],
  },
  {
    id: "loyang-lidah-kucing-kodi",
    name: "Loyang Lidah Kucing 3 Baris (Grosir Per Kodi)",
    shortName: "Lidah Kucing",
    shape3d: "bronis",
    illustrationKind: "lidah-kucing",
    category: "grosir-kodi",
    setCountLabel: "Grosir 1 Kodi (20 Pcs)",
    sizes: ["Uk. 22 cm (Tersedia)", "Uk. 20 cm (Kosong)"],
    heightCm: "1.5 cm",
    material: "Aluminium Press Cekung",
    price: 360000,
    unit: "kodi",
    allowSatuan: false,
    purchaseRuleLabel: "Uk. 22 Ready · Uk. 20 Kosong",
    featuredInStage: false,
    tagline: "Cetakan cekung 3 baris khusus kue kering lidah kucing.",
    description:
      "Loyang aluminium dengan 3 lajur cekungan seragam khusus untuk mencetak kue lidah kucing agar bentuknya rapi dan matang merata. Dijual grosir per kodi untuk ukuran 22 cm.",
    highlights: [
      "Cetakan cekung 3 baris rapi & seragam",
      "Ukuran 22 cm ready Rp360.000 / kodi",
      "Ukuran 20 cm sedang kosong (sesuai info stok)",
      "Panas cepat merata untuk adonan tipis",
    ],
    idealFor: ["Kue Lidah Kucing", "Almond Tuile", "Florentine Cookies"],
    variants: [
      {
        id: "lidah-kucing-22",
        label: "Ukuran 22 cm (1 Kodi / 20 Pcs)",
        price: 360000,
        unitLabel: "kodi",
        sizesSummary: "Uk. 22 cm · 3 Baris Cekungan · 1 Kodi",
        inStock: true,
      },
      {
        id: "lidah-kucing-20",
        label: "Ukuran 20 cm (Stok Kosong)",
        price: 340000,
        unitLabel: "kodi",
        sizesSummary: "Uk. 20 cm · Sedang Kosong",
        inStock: false,
      },
    ],
  },
];

// ---- Pure Scroll & Specimen Math ------------------------------------------

export const clamp01 = (x: number): number => (x <= 0 ? 0 : x > 1 ? 1 : x);

export const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const progressFrom = (top: number, height: number, viewport: number): number => {
  const travel = height - viewport;
  if (travel <= 0) return 0;
  return clamp01(-top / travel);
};

export const sceneCoord = (p: number, n: number, hold: number): number => {
  if (n <= 1) return 0;
  const t = clamp01(p) * (n - 1);
  const i = Math.min(Math.floor(t), n - 2);
  const h = hold / 2;
  return i + easeInOut(clamp01((t - i - h) / (1 - 2 * h)));
};

export const reveal = (coord: number, scene: number, delay: number): number => {
  const d = coord - scene;
  const lag = d < 0 ? delay : 1 - delay;
  return clamp01((0.6 - Math.abs(d) - lag * 0.2) / 0.25);
};

// ---- Pure E-Commerce & Checkout Logic -------------------------------------

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  return "Rp" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function filterProducts(
  products: FiinaProduct[],
  category: ProductCategory,
  searchQuery = ""
): FiinaProduct[] {
  const q = searchQuery.trim().toLowerCase();
  return products.filter((p) => {
    const matchesCategory = category === "all" || p.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.idealFor.some((item) => item.toLowerCase().includes(q))
    );
  });
}

export function addOrUpdateCartItem(
  cart: CartItem[],
  product: FiinaProduct,
  quantity: number,
  variantId?: string
): CartItem[] {
  if (quantity <= 0) return cart;
  const chosenVariant = variantId
    ? product.variants?.find((v) => v.id === variantId)
    : product.variants?.find((v) => v.inStock);

  if (chosenVariant && !chosenVariant.inStock) {
    return cart;
  }

  const cartItemId = chosenVariant ? `${product.id}__${chosenVariant.id}` : product.id;
  const unitPrice = chosenVariant ? chosenVariant.price : product.price;
  const variantLabel = chosenVariant ? chosenVariant.label : product.setCountLabel;
  const unit = chosenVariant ? chosenVariant.unitLabel : product.unit;
  const sizesSummary = chosenVariant
    ? chosenVariant.sizesSummary
    : `${product.sizes.join(", ")} · Tinggi ${product.heightCm}`;

  const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);
  if (existingIndex > -1) {
    return cart.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
    );
  }

  return [
    ...cart,
    {
      cartItemId,
      productId: product.id,
      name: product.name,
      variantLabel,
      unitPrice,
      unit,
      quantity,
      sizesSummary,
      illustrationKind: product.illustrationKind,
    },
  ];
}

export function updateCartItemQuantity(
  cart: CartItem[],
  cartItemId: string,
  delta: number
): CartItem[] {
  return cart
    .map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    )
    .filter((item) => item.quantity > 0);
}

export function calculateOrderSummary(cart: CartItem[], shippingId: string) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shippingOption =
    SHIPPING_OPTIONS.find((s) => s.id === shippingId) ?? SHIPPING_OPTIONS[0];
  // Estimate 1 kg per 2 sets, minimum 1 kg when cart has items
  const estimatedKg = totalItems === 0 ? 0 : Math.max(1, Math.ceil(totalItems / 2));
  const shippingCost = estimatedKg * shippingOption.pricePerKg;
  const grandTotal = subtotal + shippingCost;

  return {
    totalItems,
    subtotal,
    estimatedKg,
    shippingCost,
    grandTotal,
    shippingOption,
  };
}

export function validateCheckoutForm(input: CheckoutFormInput): CheckoutValidationResult {
  const errors: Partial<Record<keyof CheckoutFormInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = "Nama penerima wajib diisi (minimal 2 karakter).";
  }

  const cleanPhone = (input.whatsapp || "").replace(/[\s\-+]/g, "");
  if (!cleanPhone || !/^\d{9,15}$/.test(cleanPhone)) {
    errors.whatsapp = "Nomor WhatsApp aktif wajib diisi (9–15 digit angka).";
  }

  if (!input.cityDistrict || input.cityDistrict.trim().length < 3) {
    errors.cityDistrict = "Kota dan kecamatan tujuan wajib diisi.";
  }

  if (!input.address || input.address.trim().length < 8) {
    errors.address = "Alamat lengkap (jalan, nomor rumah, RT/RW) wajib diisi.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
