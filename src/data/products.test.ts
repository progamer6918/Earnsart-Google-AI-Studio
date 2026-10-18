import test from "node:test";
import assert from "node:assert/strict";
import {
  FIINA_PRODUCTS,
  clamp01,
  sceneCoord,
  reveal,
  formatRupiah,
  filterProducts,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  calculateOrderSummary,
  validateCheckoutForm,
} from "./products.ts";

test("scroll math helpers compute expected frame coordinates", () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.5), 1);
  assert.equal(sceneCoord(0, 6, 0.34), 0);
  assert.equal(sceneCoord(1, 6, 0.34), 5);
  assert.ok(reveal(0, 0, 0) > 0.99);
  assert.equal(reveal(2, 0, 0), 0);
});

test("catalog contains accurate prices from Fiinastore client posters", () => {
  const love = FIINA_PRODUCTS.find((p) => p.id === "loyang-love-set3");
  const bronis = FIINA_PRODUCTS.find((p) => p.id === "loyang-bronis-polos-set3");
  const rigi = FIINA_PRODUCTS.find((p) => p.id === "loyang-bronis-rigi-set3");
  const pai = FIINA_PRODUCTS.find((p) => p.id === "loyang-pai-set3");
  const segi2 = FIINA_PRODUCTS.find((p) => p.id === "loyang-segi-isi2-tinggi");
  const bulat5 = FIINA_PRODUCTS.find((p) => p.id === "loyang-bulat-tebal-set5");

  assert.equal(love?.price, 42000);
  assert.equal(love?.allowSatuan, false);
  assert.equal(bronis?.price, 32000);
  assert.equal(rigi?.price, 35000);
  assert.equal(pai?.price, 40000);
  assert.equal(segi2?.price, 37500);
  assert.equal(segi2?.allowSatuan, true);
  assert.equal(bulat5?.price, 65000);
  assert.equal(formatRupiah(42000), "Rp42.000");
});

test("cart additions, out-of-stock guard, and order summary calculations work", () => {
  const love = FIINA_PRODUCTS.find((p) => p.id === "loyang-love-set3")!;
  const lidahKucing = FIINA_PRODUCTS.find((p) => p.id === "loyang-lidah-kucing-kodi")!;

  let cart = addOrUpdateCartItem([], love, 2);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  // Out of stock variant (Uk 20 kosong) should not be added
  cart = addOrUpdateCartItem(cart, lidahKucing, 1, "lidah-kucing-20");
  assert.equal(cart.length, 1);

  // In stock variant (Uk 22 ready) should be added
  cart = addOrUpdateCartItem(cart, lidahKucing, 1, "lidah-kucing-22");
  assert.equal(cart.length, 2);

  const summary = calculateOrderSummary(cart, "reguler-hemat");
  assert.equal(summary.totalItems, 3);
  assert.equal(summary.subtotal, 42000 * 2 + 360000);
  assert.equal(summary.estimatedKg, 2);
  assert.equal(summary.shippingCost, 28000);
  assert.equal(summary.grandTotal, 444000 + 28000);

  cart = updateCartItemQuantity(cart, "loyang-love-set3", -2);
  assert.equal(cart.length, 1);
});

test("filterProducts and validateCheckoutForm enforce rules properly", () => {
  const set5 = filterProducts(FIINA_PRODUCTS, "set-5-tebal");
  assert.equal(set5.length, 2);

  const invalidResult = validateCheckoutForm({
    fullName: "",
    whatsapp: "abc",
    cityDistrict: "",
    postalCode: "",
    address: "Pendek",
    notes: "",
    shippingId: "reguler-hemat",
    paymentMethod: "qris",
  });
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.fullName);
  assert.ok(invalidResult.errors.whatsapp);
  assert.ok(invalidResult.errors.cityDistrict);
  assert.ok(invalidResult.errors.address);

  const validResult = validateCheckoutForm({
    fullName: "Siti Rahma",
    whatsapp: "081234567890",
    cityDistrict: "Bandung, Coblong",
    postalCode: "40132",
    address: "Jl. Ir. H. Juanda No. 108 RT 02 RW 05",
    notes: "Tolong packing kardus tebal",
    shippingId: "reguler-hemat",
    paymentMethod: "qris",
  });
  assert.equal(validResult.valid, true);
});
