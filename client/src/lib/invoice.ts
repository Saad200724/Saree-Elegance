function esc(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function openInvoice(order: any) {
  const win = window.open('', '_blank');
  if (!win) return;

  const itemsHtml = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.product?.imageUrl ? `<img src="${esc(item.product.imageUrl)}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;" />` : ''}
          <span>${esc(item.product?.name || item.name || 'Product')}</span>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">৳${Number(item.price).toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">৳${(item.quantity * Number(item.price)).toLocaleString()}</td>
    </tr>
  `).join('');

  const subtotal = (order.items || []).reduce((sum: number, item: any) => sum + (item.quantity * Number(item.price)), 0);
  const deliveryFee = subtotal > 5000 ? 0 : 130;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${order.id} - Chandrabati</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a1a, #333); color: #fff; padding: 40px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -0.5px; }
    .brand-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.6; margin-top: 4px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 32px; font-weight: 200; letter-spacing: 4px; text-transform: uppercase; }
    .invoice-title p { font-size: 12px; opacity: 0.6; margin-top: 6px; }
    .body { padding: 40px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
    .meta-section label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 6px; }
    .meta-section p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8f8f8; text-align: left; padding: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #eee; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-box { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #666; }
    .totals-row.total { border-top: 2px solid #1a1a1a; padding-top: 14px; margin-top: 6px; color: #1a1a1a; font-size: 20px; font-weight: 900; }
    .footer { background: #fafafa; border-top: 1px solid #eee; padding: 30px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #999; margin-bottom: 4px; }
    .print-btn { margin-top: 16px; padding: 10px 30px; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; }
    .print-btn:hover { background: #333; }
    .status { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-pending { background: #fff8e1; color: #f57f17; }
    .status-processing { background: #e3f2fd; color: #1565c0; }
    .status-shipped { background: #f3e5f5; color: #7b1fa2; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    @media print { 
      body { background: #fff; } 
      .invoice { box-shadow: none; margin: 0; border-radius: 0; } 
      .print-btn { display: none; } 
      .footer { border-top: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="brand">চন্দ্রাবতী</div>
        <div class="brand-sub">Chandrabati</div>
      </div>
      <div class="invoice-title">
        <h2>Invoice</h2>
        <p>${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
    <div class="body">
      <div class="meta">
        <div>
          <div class="meta-section">
            <label>Order ID</label>
            <p style="font-family: monospace; font-weight: 700; font-size: 18px;">#${order.id}</p>
          </div>
          <div class="meta-section" style="margin-top: 20px;">
            <label>Status</label>
            <p><span class="status status-${order.status || 'pending'}">${order.status || 'pending'}</span></p>
          </div>
          <div class="meta-section" style="margin-top: 20px;">
            <label>Payment Method</label>
            <p>${order.paymentMethod || 'Cash on Delivery'}</p>
          </div>
        </div>
        <div>
          <div class="meta-section">
            <label>Billed To</label>
            <p style="font-weight: 600;">${order.firstName || ''} ${order.lastName || ''}</p>
            <p>${order.phone || ''}</p>
            <p>${order.email || ''}</p>
          </div>
          <div class="meta-section" style="margin-top: 20px;">
            <label>Shipping Address</label>
            <p>${order.address || ''}</p>
            ${order.upazila ? `<p>${order.upazila}, ${order.district}, ${order.division}</p>` : ''}
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="totals">
        <div class="totals-box">
          <div class="totals-row"><span>Subtotal</span><span>৳${subtotal.toLocaleString()}</span></div>
          <div class="totals-row"><span>Delivery Fee</span><span>${deliveryFee === 0 ? 'Free' : '৳' + deliveryFee}</span></div>
          <div class="totals-row total"><span>Total</span><span>৳${Number(order.totalAmount).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for shopping with Chandrabati!</p>
      <p>For queries, contact us at 01805-108818</p>
      <button class="print-btn" onclick="window.print()">Print Invoice</button>
    </div>
  </div>
</body>
</html>`);
  win.document.close();
}
