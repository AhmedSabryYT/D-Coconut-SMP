import { world, system, ItemStack, ItemLockMode } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { JOBS, getJob, setJob, getMoney, getCoconuts, getBounty } from "./data.js";
import { openShop } from "./shop.js";
import { openCoconutShop } from "./coconutshop.js";
import { openExchange } from "./exchange.js";

export const MENU_ITEM_ID = "minecraft:compass";
export const MENU_ITEM_NAME = "§6§lD-Coconut Menu§r";

export function giveMenuItem(p) {
  try {
    const inv = p.getComponent("minecraft:inventory")?.container;
    if (!inv) return;
    for (let i = 0; i < inv.size; i++) {
      const it = inv.getItem(i);
      if (it?.typeId === MENU_ITEM_ID && it?.nameTag === MENU_ITEM_NAME) return;
    }
    const compass = new ItemStack(MENU_ITEM_ID, 1);
    compass.nameTag = MENU_ITEM_NAME;
    try { compass.setLore(["§7Tap to open the", "§7D-Coconut menu"]); } catch (_) {}
    try { compass.lockMode = ItemLockMode.inventory; } catch (_) {}
    try { compass.keepOnDeath = true; } catch (_) {}
    inv.addItem(compass);
  } catch (_) {}
}

export async function openMainMenu(p) {
  const form = new ActionFormData()
    .title("§6§lD-Coconut SMP§r")
    .body([
      `§eBalance:§r §a$${getMoney(p)}§r §7|§r §6🥥 ${getCoconuts(p)}§r §7|§r §c⚔ ${getBounty(p)}§r`,
      `§eJob:§r §b${getJob(p)}§r`,
      "",
      "§7Pick where to go:§r",
    ].join("\n"))
    .button("§e$ Money Shop§r")
    .button("§6🥥 Coconut Shop§r")
    .button("§b💼 Jobs§r")
    .button("§a🔄 Exchange Coconuts§r")
    .button("§f📊 My Balance§r")
    .button("§7❓ Commands Help§r")
    .button("§cClose§r");
  const res = await form.show(p);
  if (res.canceled || res.selection === undefined) return;
  switch (res.selection) {
    case 0: return openShop(p);
    case 1: return openCoconutShop(p);
    case 2: return openJobsMenu(p);
    case 3: return openExchange(p);
    case 4: return p.sendMessage(`§eMoney: §a$${getMoney(p)}§r §7|§r §6🥥 ${getCoconuts(p)}§r §7|§r §c⚔ bounty ${getBounty(p)}§r`);
    case 5: return showCommandsHelp(p);
    default: return;
  }
}

export async function openJobsMenu(p) {
  const cur = getJob(p);
  const form = new ActionFormData()
    .title("§6Choose Your Job§r")
    .body(`Current: §b${cur}§r\n\n§7Pick a job to earn money + coconuts on daily payouts.§r`);
  for (const j of JOBS) form.button(j === cur ? `§a✓ ${j}§r` : j);
  form.button("§cClose§r");
  const res = await form.show(p);
  if (res.canceled || res.selection === undefined || res.selection === JOBS.length) return;
  const picked = JOBS[res.selection];
  setJob(p, picked);
  p.sendMessage(`§aJob set to §b${picked}§r`);
}

function showCommandsHelp(p) {
  p.sendMessage([
    "§6§lD-Coconut Chat Commands§r",
    "§7(or just tap your §6D-Coconut Menu§7 compass)§r",
    "§e!menu§r — open the main menu",
    "§e!jobs§r — pick your job",
    "§e!shop§r — money shop",
    "§e!coconutshop§r — coconut lootboxes",
    "§e!coconutexchange§r — convert coconuts → money",
    "§e!balance§r — show balance",
  ].join("\n"));
}

export function startMenuItem() {
  world.beforeEvents.itemUse.subscribe((ev) => {
    const item = ev.itemStack;
    if (!item || item.typeId !== MENU_ITEM_ID) return;
    if (item.nameTag !== MENU_ITEM_NAME) return;
    const player = ev.source;
    if (!player || player.typeId !== "minecraft:player") return;
    ev.cancel = true;
    system.run(() => openMainMenu(player));
  });
}
