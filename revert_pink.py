import os, re

SRC = '/Users/dcunhadenver/Downloads/SafeTrace/src'

# Restore from #D4537E (the dull pink) back to #e81850 (the bright pink)
replacements = [
    ('#D4537E', '#e81850'),
    ('#d4537e', '#e81850'),
    ('rgba(212,83,126,', 'rgba(232,24,80,'),
    # The header in App.jsx and SOS.jsx that was mistakenly made red
    ("<span style={{ color: '#CE2029' }}>Trace</span>", "<span style={{ color: '#e81850' }}>Trace</span>"),
    ("color: '#CE2029', letterSpacing: '-0.02em' }}>TRACE</span>", "color: '#e81850', letterSpacing: '-0.02em' }}>TRACE</span>")
]

count = 0
for root, dirs, files in os.walk(SRC):
    for f in files:
        if f.endswith(('.jsx', '.js', '.css')):
            path = os.path.join(root, f)
            with open(path, 'r') as file:
                content = file.read()
            original = content
            for old, new in replacements:
                content = content.replace(old, new)
            if content != original:
                with open(path, 'w') as file:
                    file.write(content)
                count += 1
                
print(f'Restored bright pink in {count} files.')
