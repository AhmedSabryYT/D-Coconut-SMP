import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { getCoconuts, setCoconuts, addMoney, getMoney } from "./data.js";

export const COCONUT_TO_MONEY = 3;

export async function openExchange(p) {
  const bal = getCoconuts(p);
  if (bal <= 0) { p.sendMessage("§cYou have no coconuts to exchange."); return; }
  const modal = new ModalFormData()
    .title("§6Coconut Exchange§r")
    .slider(`Coconuts to exchange (rate: 1🥥 = $${COCONUT_TO_MONEY})`, 1, bal, 1, Math.min(bal, Math.max(1, Math.floor(bal / 2))));
  const res = await modal.show(p);
  if (res.canceled) return;
  const coco = Math.floor(res.formValues[0]);
  const money = coco * COCONUT_TO_MONEY;
  const confirm = new ActionFormData()
    .title("Confirm Exchange")
    .body(`Exchange §6${coco}🥥§r for §a$${money}§r?\n\n§7Balance after: §6${bal - coco}🥥§r §a$${getMoney(p) + money}§r`)
    .button("§aConfirm§r")
    .button("§cCancel§r");
  const r2 = await confirm.show(p);
  if (r2.canceled || r2.selection !== 0) return;
  setCoconuts(p, bal - coco);
  addMoney(p, money);
  p.sendMessage(`§aExchanged §6${coco}🥥§r → §a$${money}§r`);
}
