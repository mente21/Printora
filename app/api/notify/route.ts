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
    <!-- Header -->
    <div style="background:#1B2412;padding:28px 36px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:22px;font-weight:900;color:#A1FF4D;letter-spacing:-0.5px;">PRINTORA</span>
    </div>
    <!-- Body -->
    <div style="padding:36px 36px 28px;">
      <h2 style="margin:0 0 12px;color:#1B2412;font-size:22px;font-weight:800;">${title}</h2>
      <div style="color:#444;font-size:15px;line-height:1.7;">${body}</div>
      <a href="${ctaHref}"
         style="display:inline-block;margin-top:28px;background:#A1FF4D;color:#1B2412;padding:13px 32px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;letter-spacing:0.5px;">
        ${ctaText}
      </a>
    </div>
    <!-- Footer -->
    <div style="background:#f9f9f9;padding:18px 36px;border-top:1px solid #eee;">
      <p style="margin:0;color:#aaa;font-size:12px;">This is an automated message from Printora. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Send one email via Resend ─────────────────────────────────────────────────
async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Printora <notifications@printora.com>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error(`Resend error sending to ${to}:`, err);
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  try {
    const { type, orderId, productType } = await request.json();

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — email skipped.');
      return NextResponse.json({ success: false, message: 'API key missing' }, { status: 500 });
    }

    // Service-role client — bypasses RLS so we can look up any profile email
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let sent = 0;

    // ── Helper: fetch all admins ──────────────────────────────────────────────
    const getAdmins = async () => {
      const { data } = await db.from('profiles').select('email, full_name').eq('role', 'ADMIN');
      return data || [];
    };

    // ── Helper: fetch order with customer + supplier profiles ─────────────────
    const getOrder = async () => {
      const { data } = await db
        .from('custom_orders')
        .select(`
          id, product_type,
          customer:profiles!customer_id(email, full_name),
          supplier:profiles!supplier_id(email, full_name)
        `)
        .eq('id', orderId)
        .single();
      return data as any;
    };

    // =========================================================================
    // NEW_ORDER — Customer places a design order
    // → Confirmation to customer
    // → Alert to every registered admin
    // =========================================================================
    if (type === 'NEW_ORDER') {
      const order   = await getOrder();
      const admins  = await getAdmins();
      const custEmail = order?.customer?.email;
      const custName  = order?.customer?.full_name || 'there';
      const pType     = productType || order?.product_type || 'item';

      // Confirmation to customer
      if (custEmail) {
        await sendEmail(
          RESEND_API_KEY,
          custEmail,
          `Your order has been received — ${pType}`,
          buildEmail(
            `Hi ${custName}, your order is in! 🎉`,
            `<p>Your custom <strong>${pType}</strong> order has been submitted successfully. Our admin team will review it shortly.</p>
             <p>You'll receive another email once it's approved and sent to production.</p>`,
            'Track Your Order',
            `${SITE_URL}/orders`,
          ),
        );
        sent++;
      }

      // Alert every admin at their registered email
      for (const admin of admins) {
        if (!admin.email) continue;
        await sendEmail(
          RESEND_API_KEY,
          admin.email,
          `New order awaiting approval — ${pType}`,
          buildEmail(
            'New Order Received!',
            `<p>A new custom <strong>${pType}</strong> order has been placed by <strong>${custName}</strong> (${custEmail || 'N/A'}).</p>
             <p>Please review and approve it in the admin dashboard.</p>`,
            'Open Admin Dashboard',
            `${SITE_URL}/admin`,
          ),
        );
        sent++;
      }
    }

    // =========================================================================
    // ORDER_APPROVED — Admin assigns order to a supplier
    // → Notification to the assigned supplier at their registered email
    // → "Order in production" update to customer at their registered email
    // =========================================================================
    else if (type === 'ORDER_APPROVED') {
      const order       = await getOrder();
      const pType       = productType || order?.product_type || 'item';
      const suppEmail   = order?.supplier?.email;
      const suppName    = order?.supplier?.full_name || 'there';
      const custEmail   = order?.customer?.email;
      const custName    = order?.customer?.full_name || 'there';

      // Assigned supplier
      if (suppEmail) {
        await sendEmail(
          RESEND_API_KEY,
          suppEmail,
          `New project assigned to you — ${pType}`,
          buildEmail(
            `Hi ${suppName}, you have a new project! 🏭`,
            `<p>You've been assigned a custom <strong>${pType}</strong> order from customer <strong>${custName}</strong>.</p>
             <p>Please check your supplier dashboard to view the full design details and begin production.</p>`,
            'Open Supplier Dashboard',
            `${SITE_URL}/supplier`,
          ),
        );
        sent++;
      }

      // Customer update
      if (custEmail) {
        await sendEmail(
          RESEND_API_KEY,
          custEmail,
          `Your order is now in production — ${pType}`,
          buildEmail(
            `Hi ${custName}, your order is approved! ✅`,
            `<p>Your custom <strong>${pType}</strong> order has been approved and is now in production.</p>
             <p>We'll notify you as soon as a proof/sample is ready for review.</p>`,
            'Track Your Order',
            `${SITE_URL}/orders`,
          ),
        );
        sent++;
      }
    }

    // =========================================================================
    // ORDER_FULFILLED — Supplier uploads a proof/sample
    // → Every registered admin at their real email
    // → Customer informed that their sample is ready
    // =========================================================================
    else if (type === 'ORDER_FULFILLED') {
      const order     = await getOrder();
      const admins    = await getAdmins();
      const pType     = productType || order?.product_type || 'item';
      const custEmail = order?.customer?.email;
      const custName  = order?.customer?.full_name || 'there';

      // All admins
      for (const admin of admins) {
        if (!admin.email) continue;
        await sendEmail(
          RESEND_API_KEY,
          admin.email,
          `Supplier fulfilled an order — ${pType}`,
          buildEmail(
            'Order Fulfilled by Supplier!',
            `<p>The supplier has uploaded a proof/sample for the <strong>${pType}</strong> order placed by <strong>${custName}</strong>.</p>
             <p>Please review the proof image in the admin dashboard and approve or reject it.</p>`,
            'Review Proof',
            `${SITE_URL}/admin`,
          ),
        );
        sent++;
      }

      // Customer
      if (custEmail) {
        await sendEmail(
          RESEND_API_KEY,
          custEmail,
          `Your sample/proof is ready — ${pType}`,
          buildEmail(
            `Hi ${custName}, your sample is ready! 🎨`,
            `<p>Your supplier has finished a proof/sample for your custom <strong>${pType}</strong> order.</p>
             <p>Our admin team is currently reviewing it. You'll hear from us very soon!</p>`,
            'Track Your Order',
            `${SITE_URL}/orders`,
          ),
        );
        sent++;
      }
    }

    return NextResponse.json({ success: true, emailsSent: sent });
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
