
import { describe, expect, test, jest } from '@jest/globals';
import { TokenAsIf } from "../src/index";
import { exportedForTesting } from "../src/tokenAsIf";
import { JsonRpcProvider, solidityPacked } from 'ethers';

const { getBalanceOfSlotKey, getAllowanceSlotKey } = exportedForTesting;
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

  let provider: JsonRpcProvider;

  test("mockProvider", async () => {
    provider = new JsonRpcProvider();
    const params = [{
      to: "abc",
      gas: "0x23",
      gasPrice: "0x9184e72a000",
      value: "0x0"
    }];
    jest.spyOn(JsonRpcProvider.prototype, 'send').mockResolvedValue(sendReturnValue);
    const res = await provider.send("eth_createAccessList", params);
    expect(res.gasUsed).toBe("0x81f3");
  })


  test("balanceOf", async () => {
    provider = new JsonRpcProvider();
    // calculate slotKey
    const mappingSlotNumber = 9;
    const ownerAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
    const usdcTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const slotKey = getBalanceOfSlotKey(ownerAddress, mappingSlotNumber);
    const sendReturnValue = {
      "accessList": [
        {
          "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "storageKeys": [
            "0x12345",
            "0x67890",
            slotKey
          ]
        },
        {
          "address": "0xabc1234567",
          "storageKeys": []
        }
      ],
      "gasUsed": "0x81f3"
    }

    const balance = 1234000000n;
    const hexBalance = solidityPacked(["uint256"], [balance]);

    // mocking provider.send
    jest.spyOn(JsonRpcProvider.prototype, 'send').mockResolvedValue(sendReturnValue);

    const oldState = new TokenAsIf(usdcTokenAddress);
    const newState = oldState.connect(provider).balanceOf(ownerAddress).is(balance);
    const result = await newState.valueAsync();
    expect(result).toEqual({ [usdcTokenAddress]: { "stateDiff": { [slotKey]: hexBalance } } });
  })

  test("allowance", async () => {
    provider = new JsonRpcProvider();
    // calculate slotKey
    const mappingSlotNumber = 5;
    const ownerAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
    const spenderAddress = "0xedC7ec654e305A38FFfF3CC3fcb2BD0E7341d64A"
    const usdcTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const slotKey = getAllowanceSlotKey(ownerAddress, spenderAddress, mappingSlotNumber);
    const sendReturnValue = {
      "accessList": [
        {
          "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "storageKeys": [
            slotKey,
            "0x12345",
            "0x67890"
          ]
        },
        {
          "address": "0xabc1234567",
          "storageKeys": []
        }
      ],
      "gasUsed": "0x81f3"
    }

    const allowance = 1234000000n;
    const hexAllowance = solidityPacked(["uint256"], [allowance]);

    // mocking provider.send
    jest.spyOn(JsonRpcProvider.prototype, 'send').mockResolvedValue(sendReturnValue);

    const oldState = new TokenAsIf(usdcTokenAddress);
    const newState = oldState.connect(provider).allowance(ownerAddress, spenderAddress).is(allowance);
    const result = await newState.valueAsync();
    expect(result).toEqual({ [usdcTokenAddress]: { "stateDiff": { [slotKey]: hexAllowance } } });
  })

})