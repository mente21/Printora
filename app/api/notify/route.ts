import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// ── Pretty email wrapper ──────────────────────────────────────────────────────
function buildEmail(title: string, body: string, ctaText: string, ctaHref: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1B2412;padding:28px 36px;">
      <span style="font-size:22px;font-weight:900;color:#A1FF4D;letter-spacing:-0.5px;">PRINTORA</span>
    </div>
    <div style="padding:36px 36px 28px;">
      <h2 style="margin:0 0 12px;color:#1B2412;font-size:22px;font-weight:800;">${title}</h2>
      <div style="color:#444;font-size:15px;line-height:1.7;">${body}</div>
      <a href="${ctaHref}"
         style="display:inline-block;margin-top:28px;background:#A1FF4D;color:#1B2412;padding:13px 32px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;letter-spacing:0.5px;">
        ${ctaText}
      </a>
    </div>
    <div style="background:#f9f9f9;padding:18px 36px;border-top:1px solid #eee;">
      <p style="margin:0;color:#aaa;font-size:12px;">This is an automated message from Printora. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Send one email via Resend ─────────────────────────────────────────────────
async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  console.log(`[Notify] Sending email to: ${to} | Subject: ${subject}`);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Use Resend's free-tier sender. Replace with your verified domain when ready.
      from: 'Printora <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error(`[Notify] Resend error for ${to}:`, JSON.stringify(err));
    return false;
  }
  console.log(`[Notify] ✅ Email sent to ${to}`);
  return true;
}

export async function POST(request: Request) {
  try {
    const { type, orderId, productType } = await request.json();
    console.log(`[Notify] Received: type=${type}, orderId=${orderId}, productType=${productType}`);

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn('[Notify] RESEND_API_KEY not set — skipping.');
      return NextResponse.json({ success: false, message: 'API key missing' }, { status: 500 });
    }

    // Service-role client — bypasses RLS so we can look up any profile
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let sent = 0;

    // ── Helper: get all admin profiles ────────────────────────────────────────
    const getAdmins = async () => {
      const { data, error } = await db.from('profiles').select('email, full_name').eq('role', 'ADMIN');
      if (error) console.error('[Notify] getAdmins error:', error.message);
      return data || [];
    };

    // ── Helper: get the order + look up customer/supplier from profiles ───────
    // customer_id references auth.users(id), NOT profiles(id) directly,
    // so we fetch the order first, then look up profiles by those IDs.
    const getOrderWithProfiles = async () => {
      const { data: order, error } = await db
        .from('custom_orders')
        .select('id, product_type, customer_id, supplier_id')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        console.error('[Notify] getOrder error:', error?.message);
        return null;
      }

      let customer: { email: string; full_name: string } | null = null;
      let supplier: { email: string; full_name: string } | null = null;

      // Look up customer profile by their auth user ID
      if (order.customer_id) {
        const { data } = await db
          .from('profiles')
          .select('email, full_name')
          .eq('id', order.customer_id)
          .single();
        customer = data;
      }

      // Look up supplier profile
      if (order.supplier_id) {
        const { data } = await db
          .from('profiles')
          .select('email, full_name')
          .eq('id', order.supplier_id)
          .single();
        supplier = data;
      }

      return { ...order, customer, supplier };
    };

    // =========================================================================
    // NEW_ORDER — Customer places an order
    // → Email to customer's registered email (confirmation)
    // → Email to every admin's registered email (alert)
    // =========================================================================
    if (type === 'NEW_ORDER') {
      const order  = await getOrderWithProfiles();
      const admins = await getAdmins();
      const custEmail = order?.customer?.email;
      const custName  = order?.customer?.full_name || 'Customer';
      const pType     = productType || order?.product_type || 'item';

      console.log(`[Notify] NEW_ORDER — customer: ${custEmail}, admins: ${admins.length}`);

      // Email to customer
      if (custEmail) {
        const ok = await sendEmail(
          RESEND_API_KEY, custEmail,
          `Your order has been received — ${pType}`,
          buildEmail(
            `Hi ${custName}, your order is in! 🎉`,
            `<p>Your custom <strong>${pType}</strong> order has been submitted successfully.</p>
             <p>Our admin team will review it shortly. You'll receive another email once it's approved.</p>`,
            'Track Your Order', `${SITE_URL}/orders`,
          ),
        );
        if (ok) sent++;
      }

      // Email to every admin
      for (const admin of admins) {
        if (!admin.email) continue;
        const ok = await sendEmail(
          RESEND_API_KEY, admin.email,
          `New order awaiting approval — ${pType}`,
          buildEmail(
            'New Order Received!',
            `<p>A new custom <strong>${pType}</strong> order has been placed by <strong>${custName}</strong> (${custEmail || 'N/A'}).</p>
             <p>Please review and approve it in the admin dashboard.</p>`,
            'Open Admin Dashboard', `${SITE_URL}/admin`,
          ),
        );
        if (ok) sent++;
      }
    }

    // =========================================================================
    // ORDER_APPROVED — Admin approves and assigns to supplier
    // → Email to supplier's registered email (new project)
    // → Email to customer's registered email (your order is in production)
    // =========================================================================
    else if (type === 'ORDER_APPROVED') {
      const order     = await getOrderWithProfiles();
      const pType     = productType || order?.product_type || 'item';
      const suppEmail = order?.supplier?.email;
      const suppName  = order?.supplier?.full_name || 'Supplier';
      const custEmail = order?.customer?.email;
      const custName  = order?.customer?.full_name || 'Customer';

      console.log(`[Notify] ORDER_APPROVED — supplier: ${suppEmail}, customer: ${custEmail}`);

      // Email to supplier
      if (suppEmail) {
        const ok = await sendEmail(
          RESEND_API_KEY, suppEmail,
          `New project assigned to you — ${pType}`,
          buildEmail(
            `Hi ${suppName}, you have a new project! 🏭`,
            `<p>You've been assigned a custom <strong>${pType}</strong> order from customer <strong>${custName}</strong>.</p>
             <p>Please check your supplier dashboard to view the design details and begin production.</p>`,
            'Open Supplier Dashboard', `${SITE_URL}/supplier`,
          ),
        );
        if (ok) sent++;
      }

      // Email to customer
      if (custEmail) {
        const ok = await sendEmail(
          RESEND_API_KEY, custEmail,
          `Your order is now in production — ${pType}`,
          buildEmail(
            `Hi ${custName}, your order is approved! ✅`,
            `<p>Your custom <strong>${pType}</strong> order has been approved and is now in production.</p>
             <p>We'll notify you as soon as a proof/sample is ready.</p>`,
            'Track Your Order', `${SITE_URL}/orders`,
          ),
        );
        if (ok) sent++;
      }
    }

    // =========================================================================
    // ORDER_FULFILLED — Supplier uploads proof
    // → Email to every admin's registered email
    // → Email to customer's registered email
    // =========================================================================
    else if (type === 'ORDER_FULFILLED') {
      const order     = await getOrderWithProfiles();
      const admins    = await getAdmins();
      const pType     = productType || order?.product_type || 'item';
      const custEmail = order?.customer?.email;
      const custName  = order?.customer?.full_name || 'Customer';

      console.log(`[Notify] ORDER_FULFILLED — customer: ${custEmail}, admins: ${admins.length}`);

      // Email to every admin
      for (const admin of admins) {
        if (!admin.email) continue;
        const ok = await sendEmail(
          RESEND_API_KEY, admin.email,
          `Supplier fulfilled an order — ${pType}`,
          buildEmail(
            'Order Fulfilled by Supplier!',
            `<p>The supplier has uploaded a proof for the <strong>${pType}</strong> order by <strong>${custName}</strong>.</p>
             <p>Please review the proof in the admin dashboard.</p>`,
            'Review Proof', `${SITE_URL}/admin`,
          ),
        );
        if (ok) sent++;
      }

      // Email to customer
      if (custEmail) {
        const ok = await sendEmail(
          RESEND_API_KEY, custEmail,
          `Your sample/proof is ready — ${pType}`,
          buildEmail(
            `Hi ${custName}, your sample is ready! 🎨`,
            `<p>Your supplier has finished a proof for your custom <strong>${pType}</strong> order.</p>
             <p>Our admin team is reviewing it. You'll hear from us very soon!</p>`,
            'Track Your Order', `${SITE_URL}/orders`,
          ),
        );
        if (ok) sent++;
      }
    }

    console.log(`[Notify] Done. Emails sent: ${sent}`);
    return NextResponse.json({ success: true, emailsSent: sent });
  } catch (error: any) {
    console.error('[Notify] API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
