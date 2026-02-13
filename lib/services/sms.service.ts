// lib/services/sms.service.ts

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://boulangerie-app.vercel.app'
const SMS_SENDER = process.env.BREVO_SMS_SENDER || 'Boulangerie'

export async function sendOrderConfirmationSMS(
  customerPhone: string,
  customerName: string,
  orderNumber: string
): Promise<void> {
  try {
    const formattedPhone = formatPhone(customerPhone)

    const message =
      `Bonjour ${customerName} !\n` +
      `Commande confirmee : ${orderNumber}\n` +
      `Suivez-la sur :\n` +
      `${SITE_URL}/mes-commandes\n` +
      `Entrez votre tel + ${orderNumber}\n` +
      `Merci ! Ma Boulangerie`

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: SMS_SENDER,
        recipient: formattedPhone,
        content: message,
        type: 'transactional',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    console.log(`✅ SMS Brevo envoyé à ${formattedPhone}`)

  } catch (error) {
    // ✅ Ne jamais bloquer la commande si SMS échoue
    console.error('❌ Erreur SMS Brevo (commande non bloquée):', error)
  }
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  if (cleaned.startsWith('+')) return cleaned.replace('+', '')
  if (cleaned.length === 8) return `226${cleaned}`
  if (cleaned.startsWith('226')) return cleaned
  return cleaned
}