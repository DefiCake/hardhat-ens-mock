import { BigNumber } from "@ethersproject/bignumber";
import { hexZeroPad } from "@ethersproject/bytes";
import { HashZero } from "@ethersproject/constants";
import { keccak256 } from "@ethersproject/solidity";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ENS_REGISTRY_ADDRESS, ENS_REGISTRY_BYTECODE } from "./constants";

export async function addressIsContract(
  address: string,
  hre: HardhatRuntimeEnvironment
) {
  return await hre.network.provider
    .send("eth_getCode", [address, "latest"])
    .then((code) => code.length > 2);
}

export function getEnsStorageSlots(
  key: string,
  hre: HardhatRuntimeEnvironment
) {
  const ownerSlot = keccak256(
    ["uint256", "uint256"],
    [BigNumber.from(key), "0"]
  );
  const resolverSlot = hexZeroPad(
    BigNumber.from(ownerSlot).add(1).toHexString(),
    32
  );
  const ttlSlot = hexZeroPad(
    BigNumber.from(ownerSlot).add(2).toHexString(),
    32
  );

  return { ownerSlot, resolverSlot, ttlSlot };
}

export async function setupEnsMock(
  hre: HardhatRuntimeEnvironment,
  ownerAccountIndex = 0
) {
  if ((await addressIsContract(ENS_REGISTRY_ADDRESS, hre)) === false) {
    await hre.network.provider.send("hardhat_setCode", [
      ENS_REGISTRY_ADDRESS,
      ENS_REGISTRY_BYTECODE,
    ]);
  }

  const accounts: string[] = await hre.network.provider.send("eth_accounts");

  await hre.network.provider.send("hardhat_setStorageAt", [
    ENS_REGISTRY_ADDRESS,
    getEnsStorageSlots(HashZero, hre).ownerSlot,
    hexZeroPad(accounts[ownerAccountIndex], 32),
  ]);
}

export async function overrideEnsDeployment() {}

export async function deployNewENS() {}
