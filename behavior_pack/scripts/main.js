import { world, system } from "@minecraft/server";
import { ensureDefaults } from "./data.js";
import { startHud } from "./hud.js";
import { startBounty } from "./bounty.js";
import { startJobs } from "./jobs.js";
import { startCommands } from "./commands.js";

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  ensureDefaults(ev.player);
  try {
    ev.player.sendMessage("§6§lWelcome to D-Coconut SMP§r §7— type §e/dchelp§r§7 for commands§r");
  } catch (_) {}
});

system.run(() => {
  startCommands();
  startBounty();
  startJobs();
  startHud();
});
