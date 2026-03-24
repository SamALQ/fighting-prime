#!/bin/bash
set -euo pipefail

OLD="s3://fp-course-content"
NEW="s3://fighting-prime-media"

echo "=== Migrating Course Content ==="
echo "From: $OLD"
echo "To:   $NEW"
echo ""

copy() {
  local src="$1"
  local dst="$2"
  echo "  COPY: $dst"
  aws s3 cp "$OLD/$src" "$NEW/$dst" --quiet
}

# ─────────────────────────────────────────────────────────────
# LOW KICK SHARPSHOOTER (all single-resolution 1080p)
# ─────────────────────────────────────────────────────────────
echo "── Low Kick Sharpshooter ──"

copy "Low Kick Sharpshooter/Trailer-Intro/LKS Trailer 1080 3000kbs h265.mp4" \
     "courses/low-kick-sharpshooter/episodes/introduction/video-1080p.mp4"

copy "Low Kick Sharpshooter/Points of Connection/LKS - Points of Connection.mp4" \
     "courses/low-kick-sharpshooter/episodes/points-of-contact/video-1080p.mp4"

copy "Low Kick Sharpshooter/Maximizing Force/LKS - Maximizing Force.mp4" \
     "courses/low-kick-sharpshooter/episodes/maximizing-force/video-1080p.mp4"

copy "Low Kick Sharpshooter/Angles Of Attack/Angles Of Attact unfinished - 1080.mp4" \
     "courses/low-kick-sharpshooter/episodes/angles-of-attack/video-1080p.mp4"

copy "Low Kick Sharpshooter/Defence/LKS - Defence 1080 h265.mov" \
     "courses/low-kick-sharpshooter/episodes/defence/video-1080p.mov"

copy "Low Kick Sharpshooter/Weight Manipulation/LKS - Manipulation 1080.mp4" \
     "courses/low-kick-sharpshooter/episodes/weight-manipulation/video-1080p.mp4"

copy "Low Kick Sharpshooter/Jedi Mind Tricks/Jedi Mind Tricks LKS.mov" \
     "courses/low-kick-sharpshooter/episodes/jedi-mind-tricks/video-1080p.mov"

# ─────────────────────────────────────────────────────────────
# MUAY THAI FOUNDATIONS — Multi-resolution episodes (720p, 1080p, 4K)
# ─────────────────────────────────────────────────────────────
echo ""
echo "── Muay Thai Foundations (multi-resolution) ──"

# Into The Box (3 resolutions, .mov)
copy "Muay Thai Foundations/Intro: Into The Box/MTF - Into the box 720 h265 1200 kbs.mov" \
     "courses/muay-thai-foundations/episodes/into-the-box/video-720p.mov"
copy "Muay Thai Foundations/Intro: Into The Box/MTF - Into the box 1080 h265 3000 kbs.mov" \
     "courses/muay-thai-foundations/episodes/into-the-box/video-1080p.mov"
copy "Muay Thai Foundations/Intro: Into The Box/MTF - Into the box 4K h265 5000 kbs.mov" \
     "courses/muay-thai-foundations/episodes/into-the-box/video-4k.mov"

# The System
copy "Muay Thai Foundations/The System/MTF-The System 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/the-system/video-720p.mp4"
copy "Muay Thai Foundations/The System/MTF-The System 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/the-system/video-1080p.mp4"
copy "Muay Thai Foundations/The System/MTF-The System 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/the-system/video-4k.mp4"

# Goals & Intentions
copy "Muay Thai Foundations/Goals And Intentions/MTF-Goals And Intentions 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/goals/video-720p.mp4"
copy "Muay Thai Foundations/Goals And Intentions/MTF-Goals And Intentions 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/goals/video-1080p.mp4"
copy "Muay Thai Foundations/Goals And Intentions/MTF-Goals And Intentions 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/goals/video-4k.mp4"

# Professional Hand Wraps
copy "Muay Thai Foundations/Professional Handwraps/MTF-Hadwraps 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/professional-hand-wraps/video-720p.mp4"
copy "Muay Thai Foundations/Professional Handwraps/MTF-Hadwraps 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/professional-hand-wraps/video-1080p.mp4"
copy "Muay Thai Foundations/Professional Handwraps/MTF-Hadwraps 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/professional-hand-wraps/video-4k.mp4"

# Stance
copy "Muay Thai Foundations/Stance/Stance 720 h265 31200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/stance/video-720p.mp4"
copy "Muay Thai Foundations/Stance/Stance 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/stance/video-1080p.mp4"
copy "Muay Thai Foundations/Stance/Stance 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/stance/video-4k.mp4"

# Shadowboxing
copy "Muay Thai Foundations/Shadowboxing/MTF-Shadowboxing 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/shadowboxing/video-720p.mp4"
copy "Muay Thai Foundations/Shadowboxing/MTF-Shadowboxing 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/shadowboxing/video-1080p.mp4"
copy "Muay Thai Foundations/Shadowboxing/MTF-Shadowboxing 4k h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/shadowboxing/video-4k.mp4"

# Knees (Sting Like A Knee)
copy "Muay Thai Foundations/Knees/Knees 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/sting-like-a-knee/video-720p.mp4"
copy "Muay Thai Foundations/Knees/Knees 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/sting-like-a-knee/video-1080p.mp4"
copy "Muay Thai Foundations/Knees/Knees 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/sting-like-a-knee/video-4k.mp4"

# Roundhouse Dynamics (The Roundhouse Kick)
copy "Muay Thai Foundations/Roundhouse Dynamics/Roundhouse Dynamics 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/the-roundhouse-kick/video-720p.mp4"
copy "Muay Thai Foundations/Roundhouse Dynamics/Roundhouse Dynamics 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/the-roundhouse-kick/video-1080p.mp4"
copy "Muay Thai Foundations/Roundhouse Dynamics/Roundhouse Dynamics 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/the-roundhouse-kick/video-4k.mp4"

# Checking Kicks (Checking & Guard for Kicks)
copy "Muay Thai Foundations/Checking Kicks/MTF-Checking Kicks 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/gaurd-for-kicks/video-720p.mp4"
copy "Muay Thai Foundations/Checking Kicks/MTF-Checking Kicks 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/gaurd-for-kicks/video-1080p.mp4"
copy "Muay Thai Foundations/Checking Kicks/MTF-Checking Kicks 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/gaurd-for-kicks/video-4k.mp4"

# Missing Link (Your Missing Link)
copy "Muay Thai Foundations/Missing Link/MTF-Missing Link 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/your-missing-link/video-720p.mp4"
copy "Muay Thai Foundations/Missing Link/MTF-Missing Link 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/your-missing-link/video-1080p.mp4"
copy "Muay Thai Foundations/Missing Link/MTF-Missing Link 4k h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/your-missing-link/video-4k.mp4"

# Teeps (Basics Of The Teep)
copy "Muay Thai Foundations/Teeps/MTF - Teeps 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/basics-of-the-teep/video-720p.mp4"
copy "Muay Thai Foundations/Teeps/MTF - Teeps 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/basics-of-the-teep/video-1080p.mp4"
copy "Muay Thai Foundations/Teeps/MTF - Teeps 4k h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/basics-of-the-teep/video-4k.mp4"

# Foundational Guard (3 resolutions)
copy "Muay Thai Foundations/Foundational Gaurd/MTF-Foundational Gaurd 720 h265 1200 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/dynamic-guard/video-720p.mp4"
copy "Muay Thai Foundations/Foundational Gaurd/MTF-Foundational Gaurd 1080 h265 3000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/dynamic-guard/video-1080p.mp4"
copy "Muay Thai Foundations/Foundational Gaurd/MTF-Foundational Gaurd 4K h265 5000 kbs.mp4" \
     "courses/muay-thai-foundations/episodes/dynamic-guard/video-4k.mp4"

echo ""
echo "── Muay Thai Foundations (single-resolution) ──"

# Bag Work (1080p only, .mov)
copy "Muay Thai Foundations/Bag Work/MTF - Bag Work 1080 h265 3000 kbs.mov" \
     "courses/muay-thai-foundations/episodes/bag-work-details-xafmc/video-1080p.mov"

# Where Do You Look (1080p only, .mov)
copy "Muay Thai Foundations/Where Do You Look?/MTF - Where Do You Look 1080 h265 3000 kbs.mov" \
     "courses/muay-thai-foundations/episodes/where-do-you-look/video-1080p.mov"

# ─────────────────────────────────────────────────────────────
# TEEP COURSE (no DB records yet — staging for future use)
# ─────────────────────────────────────────────────────────────
echo ""
echo "── Teep Course (staging) ──"

copy "Teep Course/TC Ep1 Intro.mov" \
     "courses/teep-course/episodes/ep1-intro/video-default.mov"
copy "Teep Course/TC Ep2 Targets.mov" \
     "courses/teep-course/episodes/ep2-targets/video-default.mov"
copy "Teep Course/TC Ep3 Points Of Connection.mov" \
     "courses/teep-course/episodes/ep3-points-of-connection/video-default.mov"
copy "Teep Course/TC Ep4 Weight Distrobution.mov" \
     "courses/teep-course/episodes/ep4-weight-distribution/video-default.mov"
copy "Teep Course/TC Ep5 3 Kinds Of Teep.mov" \
     "courses/teep-course/episodes/ep5-three-kinds-of-teep/video-default.mov"
copy "Teep Course/TC Ep6 Dont Get it Caught.mov" \
     "courses/teep-course/episodes/ep6-dont-get-it-caught/video-default.mov"
copy "Teep Course/TC Ep7 Teep Ranges.mov" \
     "courses/teep-course/episodes/ep7-teep-ranges/video-default.mov"

# ─────────────────────────────────────────────────────────────
# ACCOUNTABILITY IN FIGHTING (no DB records yet — staging)
# ─────────────────────────────────────────────────────────────
echo ""
echo "── Accountability In Fighting (staging) ──"

copy "Accountability In Fighting/\"A Win's A Win\": Accountability & Excuses/A Win's A Win 4000kbps.mp4" \
     "courses/accountability-in-fighting/episodes/a-wins-a-win/video-default.mp4"

echo ""
echo "=== Migration complete ==="
echo ""
echo "Verifying new bucket structure..."
aws s3 ls s3://fighting-prime-media/courses/ --recursive --human-readable --summarize 2>&1 | tail -5
