import { NextResponse, URLPattern } from 'next/server';
import { z } from 'zod';

import { auth } from '~/auth';
import { client } from '~/client';

import { type MiddlewareFactory } from './compose-middlewares';

const ALLOWED_REQUESTERS = ['checkout-sdk-js'];
const graphqlPathPattern = new URLPattern({ pathname: '/graphql' });

const bodySchmea = z.object({
  query: z.unknown(),
  variables: z.record(z.unknown()).default({}),
});

export const withGraphqlProxy: MiddlewareFactory = (next) => {
  return async (request, event) => {
    // Only handle /graphql path
    if (!graphqlPathPattern.test(request.nextUrl.toString())) {
      return next(request, event);
    }

    const requester = request.headers.get('x-catalyst-graphql-proxy-requester');

    // Validate required header
    if (!requester || !ALLOWED_REQUESTERS.includes(requester)) {
      return next(request, event);
    }

    // Only handle POST requests
    if (request.method !== 'POST') {
      return new NextResponse('Method not allowed', { status: 405 });
    }

    // Wrap in auth to get customer access token
    return auth(async (req) => {
      try {
        // Parse incoming GraphQL request body
        const body: unknown = await req.json();
        const { query, variables } = bodySchmea.parse(body);

        if (!query) {
          return NextResponse.json({ error: 'Missing query' }, { status: 400 });
        }

        // Get customer access token if authenticated
        const customerAccessToken = req.auth?.user?.customerAccessToken;

        // Proxy the request using the existing client
        const response = await client.fetch({
          document: query,
          variables,
          customerAccessToken,
          fetchOptions: {
            headers: {
              // DO NOT REMOVE: We pass the request cookies to emulate that this is coming from the browser to the GraphQL API
              Cookie: request.headers.get('cookie') || '',
            },
            next: { revalidate: 0 }, // Don't cache, but avoid triggering headers() in beforeRequest
          },
        });

        return NextResponse.json(response);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        return NextResponse.json(error, { status: 500 });
      }
      // @ts-expect-error The return of `auth(() => ...) is overloaded to expect `return next(req, event)` to be the valid middleware type
      // however we are returning NextResponse directly here because we want to proxy GraphQL requests. This is fine to ignore.
    })(request, event);
  };
};
