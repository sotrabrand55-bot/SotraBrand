import { transporter } from '../utils/mailer.js';
import { logError } from '../utils/logger.js';

const money = (value) => {
  const amount = Number(value);
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
};

const text = (value, fallback = '-') =>
  String(value ?? '').trim() || fallback;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const pickImage = (image) => {
  if (Array.isArray(image)) {
    const first = image[0];
    return typeof first === 'string' ? first : first?.url || first?.path || '';
  }
  if (typeof image === 'string') return image;
  return image?.url || image?.path || '';
};

const normalizeItems = (items = []) =>
  (Array.isArray(items) ? items : []).map((item, index) => {
    const quantity = Number(item.quantity ?? item.qty ?? 0);
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    const lineTotal = Number(item.lineTotal ?? item.subtotal ?? quantity * unitPrice);

    return {
      key: `${item.productId || index}-${index}`,
      title: item.title || item.name || item.productName || item.productId || 'Product',
      image: pickImage(item.image),
      category: item.category || '',
      subCategory: item.subCategory || '',
      concentration: item.concentration || '',
      perfumeType: item.perfumeType || item.selectedPerfumeType || '',
      size: item.size || '',
      color: item.color || '',
      quantity,
      unitPrice,
      lineTotal,
    };
  });

const buildAddress = (user = {}) =>
  [
    user.addressLine1,
    user.addressLine2,
    user.street,
    user.building ? `Building ${user.building}` : '',
    user.floor ? `Floor ${user.floor}` : '',
    [user.city, user.state, user.zipCode].filter(Boolean).join(', '),
    user.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join('<br />');

const buildItemsHtml = (items = []) =>
  normalizeItems(items)
    .map((item) => {
      const meta = [item.perfumeType || item.concentration, item.subCategory || item.category, item.size]
        .filter(Boolean)
        .map(escapeHtml)
        .join(' / ');

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="74" valign="top">
                  ${
                    item.image
                      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="58" height="72" style="display:block;object-fit:cover;border-radius:6px;background:#eaeaea;" />`
                      : `<div style="width:58px;height:72px;border-radius:6px;background:#eaeaea;color:#6b7280;font-size:10px;text-align:center;line-height:72px;">No image</div>`
                  }
                </td>
                <td valign="top" style="padding-right:12px;">
                  <div style="font-family:Georgia,serif;font-size:18px;color:#000000;line-height:1.2;">${escapeHtml(item.title)}</div>
                  <div style="margin-top:5px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#4b5563;">${meta || 'Be Radiant product'}</div>
                  <div style="margin-top:7px;font-size:13px;color:#374151;">Qty ${item.quantity}${item.color ? ` / ${escapeHtml(item.color)}` : ''}</div>
                </td>
                <td width="110" valign="top" align="right" style="font-size:13px;color:#000000;">
                  <div>${money(item.unitPrice)}</div>
                  <div style="margin-top:7px;font-weight:700;">${money(item.lineTotal)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join('');

const buildHtml = ({
  user = {},
  items = [],
  totals = {},
  meta = {},
  customerNote = '',
  paymentMethod = 'COD',
  appliedCoupon = null,
}) => {
  const safeName = escapeHtml(text(user.name, 'Customer'));
  const orderId = escapeHtml(text(meta.orderId || meta.sessionId, 'Pending order id'));
  const address = buildAddress(user);
  const subtotal = Number(totals.subtotal || 0);
  const discount = Number(totals.discount || 0);
  const shipping = Number(totals.shipping || 0);
  const total = Number(totals.total || subtotal - discount + shipping);
  const safeNote = escapeHtml(text(customerNote, '')).replace(/\n/g, '<br />');
  const couponCode = escapeHtml(text(appliedCoupon?.code, 'None'));

  return `
    <div style="margin:0;padding:0;background:#ffffff;color:#000000;font:14px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="720" cellspacing="0" cellpadding="0" style="width:720px;max-width:94%;background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:26px 30px;border-bottom:1px solid #e5e5e5;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#111;">Be Radiant By Nancy Orders</div>
                  <div style="margin-top:8px;font-family:Georgia,serif;font-size:34px;line-height:1;color:#000000;">New Checkout</div>
                  <div style="margin-top:10px;color:#4b5563;">${new Date().toLocaleString()} / Order ${orderId}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 30px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="50%" valign="top" style="padding-right:18px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6b7280;">Customer</div>
                        <div style="margin-top:8px;font-family:Georgia,serif;font-size:24px;color:#000000;">${safeName}</div>
                        <div style="margin-top:8px;color:#374151;">
                          ${escapeHtml(text(user.email, 'No email'))}<br />
                          ${escapeHtml(text(user.phone, 'No phone'))}
                        </div>
                      </td>
                      <td width="50%" valign="top" style="padding-left:18px;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6b7280;">Delivery Address</div>
                        <div style="margin-top:8px;color:#374151;">${address || '-'}</div>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:26px;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6b7280;">Items</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:6px;">
                    ${buildItemsHtml(items)}
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;border-top:1px solid #e5e5e5;padding-top:14px;">
                    <tr>
                      <td style="padding:5px 0;color:#4b5563;">Payment</td>
                      <td align="right" style="padding:5px 0;color:#000000;font-weight:700;">${escapeHtml(paymentMethod)}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#4b5563;">Coupon</td>
                      <td align="right" style="padding:5px 0;color:#000000;font-weight:700;">${couponCode}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#4b5563;">Subtotal</td>
                      <td align="right" style="padding:5px 0;color:#000000;font-weight:700;">${money(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#4b5563;">Delivery</td>
                      <td align="right" style="padding:5px 0;color:#000000;font-weight:700;">${money(shipping)}</td>
                    </tr>
                    ${
                      discount > 0
                        ? `<tr><td style="padding:5px 0;color:#7b2d2d;">Discount</td><td align="right" style="padding:5px 0;color:#7b2d2d;font-weight:700;">-${money(discount)}</td></tr>`
                        : ''
                    }
                    <tr>
                      <td style="padding:14px 0 0;color:#6b7280;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Total</td>
                      <td align="right" style="padding:14px 0 0;font-family:Georgia,serif;font-size:30px;color:#000000;">${money(total)}</td>
                    </tr>
                  </table>
                  ${
                    safeNote
                      ? `<div style="margin-top:22px;border-top:1px solid #e5e5e5;padding-top:16px;">
                          <div style="font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6b7280;">Customer Note</div>
                          <div style="margin-top:8px;color:#000000;">${safeNote}</div>
                        </div>`
                      : ''
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;
};

export const notifyAdminCheckout = async (req, res) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Missing GMAIL_USER/GMAIL_APP_PASSWORD');
    }

    const {
      user = {},
      address = {},
      items = [],
      totals = {},
      meta = {},
      customerNote = '',
      paymentMethod = 'COD',
      appliedCoupon = null,
    } = req.body || {};
    if (!Array.isArray(items)) throw new Error('items must be an array');

    const userWithAddress = { ...user, ...address };
    const to = process.env.ADMIN_ORDER_EMAIL || process.env.GMAIL_USER;
    const replyTo = userWithAddress.email || undefined;

    await transporter.sendMail({
      from: `"Be Radiant By Nancy Orders" <${process.env.GMAIL_USER}>`,
      to,
      replyTo,
      subject: `Be Radiant By Nancy order ${meta.orderId ? `(${meta.orderId})` : ''} - ${userWithAddress.name || userWithAddress.email || 'Customer'}`,
      html: buildHtml({
        user: userWithAddress,
        items,
        totals,
        meta,
        customerNote,
        paymentMethod,
        appliedCoupon,
      }),
    });

    res.json({ ok: true });
  } catch (error) {
    logError('notify-checkout', error);
    res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};
