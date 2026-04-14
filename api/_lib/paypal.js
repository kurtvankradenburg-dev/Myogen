export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret)
    throw new Error('PayPal credentials not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables.')

  const base = process.env.PAYPAL_SANDBOX === 'true'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(8000),
  })
  const data = await res.json()
  if (!res.ok) throw new Error('Could not authenticate with PayPal')
  return { token: data.access_token, base }
}

export async function verifyPayPalSubscription(subscriptionId) {
  const { token, base } = await getPayPalAccessToken()
  const res = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  })
  const data = await res.json()
  if (!res.ok) throw new Error('Could not verify subscription with PayPal')
  return data
}
