import re

with open('src/App.jsx', 'r') as file:
    content = file.read()

# Replace LandingPage SOS button colors
content = re.sub(
    r"(background:\s*)isSent \? '#34d399' : isRed \? '#D4537E' : '#D4537E'",
    r"\1isSent ? '#34d399' : isRed ? '#CE2029' : '#CE2029'",
    content
)

content = re.sub(
    r"(boxShadow:\s*isSent \? '0 0 \d+px #34d39944' : isRed \? '0 0 \d+px )rgba\([^)]+\)(' : '0 0 \d+px )rgba\([^)]+\)(')",
    r"\1rgba(206,32,41,0.4)\2rgba(206,32,41,0.35)\3",
    content
)

content = re.sub(
    r"(border:\s*`2px solid \$\{isRed \? ')#D4537E30(' : ')#D4537E20('\}\`)",
    r"\1rgba(206,32,41,0.3)\2rgba(206,32,41,0.2)\3",
    content
)

content = re.sub(
    r"(border:\s*'1px solid )#D4537E10(')",
    r"\1rgba(206,32,41,0.1)\2",
    content
)

content = re.sub(
    r"(color:\s*isSent \? '#34d399' : isRed \? ')#ff4444(' : ')#D4537E(')",
    r"\1#e8474f\2#CE2029\3",
    content
)

content = re.sub(
    r"(color:\s*')#ff4444(',\s*fontFamily:\s*\"'Poppins',sans-serif\",\s*animation:\s*'fadeIn 0\.3s ease',\s*letterSpacing:\s*'0\.06em')",
    r"\1#e8474f\2",
    content
)

# App.jsx SOS trigger button
content = re.sub(
    r"(background:\s*')#D4537E(',\s*border:\s*'none',\s*display:\s*'flex',[\s\S]*?boxShadow:\s*'0 0 24px )#D4537E66(')",
    r"\1#CE2029\2#CE202966\3",
    content
)
# Also the title SafeTrace in LandingPage!
content = content.replace("<span style={{ fontSize: 30, fontWeight: 900, color: '#D4537E', letterSpacing: '-0.02em' }}>TRACE</span>", "<span style={{ fontSize: 30, fontWeight: 900, color: '#CE2029', letterSpacing: '-0.02em' }}>TRACE</span>")

# For the SOSOverlay alerts
content = content.replace("background: '#D4537E18', border: '2px solid #D4537E'", "background: 'rgba(206,32,41,0.1)', border: '2px solid rgba(206,32,41,0.4)'")
content = content.replace("color: '#ff4444'", "color: '#e8474f'")


with open('src/App.jsx', 'w') as file:
    file.write(content)

print('Patched App.jsx')
