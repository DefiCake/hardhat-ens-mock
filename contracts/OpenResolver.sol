// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ABIResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/AddrResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ContentHashResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/DNSResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/InterfaceResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/NameResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/PubkeyResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/TextResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ExtendedResolver.sol";

/**
 * A simple resolver anyone can use; allows any address to set any node
 */
contract OpenResolver is
  ABIResolver,
  AddrResolver,
  ContentHashResolver,
  DNSResolver,
  InterfaceResolver,
  NameResolver,
  PubkeyResolver,
  TextResolver,
  ExtendedResolver
{
  bytes32 private constant OPEN_RESOLVER_DOMAIN =
    0xad3c37868ae515dba167cae3a0604972edf91b84b773bb7f0d69e6c5bb930f59;

  function isAuthorised(bytes32) internal pure override returns (bool) {
    return true;
  }

  function supportsInterface(
    bytes4 interfaceID
  )
    public
    view
    virtual
    override(
      ABIResolver,
      AddrResolver,
      ContentHashResolver,
      DNSResolver,
      InterfaceResolver,
      NameResolver,
      PubkeyResolver,
      TextResolver
    )
    returns (bool)
  {
    return super.supportsInterface(interfaceID);
  }

  /**
   * Returns the address associated with an ENS node.
   * @param node The ENS node to query.
   * @return The associated address.
   */
  function addr(
    bytes32 node
  ) public view virtual override returns (address payable) {
    if (node == OPEN_RESOLVER_DOMAIN) return payable(address(this));

    return AddrResolver.addr(node);
  }
}
