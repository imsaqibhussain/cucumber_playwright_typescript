const { createTRPCProxyClient, httpBatchLink } = require('@trpc/client');
const superjson = require('superjson');
require('dotenv').config();
const fetch = require('cross-fetch');
const {
  Utilities,
} = require('../qa-automation/tests/page-objects/archive/utilities');
const utility = new Utilities();

async function run() {
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

  // const user = await client.user.getUser.query({
  //   id: 'b64e71ac1c68',
  // });

  console.log(await client.merchant);

  //Enad Hotels
  // const merchant = await client.merchant.getMerchant.query({
  //   id: '62972bbf7919',
  // });
  // console.log(merchant);
  // await utility.writeIntoJsonFile('Enad Hotels', merchant);
  /*
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
