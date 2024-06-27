import { ethers } from "ethers";
import { PaymasterData, UserOperation } from "./types";
import { PLACEHOLDER_SIG } from "./util";

export class Erc4337Bundler {
  provider: ethers.JsonRpcProvider;
  entryPointAddress: string;

  constructor(bundlerUrl: string, entryPointAddress: string) {
    this.entryPointAddress = entryPointAddress;
    this.provider = new ethers.JsonRpcProvider(bundlerUrl);
  }

  async getPaymasterData(
    rawUserOp: any,
    usePaymaster: boolean,
    safeNotDeployed: boolean,
  ): Promise<PaymasterData> {
    if (usePaymaster) {
      console.log("Requesting paymaster data...");
      const data = this.provider.send("pm_sponsorUserOperation", [
        { ...rawUserOp, signature: PLACEHOLDER_SIG },
        this.entryPointAddress,
      ]);
      console.log("Paymaster Data", data);
      return data;
    }
    return defaultPaymasterData(safeNotDeployed);
  }

  async sendUserOperation(userOp: UserOperation): Promise<string> {
    try {
      const userOpHash = await this.provider.send("eth_sendUserOperation", [
        userOp,
        this.entryPointAddress,
      ]);
      return userOpHash;
    } catch (err: unknown) {
      const error = (err as ethers.JsonRpcError).error;
      throw new Error(`Failed to send user op with: ${error.message}`);
    }
  }

  async _getUserOpReceiptInner(userOpHash: string) {
    return this.provider.send("eth_getUserOperationReceipt", [userOpHash]);
  }

  async getUserOpReceipt(userOpHash: string) {
    let userOpReceipt = null;
    while (!userOpReceipt) {
      // Wait 2 seconds before checking the status again
      await new Promise((resolve) => setTimeout(resolve, 2000));
      userOpReceipt = await this._getUserOpReceiptInner(userOpHash);
    }
    return userOpReceipt;
  }
}

// TODO(bh2smith) Should probably get reasonable estimates here:
const defaultPaymasterData = (safeNotDeployed: boolean) => {
  return {
    verificationGasLimit: ethers.toBeHex(safeNotDeployed ? 500000 : 100000),
    callGasLimit: ethers.toBeHex(100000),
    preVerificationGas: ethers.toBeHex(100000),
  };
};
