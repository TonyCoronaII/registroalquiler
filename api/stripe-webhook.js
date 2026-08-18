import crypto from 'crypto';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxb5Q1wFrE6PDVs577VpPZQRhnh2T7eoDZNDaCFpez3sUUd1qdQiWh5je3BNzCdLuPL/exec';

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const sig = req.headers['stripe-signature'];
  if (!sig || !WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or secret' });
  }

  const elements = sig.split(',');
  const timestamp = elements.find(e => e.startsWith('t=')).split('=')[1];
  const signatures = elements.filter(e => e.startsWith('v1=')).map(e => e.split('=')[1]);

  const signedPayload = timestamp + '.' + rawBody;
  const expectedSig = crypto.createHmac('sha256', WEBHOOK_SECRET).update(signedPayload).digest('hex');

  const isValid = signatures.some(s => crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expectedSig)));
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(rawBody);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pedidoId = session.client_reference_id || '';
    const emailCliente = session.customer_details?.email || '';
    const servicio = session.metadata?.servicio || '';

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'enviar_documento',
          pedidoId: pedidoId,
          emailCliente: emailCliente,
          servicio: servicio
        }),
        redirect: 'follow'
      });
    } catch (err) {
      console.error('Error calling Apps Script:', err);
    }
  }

  return res.status(200).json({ received: true });
}
