import { existsSync } from "fs";
import { join, resolve } from "path";

// Main function
const rebuildIndex = async () => {
  const packName = process.argv[2];
  if (!packName) {
    console.error("Usage: node rebuild-index.js <pack-name>");
    process.exit(1);
  }

  // Dynamically resolve Foundry data path relative to the script's location
  const scriptDir = resolve(import.meta.url.replace("file://", "")).replace(
    "/rebuild-index.js",
    ""
  );
  const foundryDataPath = resolve(scriptDir, "../"); // Adjust "../data" to point to the correct location
  const packPath = join(foundryDataPath, "packs", `${packName}.db`);

  if (!existsSync(packPath)) {
    console.error(`Error: Pack not found at ${packPath}`);
    process.exit(1);
  }

  console.log(`Rebuilding index for pack: ${packName}`);

  // Simulate Foundry environment
  globalThis.game = {
    packs: new Map([
      [
        packName,
        {
          getIndex: async ({ force }) => {
            console.log(
              `Index for pack "${packName}" rebuilt ${
                force ? "with force" : ""
              }.`
            );
          },
        },
      ],
    ]),
  };

  const pack = game.packs.get(packName);
  if (!pack) {
    console.error(`Error: Could not load pack: ${packName}`);
    process.exit(1);
  }

  await pack.getIndex({ force: true });
  console.log(`Index rebuilt successfully for pack: ${packName}`);
};

// Run the function
rebuildIndex();
