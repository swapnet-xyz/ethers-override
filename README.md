# ethers-override

> ⚡🚀 SDK for `eth_call` override.

`eth_call` is commonly used by developers to do simulations to validate calldata, to evaluate gas cost, or to test smart contract code. Its state override feature is crucial for various simulation scenarios. Previously, developers did not have an easy way of composing the override object.

This SDK simplifies the process, enabling developers to compose overrides with improved readability. 


---

## Installation

```bash
npm install ethers-override
```

```bash
yarn add ethers-override
```

---

## Usage
Build a state override object with `AsIf`s provided in this library before sending to rpc node in an `eth_call`.

### Example

```typescript
const ledgerState = new LedgerState(); // Representation of blockchain state with override
const stateOverride = await ledgerState
  .asif(tokenAt(usdcTokenAddress).connect(provider).balanceOf(ownerAddress).is(1234000000n))
  .getOverrideAsync();

const erc20Interface: Interface = new Interface(erc20Abi);
const calldata = erc20Interface.encodeFunctionData('balanceOf', [ownerAddress]);

const result = await provider.send('eth_call', [
  {
    from: ownerAddress,
    to: usdcTokenAddress,
    data: calldata,
  },
  'latest', // blocktag
  stateOverride, // eth_call state override
]);

const balance = erc20Interface.decodeFunctionResult('balanceOf', result)[0];
console.log(`Owner's USDC balance with state override: ${balance}`);
```

Output:

```bash
# Owner's USDC real balance: 0
Owner's USDC balance with state override: 1234000000
```

---

### Other `AsIf`s
```typescript
await ledgerState
    .asif(addressAt(ownerAddress).balance().is("0x1000000000000000000"))
    .asif(addressAt(ownerAddress).nonce().is(1n))
    .asif(addressAt(uniswapRouterAddress).code().is(newRouterCode))
    .asif(tokenAt(tokenAddress).connect(provider).balanceOf(ownerAddress).is(newBalance))
    .asif(tokenAt(tokenAddress).connect(provider).allowance(ownerAddress, permit2.address).is(newBalance))
    .asif(
        permit2
            .allowance(ownerAddress, tokenAddress, uniswapRouterAddress)
            .is({
                nonce: 1n,
                expiration: BigInt(Math.floor(Date.now() / 1000) + 3600),
                amount: newBalance
            })
    )
    .getOverrideAsync();

```