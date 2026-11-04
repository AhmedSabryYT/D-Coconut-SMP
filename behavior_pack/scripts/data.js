import { world } from "@minecraft/server";

const K = {
  money: "dc:money",
  coconuts: "dc:coconuts",
  bounty: "dc:bounty",
  job: "dc:job",
  workTick: "dc:workTick",
  lastAttacker: "dc:lastAttacker",
};

export const JOBS = ["none", "miner", "lumberjack", "farmer", "fisher", "hunter"];

export function getMoney(p) { return p.getDynamicProperty(K.money) ?? 0; }
export function setMoney(p, v) { p.setDynamicProperty(K.money, Math.max(0, Math.floor(v))); }
export function addMoney(p, v) { setMoney(p, getMoney(p) + v); }

export function getCoconuts(p) { return p.getDynamicProperty(K.coconuts) ?? 0; }
export function setCoconuts(p, v) { p.setDynamicProperty(K.coconuts, Math.max(0, Math.floor(v))); }
export function addCoconuts(p, v) { setCoconuts(p, getCoconuts(p) + v); }

export function getBounty(p) { return p.getDynamicProperty(K.bounty) ?? 0; }
export function setBounty(p, v) { p.setDynamicProperty(K.bounty, Math.max(0, Math.floor(v))); }
export function addBounty(p, v) { setBounty(p, getBounty(p) + v); }

export function getJob(p) { return p.getDynamicProperty(K.job) ?? "none"; }
export function setJob(p, v) { p.setDynamicProperty(K.job, v); }

export function getWork(p) { return p.getDynamicProperty(K.workTick) ?? 0; }
export function addWork(p, v) { p.setDynamicProperty(K.workTick, getWork(p) + v); }
export function resetWork(p) { p.setDynamicProperty(K.workTick, 0); }

export function getLastAttacker(p) { return p.getDynamicProperty(K.lastAttacker) ?? ""; }
export function setLastAttacker(p, id) { p.setDynamicProperty(K.lastAttacker, id); }

export function ensureDefaults(p) {
  if (p.getDynamicProperty(K.money) === undefined) setMoney(p, 100);
  if (p.getDynamicProperty(K.coconuts) === undefined) setCoconuts(p, 0);
  if (p.getDynamicProperty(K.bounty) === undefined) setBounty(p, 0);
  if (p.getDynamicProperty(K.job) === undefined) setJob(p, "none");
  if (p.getDynamicProperty(K.workTick) === undefined) resetWork(p);
}
