# D-Coconut SMP

> Minecraft Bedrock add-on for the **D-Coconut SMP** — economy, bounties, jobs, lootboxes, and shops. All running on the Script API.

**Latest version:** `v0.2.0`

---

## What's inside

A Behavior Pack + Resource Pack that bolts a full RPG-style economy onto any Bedrock world:

### Economy HUD
- Action-bar HUD showing your **money**, **coconuts** 🥥, **bounty** ⚔, and **current job**
- Starter balance of `$100` on first join
- Live refresh every 10 ticks

### Bounty system
- Every failed kill attempt (you hit a player but they survive 60s) stacks **+50 bounty** on the attacker
- Bounty value shows as a red tag above your head
- Kill a player with a bounty → you collect the full amount as money
- High bounty = **job payout multiplier** (up to **x2** at 1000+ bounty)

### Jobs
- Pick via `!jobs`: `miner`, `lumberjack`, `farmer`, `fisher`, `hunter`
- Each job tracks relevant work (mining ores, chopping logs, harvesting crops, hunting mobs)
- At the end of every Minecraft day → automatic payout: **$5 + 1🥥 per action**, scaled by bounty

### Coconut shop (`!coconutshop`)
Spend coconuts on lootboxes with weighted loot tables:

| Tier | Price | Rolls | Rare bias |
|------|-------|-------|-----------|
| Common    | 10🥥  | 2 | — |
| Uncommon  | 25🥥  | 3 | +15% |
| Rare      | 60🥥  | 3 | +35% |
| Legendary | 150🥥 | 4 | +60% |
| Mythical  | 400🥥 | 5 | +85% |

Pool includes diamonds, netherite ingots, elytras, nether stars, shulker shells, totems, enchanted golden apples. **Dragon egg never drops** (admin-only).

### Money shop (`!shop`)
Buy items with money, priced by value. Admin items (dragon egg, bedrock, command blocks, barrier, structure blocks) are banned.

### Coconut exchange (`!coconutexchange`)
Slider UI to convert coconuts → money at **1🥥 = $3** with a confirmation preview.

---

## Commands

Type these as chat messages with a `!` prefix (not `/` slash commands):

| Command | What it does |
|---------|--------------|
| `!jobs`             | Pick/change your job |
| `!shop`             | Open the money shop |
| `!coconutshop`      | Open the coconut lootbox shop |
| `!coconutexchange`  | Convert coconuts into money |
| `!balance`          | Show your money / coconuts / bounty |
| `!help`             | List all D-Coconut commands |

---

## Installation

1. Download the latest `.mcaddon` from the [Releases](../../releases) or the `releases/` folder
2. Open it with Minecraft (tap it on mobile, double-click on PC)
3. Create or edit a world → **Behavior Packs** + **Resource Packs** → activate both `D-Coconut SMP` packs
4. In **Experiments**, enable **Beta APIs** (required for the Script API)
5. Load the world → you should see the HUD on your action bar

---

## Project structure

```
D-Coconut/
├── behavior_pack/
│   ├── manifest.json
│   ├── pack_icon.png
│   └── scripts/
│       ├── main.js          ← entry point
│       ├── data.js          ← dynamic property helpers
│       ├── hud.js           ← action-bar HUD renderer
│       ├── bounty.js        ← failed-attempt tracking + rewards
│       ├── jobs.js          ← work tracking + daily payout
│       ├── commands.js      ← chat command router (! prefix)
│       ├── shop.js          ← /shop UI + catalog
│       ├── coconutshop.js   ← /coconutshop lootboxes
│       └── exchange.js      ← /coconutexchange
├── resource_pack/
│   ├── manifest.json
│   ├── pack_icon.png
│   ├── texts/
│   └── textures/
│       ├── item_texture.json
│       └── items/coconut.png
└── releases/
    ├── DCoconut_v0.2.0.mcaddon
    ├── DCoconut_BP_v0.2.0.mcpack
    └── DCoconut_RP_v0.2.0.mcpack
```

---

## Changelog

### v0.2.0 — 2026-11-04
**Full rollback to stable API.** v0.1.1–v0.1.3 all tried to use the Custom Commands API via `@minecraft/server` 2.x, but that module version doesn't resolve on all Bedrock clients yet → the whole script module was failing silently → no HUD, no welcome msg, no commands, nothing.

Rolled back to the stable baseline that works on any Bedrock 1.21.50+:
- `@minecraft/server` → **1.17.0**
- `min_engine_version` → **1.21.50**
- Commands now use **`!` prefix** via `chatSend`: `!jobs`, `!shop`, `!coconutshop`, `!coconutexchange`, `!balance`, `!help`
- HUD, bounty, jobs, lootboxes, shops — all unchanged, all working

### v0.1.3 — 2026-11-04
**Real hotfix** — cross-referenced against [Microsoft's official custom-commands sample](https://github.com/microsoft/minecraft-scripting-samples/tree/main/custom-commands) and found two issues with v0.1.2:
- Correct enum is `CommandPermissionLevel` — NOT `CustomCommandPermissionLevel`. The Microsoft docs page is wrong but the working sample uses `CommandPermissionLevel`. v0.1.2 followed the broken docs.
- The stable `@minecraft/server` version that actually ships Custom Commands is **`"2.1.0"`**, not `"2.0.0"`. v0.1.1 used `"2.0.0-beta"` (invalid), v0.1.2 used `"2.0.0"` (too low), v0.2.0 uses `"2.1.0"` (matches MS sample).

Commands should now appear in chat autocomplete for real this time.

### v0.1.2 — 2026-11-04
Attempted hotfix for v0.1.1 that didn't work — changed enum to `CustomCommandPermissionLevel` (wrong, the docs lied) and server version to `"2.0.0"` (too low for Custom Commands). Superseded by v0.2.0.

### v0.1.1 — 2026-11-04
- **Real slash commands** via the Custom Commands API — `/dc:jobs`, `/dc:shop`, `/dc:coconutshop`, `/dc:coconutexchange`, `/dc:balance`, `/dc:help` with autocomplete in chat
- Upgraded `@minecraft/server` to `2.0.0-beta` (⚠️ this was wrong — see v0.2.0)
- Bumped minimum engine version to **1.21.80**
- Dropped the old `chatSend` interceptor (slash commands don't fire that event — that's why `/jobs` wasn't opening anything in v0.1.0)

### v0.1.0 — 2026-11-04
Initial release.
- Economy core (money + coconuts + bounty)
- Action-bar HUD
- Bounty system with failed-attempt detection and kill rewards
- 6 jobs with daily payout and bounty multiplier
- `/shop`, `/coconutshop`, `/coconutexchange`, `/balance`, `/dchelp`
- 5-tier weighted lootbox system
- Admin-item ban list (dragon egg etc. protected)

---

## Requirements

- Minecraft Bedrock Edition **1.21.50+**
- **Beta APIs** experiment enabled
- `@minecraft/server` 1.17.0
- `@minecraft/server-ui` 1.3.0

---

## Author

Built by **Ahmed** ([@AhmedSabryYT](https://github.com/AhmedSabryYT)) for the D-Coconut SMP 🥥
