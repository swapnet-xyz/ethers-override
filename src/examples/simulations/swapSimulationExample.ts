
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
const routerAddress = "0x1111111254EEB25477B68fb85Ed929f73A960582";   // 1inch v5 address


async function queryAsync(sellToken: string, buyToken: string, sellAmount: bigint, verb: 'quote' | 'swap' = 'quote'): Promise<{ calldata: string, expectedBuyAmount: bigint }> {
  const response = await axios({
    method: "get",
    url: `/swap/v5.2/1/${verb}`,
    baseURL: "https://api.1inch.dev",
    headers: {
      accept: 'application/json',
      Authorization: `Bearer [1inch-API-KEY]` // Placeholder. Use your API key
    },
    params: {
      src: sellToken,
      dst: buyToken,
      amount: sellAmount,
      // protocol list could be obtained from: https://api.1inch.io/v5.0/1/liquidity-sources using
      // 1inch's swagger: https://docs.1inch.io/docs/aggregation-protocol/api/swagger
      // protocols: "UNISWAP_V3,UNISWAP_V2,CURVE,CURVE_3CRV"
      protocols: "UNISWAP_V3,UNISWAP_V2,CURVE,CURVE_3CRV",
      includeTokensInfo: true,
      includeProtocols: true,
      includeGas: true,
      from: senderAddress,
      slippage: 1,
      disableEstimate: true,
    }
  });

  // console.log(JSON.stringify(response.data, null, 2));
  return { calldata: response.data.tx?.data, expectedBuyAmount: BigInt(response.data.toAmount) };
}

async function swapSimulation(): Promise<any> {

  const sellTokenAddress: string = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const buyTokenAddress: string = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const sellAmount: bigint = 100000000000000000000n;
  const blockNumber: string = "latest";
  const { calldata, expectedBuyAmount } = await queryAsync(sellTokenAddress, buyTokenAddress, sellAmount, 'swap');

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