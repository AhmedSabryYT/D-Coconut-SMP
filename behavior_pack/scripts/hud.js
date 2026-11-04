import { world, system } from "@minecraft/server";
import { getMoney, getCoconuts, getBounty, getJob } from "./data.js";

const PAD = "                                        ";

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

function buildLine(p) {
  const money = fmt(getMoney(p));
  const coco = fmt(getCoconuts(p));
  const bounty = getBounty(p);
  const job = getJob(p);
  const jobTag = job !== "none" ? `§7[§b${job}§7]§r ` : "";
  const bountyTag = bounty > 0 ? ` §c⚔ ${fmt(bounty)}§r` : "";
  return `${PAD}${jobTag}§e$${money}§r §6🥥 ${coco}§r${bountyTag}`;
}

export function startHud() {
  system.runInterval(() => {
    for (const p of world.getPlayers()) {
      try { p.onScreenDisplay.setActionBar(buildLine(p)); } catch (_) {}
    }
  }, 10);
}
