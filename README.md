[![Umbrel Manager](https://static.getumbrel.com/github/github-banner-umbrel-manager.svg)](https://github.com/getumbrel/umbrel-manager)

[![Version](https://img.shields.io/github/v/release/getumbrel/umbrel-manager?color=%235351FB&label=version)](https://github.com/getumbrel/umbrel-manager/releases)
[![Docker Build](https://img.shields.io/github/workflow/status/getumbrel/umbrel-manager/Docker%20build%20on%20push?color=%235351FB)](https://github.com/getumbrel/umbrel-manager/actions?query=workflow%3A"Docker+build+on+push")
[![Docker Pulls](https://img.shields.io/docker/pulls/getumbrel/manager?color=%235351FB)](https://hub.docker.com/repository/registry-1.docker.io/getumbrel/manager/tags?page=1)
[![Chat](https://img.shields.io/badge/chat%20on-telegram-%235351FB)](https://t.me/getumbrel)

[![Twitter](https://img.shields.io/twitter/follow/getumbrel?style=social)](https://twitter.com/getumbrel)
[![Reddit](https://img.shields.io/reddit/subreddit-subscribers/getumbrel?label=Subscribe%20%2Fr%2Fgetumbrel&style=social)](https://reddit.com/r/getumbrel)


# ☂️ manager

Manager runs by-default on [Umbrel OS](https://github.com/getumbrel/umbrel-os) as a containerized service. It provides a low-level system API that handles:
- User authentication using JWT
- Encryption/decryption of sensitive information, such as the lightning wallet's seed
- CRUD operations
- Lifecycle-management of all other containerized services

## 🚀 Getting started

If you are looking to run Umbrel on your hardware, you do not need to run this service on it's own. Just download [Umbrel OS](https://github.com/getumbrel/umbrel-os/releases) and you're good to go.

## 🛠 Running manager

### Step 1. Install dependencies
```sh
yarn
```

### Step 2. Set environment variables
Set the following environment variables directly or by placing them in `.env` file of project's root.

| Variable | Description | Default |
| ------------- | ------------- | ------------- |
| `PORT` | Port where manager should listen for requests | `3006` |
| `DEVICE_HOST` | IP or domain from where [`umbrel-dashboard`](https://github.com/getumbrel/umbrel-dashboard) will request | `http://umbrel.local` |
| `USER_FILE` | Path to the user's data file (automatically created on user registration) | `/db/user.json` |
| `SHUTDOWN_SIGNAL_FILE` | Path to write a file to signal a system shutdown | `/signals/shutdown` |
| `REBOOT_SIGNAL_FILE` | Path to write a file to signal a system reboot | `/signals/reboot` |
| `MIDDLEWARE_API_URL` | IP or domain where [`umbrel-middleware`](https://github.com/getumbrel/umbrel-middleware) is listening | `http://localhost` |
| `MIDDLEWARE_API_PORT` | Port where [`umbrel-middleware`](https://github.com/getumbrel/umbrel-middleware) is listening | `3005` |
| `JWT_PUBLIC_KEY_FILE` | Path to the JWT public key (automatically created) | `/db/jwt-public-key/jwt.pem` |
| `JWT_PRIVATE_KEY_FILE` | Path to the JWT private key (automatically created) | `/db/jwt-public-key/jwt.key` |
| `JWT_EXPIRATION` | JWT expiration in miliseconds | `3600` |
| `DOCKER_COMPOSE_DIRECTORY` | Path to directory containing `docker-compose.yml` | `/docker-compose` |
| `UMBREL_SEED_FILE` | Path to the seed used to deterministically generate entropy | `'/db/umbrel-seed/seed'` |
| `UMBREL_DASHBOARD_HIDDEN_SERVICE_FILE` | Path to Tor hostname of [`umbrel-dashboard`](https://github.com/getumbrel/umbrel-dashboard) | `/var/lib/tor/dashboard/hostname` |
| `BITCOIN_P2P_HIDDEN_SERVICE_FILE` | Path to P2P hidden service hostname of `bitcoin` | `/var/lib/tor/bitcoin-p2p/hostname` |
| `BITCOIN_P2P_PORT` | P2P port of `bitcoin` | `8333` |
| `GITHUB_REPO` | GitHub repository of Umbrel | `getumbrel/umbrel` |
| `UMBREL_VERSION_FILE` | Path to the Umbrel's version file | `/info.json` |
| `UPDATE_STATUS_FILE` | Path to update status file | `/statuses/update-status.json` |
| `UPDATE_SIGNAL_FILE` | Path to write the update signal file | `/signals/update` |
| `UPDATE_LOCK_FILE` | Path to the update lock file | `/statuses/update-in-progress` |

### Step 3. Run manager
```sh
yarn start
```

You can browse through the available API endpoints [here](https://github.com/getumbrel/umbrel-manager/tree/master/routes/v1).

---

### ⚡️ Don't be too reckless

> Umbrel is still in an early stage and things are expected to break every now and then. We **DO NOT** recommend running it on the mainnet with real money just yet, unless you want to be really *#reckless*.

## ❤️ Contributing

We welcome and appreciate new contributions!

If you're a developer looking to help but not sure where to begin, check out [these issues](https://github.com/getumbrel/umbrel-manager/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) that have specifically been marked as being friendly to new contributors.

If you're looking for a bigger challenge, before opening a pull request please [create an issue](https://github.com/getumbrel/umbrel-manager/issues/new/choose) or [join our community chat](https://t.me/getumbrel) to get feedback, discuss the best way to tackle the challenge, and to ensure that there's no duplication of work.

## 🙏 Acknowledgements

Umbrel Manager is inspired by and built upon the work done by [Casa](https://github.com/casa) on its open-source [Node Manager API](https://github.com/Casa/V2-Casa-Node-Manager).

---

[![License](https://img.shields.io/github/license/getumbrel/umbrel-manager?color=%235351FB)](https://github.com/getumbrel/umbrel-manager/blob/master/LICENSE)

[getumbrel.com](https://getumbrel.com)
