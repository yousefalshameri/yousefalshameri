import sys, os
OUT = sys.argv[1]
NAVY="#0B3B52"; DEEP="#072A3B"; GREEN="#1FB58A"; GOLD="#F2C14E"; INK="#0F2533"; MUTED="#536B7A"; PAPER="#F5F8FA"; CARD="#FFFFFF"; LINE="#D7E2E8"; TINT="#E3F5EE"

def svg(role, body, bg):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="ar" data-pptx-page-role="{role}" font-family="Segoe UI">
  <rect id="bg" data-pptx-role="background" x="0" y="0" width="1280" height="720" fill="{bg}"/>
{body}
</svg>
'''

def header(title, kicker):
    return f'''  <g id="header" data-pptx-bounds="80 44 1120 108" text-anchor="end">
    <text x="1200" y="78" font-size="18" font-weight="bold" fill="{GREEN}">{kicker}</text>
    <text x="1200" y="130" font-size="44" font-weight="bold" fill="{INK}">{title}</text>
    <rect x="1136" y="144" width="64" height="6" rx="3" fill="{GOLD}"/>
  </g>'''

pages = {}

# 1 cover
pages["01_cover.svg"] = svg("cover", f'''  <circle id="deco-ring" data-pptx-role="decoration" cx="150" cy="600" r="260" fill="none" stroke="{GREEN}" stroke-width="2" stroke-opacity="0.35"/>
  <circle id="deco-disc" data-pptx-role="decoration" cx="150" cy="600" r="170" fill="{GREEN}" fill-opacity="0.12"/>
  <g id="mark" data-pptx-bounds="1072 150 128 128">
    <rect x="1072" y="150" width="128" height="128" rx="30" fill="{GREEN}"/>
    <path d="M1121 176H1151V199H1174V229H1151V252H1121V229H1098V199H1121Z" fill="#FFFFFF"/>
  </g>
  <g id="cover-title" data-pptx-bounds="380 300 820 220" text-anchor="end">
    <text x="1200" y="352" font-size="22" font-weight="bold" fill="{GOLD}">عرض تعريفي بالمشروع</text>
    <text x="1200" y="436" font-size="64" font-weight="bold" fill="#FFFFFF">نظام إدارة الموظفين</text>
    <text x="1200" y="500" font-size="32" fill="#BFD8E3">منطقة الجهراء الصحية</text>
  </g>
  <g id="cover-foot" data-pptx-bounds="700 600 500 60" text-anchor="end">
    <rect x="1136" y="612" width="64" height="6" rx="3" fill="{GOLD}"/>
    <text x="1200" y="650" font-size="18" fill="#BFD8E3">إدارة تقنية المعلومات</text>
  </g>''', NAVY)

# 2 challenge
cards = [
 ("معاملات ورقية", ["طلبات الإجازة والحضور تمر", "على الورق والتوقيع اليدوي"], "١"),
 ("بيانات متفرقة", ["كل قسم يحتفظ بسجلاته", "بدون مصدر موحد للبيانات"], "٢"),
 ("بطء الاعتماد", ["متابعة الطلبات صعبة", "والتقارير تاخذ وقت وجهد"], "٣"),
]
b = header("التحدي الحالي", "ليش نحتاج نظام جديد؟")
for i,(t,lines,n) in enumerate(cards):
    x0 = 840 - i*370; r = x0+340
    b += f'''
  <g id="challenge-{i+1}" data-pptx-bounds="{x0} 200 340 300">
    <rect x="{x0}" y="200" width="340" height="300" rx="20" fill="{CARD}" stroke="{LINE}" stroke-width="1.5"/>
    <circle cx="{r-56}" cy="256" r="28" fill="{TINT}"/>
    <text x="{r-56}" y="266" font-size="26" font-weight="bold" fill="{GREEN}" text-anchor="middle">{n}</text>
    <text x="{r-32}" y="346" font-size="28" font-weight="bold" fill="{INK}" text-anchor="end">{t}</text>
    <text x="{r-32}" y="400" font-size="22" fill="{MUTED}" text-anchor="end">{lines[0]}<tspan x="{r-32}" dy="34">{lines[1]}</tspan></text>
  </g>'''
b += f'''
  <g id="takeaway" data-pptx-bounds="100 548 1080 96">
    <rect x="100" y="548" width="1080" height="96" rx="20" fill="{NAVY}"/>
    <rect x="1140" y="572" width="8" height="48" rx="4" fill="{GOLD}"/>
    <text x="1120" y="608" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="end">الحل: منصة رقمية موحدة لكل موظفي المنطقة</text>
  </g>'''
pages["02_challenge.svg"] = svg("content", b, PAPER)

# 3 modules 2x2
def icon(kind, cx, cy):
    s = f'<g fill="none" stroke="{GREEN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'
    if kind=="clock": s += f'<circle cx="{cx}" cy="{cy}" r="20"/><path d="M{cx} {cy-11}V{cy}L{cx+9} {cy+6}"/>'
    if kind=="cal": s += f'<rect x="{cx-20}" y="{cy-16}" width="40" height="36" rx="6"/><path d="M{cx-20} {cy-4}H{cx+20}M{cx-10} {cy-24}V{cy-12}M{cx+10} {cy-24}V{cy-12}"/>'
    if kind=="swap": s += f'<path d="M{cx-18} {cy-8}H{cx+18}M{cx+10} {cy-16}L{cx+18} {cy-8}L{cx+10} {cy}M{cx+18} {cy+10}H{cx-18}M{cx-10} {cy+2}L{cx-18} {cy+10}L{cx-10} {cy+18}"/>'
    if kind=="bars": s += f'<path d="M{cx-20} {cy+20}H{cx+20}M{cx-12} {cy+12}V{cy+2}M{cx} {cy+12}V{cy-16}M{cx+12} {cy+12}V{cy-6}"/>'
    return s + '</g>'
mods = [("الحضور والانصراف",("تسجيل البصمة ومتابعة","التأخير والغياب لحظياً"),"clock"),
        ("الإجازات",("تقديم الطلب واعتماده إلكترونياً","مع رصيد محدّث دائماً"),"cal"),
        ("المناوبات",("جدولة مناوبات الأقسام","وتبديلها بسهولة"),"swap"),
        ("التقارير",("لوحات وتقارير جاهزة","للإدارة بضغطة زر"),"bars")]
b = header("المحاور الأربعة للنظام", "وش يغطي النظام؟")
for i,(t,d,k) in enumerate(mods):
    col = i%2; row = i//2
    x0 = 655 - col*555; y0 = 196 + row*236; r = x0+525
    b += f'''
  <g id="module-{i+1}" data-pptx-bounds="{x0} {y0} 525 210">
    <rect x="{x0}" y="{y0}" width="525" height="210" rx="20" fill="{CARD}" stroke="{LINE}" stroke-width="1.5"/>
    <rect x="{r-112}" y="{y0+32}" width="80" height="80" rx="20" fill="{TINT}"/>
    {icon(k, r-72, y0+72)}
    <text x="{r-136}" y="{y0+84}" font-size="30" font-weight="bold" fill="{INK}" text-anchor="end">{t}</text>
    <text x="{r-32}" y="{y0+150}" font-size="22" fill="{MUTED}" text-anchor="end">{d[0]}<tspan x="{r-32}" dy="34">{d[1]}</tspan></text>
  </g>'''
pages["03_modules.svg"] = svg("content", b, PAPER)

# 4 process
steps = [("تقديم الطلب","من الجوال أو الكمبيوتر","١"),
         ("اعتماد رئيس القسم","إشعار فوري للمراجعة","٢"),
         ("الموارد البشرية","تدقيق الرصيد والتوثيق","٣"),
         ("إشعار الموظف","بالقرار وتحديث الرصيد","٤")]
b = header("رحلة طلب الإجازة", "مثال عملي")
for i,(t,d,n) in enumerate(steps):
    x0 = 910 - i*270; cx = x0+135
    arrow = ""
    if i < 3:
        arrow = f'<polygon points="{x0+10},286 {x0+10},314 {x0-6},300" fill="{GOLD}"/>'
    hi = NAVY if i in (0,3) else GREEN
    b += f'''
  <g id="step-{i+1}" data-pptx-bounds="{x0-6} 236 270 300">
    <circle cx="{cx}" cy="300" r="56" fill="{hi}"/>
    <text x="{cx}" y="316" font-size="40" font-weight="bold" fill="#FFFFFF" text-anchor="middle">{n}</text>
    {arrow}
    <text x="{cx}" y="410" font-size="24" font-weight="bold" fill="{INK}" text-anchor="middle">{t}</text>
    <text x="{cx}" y="452" font-size="20" fill="{MUTED}" text-anchor="middle">{d}</text>
  </g>'''
b += f'''
  <g id="process-note" data-pptx-bounds="100 560 1080 84">
    <rect x="100" y="560" width="1080" height="84" rx="20" fill="{TINT}"/>
    <text x="640" y="612" font-size="26" font-weight="bold" fill="{NAVY}" text-anchor="middle">كل خطوة موثّقة وقابلة للتتبع بدون أي ورقة</text>
  </g>'''
pages["04_leave_flow.svg"] = svg("content", b, PAPER)

# 5 timeline
phases = [("تحليل المتطلبات","جمع احتياجات الأقسام","والموارد البشرية","المرحلة الأولى"),
          ("التصميم والتطوير","بناء النظام بتقنيات","ويب حديثة وآمنة","المرحلة الثانية"),
          ("التجربة التشغيلية","تجربة في قسم واحد","وجمع الملاحظات","المرحلة الثالثة"),
          ("الإطلاق والتدريب","تعميم النظام وتدريب","الموظفين على استخدامه","المرحلة الرابعة")]
b = header("خطة التنفيذ", "خارطة الطريق")
b += f'''
  <rect id="timeline-rail" data-pptx-role="decoration" x="150" y="297" width="980" height="6" rx="3" fill="{LINE}"/>'''
for i,(t,l1,l2,k) in enumerate(phases):
    x0 = 910 - i*270; cx = x0+135
    fill = GREEN if i==0 else CARD
    stroke = GREEN
    tc = "#FFFFFF" if i==0 else GREEN
    b += f'''
  <g id="phase-{i+1}" data-pptx-bounds="{x0} 236 270 340">
    <text x="{cx}" y="254" font-size="18" font-weight="bold" fill="{GREEN}" text-anchor="middle">{k}</text>
    <circle cx="{cx}" cy="300" r="22" fill="{fill}" stroke="{stroke}" stroke-width="4"/>
    <rect x="{x0+15}" y="352" width="240" height="200" rx="18" fill="{CARD}" stroke="{LINE}" stroke-width="1.5"/>
    <text x="{cx}" y="404" font-size="26" font-weight="bold" fill="{INK}" text-anchor="middle">{t}</text>
    <text x="{cx}" y="458" font-size="20" fill="{MUTED}" text-anchor="middle">{l1}<tspan x="{cx}" dy="32">{l2}</tspan></text>
  </g>'''
pages["05_roadmap.svg"] = svg("content", b, PAPER)

# 6 ending
pages["06_end.svg"] = svg("ending", f'''  <circle id="deco-ring" data-pptx-role="decoration" cx="1130" cy="120" r="240" fill="none" stroke="{GREEN}" stroke-width="2" stroke-opacity="0.35"/>
  <circle id="deco-disc" data-pptx-role="decoration" cx="1130" cy="120" r="150" fill="{GREEN}" fill-opacity="0.12"/>
  <g id="closing" data-pptx-bounds="140 250 1000 260" text-anchor="middle">
    <text x="640" y="330" font-size="72" font-weight="bold" fill="#FFFFFF">شكراً لكم</text>
    <rect x="608" y="362" width="64" height="6" rx="3" fill="{GOLD}"/>
    <text x="640" y="430" font-size="30" fill="#BFD8E3">نحو إدارة رقمية أذكى لموظفي</text>
    <text x="640" y="476" font-size="30" font-weight="bold" fill="{GREEN}">منطقة الجهراء الصحية</text>
  </g>
  <g id="contact" data-pptx-bounds="340 600 600 50" text-anchor="middle">
    <text x="640" y="632" font-size="18" fill="#BFD8E3">للاستفسار: إدارة تقنية المعلومات</text>
  </g>''', NAVY)

for k,v in pages.items():
    open(os.path.join(OUT,k),"w").write(v)
print("wrote", len(pages))
