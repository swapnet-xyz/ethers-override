
import { beforeEach, describe, expect, test, jest, afterEach, beforeAll } from '@jest/globals';
import { TokenAsIf } from "../src/index";
import { JsonRpcProvider, Network, keccak256, solidityPacked, toBeHex, zeroPadValue } from 'ethers';

describe("tokenAsIf", () => {

  const sendReturnValue = {
    "accessList": [
      {
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "storageKeys": [
          "0x12345",
          "0x67890",
          "0xf800ab3c6019c234c0cd9e10d337b2fa51dcb3800bc9bfa22e41d22bc7ca3ceb"
        ]
      },
      {
        "address": "0xabc1234567",
        "storageKeys": []
      }
    ],
    "gasUsed": "0x81f3"
  }

  beforeAll(async () => {
    jest.spyOn(JsonRpcProvider.prototype, 'send').mockResolvedValue(sendReturnValue);
  });

  let provider: JsonRpcProvider;

  test("mockProvider", async () => {
    provider = new JsonRpcProvider();
    const params = [{
      to: "abc",
      gas: "0x23",
      gasPrice: "0x9184e72a000",
      value: "0x0"
    }];
    const res = await provider.send("eth_createAccessList", params);
    expect(res.gasUsed).toBe("0x81f3");
  })


  test("balanceOf", async () => {
    provider = new JsonRpcProvider();
    // calculate slotKey
    const mappingSlotNumber = 9;
    const ownerAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
    const usdcTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const slotKey = keccak256(zeroPadValue(ownerAddress, 32) + toBeHex(mappingSlotNumber, 32).slice(2)).toLowerCase();
    const balance = 1234000000n;
    const hexBalance = solidityPacked(["uint256"], [balance]);

    const oldState = new TokenAsIf(usdcTokenAddress);
    const newState = oldState.connect(provider).balanceOf(ownerAddress).is(1234000000n);
    const result = await newState.valueAsync();
    expect(result).toEqual({ [usdcTokenAddress]: { "stateDiff": { [slotKey]: hexBalance } } });
  })



})