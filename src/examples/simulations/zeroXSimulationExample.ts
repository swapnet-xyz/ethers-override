
import axios from "axios";
import { JsonRpcProvider, Network } from "ethers";
import { SwapSimulation } from "./swapSimulation.js";

const rpcUrl = "https://eth.meowrpc.com";

const network = { chainId: 1, name: "unknown" };
const provider = new JsonRpcProvider(
  rpcUrl,
  network,
  {
    staticNetwork: Network.from(network),
  }
);
const senderAddress: string = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
const routerAddress = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";   // 0x: Exchange Proxy


async function queryAsync(sellToken: string, buyToken: string, sellAmount: bigint, verb: 'quote' | 'price' = 'price'): Promise<{ calldata: string, expectedBuyAmount: bigint }> {
  const response = await axios({
    method: "get",
    url: `/swap/v1/${verb}?`,
    baseURL: "https://api.0x.org",
    headers: {
      accept: 'application/json',
      '0x-api-key': '[0x-API_KEY]'  // Placeholder. Use your API key
    },
    params: {
      sellToken: sellToken,
      buyToken: buyToken,
      sellAmount: sellAmount,
      takerAddress: senderAddress,
      skipValidation: true
    }
  });

  // console.log(JSON.stringify(response.data, null, 2));
  return { calldata: response.data.data, expectedBuyAmount: BigInt(response.data.buyAmount) };
}

async function swapSimulation(): Promise<any> {

  const sellTokenAddress: string = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const buyTokenAddress: string = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const sellAmount: bigint = 100000000000000000000n;
  const blockNumber: string = "latest";
  const { calldata, expectedBuyAmount } = await queryAsync(sellTokenAddress, buyTokenAddress, sellAmount, 'quote');

  const { gas, amountOut } = await SwapSimulation
    .from(blockNumber)
    .connect(provider)
    .swapAsync(senderAddress, routerAddress, sellTokenAddress, buyTokenAddress, sellAmount, calldata);

  console.log(`gas: ${gas}`);
  console.log(`amountOut: ${amountOut}`);
  console.log(`expectedBuyAmount: ${expectedBuyAmount}`);
  console.log(`diff: ${(Number(amountOut - expectedBuyAmount) / Number(expectedBuyAmount) * 100).toFixed(10)}%`);
};

swapSimulation().then();