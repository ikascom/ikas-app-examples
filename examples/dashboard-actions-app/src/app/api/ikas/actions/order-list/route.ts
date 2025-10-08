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
 * Handles POST requests for order list actions.
 * - Validates the webhook signature.
 * - Fetches multiple order details from ikas API.
 * - Logs order information for each order.
 * - Returns success/failure response with order count.
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

    // Fetch order details for all order IDs
    const orderPromises = idList.map(orderId => 
      ikasClient.queries.listOrder({ id: { eq: orderId } })
    );

    const orderResponses = await Promise.all(orderPromises);

    const successfulOrders: Array<{ id: string; orderNumber: string }> = [];
    const failedOrderIds: string[] = [];

    console.log('===== ORDER LIST DETAILS =====');
    console.log('Action Run ID:', actionRunId);
    console.log('Total Orders Requested:', idList.length);

    orderResponses.forEach((orderResponse, index) => {
      const orderId = idList[index];

      if (orderResponse.isSuccess && orderResponse.data && orderResponse.data.listOrder) {
        const orders = orderResponse.data.listOrder.data;

        if (orders && orders.length > 0) {
          const order = orders[0];
          successfulOrders.push({ id: order.id, orderNumber: order.orderNumber || '' });

          // Log order details
          console.log(`\n--- Order ${index + 1} of ${idList.length} ---`);
          console.log('Order ID:', order.id);
          console.log('Order Number:', order.orderNumber);
          console.log('Order Date:', order.orderedAt ? new Date(order.orderedAt * 1000).toISOString() : 'N/A');
          console.log('Order Status:', order.status);
          console.log('Payment Status:', order.orderPaymentStatus);
          console.log('Total Amount:', order.totalFinalPrice, order.currencyCode);
          
          if (order.customer) {
            console.log('Customer:', order.customer.fullName || `${order.customer.firstName} ${order.customer.lastName}`);
            console.log('Customer Email:', order.customer.email);
          }
          
          console.log('Item Count:', order.orderLineItems?.length || 0);
        } else {
          console.error(`Order not found: ${orderId}`);
          failedOrderIds.push(orderId);
        }
      } else {
        console.error(`Failed to fetch order: ${orderId}`);
        failedOrderIds.push(orderId);
      }
    });

    console.log('\n--- Summary ---');
    console.log('Successful:', successfulOrders.length);
    console.log('Failed:', failedOrderIds.length);
    console.log('========================');

    // Return success response
    return NextResponse.json({
      success: true,
      message: userLocale === 'tr' 
        ? `${successfulOrders.length} sipariş başarıyla alındı` 
        : `${successfulOrders.length} orders retrieved successfully`,
      actionRunId,
      totalOrders: idList.length,
      successCount: successfulOrders.length,
      failedCount: failedOrderIds.length,
      orders: successfulOrders,
      failedOrderIds: failedOrderIds.length > 0 ? failedOrderIds : undefined,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error processing order list action:', error);
    // Return a generic server error response
    return NextResponse.json({ 
      success: false,
      message: t('action.order_detail.error.failed', userLocale),
      error: 'Failed to process action' 
    }, { status: 500 });
  }
}

