import { getIkas } from '@/helpers/api-helpers';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { AuthTokenManager } from '@/models/auth-token/manager';
import { NextRequest, NextResponse } from 'next/server';
import { ListOrderQueryData } from '@/lib/ikas-client/generated/graphql';

export type GetOrderApiResponse = {
  order?: ListOrderQueryData['data'][0];
};

/**
 * Handles GET requests to fetch order details for the iframe action page.
 * - Authenticates the user from the request JWT token.
 * - Retrieves the auth token for the user's authorized app.
 * - Fetches order info using the Ikas API client.
 * - Returns the order info or an appropriate error response.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user from the request
    const user = getUserFromRequest(request);
    if (!user) {
      // User is not authenticated
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get order ID from query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Retrieve the auth token for the user's authorized app
    const authToken = await AuthTokenManager.get(user.authorizedAppId);
    if (!authToken) {
      // Auth token not found for the user
      return NextResponse.json({ error: 'Auth token not found' }, { status: 404 });
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

        // Log order access for audit purposes
        console.log('Order accessed via iframe action:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          merchantId: user.merchantId,
          authorizedAppId: user.authorizedAppId,
          timestamp: new Date().toISOString(),
        });

        // Return the order information
        return NextResponse.json({ data: { order } });
      } else {
        // Order not found
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    } else {
      // Order fetch failed
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching order for iframe action:', error);
    // Return a generic server error response
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

