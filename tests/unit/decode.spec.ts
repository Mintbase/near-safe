import { EIP712TypedData } from "near-ca";
import { TransactionSerializableEIP1559 } from "viem";

import { SafeEncodedSignRequest, UserOperation } from "../../src";
import {
  decodeRlpHex,
  decodeTransactionSerializable,
  decodeTxData,
  decodeTypedData,
  decodeUserOperation,
} from "../../src/decode";

const chainId = 11155111;
describe("decoding functions", () => {
  it("adapter: decodeTxData", async () => {
    // setup:

    const expectedMessage =
      "Welcome to OpenSea!\n" +
      "\n" +
      "Click to sign in and accept the OpenSea Terms of Service (https://opensea.io/tos) and Privacy Policy (https://opensea.io/privacy).\n" +
      "\n" +
      "This request will not trigger a blockchain transaction or cost any gas fees.\n" +
      "\n" +
      "Wallet address:\n" +
      "0xf057e37024abe7e6bc04fb4f00978613b5ca0241\n" +
      "\n" +
      "Nonce:\n" +
      "aca09a1c-a800-4d71-98ed-547f7c59370c";
    const evmData: SafeEncodedSignRequest = {
      chainId,
      hashToSign:
        "0xb3a14f9bd21518d7da23dba01ddf7c7ef45795ca1515f1b41b6f3455c862e22d",
      evmMessage: expectedMessage,
    };

    expect(decodeTxData(evmData)).toStrictEqual({
      chainId: 11155111,
      costEstimate: "0",
      transactions: [],
      message: expectedMessage,
    });
    // TODO(bh2smith): Test dis sheet.
    // Typed data request:

    // expect(typedSignRequest).toStrictEqual({
    //   chainId,
    //   hash: "0xb3a14f9bd21518d7da23dba01ddf7c7ef45795ca1515f1b41b6f3455c862e22d",
    //   data: expectedMessage,
    // });
  });

  it("decodeRlpHex", () => {
    const evmMessage =
      "0x02f9027083aa36a72a830f4d5b844f32d7b98301ad80947fa8e8264985c7525fc50f98ac1a9b376540548980b902446a7612020000000000000000000000007fa8e8264985c7525fc50f98ac1a9b37654054890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000440d582f130000000000000000000000007f01d9b227593e033bf8d6fc86e634d27aa855680000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041000000000000000000000000102543f7e6b5786a444cc89ff73012825d13000d00000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c0";
    expect(decodeRlpHex(chainId, evmMessage)).toStrictEqual({
      chainId: 11155111,
      costEstimate: "0.000146207015243264",
      transactions: [
        {
          to: "0x7fa8e8264985c7525fc50f98ac1a9b3765405489",
          value: "0",
          data: "0x6a7612020000000000000000000000007fa8e8264985c7525fc50f98ac1a9b37654054890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000440d582f130000000000000000000000007f01d9b227593e033bf8d6fc86e634d27aa855680000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041000000000000000000000000102543f7e6b5786a444cc89ff73012825d13000d00000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    });
    const minimalRlpHex =
      "0x02ef83aa36a780830f4d5b84350f1b6a82520894d8b91431c9fa6dcf3a8cdc2dda68904524a65726865af3107a400080c0";
    expect(decodeRlpHex(11155111, minimalRlpHex)).toStrictEqual({
      chainId: 11155111,
      costEstimate: "0.000018714892329",
      transactions: [
        {
          to: "0xd8b91431c9fa6dcf3a8cdc2dda68904524a65726",
          value: "100000000000000",
          data: "0x",
        },
      ],
    });
  });

  it("decodeTransactionSerializable", () => {
    const tx: TransactionSerializableEIP1559 = {
      chainId: 11155111,
      gas: BigInt("0x1ad80"),
      maxFeePerGas: BigInt("0x65ae4691"),
      maxPriorityFeePerGas: BigInt("0xfc363"),
      nonce: parseInt("0x29", 16),
      // from: "0x102543f7e6b5786a444cc89ff73012825d13000d",
      to: "0x7fa8e8264985c7525fc50f98ac1a9b3765405489",
      data: "0x6a7612020000000000000000000000007fa8e8264985c7525fc50f98ac1a9b37654054890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000440d582f130000000000000000000000007f01d9b227593e033bf8d6fc86e634d27aa855680000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041000000000000000000000000102543f7e6b5786a444cc89ff73012825d13000d00000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000",
    };
    const decoded = decodeTransactionSerializable(chainId, tx);
    expect(decoded).toStrictEqual({
      chainId: 11155111,
      costEstimate: "0.000187682918686208",
      transactions: [
        {
          to: "0x7fa8e8264985c7525fc50f98ac1a9b3765405489",
          value: "0",
          data: "0x6a7612020000000000000000000000007fa8e8264985c7525fc50f98ac1a9b37654054890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000440d582f130000000000000000000000007f01d9b227593e033bf8d6fc86e634d27aa855680000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041000000000000000000000000102543f7e6b5786a444cc89ff73012825d13000d00000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    });
  });

  it("decodeTypedData", () => {
    const typedData: EIP712TypedData = {
      types: {
        SafeTx: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "operation", type: "uint8" },
          { name: "safeTxGas", type: "uint256" },
          { name: "baseGas", type: "uint256" },
          { name: "gasPrice", type: "uint256" },
          { name: "gasToken", type: "address" },
          { name: "refundReceiver", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
        EIP712Domain: [
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
      },
      domain: {
        // Viem: The expected type comes from property 'chainId' which is declared here on type 'TypedDataDomain'
        // @ts-expect-error: Type 'string' is not assignable to type 'number'.
        chainId: "0xaa36a7",
        verifyingContract: "0x7fa8e8264985c7525fc50f98ac1a9b3765405489",
      },
      primaryType: "SafeTx",
      message: {
        to: "0x7fa8e8264985c7525fc50f98ac1a9b3765405489",
        value: "0",
        data: "0xf8dc5dd900000000000000000000000000000000000000000000000000000000000000010000000000000000000000007f01d9b227593e033bf8d6fc86e634d27aa855680000000000000000000000000000000000000000000000000000000000000001",
        operation: "0",
        safeTxGas: "0",
        baseGas: "0",
        gasPrice: "0",
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: "0",
      },
    };
    const decoded = decodeTypedData(chainId, typedData);
    expect(decoded).toStrictEqual({
      chainId,
      costEstimate: "0",
      transactions: [],
      message: typedData,
    });
  });

  it("decodeUserOperation", () => {
    const userOp: UserOperation = {
      nonce: "0x12",
      sender: "0x7fa8e8264985C7525Fc50F98aC1A9b3765405489",
      callData:
        "0x7bb374280000000000000000000000009008d19f58aabd9ed0d60971565aa8510560ab4100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4ec6cb13f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000385ed999b6170188091d3b619aaad8b79ab6d42d4517e26a33b0246ba31cce5bee7fa8e8264985c7525fc50f98ac1a9b3765405489671bdb4400000000000000000000000000000000000000000000000000000000000000000000000062697474652f6e6561722d7361666500",
      signature:
        "0x00000000000000000000000089431a62102a8a224e344ca8d933ffac20c34fe3d8f79479e0ca7323e702192d1b54d4fb6a9f65a49e59a223046f60a160c62dc3c76a332623baa4e9dad0321a1b",
      callGasLimit: "0x26a93",
      maxFeePerGas: "0x1c9c49e8",
      preVerificationGas: "0xd925",
      maxPriorityFeePerGas: "0xc11d3c",
      verificationGasLimit: "0x13393",
      //
      // paymasterData:
      //   "0x000000671bd6ad00000000000036a28a7627b702bf67b6f972b86b475d0396f5be33b49b713b27d07ee98b46df4e698750dfcdcb6e9d66c2951392cde9f31d828e6ab4edd5cadfd239a4dc0fd41c",
      // paymasterPostOpGasLimit: BigInt("0x1"),
      // paymasterVerificationGasLimit: BigInt("0x6bc8"),
    };
    const decoded = decodeUserOperation(chainId, userOp);
    expect(decoded).toStrictEqual({
      chainId: 11155111,
      costEstimate: "0.00007801525601118",
      transactions: [
        {
          to: "0x9008D19f58AAbD9eD0D60971565AA8510560ab41",
          value: 0n,
          data: "0xec6cb13f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000385ed999b6170188091d3b619aaad8b79ab6d42d4517e26a33b0246ba31cce5bee7fa8e8264985c7525fc50f98ac1a9b3765405489671bdb440000000000000000",
          operation: 0,
        },
      ],
    });
  });
});