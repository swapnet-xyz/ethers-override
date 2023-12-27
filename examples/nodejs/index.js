const { Interface, JsonRpcProvider, Network, ethers } = require("ethers");
const { LedgerState, tokenAt } = require("ethers-override");

async function runAsync() {
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

  const rpcUrl = "https://eth.meowrpc.com";   // Mainnet RPC URL

  const network = { chainId: 1, name: "unknown" };
  const provider = new JsonRpcProvider(
    rpcUrl,
    network,
    {
      staticNetwork: Network.from(network),
    }
  );

  const ownerAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
  const usdcTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  const ledgerState = new LedgerState(); // Representation of blockchain state with override
  const stateOverride = await ledgerState.asif(tokenAt(usdcTokenAddress).connect(provider).balanceOf(ownerAddress).is(1234000000n)).getOverrideAsync();

  const erc20Interface = new Interface(erc20Abi);
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
  console.log(`Owner's USDC balance with state override: ${balance}`);
}

runAsync().then();
