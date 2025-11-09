#!/bin/bash
# FFmpeg preset for WebM (Telegram alternative)
# Usage: ./webm-512.sh <frames_dir> <audio_file> <output_file>

FRAMES_DIR="${1:-frames}"
AUDIO_FILE="${2:-voice.opus}"
OUTPUT_FILE="${3:-out_512.webm}"

ffmpeg -y -r 15 -i "${FRAMES_DIR}/%04d.png" -i "${AUDIO_FILE}" -shortest \
  -c:v libvpx-vp9 -b:v 0 -crf 32 -c:a libopus "${OUTPUT_FILE}"

