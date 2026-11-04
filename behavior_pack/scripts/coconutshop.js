import { ActionFormData } from "@minecraft/server-ui";
import { getCoconuts, setCoconuts } from "./data.js";

const BOXES = [
  { key: "common",    name: "§fCommon Lootbox",    price: 10,  rolls: 2, bias: 0.0 },
  { key: "uncommon",  name: "§aUncommon Lootbox",  price: 25,  rolls: 3, bias: 0.15 },
  { key: "rare",      name: "§bRare Lootbox",      price: 60,  rolls: 3, bias: 0.35 },
  { key: "legendary", name: "§6Legendary Lootbox", price: 150, rolls: 4, bias: 0.6 },
  { key: "mythical",  name: "§dMythical Lootbox",  price: 400, rolls: 5, bias: 0.85 },
];

const POOL = [
  { id: "minecraft:dirt",              min: 8, max: 32, w: 100, tier: 0 },
  { id: "minecraft:cobblestone",       min: 8, max: 32, w: 100, tier: 0 },
  { id: "minecraft:oak_log",           min: 4, max: 16, w: 80,  tier: 0 },
  { id: "minecraft:iron_ingot",        min: 2, max: 8,  w: 55,  tier: 1 },
  { id: "minecraft:gold_ingot",        min: 2, max: 6,  w: 45,  tier: 1 },
  { id: "minecraft:experience_bottle", min: 4, max: 12, w: 50,  tier: 1 },
  { id: "minecraft:diamond",           min: 1, max: 4,  w: 25,  tier: 2 },
  { id: "minecraft:emerald",           min: 1, max: 4,  w: 25,  tier: 2 },
  { id: "minecraft:ender_pearl",       min: 1, max: 4,  w: 20,  tier: 2 },
  { id: "minecraft:shulker_shell",     min: 1, max: 2,  w: 10,  tier: 3 },
  { id: "minecraft:totem_of_undying",  min: 1, max: 1,  w: 8,   tier: 3 },
  { id: "minecraft:netherite_scrap",   min: 1, max: 2,  w: 6,   tier: 3 },
  { id: "minecraft:netherite_ingot",   min: 1, max: 1,  w: 3,   tier: 4 },
  { id: "minecraft:elytra",            min: 1, max: 1,  w: 1,   tier: 4 },
  { id: "minecraft:nether_star",       min: 1, max: 1,  w: 2,   tier: 4 },
];

function weightedPick(bias) {
  const items = POOL.map(it => {
    const boost = 1 + bias * it.tier * 1.5;
    return { it, w: it.w * boost };
  });
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of items) { r -= x.w; if (r <= 0) return x.it; }
  return items[0].it;
}

export async function openCoconutShop(p) {
  const form = new ActionFormData()
    .title("§6Coconut Shop§r")
    .body(`§6🥥 ${getCoconuts(p)}§r coconuts`);
  for (const b of BOXES) form.button(`${b.name}\n§e${b.price} 🥥§r`);
  form.button("§cClose§r");
  const res = await form.show(p);
  if (res.canceled || res.selection === undefined || res.selection === BOXES.length) return;
  const box = BOXES[res.selection];
  if (getCoconuts(p) < box.price) { p.sendMessage("§cNot enough coconuts."); return; }
  setCoconuts(p, getCoconuts(p) - box.price);
  rollBox(p, box);
}

function rollBox(p, box) {
  p.sendMessage(`§6Opening ${box.name}§r§6...§r`);
  const summary = [];
  for (let i = 0; i < box.rolls; i++) {
    const it = weightedPick(box.bias);
    const qty = Math.floor(Math.random() * (it.max - it.min + 1)) + it.min;
    try { p.runCommand(`give @s ${it.id} ${qty}`); } catch (_) {}
    summary.push(`§f${qty}x ${it.id.replace("minecraft:","")}§r`);
  }
  p.sendMessage("§a▶ " + summary.join(" §7|§r "));
}
