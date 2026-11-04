#!/bin/bash
# Sync /sdcard/D-Coconut sources → LeviLauncher's ALL 4 pack folders:
#   1. internal + development_*_packs  (hot-reload dev)
#   2. internal + *_packs              (standard)
#   3. Android/data + development_*_packs
#   4. Android/data + *_packs
# Requires root. Usage: bash /sdcard/D-Coconut/sync-to-levi.sh

BP_SRC=/sdcard/D-Coconut/behavior_pack
RP_SRC=/sdcard/D-Coconut/resource_pack

INT=/data/data/org.levimc.launcher/games/com.mojang
EXT=/sdcard/Android/data/org.levimc.launcher/files/games/com.mojang

su -c "
# ---- Internal (app-private) -----
for base in '$INT/development_behavior_packs' '$INT/behavior_packs'; do
  dst=\"\$base/DCoconut_BP\"
  rm -rf \"\$dst\"
  cp -r '$BP_SRC' \"\$dst\"
  chown -R u0_a450:u0_a450 \"\$dst\"
  find \"\$dst\" -type d -exec chmod 700 {} +
  find \"\$dst\" -type f -exec chmod 600 {} +
done
for base in '$INT/development_resource_packs' '$INT/resource_packs'; do
  dst=\"\$base/DCoconut_RP\"
  rm -rf \"\$dst\"
  cp -r '$RP_SRC' \"\$dst\"
  chown -R u0_a450:u0_a450 \"\$dst\"
  find \"\$dst\" -type d -exec chmod 700 {} +
  find \"\$dst\" -type f -exec chmod 600 {} +
done

# ---- Android/data (public) -----
for base in '$EXT/development_behavior_packs' '$EXT/behavior_packs'; do
  dst=\"\$base/DCoconut_BP\"
  rm -rf \"\$dst\"
  cp -r '$BP_SRC' \"\$dst\"
  chown -R u0_a450:ext_data_rw \"\$dst\"
  find \"\$dst\" -type d -exec chmod 2750 {} +
  find \"\$dst\" -type f -exec chmod 640 {} +
done
for base in '$EXT/development_resource_packs' '$EXT/resource_packs'; do
  dst=\"\$base/DCoconut_RP\"
  rm -rf \"\$dst\"
  cp -r '$RP_SRC' \"\$dst\"
  chown -R u0_a450:ext_data_rw \"\$dst\"
  find \"\$dst\" -type d -exec chmod 2750 {} +
  find \"\$dst\" -type f -exec chmod 640 {} +
done

echo 'Synced D-Coconut → 4 LeviLauncher pack folders ✓'
"
