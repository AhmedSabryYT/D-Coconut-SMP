import { world, system, EntityDamageCause } from "@minecraft/server";
import {
  getBounty, setBounty, addBounty,
  addMoney,
  setLastAttacker, getLastAttacker,
} from "./data.js";

const BOUNTY_PER_FAIL = 50;
const ATTACKER_TTL_TICKS = 20 * 60;
const attackerTimers = new Map();

function tagBounty(p) {
  const b = getBounty(p);
  const base = `§6${p.name}§r`;
  p.nameTag = b > 0 ? `§c⚔ ${b}§r\n${base}` : base;
}

function clearAttacker(victimId) {
  attackerTimers.delete(victimId);
}

export function startBounty() {
  world.afterEvents.entityHurt.subscribe((ev) => {
    const victim = ev.hurtEntity;
    const attacker = ev.damageSource?.damagingEntity;
    if (!victim || victim.typeId !== "minecraft:player") return;
    if (!attacker || attacker.typeId !== "minecraft:player") return;
    if (victim.id === attacker.id) return;

    setLastAttacker(victim, attacker.id);
    const prev = attackerTimers.get(victim.id);
    if (prev) system.clearRun(prev);
    const handle = system.runTimeout(() => {
      const atk = world.getEntity(getLastAttacker(victim));
      if (atk && atk.typeId === "minecraft:player") {
        addBounty(atk, BOUNTY_PER_FAIL);
        try { atk.sendMessage(`§c+${BOUNTY_PER_FAIL} bounty§r (failed attempt on §e${victim.name}§r)`); } catch (_) {}
        tagBounty(atk);
      }
      clearAttacker(victim.id);
    }, ATTACKER_TTL_TICKS);
    attackerTimers.set(victim.id, handle);
  });

  world.afterEvents.entityDie.subscribe((ev) => {
    const victim = ev.deadEntity;
    if (!victim || victim.typeId !== "minecraft:player") return;

    const killer = ev.damageSource?.damagingEntity;
    const bounty = getBounty(victim);

    if (killer && killer.typeId === "minecraft:player" && killer.id !== victim.id && bounty > 0) {
      addMoney(killer, bounty);
      try { killer.sendMessage(`§a+ $${bounty}§r collected from §e${victim.name}§r's bounty`); } catch (_) {}
    }

    setBounty(victim, 0);
    tagBounty(victim);

    const atkHandle = attackerTimers.get(victim.id);
    if (atkHandle) { system.clearRun(atkHandle); clearAttacker(victim.id); }
  });

  system.runInterval(() => {
    for (const p of world.getPlayers()) tagBounty(p);
  }, 40);
}

export function bountyMultiplier(p) {
  const b = getBounty(p);
  if (b >= 1000) return 2.0;
  if (b >= 500) return 1.75;
  if (b >= 250) return 1.5;
  if (b >= 100) return 1.25;
  return 1.0;
}
