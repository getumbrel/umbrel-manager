const diskLogic = require('logic/disk.js');
const NodeError = require('models/errors.js').NodeError;

async function get() {
  // TODO: Query this dynamically from disk.
  const apps = [
    {
      id: "btcpay",
      category: "Merchants",
      name: "BTCPay Server",
      version: "3.2.2",
      tagline: "Accept Bitcoin payments with zero fees and no third-party",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.\n\nBTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "mempool-space",
      category: "Explorers",
      name: "mempool.space",
      version: "2.9.2",
      tagline: "Mempool visualizer for the Bitcoin network",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "btc-rpc-explorer",
      category: "Explorers",
      name: "BTC RPC Explorer",
      version: "0.7.2",
      tagline: "A simple explorer for the Bitcoin blockchain",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "dojo",
      category: "Wallets",
      name: "Dojo",
      version: "0.7.2",
      tagline: "Private server for Samourai Wallet",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "specter",
      category: "Wallets",
      name: "Specter",
      version: "0.7.2",
      tagline: "Multi-sig Bitcoin made easy",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "lndhub",
      category: "Lightning",
      name: "LNDhub",
      version: "0.7.2",
      tagline: "Multi-account wrapper for LND",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "rtl",
      category: "Lightning",
      name: "Ride The Lightning",
      version: "0.7.2",
      tagline: "A powerful dashboard for Lightning",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "thunderhub",
      category: "Lightning",
      name: "Thunderhub",
      version: "0.7.2",
      tagline: "Lightning node management for full control",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    },
    {
      id: "sphinx",
      category: "Lightning",
      name: "Sphinx Relay",
      version: "0.7.2",
      tagline: "Chat & pay with Lightning",
      description: "BTCPay is a non-custodial invoicing system which eliminates the involvement of a third-party. Payments with BTCPay go directly to your wallet, which increases the privacy and security. Your private keys are never uploaded to the server. There is no address re-use, since each invoice generates a new address deriving from your xpubkey.",
      developer: "BTCPay Foundation",
      repo: "https://github.com/btcpayserver/btcpayserver",
      gallery: ["1.png", "2.png", "3.png"],
      compatible: true,
      dependencies: [{ id: "bitcoind", version: "0.20.1" }, { id: "lnd", version: "0.11.1" }],
      website: "https://btcpayserver.org",
    }
  ];

  return apps;
}

async function isValidAppId(id) {
  // TODO: validate id
  return true;
}

async function install(id) {
  if(! await isValidAppId(id)) {
    throw new NodeError('Invalid app id');
  }

  try {
    await diskLogic.writeSignalFile(`app-install-${id}`);
  } catch (error) {
    throw new NodeError('Could not write the signal file');
  }
};

async function uninstall(id) {
  if(! await isValidAppId(id)) {
    throw new NodeError('Invalid app id');
  }

  try {
    await diskLogic.writeSignalFile(`app-uninstall-${id}`);
  } catch (error) {
    throw new NodeError('Could not write the signal file');
  }
};

module.exports = {
  get,
  install,
  uninstall,
};
