import { isAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { hexZeroPad } from "@ethersproject/bytes";
import { HashZero } from "@ethersproject/constants";
import { namehash } from "@ethersproject/hash";
import { keccak256 } from "@ethersproject/solidity";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  ENS_OPEN_RESOLVER_ADDRESS,
  ENS_OPEN_RESOLVER_BYTECODE,
  ENS_OPEN_RESOLVER_DOMAIN,
  ENS_REGISTRY_ADDRESS,
  ENS_REGISTRY_BYTECODE,
} from "./constants";
import { RPC } from "./types";

export async function addressIsContract(
  address: string,
  hre: HardhatRuntimeEnvironment
) {
  return await hre.network.provider
    .send("eth_getCode", [address, "latest"])
    .then((code) => code.length > 2);
}

export function getEnsStorageSlots(key: string) {
  // To access the storage slot of an entry in the private mapping located at ENS,
  // it is needed to keccak256(key + slot of mapping). Since the key
  // is a number, and the mapping of owners is the first storage slot in the contract,
  // then slot = keccak256(key, 0).

  // Then, this storage slot is a struct of [address owner,address resolver,uint ttl].
  // The slot generated from the keccak will point us to the first 32 bytes of the struct,
  // which will contain `address owner`.
  // The next slot (i.e. the next 32 bytes) will contain `address resolver`.
  // The next slot will contain `uint ttl`.

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
    await deployNewENS(hre);
  }

  const accounts: string[] = await hre.network.provider.send("eth_accounts");

  const ownerSlot = getEnsStorageSlots(HashZero).ownerSlot;
  await hre.network.provider.send("hardhat_setStorageAt", [
    ENS_REGISTRY_ADDRESS,
    ownerSlot.replace(/0x0+/, "0x"),
    hexZeroPad(accounts[ownerAccountIndex], 32),
  ]);

  const resolverSlot = getEnsStorageSlots(ENS_OPEN_RESOLVER_DOMAIN)
    .resolverSlot;
  await hre.network.provider.send("hardhat_setStorageAt", [
    ENS_REGISTRY_ADDRESS,
    resolverSlot.replace(/0x0+/, "0x"),
    hexZeroPad(ENS_OPEN_RESOLVER_ADDRESS, 32),
  ]);
}

export function setDomainOwner(hre: HardhatRuntimeEnvironment) {
  return async function (
    domain: string,
    owner: string,
    provider: RPC = hre.network.provider
  ) {
    if (!isAddress(owner)) throw new Error(`${owner} is not a valid address`);
    const node = namehash(domain);
    const ownerSlot = getEnsStorageSlots(node).ownerSlot;
    await provider.send("hardhat_setStorageAt", [
      ENS_REGISTRY_ADDRESS,
      ownerSlot.replace(/0x0+/, "0x"),
      hexZeroPad(owner, 32),
    ]);
  };
}

export function setDomainResolver(hre: HardhatRuntimeEnvironment) {
  return async function (
    domain: string,
    resolver: string,
    provider: RPC = hre.network.provider
  ) {
    if (!isAddress(resolver))
      throw new Error(`${resolver} is not a valid address`);
    const node = namehash(domain);
    const resolverSlot = getEnsStorageSlots(node).resolverSlot;
    await provider.send("hardhat_setStorageAt", [
      ENS_REGISTRY_ADDRESS,
      resolverSlot.replace(/0x0+/, "0x"),
      hexZeroPad(resolver, 32),
    ]);
  };
}

export async function deployNewENS(
  hre: HardhatRuntimeEnvironment,
  at = ENS_REGISTRY_ADDRESS,
  resolver = ENS_OPEN_RESOLVER_ADDRESS
) {
  await hre.network.provider.send("hardhat_setCode", [
    at,
    ENS_REGISTRY_BYTECODE,
  ]);

  await hre.network.provider.send("hardhat_setCode", [
    resolver,
    ENS_OPEN_RESOLVER_BYTECODE,
  ]);
}

export function hreIsEthersV5(hre: HardhatRuntimeEnvironment) {
  return !!hre.ethers && "_networkPromise" in hre.ethers.provider;
}

export function hreIsEthersV6(hre: HardhatRuntimeEnvironment) {
  const v6regExp = /^6\.\d+\.\d+/;

  return !!hre.ethers && v6regExp.test(hre.ethers.version);
}

export function hreIsWeb3JS(hre: HardhatRuntimeEnvironment) {
  return (
    !!hre.web3 &&
    (((hre.web3 as unknown) as any).eth.ens.registryAddress = ENS_REGISTRY_ADDRESS)
  );
}
