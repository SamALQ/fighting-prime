#!/bin/bash
set -euo pipefail

BUCKET="s3://fighting-prime-media"
TMP="/tmp/fpa-image-migration"
mkdir -p "$TMP"

upload_image() {
  local url="$1"
  local s3key="$2"
  local ext="${s3key##*.}"
  local ct="image/jpeg"
  case "$ext" in
    png) ct="image/png" ;;
    webp) ct="image/webp" ;;
    gif) ct="image/gif" ;;
  esac

  local tmpfile="$TMP/$(echo "$s3key" | tr '/' '_')"
  echo "  DL+UP: $s3key"
  curl -sL "$url" -o "$tmpfile" 2>/dev/null
  if [ -s "$tmpfile" ]; then
    aws s3 cp "$tmpfile" "$BUCKET/$s3key" --content-type "$ct" --quiet
  else
    echo "    WARN: Failed to download $url"
  fi
  rm -f "$tmpfile"
}

echo "=== Migrating Images to S3 ==="
echo ""

# ── Course Images ────────────────────────────────────────────
echo "── Course Images ──"

# MTF
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/689dbcdb56b82a21fdc704c6_MTF%20test%20lowq.jpg" \
  "courses/muay-thai-foundations/poster.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/687cb9acb86a8328e2e1fde2_MTF%20Wide%20Poster%20NEW.jpg" \
  "courses/muay-thai-foundations/cover.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/687cbc17faeb98df7005351e_MTF%20Portrait%20Teaser.jpg" \
  "courses/muay-thai-foundations/portrait.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/681d4de50935f594b1b13521_Difficulty%20(Biginner%3AIntermediate).png" \
  "courses/muay-thai-foundations/difficulty-meter.png"

# LKS
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d2812cb8d4226d9752c03d_Still%202025-09-23%20051413_3.13.1.jpg" \
  "courses/low-kick-sharpshooter/cover.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/6836d407490e27760a055dfe_Difficulty%20Meter%20(Intermediate).png" \
  "shared/difficulty-meter-intermediate.png"

# Refine The Teep
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/697ffac6a1c89e5e19ff0ad4_Teepstill_2.1.jpg" \
  "courses/refine-the-teep/cover.jpg"

# Accountability
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/69720f52ff45cf72a834099b_ACCThumb-2.jpg" \
  "courses/accountability-in-fighting/poster.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/69720f58749f727647844b20_ACCThumb.jpg" \
  "courses/accountability-in-fighting/cover.jpg"

# Elite Ringcraft
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b18a227128cc7bc8eb9ebe_Jake-Peacock-L-ONE-Championship-2.jpg" \
  "courses/elite-ringcraft/poster.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/680fe599d93f53fb55f96703_Jake-Peacock-L-ONE-Championship-2.jpg" \
  "courses/elite-ringcraft/cover.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/681d4dfc5213dec3d357fa77_Difficulty%20Meter%20(Advanced).png" \
  "shared/difficulty-meter-advanced.png"

# Winning Mindset
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b188ff49d940874bb117b0_IMG_6751.jpg" \
  "courses/winning-mindset/cover.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68369039cd25e9cf6e0ea589_Difficulty%20Meter%20(Pro).png" \
  "shared/difficulty-meter-pro.png"

# ── Episode Thumbnails ───────────────────────────────────────
echo ""
echo "── MTF Episode Thumbnails ──"

upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/680fe5b12ecebd681e8c9daf_Still%202025-04-28%20051718_1.2.1.jpeg" \
  "courses/muay-thai-foundations/episodes/into-the-box/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/688e8b4cdb6ff6c6f3670662_The%20system%20thumb.jpg" \
  "courses/muay-thai-foundations/episodes/the-system/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0b3b86f599afb3b92d07f_Goals%20Thumb.jpg" \
  "courses/muay-thai-foundations/episodes/goals/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/6821bb36c31af3dd6d06f9f9_Preperation%20thumbnail.jpg" \
  "courses/muay-thai-foundations/episodes/training-plan/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/6821be4947feba40cae3adcb_Handwraps%20thumb.jpg" \
  "courses/muay-thai-foundations/episodes/professional-hand-wraps/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0b2214c425573577b7dac_Stance%20Thumb.jpg" \
  "courses/muay-thai-foundations/episodes/stance/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0b0e0177dc57b2ddd35be_Shadowboxing%20thumb.jpg" \
  "courses/muay-thai-foundations/episodes/shadowboxing/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/6821c4a0b801efec17c39a5d_punches%20thumb.jpg" \
  "courses/muay-thai-foundations/episodes/the-6-punches/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0aac77c86ba66b1877287_Gaurd%20Thumb.jpg" \
  "courses/muay-thai-foundations/episodes/dynamic-guard/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0ba328a9d8103942a6c91_WDYL%20Thumb.jpg" \
  "courses/muay-thai-foundations/episodes/where-do-you-look/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a09a8efe0aceb5daec9f91_Elbows%20thumb.jpg" \
  "courses/muay-thai-foundations/episodes/elbow-mentality/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a09aabe2b27b71e68d20b3_6821c165786830d8fc0181af_Knee%20Still.jpg" \
  "courses/muay-thai-foundations/episodes/sting-like-a-knee/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a09e24b90e1804945afa31_Roundhouse%20Thumb%202.jpg" \
  "courses/muay-thai-foundations/episodes/the-roundhouse-kick/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0ab7d956b6b807c6a6fe2_Checking%20Thumb.jpg" \
  "courses/muay-thai-foundations/episodes/gaurd-for-kicks/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0ace7368e00e43eb64b05_Skeleton%20Frame.jpg" \
  "courses/muay-thai-foundations/episodes/skeleton-frame/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0a80b7c86ba66b1870ef9_Teep%20Thumb%201.jpg" \
  "courses/muay-thai-foundations/episodes/basics-of-the-teep/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/688e5b8193d0d395bedd7357_Missing%20Link%20Thumb.jpg" \
  "courses/muay-thai-foundations/episodes/your-missing-link/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68a0bae4a2a187c96bf908ef_BAG%20thumb.jpg" \
  "courses/muay-thai-foundations/episodes/bag-work-details-xafmc/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/680fe599d93f53fb55f96703_Jake-Peacock-L-ONE-Championship-2.jpg" \
  "courses/muay-thai-foundations/episodes/conclusion-out-of-the-box/thumbnail.jpg"

echo ""
echo "── LKS Episode Thumbnails ──"

upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d8157689e1be722ac9c168_Still%202025-09-27%20104724_1.1.1-2.jpg" \
  "courses/low-kick-sharpshooter/episodes/introduction/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d81608259b4ed4651fa249_Still%202025-09-27%20103245_4.1.1-2.jpg" \
  "courses/low-kick-sharpshooter/episodes/points-of-contact/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d8324c544f90351dbc4e5a_Still%202025-09-27%20125111_3.1.1.jpeg" \
  "courses/low-kick-sharpshooter/episodes/maximizing-force/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68db7d2efc971c528c03bd10_Still%202025-09-30%20004650_1.16.1.jpeg" \
  "courses/low-kick-sharpshooter/episodes/angles-of-attack/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d823ab18a315a3bc15ba8b_Still%202025-09-27%20114845_1.3.1.jpeg" \
  "courses/low-kick-sharpshooter/episodes/defence/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d8a81958f7d78bc3d17d25_Still%202025-09-27%20211308_2.2.1.jpeg" \
  "courses/low-kick-sharpshooter/episodes/weight-manipulation/thumbnail.jpg"
upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/697f0336a096f552077018e5_LKS%20jedi%20mind%20tricks%20thumb_1.23.jpg" \
  "courses/low-kick-sharpshooter/episodes/jedi-mind-tricks/thumbnail.jpg"

echo ""
echo "── Accountability Episode Thumbnail ──"

upload_image "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/69720a9a6b705eb245731f3b_Thumb.jpg" \
  "courses/accountability-in-fighting/episodes/a-wins-a-win-accountability-excuses/thumbnail.jpg"

echo ""
echo "=== Image migration complete ==="
rm -rf "$TMP"
