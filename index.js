const { logger, fetchPeers, filterUniquePeers, processNewPeers, savePeers } = require("./utils");
const savedPeers = require("./peers.json");

const main = async () => {
  logger("Script started.");

  const peers = await fetchPeers();
  const newPeers = savedPeers.length ? filterUniquePeers(savedPeers, peers) : peers;

  if (newPeers.length) {
    logger(`Found ${newPeers.length} new peers!`);

    const processedPeers = await processNewPeers(savedPeers, newPeers);

    logger(
      `Total peers in database is now ${processedPeers.length} (previously ${savedPeers.length}).`
    );

    savePeers(processedPeers);
  } else {
    logger(`No new peers detected.`);
  }
};

if (typeof module !== "undefined" && !module.parent) main();
