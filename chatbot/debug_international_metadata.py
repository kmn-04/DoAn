# -*- coding: utf-8 -*-
import pickle
import sys

# Set UTF-8 encoding for output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load metadata
with open('chunks_with_metadata.pkl', 'rb') as f:
    data = pickle.load(f)

print('=' * 80)
print('🔍 DEBUG: INTERNATIONAL TOUR METADATA')
print('=' * 80)

# Find first INTERNATIONAL tour chunk
for i, chunk in enumerate(data['chunks']):
    meta = chunk['metadata']
    if 'Singapore' in meta.get('tour_name', ''):
        print(f"\n📋 Chunk #{i} - Singapore Tour:")
        print(f"   tour_name: {meta.get('tour_name')}")
        print(f"   tour_type: {meta.get('tour_type')}")
        print(f"   is_domestic: {meta.get('is_domestic')}")
        print(f"   is_domestic type: {type(meta.get('is_domestic'))}")
        print(f"   is_domestic == False: {meta.get('is_domestic') == False}")
        print(f"   is_domestic is False: {meta.get('is_domestic') is False}")
        print(f"   is_domestic is not False: {meta.get('is_domestic') is not False}")
        
        # Test filter logic
        is_domestic = meta.get('is_domestic', None)
        print(f"\n🧪 TEST FILTER LOGIC:")
        print(f"   is_domestic = {is_domestic}")
        print(f"   Filter condition (is_domestic is not False): {is_domestic is not False}")
        
        if is_domestic is not False:
            print("   ❌ SKIP = True (tour bị loại bỏ!)")
        else:
            print("   ✅ SKIP = False (tour được giữ lại)")
        
        break

print('\n' + '=' * 80)
print('🔍 COUNT CHUNKS BY is_domestic VALUE')
print('=' * 80)

count_true = sum(1 for c in data['chunks'] if c['metadata'].get('is_domestic') == True)
count_false = sum(1 for c in data['chunks'] if c['metadata'].get('is_domestic') == False)
count_none = sum(1 for c in data['chunks'] if c['metadata'].get('is_domestic') is None)

print(f"is_domestic == True:  {count_true} chunks")
print(f"is_domestic == False: {count_false} chunks")
print(f"is_domestic is None:  {count_none} chunks")

print('\n' + '=' * 80)

