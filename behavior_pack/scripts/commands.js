import { world, system } from "@minecraft/server";
import { getMoney, getCoconuts, getBounty } from "./data.js";
import { openShop } from "./shop.js";
import { openCoconutShop } from "./coconutshop.js";
import { openExchange } from "./exchange.js";
import { openMainMenu, openJobsMenu } from "./menu.js";

function showBalance(p) {
  p.sendMessage(`§eMoney: §a$${getMoney(p)}§r §7|§r §6🥥 ${getCoconuts(p)}§r §7|§r §c⚔ bounty ${getBounty(p)}§r`);
}

function showHelp(p) {
  p.sendMessage([
    "§6§lD-Coconut Commands§r",
    "§7Tip: tap your §6D-Coconut Menu§7 compass for the full UI.§r",
    "§e/dc:menu§r §7(or §e!menu§r)§r — open the main menu",
    "§e/dc:jobs§r — pick your job",
    "§e/dc:shop§r — money shop",
    "§e/dc:coconutshop§r — coconut lootboxes",
    "§e/dc:coconutexchange§r — coconuts → money",
    "§e/dc:balance§r — show balance",
  ].join("\n"));
}

const SLASH_SPEC = [
  ["dc:menu",            "Open the D-Coconut main menu",   openMainMenu],
  ["dc:jobs",            "Pick or change your job",        openJobsMenu],
  ["dc:shop",            "Open the money shop",            openShop],
  ["dc:coconutshop",     "Open the coconut lootbox shop",  openCoconutShop],
  ["dc:coconutexchange", "Exchange coconuts for money",    openExchange],
  ["dc:balance",         "Show your money / coconuts / bounty", showBalance],
  ["dc:help",            "List D-Coconut commands",        showHelp],
];

// Register namespaced slash commands via Custom Commands API (requires @minecraft/server 2.1.0+).
// Pattern cribbed from a known-working mod: numeric permissionLevel, callback returns nothing,
// no CommandPermissionLevel / CustomCommandStatus imports.
try {
  system.beforeEvents.startup.subscribe((ev) => {
    const reg = ev.customCommandRegistry;
    if (!reg) return;
    for (const [name, desc, fn] of SLASH_SPEC) {
      try {
        reg.registerCommand(
          { name, description: desc, permissionLevel: 0 },
          (origin) => {
            const p = origin?.sourceEntity;
            if (p?.typeId !== "minecraft:player") return;
            system.run(() => fn(p));
          }
        );
      } catch (_) {}
    }
  });
} catch (_) {}

// Chat router (! prefix) — kept as a backup channel alongside slash commands.
const PREFIX = "!";
const CHAT_HANDLERS = {
  "menu":            openMainMenu,
  "jobs":            openJobsMenu,
  "shop":            openShop,
  "coconutshop":     openCoconutShop,
  "coconutexchange": openExchange,
  "balance":         showBalance,
  "bal":             showBalance,
  "help":            showHelp,
  "dchelp":          showHelp,
};

export function startCommands() {
  world.beforeEvents.chatSend.subscribe((ev) => {
    const msg = ev.message.trim();
    if (!msg.startsWith(PREFIX)) return;
    const raw = msg.slice(PREFIX.length).split(/\s+/)[0];
    const fn = CHAT_HANDLERS[raw.toLowerCase()];
    if (!fn) return;
    ev.cancel = true;
    const sender = ev.sender;
    system.run(() => fn(sender));
  });
}
