import type { Product, Size } from "./catalog";
import { productSizes, quantityLimit } from "./catalog.ts";
export type CartLine = { productId: string; size: Size; quantity: number };
export type BagState = {lines:CartLine[];consumed:string[]};
export function settlePaidOrder(state:BagState,id:string,purchased:CartLine[]):BagState{
  if(state.consumed.includes(id))return state;
  return {consumed:[...state.consumed,id],lines:state.lines.map(line=>({...line,quantity:Math.max(0,line.quantity-purchased.filter(p=>p.productId===line.productId&&p.size===line.size).reduce((sum,p)=>sum+p.quantity,0))})).filter(line=>line.quantity>0)};
}
export function normalizeCart(value: unknown, products: Product[]): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines: CartLine[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const p = products.find((p) => p.id === item.productId);
    if (
      !p ||
      !productSizes(p).includes(item.size) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    )
      continue;
    const size = item.size as Size;
    const limit = quantityLimit(p, size);
    if (limit < 1) continue;
    const found = lines.find((l) => l.productId === p.id && l.size === size);
    if (found) found.quantity = Math.min(limit, found.quantity + item.quantity);
    else
      lines.push({
        productId: p.id,
        size,
        quantity: Math.min(limit, item.quantity),
      });
  }
  return lines;
}
export function cartSubtotal(lines: CartLine[], products: Product[]) {
  return lines.reduce(
    (sum, line) =>
      sum +
      (products.find((p) => p.id === line.productId)?.price ?? 0) *
        line.quantity,
    0,
  );
}
