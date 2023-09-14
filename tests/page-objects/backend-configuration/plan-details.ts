import { Utilities } from '../utilities';
const utility = new Utilities();
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import fetch from 'cross-fetch';
// import { merchantDemo } from '../../../setup/configurations/merchant';
import { config } from '../.././setup/configurations/test-data-ts.conf';

export class planConfig {
  env = config.LocalEnv.env;

  async fetchAndWritePlanDetails(planId: any) {
    console.log('plan id from fetchplan function', planId);
    try {
      const url = process.env.PLANPAY_NEXT_URL;
      console.log(url);
      const client = createTRPCProxyClient({
        transformer: superjson,
        links: [
          httpBatchLink({
            url: `${url}/api/trpc`,
            fetch,
            headers() {
              return {
                Authorization: 'Bearer ' + process.env.APP_INTERNAL_REQUEST_KEY,
              };
            },
          }),
        ],
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log('await client.plan ', await client.plan);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const planDetails = await client.plan.getPlan.query({
        planId: planId,
      });

      console.log('planDetails ', planDetails);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await utility.writeIntoJsonFile(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        'plan-details',
        planDetails,
        './actual'
      );
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}
