const fs = require("fs");
const path = require("path");
const axios = require("axios");
const config = require("./config");

function logger(message) {
  console.log(message);
}

function fetchRequest(url) {
  return axios.get(url).then(res => res.data);
}

async function fetchPeers() {
  logger("Fetching all peers from the ARK network..");

  let peers = [];
  let page = 1;

  while (true) {
    const { data } = await getPeerPage(page);

    if ((page === 2 && config.limit) || !data.length) {
      break;
    }

    data.forEach(peer => peers.push(peer.ip));

    page++;
  }

  return peers;
}

function getPeerPage(page) {
  const url = `${config.api}/api/peers?limit=100&page=${page}`;

  return fetchRequest(url);
}

function filterUniquePeers(savedPeers, fetchedPeers) {
  const ips = savedPeers.map(peer => peer.ip);

  const newPeers = fetchedPeers.filter(ip => !ips.includes(ip));

  return newPeers;
}

async function processNewPeers(savedPeers, newPeers) {
  const processedPeers = [...savedPeers];

  for (const ip of newPeers) {
    const { country } = await getPeerInfo(ip);

    processedPeers.push({ ip, country, firstSeen: Date.now() });
  }

  return processedPeers;
}

function getPeerInfo(ip) {
  logger(`Fetching data for peer ${ip}..`);

  const url = `https://ipinfo.io/${ip}/geo?token=${config.accessToken}`;

  return fetchRequest(url);
}

function savePeers(peers) {
  logger("Saving new database to peers.json..");

  fs.writeFile(path.resolve(__dirname, "peers.json"), JSON.stringify(peers, null, 2), err => {
    if (err) logger("Something went wrong :(");

    logger("File saved succesfully.");
  });
}

module.exports = { logger, fetchPeers, filterUniquePeers, processNewPeers, savePeers };
