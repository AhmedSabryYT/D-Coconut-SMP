import { world, system } from "@minecraft/server";
import { getMoney, getCoconuts, getBounty } from "./data.js";
import { openShop } from "./shop.js";
import { openCoconutShop } from "./coconutshop.js";
import { openExchange } from "./exchange.js";
import { openMainMenu, openJobsMenu } from "./menu.js";

const PREFIX = "!";

const HANDLERS = {
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
    const [raw, ...args] = msg.slice(PREFIX.length).split(/\s+/);
    const cmd = raw.toLowerCase();
    const fn = HANDLERS[cmd];
    if (!fn) return;
    ev.cancel = true;
    const sender = ev.sender;
    system.run(() => fn(sender, args));
  });
}

function showBalance(p) {
  p.sendMessage(`§eMoney: §a$${getMoney(p)}§r §7|§r §6🥥 ${getCoconuts(p)}§r §7|§r §c⚔ bounty ${getBounty(p)}§r`);
}

function showHelp(p) {
  p.sendMessage([
    "§6§lD-Coconut Commands§r",
    "§7Tip: tap your §6D-Coconut Menu§7 compass for the full UI.§r",
    "§e!menu§r — open the main menu",
    "§e!jobs§r — pick your job",
    "§e!shop§r — money shop",
    "§e!coconutshop§r — coconut lootboxes",
    "§e!coconutexchange§r — convert coconuts → money",
    "§e!balance§r — show your money / coconuts / bounty",
    "§e!help§r — this menu",
  ].join("\n"));
}
