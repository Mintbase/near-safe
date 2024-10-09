import dotenv from "dotenv";
import { ethers } from "ethers";
import { isAddress } from "viem";

import { loadArgs, loadEnv } from "./cli";
import { NearSafe } from "../src";

dotenv.config();

async function main(): Promise<void> {
  const [
    { pimlicoKey, nearAccountId, nearAccountPrivateKey },
    { mpcContractId, recoveryAddress, usePaymaster },
  ] = await Promise.all([loadEnv(), loadArgs()]);
  const chainId = 11155111;
  const txManager = await NearSafe.create({
    accountId: nearAccountId,
    mpcContractId,
    pimlicoKey,
    privateKey: nearAccountPrivateKey,
  });
  const deployed = await txManager.safeDeployed(chainId);
  console.log("Safe Deployed:", deployed);
  const transactions = [
    // TODO: Replace dummy transaction with real user transaction.
    {
      to: "0xbeef4dad00000000000000000000000000000000",
      value: "0", // 0 value transfer with non-trivial data.
      data: "0xbeef",
    },
  ];
  // Add Recovery if safe not deployed & recoveryAddress was provided.
  if (
    !(await txManager.safeDeployed(chainId)) &&
    recoveryAddress &&
    isAddress(recoveryAddress)
  ) {
    const recoveryTx = txManager.addOwnerTx(recoveryAddress);
    // This would happen (sequentially) after the userTx, but all executed in a single
    transactions.push(recoveryTx);
  }

  const unsignedUserOp = await txManager.buildTransaction({
    chainId,
    transactions,
    usePaymaster,
  });
  console.log("Unsigned UserOp", unsignedUserOp);
  const safeOpHash = await txManager.opHash(chainId, unsignedUserOp);
  console.log("Safe Op Hash", safeOpHash);

  // TODO: Evaluate gas cost (in ETH)
  const gasCost = ethers.parseEther("0.01");
  // Whenever not using paymaster, or on value transfer, the Safe must be funded.
  const sufficientFunded = await txManager.sufficientlyFunded(
    chainId,
    transactions,
    usePaymaster ? 0n : gasCost
  );
  if (!sufficientFunded) {
    console.warn(
      `Safe ${txManager.address} insufficiently funded to perform this transaction. Exiting...`
    );
    process.exit(0); // soft exit with warning!
  }

  console.log("Signing with Near at", txManager.mpcContractId);
  const signature = await txManager.signTransaction(safeOpHash);

  console.log("Executing UserOp...");
  const userOpHash = await txManager.executeTransaction(chainId, {
    ...unsignedUserOp,
    signature,
  });
  console.log("userOpHash:", userOpHash);

  const userOpReceipt = await txManager.getOpReceipt(chainId, userOpHash);
  console.log("userOpReceipt:", userOpReceipt);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
