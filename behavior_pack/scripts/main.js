import { world, system } from "@minecraft/server";
import { ensureDefaults } from "./data.js";
import { startHud } from "./hud.js";
import { startBounty } from "./bounty.js";
import { startJobs } from "./jobs.js";
import { registerCommands } from "./commands.js";

registerCommands();

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  ensureDefaults(ev.player);
  try {
    ev.player.sendMessage("§6§lWelcome to D-Coconut SMP§r §7— type §e/dc:help§r§7 for commands§r");
  } catch (_) {}
});

system.run(() => {
  startBounty();
  startJobs();
  startHud();
});
