# -*- coding: utf-8 -*-
import pickle
import sys

# Set UTF-8 encoding for output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load metadata
with open('chunks_with_metadata.pkl', 'rb') as f:
    data = pickle.load(f)

# Find INTERNATIONAL tours
intl_tours = set()
for c in data['chunks']:
    meta = c['metadata']
    if meta.get('is_domestic') == False and 'tour_name' in meta:
        intl_tours.add(meta['tour_name'])

print('=' * 60)
print('🌍 INTERNATIONAL TOURS TRONG INDEX:')
print('=' * 60)
for i, tour in enumerate(sorted(intl_tours), 1):
    print(f"{i}. {tour}")

print(f"\n✅ Tổng số: {len(intl_tours)} INTERNATIONAL tours")
print('=' * 60)


