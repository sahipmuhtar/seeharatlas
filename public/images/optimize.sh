# Convert all PNGs with reduced quality
for file in *.png; do
  sips -s format png "$file" --out "optimized_$file" -s formatOptions 70
done