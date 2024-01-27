import { Interface, JsonRpcProvider, Network } from "ethers";
// import erc20Abi from "../src/abi/erc20.json";
import { LedgerState, tokenAt } from "../src/index";
import { beforeEach, describe, expect, test } from '@jest/globals';

const erc20Abi = `[{
      "constant": true,
      "inputs": [
          {
              "name": "",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }]`;

const erc20Interface = new Interface(erc20Abi);

const ownerAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
const usdcTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";


describe("ethers-override", () => {
  const rpcUrl = "https://eth.meowrpc.com";   // Mainnet RPC URL
  const network = { chainId: 1, name: "unknown" };
  let provider: JsonRpcProvider;


  beforeEach(async () => {
    provider = new JsonRpcProvider(
      rpcUrl,
      network,
      {
        staticNetwork: Network.from(network),
      }
    );
  });


  describe("Ledger State", () => {
    test("should override balance correctly", async () => {
      const ledgerState = new LedgerState();
      const stateOverride = await ledgerState.asif(tokenAt(usdcTokenAddress).connect(provider).balanceOf(ownerAddress).is(1234000000n)).getOverrideAsync();
      const calldata = erc20Interface.encodeFunctionData('balanceOf', [ownerAddress]);
      const result = await provider.send('eth_call', [
        {
          from: ownerAddress,
          to: usdcTokenAddress,
          data: calldata,
        },
        'latest',         // blocktag
        stateOverride,    // eth_call state override
      ]);
      const balance = erc20Interface.decodeFunctionResult('balanceOf', result)[0];
      expect(balance).toBe(1234000000n);
    })
  })
})





