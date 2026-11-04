import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getMoney, setMoney, addMoney } from "./data.js";

const BANNED = new Set([
  "minecraft:dragon_egg",
  "minecraft:command_block","minecraft:chain_command_block","minecraft:repeating_command_block",
  "minecraft:structure_block","minecraft:barrier","minecraft:jigsaw",
  "minecraft:bedrock","minecraft:end_portal_frame",
]);

const CATALOG = [
  { id: "minecraft:dirt", name: "Dirt", price: 1 },
  { id: "minecraft:cobblestone", name: "Cobblestone", price: 2 },
  { id: "minecraft:oak_log", name: "Oak Log", price: 4 },
  { id: "minecraft:iron_ingot", name: "Iron Ingot", price: 25 },
  { id: "minecraft:gold_ingot", name: "Gold Ingot", price: 40 },
  { id: "minecraft:diamond", name: "Diamond", price: 150 },
  { id: "minecraft:emerald", name: "Emerald", price: 120 },
  { id: "minecraft:netherite_ingot", name: "Netherite Ingot", price: 1500 },
  { id: "minecraft:elytra", name: "Elytra", price: 5000 },
  { id: "minecraft:totem_of_undying", name: "Totem of Undying", price: 800 },
  { id: "minecraft:enchanted_golden_apple", name: "Enchanted Golden Apple", price: 600 },
  { id: "minecraft:shulker_shell", name: "Shulker Shell", price: 350 },
  { id: "minecraft:nether_star", name: "Nether Star", price: 3000 },
  { id: "minecraft:experience_bottle", name: "XP Bottle", price: 20 },
];

export async function openShop(p) {
  const form = new ActionFormData()
    .title("§6D-Coconut Shop§r")
    .body(`§eBalance: $${getMoney(p)}§r`);
  for (const it of CATALOG) form.button(`${it.name}\n§2$${it.price}§r`);
  form.button("§cClose§r");
  const res = await form.show(p);
  if (res.canceled || res.selection === undefined) return;
  if (res.selection === CATALOG.length) return;
  const item = CATALOG[res.selection];
  if (BANNED.has(item.id)) { p.sendMessage("§cThat item is admin-only."); return; }
  await promptQty(p, item);
}

async function promptQty(p, item) {
  const max = Math.min(64, Math.floor(getMoney(p) / item.price));
  const modal = new ModalFormData()
    .title(`Buy ${item.name}`)
    .slider(`Quantity (max ${max})`, 0, Math.max(1, max), 1, Math.min(1, max));
  const res = await modal.show(p);
  if (res.canceled) return;
  const qty = Math.floor(res.formValues[0]);
  if (qty <= 0) return;
  const cost = qty * item.price;
  if (getMoney(p) < cost) { p.sendMessage("§cNot enough money."); return; }
  setMoney(p, getMoney(p) - cost);
  try {
    p.runCommand(`give @s ${item.id} ${qty}`);
    p.sendMessage(`§aBought §e${qty}x ${item.name}§a for §2$${cost}§r`);
  } catch (e) {
    addMoney(p, cost);
    p.sendMessage(`§cCouldn't give item, refunded.`);
  }
}
