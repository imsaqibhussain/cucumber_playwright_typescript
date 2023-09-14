import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
// require('dotenv').config();
import fetch from 'cross-fetch';
// import { authorize } from '@planpay/planpay-next-lib';

async function run(merchantName: any, merchantId: any, userId: any) {
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
  console.log('client data recieved ', client);
  console.log('user Id ', userId);

  const user = await client.user.getUser.query({
    id: userId,
  });
  console.log(
    '======== User data recieved from trpc api ====== \n ',
    user,
    '\n'
  );

  //  Enad Hotels

  console.log('merchant Id ', merchantId);
  const merchant = await client.merchant.getMerchant.query({
    id: merchantId,
  });
  console.log(
    '======= Merchant data recieved from trpc api ======= \n',
    merchant,
    '\n'
  );

  // await utility.writeIntoJsonFile(
  //   merchantName,
  //   await client.merchant.getMerchant.query({
  //     id: merchantId,
  //   })
  // );

  /*
 

  console.log(user);

  //Enad Hotels
  // const merchant = await client.merchant.getMerchant.query({
  //   id: '62972bbf7919',
  // });
  // console.log(merchant);
  // await utility.writeIntoJsonFile('Enad Hotels', merchant);

  await utility.writeIntoJsonFile(
    'Enad Hotels',
    await client.merchant.getMerchant.query({
      id: '62972bbf7919',
    })
  );
  await utility.writeIntoJsonFile(
    'Shonrate Hotels',
    await client.merchant.getMerchant.query({
      id: '631adba97bf3',
    })
  );
  await utility.writeIntoJsonFile(
    'Noraa Travel',
    await client.merchant.getMerchant.query({
      id: '630880668a41',
    })
  );
  await utility.writeIntoJsonFile(
    'Ovolo Hotels',
    await client.merchant.getMerchant.query({
      id: '62bd1b7e5e8b',
    })
  );
  */
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
export default run;
