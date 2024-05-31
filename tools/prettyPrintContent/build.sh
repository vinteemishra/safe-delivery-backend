#!/bin/sh

rm ./output/*

# Create HTML file
node --max-old-space-size=8192 run.js

# Convert HTML to docs
libreoffice  --convert-to "docx:Office Open XML Text" output/*.html --outdir output

# create archive with output
rm output.zip || true
zip -j output.zip output/*.docx