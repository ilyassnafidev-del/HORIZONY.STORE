// The future server must re-read product prices and stock before creating any session.
// Provider implementations must use hosted checkout/approved provider components.
export type PaymentSessionRequest = {
  items: { productId: string; size: string; quantity: number }[];
};
export interface PaymentProvider {
  createHostedSession(request: PaymentSessionRequest): Promise<{ url: string }>;
}
export const paymentProvider: PaymentProvider = {
  async createHostedSession() {
    throw new Error("Card payments and order processing are not configured.");
  },
};
