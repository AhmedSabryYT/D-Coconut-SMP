import { world, system } from "@minecraft/server";
import {
  getJob, addWork, getWork, resetWork,
  addMoney, addCoconuts,
} from "./data.js";
import { bountyMultiplier } from "./bounty.js";

const MINER = new Set([
  "minecraft:stone","minecraft:cobblestone","minecraft:deepslate","minecraft:cobbled_deepslate",
  "minecraft:coal_ore","minecraft:deepslate_coal_ore",
  "minecraft:iron_ore","minecraft:deepslate_iron_ore",
  "minecraft:gold_ore","minecraft:deepslate_gold_ore",
  "minecraft:redstone_ore","minecraft:deepslate_redstone_ore","minecraft:lit_redstone_ore","minecraft:lit_deepslate_redstone_ore",
  "minecraft:lapis_ore","minecraft:deepslate_lapis_ore",
  "minecraft:diamond_ore","minecraft:deepslate_diamond_ore",
  "minecraft:emerald_ore","minecraft:deepslate_emerald_ore",
  "minecraft:copper_ore","minecraft:deepslate_copper_ore",
  "minecraft:nether_quartz_ore","minecraft:nether_gold_ore","minecraft:ancient_debris",
]);

const LUMBERJACK = new Set([
  "minecraft:oak_log","minecraft:spruce_log","minecraft:birch_log","minecraft:jungle_log",
  "minecraft:acacia_log","minecraft:dark_oak_log","minecraft:mangrove_log","minecraft:cherry_log",
  "minecraft:crimson_stem","minecraft:warped_stem",
  "minecraft:stripped_oak_log","minecraft:stripped_spruce_log","minecraft:stripped_birch_log",
  "minecraft:stripped_jungle_log","minecraft:stripped_acacia_log","minecraft:stripped_dark_oak_log",
  "minecraft:stripped_mangrove_log","minecraft:stripped_cherry_log",
]);

const FARMER = new Set([
  "minecraft:wheat","minecraft:carrots","minecraft:potatoes","minecraft:beetroot",
  "minecraft:pumpkin","minecraft:melon_block","minecraft:sugar_cane","minecraft:bamboo",
  "minecraft:sweet_berry_bush","minecraft:cocoa","minecraft:nether_wart",
]);

function jobMatches(job, blockId) {
  if (job === "miner") return MINER.has(blockId);
  if (job === "lumberjack") return LUMBERJACK.has(blockId);
  if (job === "farmer") return FARMER.has(blockId);
  return false;
}

export function startJobs() {
  world.afterEvents.playerBreakBlock.subscribe((ev) => {
    const p = ev.player;
    const job = getJob(p);
    if (job === "none") return;
    const id = ev.brokenBlockPermutation.type.id;
    if (!jobMatches(job, id)) return;
    addWork(p, 1);
  });

  world.afterEvents.entityDie.subscribe((ev) => {
    const killer = ev.damageSource?.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player") return;
    if (getJob(killer) !== "hunter") return;
    const victimType = ev.deadEntity?.typeId ?? "";
    if (victimType === "minecraft:player") return;
    if (!victimType.startsWith("minecraft:")) return;
    addWork(killer, 1);
  });

  let lastDay = -1;
  system.runInterval(() => {
    const day = Math.floor(world.getTimeOfDay ? 0 : 0);
    const abs = world.getAbsoluteTime ? world.getAbsoluteTime() : 0;
    const curDay = Math.floor(abs / 24000);
    if (curDay === lastDay) return;
    if (lastDay === -1) { lastDay = curDay; return; }
    lastDay = curDay;
    payout();
  }, 200);
}

function payout() {
  for (const p of world.getPlayers()) {
    const job = getJob(p);
    if (job === "none") continue;
    const work = getWork(p);
    if (work <= 0) continue;
    const mult = bountyMultiplier(p);
    const money = Math.floor(work * 5 * mult);
    const coconuts = Math.floor(work * 1 * mult);
    addMoney(p, money);
    addCoconuts(p, coconuts);
    resetWork(p);
    try {
      p.sendMessage(`§6☀ Daily payout§r (§b${job}§r x${work}): §a+$${money}§r §6+${coconuts}🥥§r${mult > 1 ? ` §c(x${mult} bounty boost)§r` : ""}`);
    } catch (_) {}
  }
}
