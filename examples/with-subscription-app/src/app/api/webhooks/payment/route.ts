import { IkasWebhook, WebhookPaymentData } from '@/types/subscription';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests for payment webhook callbacks from ikas.
 * - Receives IkasWebhook payload
 * - Parses payment data from data field (JSON string)
 * - Logs payment status updates for debugging
 * - Returns 200 OK to acknowledge receipt
 *
 * Note: This endpoint is public (no JWT required) as it receives callbacks from ikas.
 */
export async function POST(request: NextRequest) {
  try {
    const webhook: IkasWebhook = await request.json();

    console.log('[Webhook] Received payment webhook:', {
      scope: webhook.scope,
      merchantId: webhook.merchantId,
    });

    // Parse the payment data from the JSON string
    let paymentData: WebhookPaymentData | null = null;
    try {
      paymentData = JSON.parse(webhook.data) as WebhookPaymentData;
    } catch (parseError) {
      console.error('[Webhook] Failed to parse payment data:', parseError);
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    console.log('[Webhook] Payment data:', {
      paymentStatus: paymentData.paymentStatus,
      subscriptionKey: paymentData.subscriptionKey,
      merchantId: paymentData.merchantId,
      paymentId: paymentData.paymentId,
    });

    // Handle different payment statuses
    switch (paymentData.paymentStatus) {
      case 'PAID':
        console.log(
          `[Webhook] Payment successful for merchant ${paymentData.merchantId}, subscription: ${paymentData.subscriptionKey}`
        );
        break;
      case 'PAYMENT_FAILED':
        console.log(
          `[Webhook] Payment failed for merchant ${paymentData.merchantId}, subscription: ${paymentData.subscriptionKey}`
        );
        break;
      case 'WAITING_FOR_PAYMENT':
        console.log(
          `[Webhook] Payment pending for merchant ${paymentData.merchantId}, subscription: ${paymentData.subscriptionKey}`
        );
        break;
      default:
        console.log(`[Webhook] Unknown payment status: ${paymentData.paymentStatus}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing payment webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
