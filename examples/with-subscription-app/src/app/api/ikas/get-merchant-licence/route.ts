import { GetMerchantLicenceQueryData } from '@/lib/ikas-client/generated/graphql';
import { getIkas } from '@/helpers/api-helpers';
import { getUserFromRequest } from '@/lib/auth-helpers';
import { AuthTokenManager } from '@/models/auth-token/manager';
import { NextRequest, NextResponse } from 'next/server';

export type GetMerchantLicenceApiResponse = {
  licence: GetMerchantLicenceQueryData;
};

/**
 * Handles GET requests to fetch the merchant licence including appSubscriptions.
 * - Validates JWT token via getUserFromRequest()
 * - Calls getMerchantLicence query
 * - Returns the licence with its appSubscriptions list
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authToken = await AuthTokenManager.get(user.authorizedAppId);
    if (!authToken) {
      return NextResponse.json(
        { error: { statusCode: 404, message: 'Auth token not found' } },
        { status: 404 }
      );
    }

    const ikasClient = getIkas(authToken);

    const licenceResponse = await ikasClient.queries.getMerchantLicence();

    if (licenceResponse.isSuccess && licenceResponse.data?.getMerchantLicence) {
      return NextResponse.json({
        data: { licence: licenceResponse.data.getMerchantLicence },
      });
    }

    return NextResponse.json(
      { error: { statusCode: 500, message: 'Failed to fetch merchant licence' } },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error fetching merchant licence:', error);
    return NextResponse.json(
      { error: { statusCode: 500, message: 'Failed to fetch merchant licence' } },
      { status: 500 }
    );
  }
}
