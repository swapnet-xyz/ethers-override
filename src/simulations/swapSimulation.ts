import { BlockTag, Interface, JsonRpcApiProvider } from "ethers";
import { LedgerState } from "../asifs/ledgerState";
import { addressAt } from "../asifs/addressAsIf";
import { abi as erc20Abi } from '../abi/erc20.json'
import { abi as multicallAbi, bytecode as multicallBytecode } from '../abi/multicall3Revised.json'
import { bytecode as universalRouterBytecode } from '../abi/universalRouterRevised.json'
import { tokenAt } from "../asifs/tokenAsIf";
import { permit2 } from "../asifs/permit2AsIf";

const erc20Interface: Interface = new Interface(erc20Abi);
const multicallInterface: Interface = new Interface(multicallAbi);


export class SwapSimulation {
    public static from(blockTag: BlockTag): SwapSimulation {
        return new SwapSimulation(blockTag);
    }

    private _ledgerState: LedgerState;
    private _provider: JsonRpcApiProvider | undefined = undefined;

    public constructor(blockTag: BlockTag) {
        this._ledgerState = LedgerState.from(blockTag);
    }

    public connect(provider: JsonRpcApiProvider): SwapSimulation {
        this._provider = provider;
        return this;
    }

    public async swapAsync(
        senderAddress: string,
        routerAddress: string,
        sellTokenAddress: string,
        buyTokenAddress: string,
        sellAmount: bigint,
        calldata: string,
    ): Promise<{ gas: bigint, amountOut: bigint, }> {
        if (this._provider === undefined) {
            throw new Error(`No provider is connected with SwapSimulation.`);
        }

        const state = await this._ledgerState
            .asif(addressAt(senderAddress).balance().is("0x1000000000000000000"))  // suppose sender has sufficient native token (1 ether) for the Tx
            .asif(addressAt(senderAddress).code().is(multicallBytecode))
            .asif(addressAt(routerAddress).code().is(universalRouterBytecode))
            .asif(tokenAt(sellTokenAddress).connect(this._provider).balanceOf(senderAddress).is(sellAmount + 1n))
            .asif(tokenAt(sellTokenAddress).connect(this._provider).allowance(senderAddress, permit2.address).is(sellAmount + 1n))
            .asif(
                permit2
                    .allowance(senderAddress, sellTokenAddress, routerAddress)
                    .is({
                        nonce: 1n,
                        expiration: BigInt(Math.floor(Date.now() / 1000) + 3600),
                        amount: sellAmount + 1n
                    })
            )
            .getStateAsync();

        const balanceOfCalldata = erc20Interface.encodeFunctionData("balanceOf", [ senderAddress ]);
        const multicallData = multicallInterface.encodeFunctionData("aggregate2", [[
            [buyTokenAddress, balanceOfCalldata],
            [routerAddress, calldata],
            [buyTokenAddress, balanceOfCalldata],
        ]]);
        const result = await this._provider.send("eth_call", [{
                from: senderAddress,
                to: senderAddress,
                gas: "0x4c4b40",
                gasPrice: "0x290c792f3e",
                value: "0x0",
                data: multicallData,
            },
            ...state
        ]);

        if (result.error && result.error.code === 3) {
            const error = multicallInterface.parseError(result.error.data)!;
            if (error) {
                console.log(`Parsed error: ` + error.signature);
                if (error.args.length > 0) {
                    console.log(`Parsed error: ` + error.args);
                    console.log(JSON.stringify(result));
                }
            }
        }
        // console.log(JSON.stringify(result, null, 2))
        const decodedResult = multicallInterface.decodeFunctionResult("aggregate2", result);
        const gas = BigInt(decodedResult[1][1]);
        const amountOut = BigInt(decodedResult[2][2]) - BigInt(decodedResult[2][0]);
        return { gas, amountOut };
    }
}