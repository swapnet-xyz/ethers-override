
import { describe, expect, test } from '@jest/globals';
import { Permit2AsIf } from "../src/index";
import type { Permit2AllowanceValue } from "../src/index";
import { exportedForTesting } from '../src/permit2AsIf';
import { solidityPacked } from 'ethers';

const { getAllowanceSlotKey } = exportedForTesting;
const PERMIT2_ADDRESS = "0x000000000022d473030f116ddee9f6b43ac78ba3";

describe("permit2AsIf", () => {

  test("allowance", async () => {
    // calculate slotKey
    const mappingSlotNumber = 1;  // hard coded to 1
    const ownerAddress = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";
    const spenderAddress = "0xedC7ec654e305A38FFfF3CC3fcb2BD0E7341d64A"
    const slotKey = getAllowanceSlotKey(ownerAddress, PERMIT2_ADDRESS, spenderAddress, mappingSlotNumber);

    const allowance = 1234000000n;

    const permit2Allowance: Permit2AllowanceValue = {
      nonce: 1n,
      expiration: 1234567890n,
      amount: allowance
    }
    const hexAllowance = solidityPacked(["uint48", "uint48", "uint160"], [permit2Allowance.nonce, permit2Allowance.expiration, permit2Allowance.amount]);

    const oldState = new Permit2AsIf(PERMIT2_ADDRESS);
    const newState = oldState.allowance(ownerAddress, PERMIT2_ADDRESS, spenderAddress).is(permit2Allowance);
    const result = await newState.valueAsync();
    expect(result).toEqual({ [PERMIT2_ADDRESS]: { "stateDiff": { [slotKey]: hexAllowance } } });
  })

})

