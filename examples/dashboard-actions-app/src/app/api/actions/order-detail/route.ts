import crypto from 'crypto';
import { getIkas } from '@/helpers/api-helpers';
import { AuthTokenManager } from '@/models/auth-token/manager';
import { NextRequest, NextResponse } from 'next/server';
import { t } from '@/lib/i18n';

type ActionRequestBody = {
  signature: string;
  authorizedAppId: string;
  merchantId: string;
  data: string; // JSON string containing actionRunId and other data
};

type ActionData = {
  actionRunId: string;
  idList?: string[];
  userLocale?: string;
};

/**
 * Validates webhook signature by generating signature from data and comparing with received signature.
 * @param data - The data string that was signed
 * @param receivedSignature - The signature received from the request
 * @param secret - The app secret used for signing
 * @returns true if signatures match, false otherwise
 */
function validateWebhookSignature(data: string, receivedSignature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex');
  return expectedSignature === receivedSignature;
}

/**
 * Handles POST requests for order detail actions.
 * - Validates the webhook signature.
 * - Fetches order details from ikas API.
 * - Logs order information (orderNumber, orderDate, customer info).
 * - Returns success/failure response.
 */
export async function POST(request: NextRequest) {
  let userLocale = 'en'; // Default locale
  
  try {
    // Parse request body
    const body: ActionRequestBody = await request.json();
    const { signature, authorizedAppId, merchantId, data } = body;

    if (!signature || !authorizedAppId || !merchantId || !data) {
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.missing_fields', userLocale),
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get app secret from environment
    const appSecret = process.env.CLIENT_SECRET;
    if (!appSecret) {
      console.error('CLIENT_SECRET not configured');
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.failed', userLocale),
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    // Validate signature
    const isValidSignature = validateWebhookSignature(data, signature, appSecret);
    if (!isValidSignature) {
      console.error('Invalid signature for app action');
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.invalid_signature', userLocale),
        error: 'Invalid signature' 
      }, { status: 401 });
    }

    // Parse action data
    let actionData: ActionData;
    try {
      actionData = JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse action data:', error);
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.failed', userLocale),
        error: 'Invalid data format' 
      }, { status: 400 });
    }

    const { actionRunId, idList, userLocale: locale } = actionData;
    
    // Set user locale from action data, fallback to 'en'
    userLocale = locale || 'en';

    if (!actionRunId) {
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.missing_fields', userLocale),
        error: 'Missing actionRunId' 
      }, { status: 400 });
    }

    if (!idList || idList.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.missing_fields', userLocale),
        error: 'Missing idList' 
      }, { status: 400 });
    }

    // Get the order ID from idList (assuming single order ID)
    const orderId = idList[0];

    // Retrieve the auth token for the authorized app
    const authToken = await AuthTokenManager.get(authorizedAppId);
    if (!authToken) {
      console.error('Auth token not found for authorizedAppId:', authorizedAppId);
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.unauthorized', userLocale),
        error: 'Auth token not found' 
      }, { status: 404 });
    }

    // Initialize Ikas API client with the auth token
    const ikasClient = getIkas(authToken);

    // Fetch order details from ikas API
    const orderResponse = await ikasClient.queries.listOrder({
      id: { eq: orderId },
    });

    // Check if the API call was successful and order data is present
    if (orderResponse.isSuccess && orderResponse.data && orderResponse.data.listOrder) {
      const orders = orderResponse.data.listOrder.data;

      if (orders && orders.length > 0) {
        const order = orders[0];

        // Log order details as requested
        console.log('===== ORDER DETAILS =====');
        console.log('Action Run ID:', actionRunId);
        console.log('Order ID:', order.id);
        console.log('Order Number:', order.orderNumber);
        console.log('Order Date:', order.orderedAt ? new Date(order.orderedAt).toISOString() : 'N/A');
        console.log('Order Status:', order.status);
        console.log('Payment Status:', order.orderPaymentStatus);
        console.log('Total Amount:', order.totalFinalPrice, order.currencyCode);
        console.log('--- Customer Info ---');
        if (order.customer) {
          console.log('Customer ID:', order.customer.id);
          console.log('Customer Name:', order.customer.fullName || `${order.customer.firstName} ${order.customer.lastName}`);
          console.log('Customer Email:', order.customer.email);
          console.log('Customer Phone:', order.customer.phone);
        } else {
          console.log('No customer information available');
        }
        console.log('--- Shipping Address ---');
        if (order.shippingAddress) {
          console.log(
            'Name:',
            `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          );
          console.log('Phone:', order.shippingAddress.phone);
          console.log('Address:', order.shippingAddress.addressLine1);
          if (order.shippingAddress.addressLine2) {
            console.log('Address Line 2:', order.shippingAddress.addressLine2);
          }
          console.log('City:', order.shippingAddress.city?.name);
          console.log('State:', order.shippingAddress.state?.name);
          console.log('Country:', order.shippingAddress.country?.name);
          console.log('Postal Code:', order.shippingAddress.postalCode);
        }
        console.log('--- Order Items ---');
        console.log('Item Count:', order.orderLineItems?.length || 0);
        if (order.orderLineItems && order.orderLineItems.length > 0) {
          order.orderLineItems.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, item.variant?.name);
            console.log('  SKU:', item.variant?.sku);
            console.log('  Quantity:', item.quantity);
            console.log('  Price:', item.finalPrice);
          });
        }
        console.log('========================');

        // Return success response
        return NextResponse.json({
          success: true,
          message: t('action.order_detail.success', userLocale),
          actionRunId,
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      } else {
        console.error('Order not found:', orderId);
        return NextResponse.json({ 
          success: false,
          message: t('action.order_detail.error.order_not_found', userLocale),
          error: 'Order not found' 
        }, { status: 404 });
      }
    } else {
      console.error('Failed to fetch order:', orderResponse);
      return NextResponse.json({ 
        success: false,
        message: t('action.order_detail.error.failed', userLocale),
        error: 'Failed to fetch order' 
      }, { status: 500 });
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error processing order detail action:', error);
    // Return a generic server error response
    return NextResponse.json({ 
      success: false,
      message: t('action.order_detail.error.failed', userLocale),
      error: 'Failed to process action' 
    }, { status: 500 });
  }
}

