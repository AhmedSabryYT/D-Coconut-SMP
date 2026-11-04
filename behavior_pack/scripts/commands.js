import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { JOBS, getJob, setJob, getMoney, getCoconuts, getBounty } from "./data.js";
import { openShop } from "./shop.js";
import { openCoconutShop } from "./coconutshop.js";
import { openExchange } from "./exchange.js";

const PREFIX = "/";

const HANDLERS = {
  "jobs":            openJobs,
  "shop":            (p) => openShop(p),
  "coconutshop":     (p) => openCoconutShop(p),
  "coconutexchange": (p) => openExchange(p),
  "balance":         showBalance,
  "bal":             showBalance,
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

async function openJobs(p) {
  const cur = getJob(p);
  const form = new ActionFormData()
    .title("§6Choose Your Job§r")
    .body(`Current: §b${cur}§r\n\n§7Pick a job to start earning money + coconuts on daily payouts.§r`);
  for (const j of JOBS) form.button(j === cur ? `§a✓ ${j}§r` : j);
  form.button("§cClose§r");
  const res = await form.show(p);
  if (res.canceled || res.selection === undefined || res.selection === JOBS.length) return;
  const picked = JOBS[res.selection];
  setJob(p, picked);
  p.sendMessage(`§aJob set to §b${picked}§r`);
}

function showBalance(p) {
  p.sendMessage(`§eMoney: §a$${getMoney(p)}§r §7|§r §6🥥 ${getCoconuts(p)}§r §7|§r §c⚔ bounty ${getBounty(p)}§r`);
}

function showHelp(p) {
  p.sendMessage([
    "§6§lD-Coconut Commands§r",
    "§e/jobs§r — pick your job",
    "§e/shop§r — buy items w/ money",
    "§e/coconutshop§r — buy lootboxes w/ coconuts",
    "§e/coconutexchange§r — convert coconuts → money",
    "§e/balance§r — show money + coconuts + bounty",
  ].join("\n"));
}
