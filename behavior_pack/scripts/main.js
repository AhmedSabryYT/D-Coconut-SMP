import { world, system } from "@minecraft/server";
import { ensureDefaults } from "./data.js";
import { startHud } from "./hud.js";
import { startBounty } from "./bounty.js";
import { startJobs } from "./jobs.js";
import { startCommands } from "./commands.js";
import { giveMenuItem, startMenuItem } from "./menu.js";

world.afterEvents.playerSpawn.subscribe((ev) => {
  const p = ev.player;
  ensureDefaults(p);
  giveMenuItem(p);
  if (ev.initialSpawn) {
    try {
      p.sendMessage([
        "§6§lWelcome to D-Coconut SMP§r",
        "§7Tap the §6D-Coconut Menu§7 compass in your hotbar to open the main menu.§r",
        "§7Or type §e!help§7 in chat for every command.§r",
      ].join("\n"));
    } catch (_) {}
  }
});

system.run(() => {
  startCommands();
  startMenuItem();
  startBounty();
  startJobs();
  startHud();
});
