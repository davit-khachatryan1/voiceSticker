#!/bin/bash
# FFmpeg preset for long form (60s+) - lowest bitrate
# Usage: ./cast-512.sh <frames_dir> <audio_file> <output_file>

FRAMES_DIR="${1:-frames}"
AUDIO_FILE="${2:-voice.opus}"
OUTPUT_FILE="${3:-out_512.mp4}"

ffmpeg -y -r 12 -i "${FRAMES_DIR}/%04d.png" -i "${AUDIO_FILE}" -shortest \
  -c:v libx264 -profile:v baseline -pix_fmt yuv420p -b:v 400k \
  -c:a aac -b:a 56k -movflags +faststart "${OUTPUT_FILE}"

