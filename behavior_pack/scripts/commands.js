import { system, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { JOBS, getJob, setJob, getMoney, getCoconuts, getBounty } from "./data.js";
import { openShop } from "./shop.js";
import { openCoconutShop } from "./coconutshop.js";
import { openExchange } from "./exchange.js";

function playerFromOrigin(origin) {
  const e = origin?.sourceEntity;
  if (e && e.typeId === "minecraft:player") return e;
  return null;
}

function requirePlayer(origin) {
  const p = playerFromOrigin(origin);
  if (!p) return { ok: false, res: { status: CustomCommandStatus.Failure, message: "Only players can run this." } };
  return { ok: true, player: p };
}

function defer(fn) { system.run(fn); }

export function registerCommands() {
  system.beforeEvents.startup.subscribe((init) => {
    const reg = init.customCommandRegistry;

    reg.registerCommand(
      { name: "dc:jobs", description: "Pick or change your job", permissionLevel: CommandPermissionLevel.Any },
      (origin) => {
        const r = requirePlayer(origin); if (!r.ok) return r.res;
        defer(() => openJobs(r.player));
        return { status: CustomCommandStatus.Success };
      }
    );

    reg.registerCommand(
      { name: "dc:shop", description: "Open the money shop", permissionLevel: CommandPermissionLevel.Any },
      (origin) => {
        const r = requirePlayer(origin); if (!r.ok) return r.res;
        defer(() => openShop(r.player));
        return { status: CustomCommandStatus.Success };
      }
    );

    reg.registerCommand(
      { name: "dc:coconutshop", description: "Open the coconut lootbox shop", permissionLevel: CommandPermissionLevel.Any },
      (origin) => {
        const r = requirePlayer(origin); if (!r.ok) return r.res;
        defer(() => openCoconutShop(r.player));
        return { status: CustomCommandStatus.Success };
      }
    );

    reg.registerCommand(
      { name: "dc:coconutexchange", description: "Exchange coconuts for money", permissionLevel: CommandPermissionLevel.Any },
      (origin) => {
        const r = requirePlayer(origin); if (!r.ok) return r.res;
        defer(() => openExchange(r.player));
        return { status: CustomCommandStatus.Success };
      }
    );

    reg.registerCommand(
      { name: "dc:balance", description: "Show your money, coconuts, and bounty", permissionLevel: CommandPermissionLevel.Any },
      (origin) => {
        const r = requirePlayer(origin); if (!r.ok) return r.res;
        const p = r.player;
        defer(() => p.sendMessage(`§eMoney: §a$${getMoney(p)}§r §7|§r §6🥥 ${getCoconuts(p)}§r §7|§r §c⚔ bounty ${getBounty(p)}§r`));
        return { status: CustomCommandStatus.Success };
      }
    );

    reg.registerCommand(
      { name: "dc:help", description: "List D-Coconut commands", permissionLevel: CommandPermissionLevel.Any },
      (origin) => {
        const r = requirePlayer(origin); if (!r.ok) return r.res;
        const p = r.player;
        defer(() => p.sendMessage([
          "§6§lD-Coconut Commands§r",
          "§e/dc:jobs§r — pick your job",
          "§e/dc:shop§r — buy items w/ money",
          "§e/dc:coconutshop§r — buy lootboxes w/ coconuts",
          "§e/dc:coconutexchange§r — convert coconuts → money",
          "§e/dc:balance§r — show balance",
        ].join("\n")));
        return { status: CustomCommandStatus.Success };
      }
    );
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
