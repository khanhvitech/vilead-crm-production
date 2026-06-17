import re

with open('app/components/automation/sequence/SequenceListPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_body = '''<div key={seq.id} className={group grid grid-cols-12 gap-0 px-5 py-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors items-center cursor-pointer } onClick={() => onSelectSequence(seq.id)}>'''
good_body = '''<div key={seq.id} className={"group grid grid-cols-12 gap-0 px-5 py-3 border-b border-gray-100 hover:bg-blue-50/40 transition-colors items-center cursor-pointer " + (selectedIds.has(seq.id) ? "bg-blue-50" : "")} onClick={() => onSelectSequence(seq.id)}>'''

text = text.replace(bad_body, good_body)

# there is also a missing selectedIds ? 'bg-blue-50' : ''
# let's just do a normal python replace

with open('app/components/automation/sequence/SequenceListPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patched backticks")
