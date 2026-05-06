/**
 * Client-side helpers that call /api/notify.
 * The server-side route fetches all real registered emails from the DB
 * using the Supabase service role key — no email is ever hardcoded here.
 */

async function postNotify(payload: Record<string, string>) {
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('notify fetch failed:', err);
    return false;
  }
}

/** Called when a customer places a new design order. */
export function notifyNewOrder(orderId: string, productType: string) {
  return postNotify({ type: 'NEW_ORDER', orderId, productType });
}

/** Called when admin approves an order and assigns it to a supplier. */
export function notifyOrderApproved(orderId: string, productType: string) {
  return postNotify({ type: 'ORDER_APPROVED', orderId, productType });
}

/** Called when a supplier uploads a proof/sample for an order. */
export function notifyOrderFulfilled(orderId: string, productType: string) {
  return postNotify({ type: 'ORDER_FULFILLED', orderId, productType });
}
