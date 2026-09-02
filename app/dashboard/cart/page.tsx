import { fetchApi } from "@/lib/fetchApi";
import CartContainer, {
  type CartRead,
} from "@/components/dashboard/cart/CartContainer";

export const metadata = {
  title: "Cart | Dashboard",
};

const EMPTY_CART: CartRead = {
  items: [],
  item_count: 0,
  subtotal_amount: 0,
};

export default async function CartPage() {
  let cart = EMPTY_CART;
  let error: string | null = null;

  try {
    const res = await fetchApi("/cart", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.message || "Unable to load your cart.");
    }

    cart = {
      items: Array.isArray(json?.data?.items) ? json.data.items : [],
      item_count:
        typeof json?.data?.item_count === "number"
          ? json.data.item_count
          : Array.isArray(json?.data?.items)
            ? json.data.items.length
            : 0,
      subtotal_amount:
        typeof json?.data?.subtotal_amount === "number"
          ? json.data.subtotal_amount
          : 0,
    };
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load your cart.";
  }

  return <CartContainer initialCart={cart} initialError={error} />;
}
