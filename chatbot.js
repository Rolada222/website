/* ===================================================
   MTARISE CONSTRUCTION LTD — Advanced Chatbot v3
   =================================================== */
'use strict';

// ─── Conversation State ───────────────────────────────
const STATE = {
  open:         false,
  started:      false,
  userName:     '',
  userEmail:    '',
  userPhone:    '',
  leadStage:    0,
  awaitLead:    null,
  lastTopic:    null,
  history:      [],
  messageCount: 0,
  typingTimer:  null,
  seenTopics:   new Set(),
};

const PHONE     = '087 453 3339';
const PHONE_TEL = 'tel:0874533339';
const EMAIL     = 'info@mtarise.com';

const $  = id => document.getElementById(id);
const hi = () => STATE.userName ? `, ${STATE.userName}` : '';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Knowledge Base ───────────────────────────────────
const KB = [

  // ── Greetings ──────────────────────────────────────
  {
    id: 'greeting',
    patterns: [['hello','hi','hey','howya','how are','hiya','sup','good morning','good afternoon','good evening','morning','evening','afternoon','greetings','start']],
    reply: () => `${getGreeting()}${hi()}! 👋 Welcome to <strong>MTARISE CONSTRUCTION LTD</strong>.<br><br>I'm your virtual assistant — here to answer questions about our residential construction and renovation services, and help you get a <strong>free quote</strong>.<br><br>What can I help you with today?`,
    quick: ['Get a free quote','Our services','Bathroom renovation','Kitchen renovation','House extension','Attic conversion','Pricing info','Contact details'],
  },

  // ── Quote ──────────────────────────────────────────
  {
    id: 'quote',
    patterns: [['quote','quotation','estimate','free quote','get a quote','request a quote','site visit']],
    reply: () => `All our quotations are <strong>100% free with no obligation</strong> 🏗️<br><br><ol style="padding-left:16px;margin-top:8px"><li>Fill in our <a href="quote.html">online quote form</a> or call us directly</li><li>We arrange a <strong>free site visit</strong> at a time that suits you</li><li>You receive a detailed written quotation within <strong>5 working days</strong></li></ol><br>No hidden costs. No pressure. Just an honest breakdown of your project.`,
    quick: ['Start my quote now','Leave my details here','Call you directly','What info do you need?','How long does a quote take?'],
  },

  // ── Pricing ────────────────────────────────────────
  {
    id: 'pricing',
    patterns: [['price','pricing','cost','how much','expensive','cheap','affordable','budget','rates','charge','fee','euro','€']],
    reply: () => `Pricing depends on the scope and spec of each project${hi()}. Here's a general guide: 💰<br><br>🛁 <strong>Bathroom renovation:</strong> €5,000 – €25,000+<br>🍳 <strong>Kitchen renovation:</strong> €8,000 – €40,000+<br>🏠 <strong>Single-storey extension (25m²):</strong> €50,000 – €90,000+<br>🪜 <strong>Attic conversion:</strong> €30,000 – €60,000+<br>🔨 <strong>Full home renovation:</strong> €40,000 – €200,000+<br>🪣 <strong>Full interior painting:</strong> €1,500 – €5,000+<br><br>These are guide ranges. Your free quote gives an exact figure based on your home.`,
    quick: ['Get a free quote','What affects the price?','Bathroom pricing','Kitchen pricing','Extension pricing'],
  },
  {
    id: 'price_factors',
    patterns: [['what affect','factor','influence','depend','why different','why vary','varies']],
    reply: () => `Several things affect the final cost${hi()} 📋<br><br>• <strong>Size</strong> — floor area and number of rooms<br>• <strong>Specification</strong> — standard vs luxury finishes<br>• <strong>Structural work</strong> — walls, beams, foundations<br>• <strong>Existing condition</strong> — older properties often need more prep<br>• <strong>Access</strong> — ease of site access for materials<br>• <strong>Location</strong> — city centre vs suburban<br><br>Our free site visit accounts for all of these accurately.`,
    quick: ['Get a free quote','Our services','Contact details'],
  },

  // ── Services ───────────────────────────────────────
  {
    id: 'services',
    patterns: [['service','services','what do you do','what do you offer','what can you do','what work','offer','speciali','provide']],
    reply: () => `We're a full-service residential construction company${hi()} 🔨<br><br>🏗️ <strong>Residential Construction</strong> — new builds &amp; structural<br>🔨 <strong>Home Renovation</strong> — full property transformations<br>🏠 <strong>House Extensions</strong> — rear, side, double-storey<br>🪜 <strong>Attic Conversions</strong> — bedroom, office, playroom<br>🛁 <strong>Bathroom Renovation</strong> — luxury redesigns<br>🍳 <strong>Kitchen Renovation</strong> — full design &amp; fit-out<br>🪣 <strong>Painting &amp; Decorating</strong> — interior &amp; exterior<br>🔧 <strong>Plumbing Works</strong> — installation &amp; repair<br>⚡ <strong>Electrical Works</strong> — RECI certified<br>🔩 <strong>Repairs &amp; Maintenance</strong> — no job too small<br><br>Which service are you interested in?`,
    quick: ['Bathroom renovation','Kitchen renovation','House extension','Attic conversion','Painting','Plumbing','Electrical','Repairs'],
  },

  // ── Bathroom ───────────────────────────────────────
  {
    id: 'bathroom',
    patterns: [['bathroom','bath','shower','wet room','en suite','ensuite','toilet','washroom','wc','tiles','tiling']],
    reply: () => `Bathroom renovations are one of our most popular services${hi()}! 🛁<br><br>We handle the complete project:<br>• Full strip-out &amp; structural prep<br>• Waterproofing &amp; replastering<br>• Walk-in showers, wet rooms &amp; freestanding baths<br>• Large format, mosaic &amp; feature tiling<br>• Bespoke vanity units &amp; storage<br>• Underfloor heating<br>• All plumbing &amp; electrical included<br><br>⏱ <strong>Typical timeline:</strong> 1–3 weeks<br>💰 <strong>Starting from:</strong> €5,000<br><br>Want a free quote for your bathroom?`,
    quick: ['Get a free quote','Bathroom pricing','How long does it take?','Do you supply fixtures?','See before & after'],
  },
  {
    id: 'bathroom_fixtures',
    patterns: [['supply','fixture','fitting','sanitaryware','basin','sink','tap','shower tray','toilet supply']],
    reply: () => `We can work either way${hi()}:<br><br>✅ <strong>Supply &amp; fit</strong> — we source all fixtures using our trade accounts (often cheaper than retail)<br>✅ <strong>Fit only</strong> — if you've already chosen your fixtures, we fit them to your exact spec<br><br>We'll advise on the best approach during the free site visit.`,
    quick: ['Get a free quote','Bathroom renovation','Kitchen renovation'],
  },

  // ── Kitchen ────────────────────────────────────────
  {
    id: 'kitchen',
    patterns: [['kitchen','fitted kitchen','worktop','units','cabinet','cupboard','island','splashback','appliance']],
    reply: () => `A new kitchen completely transforms your home and adds real value${hi()}! 🍳<br><br>Our kitchen service includes:<br>• Design consultation &amp; 3D planning<br>• Supply &amp; fit of kitchen units<br>• Worktops: quartz, granite, solid wood, or laminate<br>• Tiled splashbacks &amp; floor tiling<br>• All plumbing &amp; appliance connections<br>• Under-cabinet &amp; ceiling lighting<br>• Full replastering where needed<br><br>⏱ <strong>Typical timeline:</strong> 2–4 weeks<br>💰 <strong>Starting from:</strong> €8,000<br><br>Want us to visit and quote your kitchen?`,
    quick: ['Get a free quote','Kitchen pricing','Can you design it?','What worktops are available?','See our projects'],
  },
  {
    id: 'kitchen_design',
    patterns: [['design','designer','plan','layout','3d','render','concept','style']],
    reply: () => `We work with specialist kitchen designers${hi()}. Our process:<br><br>1. We assess your space and discuss your style preferences<br>2. A designer creates a detailed layout and 3D render<br>3. You approve before anything is ordered<br>4. We manage the full installation<br><br>Design is coordinated through our trusted partners and included in your quote.`,
    quick: ['Get a free quote','Kitchen renovation','Contact details'],
  },

  // ── Extension ──────────────────────────────────────
  {
    id: 'extension',
    patterns: [['extension','extend','rear extension','side extension','double storey','single storey','build on','add on','annex','conservatory','extra room']],
    reply: () => `A house extension is the smartest way to gain space without moving${hi()}! 🏠<br><br>We build:<br>• Single-storey rear extensions<br>• Side return extensions<br>• Double-storey extensions<br>• Wrap-around extensions<br>• Garage conversions<br>• Porch additions<br><br>We handle everything: planning consultation, structural engineering, full build, and internal fit-out.<br><br>⏱ <strong>Typical timeline:</strong> 8–16 weeks<br>💰 <strong>From €50,000</strong> for a 25m² single-storey<br><br>Want a free site assessment?`,
    quick: ['Get a free quote','Do I need planning permission?','How long does it take?','Extension pricing','Open plan kitchen'],
  },
  {
    id: 'open_plan',
    patterns: [['open plan','knock wall','remove wall','knock through','open up','wall removed','wall down','structural wall']],
    reply: () => `Open-plan living is one of the most popular home improvements${hi()}! 🏗️<br><br>What's involved:<br>• Structural survey to identify load-bearing walls<br>• Steel beam (RSJ) installation where required<br>• Building control approval if needed<br>• Replastering, flooring &amp; decoration<br><br>⚠️ Always use a professional — we ensure full compliance with Irish building regulations.<br><br>Want us to assess your property?`,
    quick: ['Get a free quote','House extension','Do I need planning?','Pricing info'],
  },

  // ── Attic ──────────────────────────────────────────
  {
    id: 'attic',
    patterns: [['attic','loft','roof room','roof conversion','attic bedroom','attic office','loft conversion','attic space']],
    reply: () => `An attic conversion is one of the best-value ways to add a bedroom${hi()}! 🪜<br><br>We handle:<br>• Structural assessment &amp; steelwork<br>• Velux or dormer window installation<br>• New timber floor &amp; full insulation<br>• Staircase design &amp; build<br>• En-suite bathroom option<br>• Full fire compliance (doors, alarms)<br>• Complete plastering &amp; decoration<br><br>⏱ <strong>Typical timeline:</strong> 4–8 weeks<br>💰 <strong>Starting from:</strong> €30,000<br><br>We can assess your attic's suitability for free!`,
    quick: ['Get a free quote','Is my attic suitable?','Do I need planning?','Attic with en-suite','How long does it take?'],
  },
  {
    id: 'attic_suitable',
    patterns: [['suitable','head height','headroom','can i convert','usable','possible','fit attic','attic work']],
    reply: () => `Here's what determines suitability${hi()}:<br><br>✅ <strong>Minimum head height:</strong> 2.2m at the ridge<br>✅ <strong>Roof pitch:</strong> ideally 30° or steeper<br>✅ <strong>Structural condition:</strong> rafters and joists assessed<br>✅ <strong>Usable floor space:</strong> typically 15m²+<br><br>Most attics in standard Irish semi-detached and detached homes can be converted. We check all of this completely free.`,
    quick: ['Book a free assessment','Get a free quote','Attic conversion info'],
  },

  // ── Painting ───────────────────────────────────────
  {
    id: 'painting',
    patterns: [['paint','painting','decorating','decorator','decorate','redecorate','colour','color','wall','ceiling','exterior paint','interior paint','render']],
    reply: () => `Our professional painters deliver a flawless finish every time${hi()}! 🪣<br><br>Services include:<br>• <strong>Interior painting</strong> — walls, ceilings, woodwork, coving<br>• <strong>Exterior painting</strong> — masonry, render, fascia, soffits<br>• Full surface preparation &amp; priming<br>• Anti-mould &amp; damp treatment where needed<br>• Wallpaper hanging &amp; removal<br>• Specialist feature wall finishes<br>• Colour consultation available<br><br>⏱ <strong>Full interior:</strong> 3–7 days<br>⏱ <strong>Exterior:</strong> 4–10 days<br>💰 <strong>Full interior from:</strong> €1,500`,
    quick: ['Get a free quote','Exterior painting','Interior painting','Colour consultation','Wallpaper'],
  },

  // ── Plumbing ───────────────────────────────────────
  {
    id: 'plumbing',
    patterns: [['plumb','plumbing','boiler','heating','radiator','pipe','leak','water','hot water','cylinder','heating system','pressure','rgii']],
    reply: () => `Our RGII-certified plumbers cover all residential plumbing needs${hi()}! 🔧<br><br>Services include:<br>• Full property plumbing installations<br>• Central heating system installation &amp; upgrades<br>• Boiler replacement (gas &amp; oil)<br>• Bathroom &amp; kitchen plumbing<br>• Underfloor heating systems<br>• Leak detection &amp; emergency repairs<br>• Water pressure &amp; cylinder work<br><br>All plumbing is certified and fully guaranteed.`,
    quick: ['Get a free quote','Boiler replacement','Underfloor heating','Emergency repair','Are you RGII certified?'],
  },
  {
    id: 'emergency',
    patterns: [['emergency','urgent','asap','immediately','burst','flood','leak now','help now','today','right now','urgent repair']],
    reply: () => `For urgent issues${hi()}, please <strong>call us directly</strong> on 📞 <a href="${PHONE_TEL}"><strong>${PHONE}</strong></a> — we'll assess the situation and get someone to you as quickly as possible.<br><br>For active leaks:<br>• Turn off your mains stopcock immediately<br>• Turn off electricity in affected areas if safe<br>• Call us and we'll advise from there`,
    quick: ['Call now','Contact details'],
  },

  // ── Electrical ─────────────────────────────────────
  {
    id: 'electrical',
    patterns: [['electric','electrical','rewire','socket','plug','lighting','light','fuse','consumer unit','fuse board','ev charger','alarm','smoke','carbon','reci']],
    reply: () => `All electrical work is carried out by <strong>RECI registered electricians</strong> and fully certified${hi()}! ⚡<br><br>Services include:<br>• Full property electrical rewires<br>• Consumer unit (fuse board) upgrades<br>• Additional sockets, circuits &amp; lighting<br>• EV car charger installation<br>• Smoke &amp; carbon monoxide alarm systems<br>• External security lighting<br>• Electrical safety certificates (ECTI)<br><br>All work comes with full certification documents.`,
    quick: ['Get a free quote','EV charger','Rewire my home','Consumer unit upgrade','Are you RECI registered?'],
  },
  {
    id: 'ev_charger',
    patterns: [['ev charger','electric car','electric vehicle','car charger','home charger','seai','grant','zappi','wallbox','ohme']],
    reply: () => `We install EV home chargers and guide you through the <strong>SEAI grant process</strong>${hi()}! ⚡🚗<br><br>• SEAI grant available: up to <strong>€300</strong> off installation<br>• Leading brands: Zappi, Ohme, Wallbox<br>• Smart chargers with app control<br>• Installation typically takes <strong>3–4 hours</strong><br>• Full electrical certification provided<br><br>Want us to handle the full installation?`,
    quick: ['Get a free quote','SEAI grant info','Electrical services','Contact details'],
  },

  // ── Repairs ────────────────────────────────────────
  {
    id: 'repairs',
    patterns: [['repair','maintenance','fix','snag','snagging','small job','minor','roof','gutter','fascia','soffit','crack','window','door','odd job']],
    reply: () => `No job is too small${hi()}! 🔩<br><br>Our repair and maintenance service covers:<br>• General snag &amp; repair works<br>• Roof repairs &amp; tile replacement<br>• Gutter cleaning &amp; repair<br>• Fascia &amp; soffit replacement<br>• Window &amp; door repairs<br>• Damp treatment &amp; proofing<br>• Cracked render &amp; plaster repair<br>• General property upkeep<br><br>We can often visit for smaller jobs within <strong>3–5 working days</strong>.`,
    quick: ['Get a free quote','Damp problems','Roof repair','Contact details'],
  },
  {
    id: 'damp',
    patterns: [['damp','mould','mold','moisture','rising damp','penetrating damp','condensation','wet wall','black mould','dampness']],
    reply: () => `Damp is very common in Irish homes — but very treatable${hi()}! 💧<br><br>We identify the type first:<br>• <strong>Rising damp</strong> — enters from the ground<br>• <strong>Penetrating damp</strong> — through walls or roof<br>• <strong>Condensation</strong> — from poor ventilation<br><br>Treatment includes:<br>• Damp-proof course (DPC) injection<br>• Waterproof render application<br>• Ventilation improvement<br>• Full replastering after treatment<br><br>We offer a <strong>free assessment</strong> to identify the cause.`,
    quick: ['Get a free assessment','Repairs &amp; maintenance','Contact details'],
  },

  // ── Full renovation ────────────────────────────────
  {
    id: 'renovation',
    patterns: [['renovate','renovation','refurbish','refurbishment','full house','whole house','complete house','overhaul','transform','full renovation','gut','gut out','entire home']],
    reply: () => `A full home renovation is our most comprehensive service${hi()} — and the most rewarding! 🔨<br><br>We manage everything under one contract:<br>• Detailed project plan &amp; schedule<br>• Full strip-out &amp; structural alterations<br>• Replastering &amp; drylining throughout<br>• New flooring (timber, tile, LVT)<br>• Full electrical rewire<br>• Plumbing upgrade &amp; re-route<br>• New kitchen &amp; bathrooms<br>• Complete interior decoration<br><br>One dedicated project manager. One point of contact. No juggling multiple trades.<br><br>⏱ <strong>Typical timeline:</strong> 3–6 months<br>💰 <strong>Starting from:</strong> €40,000`,
    quick: ['Get a free quote','Do I need to move out?','How long does it take?','Who manages the project?','Pricing info'],
  },
  {
    id: 'move_out',
    patterns: [['move out','stay','live in','vacate','leave house','stay home','move away','accommodation','disrupt']],
    reply: () => `It depends on the scale of the work${hi()}:<br><br>🏠 <strong>Partial renovation</strong> (one room at a time) — most clients stay. We seal off working areas and maintain daily living standards.<br><br>🔨 <strong>Full home renovation</strong> — we recommend alternative accommodation for the main construction phase (typically 8–12 weeks). We help you plan this in advance.<br><br>We discuss this fully at the site visit and plan the schedule to minimise disruption.`,
    quick: ['Get a free quote','Full renovation info','How long does it take?'],
  },

  // ── Process ────────────────────────────────────────
  {
    id: 'process',
    patterns: [['process','how does it work','what happens','step','procedure','start to finish','beginning','what to expect','stages','how do i start']],
    reply: () => `Our process is simple and transparent${hi()}:<br><br><strong>1 — Contact us</strong><br>Call, email, or fill in our quote form<br><br><strong>2 — Free site visit</strong><br>We visit, listen to your vision, and assess the scope<br><br><strong>3 — Written quotation</strong><br>Detailed, itemised quote within 5 working days<br><br><strong>4 — Contract &amp; scheduling</strong><br>You approve, we agree a start date and assign your project manager<br><br><strong>5 — Build &amp; updates</strong><br>Regular progress updates, clean worksite daily<br><br><strong>6 — Handover &amp; aftercare</strong><br>Final walkthrough, snag completion, 12-month guarantee`,
    quick: ['Get a free quote','How long does a quote take?','Who manages the project?','Payment terms'],
  },
  {
    id: 'project_manager',
    patterns: [['project manager','who manages','who is in charge','contact person','manage','oversee','supervisor','site manager','one point']],
    reply: () => `Every project gets a <strong>dedicated project manager</strong> assigned before work starts${hi()}.<br><br>Your PM is your single point of contact throughout. They:<br>• Coordinate all trades on site<br>• Send regular progress updates<br>• Handle any issues immediately<br>• Manage the project schedule<br>• Conduct the final walkthrough with you<br><br>No chasing multiple people. One call gets you answers.`,
    quick: ['Get a free quote','Our process','Contact details'],
  },

  // ── Timeline ───────────────────────────────────────
  {
    id: 'timeline',
    patterns: [['how long','time','duration','timeline','weeks','months','days','take','when can you start','finish','complete','availability']],
    reply: () => `Typical project timelines${hi()} ⏱️<br><br>🛁 <strong>Bathroom renovation:</strong> 1–3 weeks<br>🍳 <strong>Kitchen renovation:</strong> 2–4 weeks<br>🪣 <strong>Painting (full interior):</strong> 3–7 days<br>🪜 <strong>Attic conversion:</strong> 4–8 weeks<br>🏠 <strong>Single-storey extension:</strong> 10–14 weeks<br>🏗️ <strong>Double-storey extension:</strong> 14–20 weeks<br>🔨 <strong>Full home renovation:</strong> 12–24 weeks<br><br>We always agree a detailed schedule before work starts and deliver on time.`,
    quick: ['Get a free quote','Our process','Bathroom renovation','Kitchen renovation','House extension'],
  },
  {
    id: 'quote_time',
    patterns: [['how long quote','how long quotation','quote time','when will i get','how fast quote','how quick quote']],
    reply: () => `After our free site visit, you'll receive your detailed written quotation within <strong>5 working days</strong>${hi()}.<br><br>For smaller jobs (painting, repairs), we often turn quotes around in <strong>48 hours</strong>.<br><br>The quote includes a full itemised breakdown — materials, labour, and timeline — so you know exactly what you're getting.`,
    quick: ['Get a free quote','Our process','Contact details'],
  },

  // ── Insurance & Certs ──────────────────────────────
  {
    id: 'insurance',
    patterns: [['insure','insured','insurance','liability','cover','covered','policy','public liability']],
    reply: () => `Yes — we carry <strong>full professional insurance</strong> on every project${hi()} 🛡️<br><br>• <strong>Public Liability:</strong> €6.5 million coverage<br>• <strong>Employer's Liability:</strong> fully covered<br>• All subcontractors are vetted for appropriate insurance<br><br>Certificates are available on request and provided before any work commences.`,
    quick: ['Are you certified?','Guarantee info','Get a free quote','Contact details'],
  },
  {
    id: 'certifications',
    patterns: [['certif','reci','rgii','registered','qualif','license','licence','accredit','approved','certified']],
    reply: () => `All our tradespeople are fully qualified and certified${hi()} ✅<br><br>⚡ <strong>Electricians:</strong> RECI registered<br>🔧 <strong>Plumbers:</strong> RGII certified<br>🏗️ <strong>Construction:</strong> compliant with Irish Building Regulations<br><br>On completion you receive:<br>• Electrical certification (ECTI)<br>• Plumbing certification (RGII)<br>• Building compliance documentation<br><br>All certifications are provided as standard — no extra charge.`,
    quick: ['Are you insured?','Our guarantee','Get a free quote'],
  },
  {
    id: 'guarantee',
    patterns: [['guarantee','warranty','aftercare','after care','after-care','stand behind','backed','warranted','defect']],
    reply: () => `Every project comes with a <strong>12-month workmanship guarantee</strong>${hi()} ⭐<br><br>• Any defect from our work within 12 months — we return and fix it at <strong>no cost</strong><br>• We respond to aftercare requests within <strong>48 hours</strong><br>• Our reputation depends on quality — we take that very seriously<br><br>Beyond 12 months, manufacturers' warranties apply to materials and products.`,
    quick: ['Get a free quote','Our process','Are you insured?','Contact details'],
  },

  // ── Payment ────────────────────────────────────────
  {
    id: 'payment',
    patterns: [['pay','payment','deposit','stage payment','instalment','installment','how do i pay','when to pay','finance','upfront']],
    reply: () => `We operate a transparent <strong>stage payment</strong> system${hi()} 💳<br><br>• <strong>Deposit</strong> on contract signing (10–20% depending on project size)<br>• <strong>Stage payments</strong> tied to agreed project milestones<br>• <strong>Final payment</strong> on your sign-off at handover<br><br>You only pay for completed, inspected work. Full payment terms are clearly outlined in your written contract before work begins.`,
    quick: ['Get a free quote','Our process','Contact details'],
  },

  // ── Planning ───────────────────────────────────────
  {
    id: 'planning',
    patterns: [['planning','permission','council','planning permission','exempt','exemption','planning application','permitted development','planning office']],
    reply: () => `Whether you need planning permission depends on the project${hi()} 📋<br><br><strong>Usually doesn't need planning:</strong><br>• Rear extensions under 40m² (with conditions)<br>• Attic conversions (no dormer to front)<br>• Internal renovations<br>• Painting &amp; maintenance<br><br><strong>Usually needs planning:</strong><br>• Large extensions exceeding exemption limits<br>• Front extensions<br>• Significant structural alterations<br><br>We assess this at the free site visit and refer you to our trusted architects where planning is required.`,
    quick: ['Get a free site visit','House extension info','Attic conversion','Our process'],
  },

  // ── Areas ──────────────────────────────────────────
  {
    id: 'areas',
    patterns: [['area','areas','cover','where do you work','location','local','dublin','wicklow','kildare','meath','louth','south dublin','north dublin','county','near me']],
    reply: () => `We cover the greater Dublin region and surrounding counties${hi()} 📍<br><br><strong>Dublin:</strong> All D1–D24 postcodes<br><strong>Co. Dublin:</strong> Dún Laoghaire, Blackrock, Clontarf, Malahide, Swords, Tallaght &amp; all areas<br><strong>Co. Wicklow:</strong> Bray, Greystones, Wicklow town<br><strong>Co. Kildare:</strong> Naas, Newbridge, Maynooth<br><strong>Co. Meath:</strong> Navan, Trim, Dunshaughlin<br><strong>Co. Louth:</strong> Drogheda, Dundalk<br><br>Not sure if we cover your area? Just ask!`,
    quick: ['Get a free quote','Contact details','Our services'],
  },

  // ── Contact ────────────────────────────────────────
  {
    id: 'contact',
    patterns: [['contact','phone','call','email','ring','reach','speak','talk','office','hours','open','find you','address','get in touch']],
    reply: () => `Here's how to reach us${hi()} 📞<br><br>📞 <a href="${PHONE_TEL}"><strong>${PHONE}</strong></a><br>✉️ <a href="mailto:${EMAIL}">${EMAIL}</a><br>📍 Dublin, Ireland<br><br>🕐 <strong>Mon–Fri:</strong> 8:00am – 6:00pm<br>🕐 <strong>Saturday:</strong> 9:00am – 2:00pm<br>🕐 <strong>Sunday:</strong> Closed<br><br>We typically respond within <strong>2 hours</strong> during business hours.`,
    quick: ['Get a free quote','Leave my details here','Call you directly','Our services'],
  },

  // ── Before & After ─────────────────────────────────
  {
    id: 'beforeafter',
    patterns: [['before after','before and after','transformation','compare','comparison','results','photos','gallery','see work','show me','example','portfolio']],
    reply: () => `Our before &amp; after gallery shows incredible real transformations${hi()}! 📸<br><br>We have interactive comparison sliders for:<br>• 🍳 Kitchen transformation — Rathmines<br>• 🛁 Luxury en-suite — Clontarf<br>• 🏠 Open-plan living — Rathgar<br>• 🏡 Exterior repaint — Terenure<br><br>Every image is from a real completed project.`,
    quick: ['View before & after','View our projects','Get a free quote'],
  },

  // ── Reviews ────────────────────────────────────────
  {
    id: 'reviews',
    patterns: [['review','reviews','testimonial','rating','feedback','recommend','reputation','trust','reliable','past client','previous work','google']],
    reply: () => `We're very proud of our client reviews${hi()} ⭐<br><br>We hold a <strong>5.0 rating</strong> across Google, Houzz, and Checkatrade from <strong>120+ verified reviews</strong>.<br><br>Clients consistently highlight:<br>✅ On-time delivery<br>✅ Clean &amp; tidy worksite<br>✅ Clear communication<br>✅ Quality of finish<br>✅ Honest, transparent pricing<br><br>We can provide references from recent local projects on request.`,
    quick: ['Read all reviews','Get a free quote','Our projects','Contact details'],
  },

  // ── Pre-sale ───────────────────────────────────────
  {
    id: 'presale',
    patterns: [['sell','selling','for sale','property value','add value','return on investment','estate agent','ber','energy rating','before selling']],
    reply: () => `Smart thinking${hi()}! The right renovations add significant value before a sale:<br><br>🥇 <strong>Kitchen update:</strong> can add 5–10% to sale price<br>🥈 <strong>Bathroom renovation:</strong> strong buyer appeal<br>🥉 <strong>Full redecoration:</strong> immediate visual impact<br>🏅 <strong>Extension:</strong> largest value increase<br><br>We've helped many clients achieve above-asking-price sales. We'll advise on the best return for your budget.`,
    quick: ['Get a free quote','Kitchen renovation','Bathroom renovation','Painting & decorating'],
  },

  // ── Cleanliness ────────────────────────────────────
  {
    id: 'cleanliness',
    patterns: [['clean','mess','dust','tidy','dirty','disruption','noise','neighbours','daily','end of day','site clean']],
    reply: () => `We take cleanliness and respect for your home very seriously${hi()}.<br><br>Our standards:<br>• <strong>Daily clean-up</strong> — tools stored, dust sheets maintained<br>• <strong>Dust barriers</strong> — working areas properly sealed<br>• <strong>Waste management</strong> — skips managed properly<br>• <strong>Shoe covers</strong> in living areas<br>• <strong>No loud work</strong> before 8am or after 6pm<br>• <strong>Neighbour communication</strong> — we inform neighbours in advance<br><br>We treat your home as we would our own.`,
    quick: ['Get a free quote','Our process','Our guarantee'],
  },

  // ── Subcontractors ─────────────────────────────────
  {
    id: 'subcontractors',
    patterns: [['subcontract','subbies','your own team','who does the work','in-house','employed','staff','workers','tradespeople','your own guys']],
    reply: () => `We use a combination${hi()}:<br><br>👷 <strong>Directly employed tradespeople</strong> — our core team covering main trades<br>🤝 <strong>Vetted specialist subcontractors</strong> — for specialist trades (structural engineering, specialist tiling)<br><br>All subcontractors are:<br>• Personally vetted and regularly used<br>• Fully insured and certified<br>• Held to our quality and cleanliness standards<br><br>You deal with us throughout — not multiple contractors.`,
    quick: ['Our process','Are you insured?','Get a free quote'],
  },

  // ── Architect ──────────────────────────────────────
  {
    id: 'architect',
    patterns: [['architect','architectural','engineer','structural','drawing','plan','technical','specification','bcms','building control','structural engineer']],
    reply: () => `We work closely with trusted architects and structural engineers${hi()}.<br><br>For projects requiring professional design or planning:<br>• We refer you to trusted local architects we regularly work with<br>• We coordinate with them throughout the build<br>• Structural engineering is handled through our network<br>• Building Control compliance is managed by us<br><br>You don't need to find your own architect — we facilitate the entire process.`,
    quick: ['House extension','Planning permission','Our process','Get a free quote'],
  },

  // ── About / founder ────────────────────────────────
  {
    id: 'about',
    patterns: [['about you','about the company','who are you','founder','avtandil','established','history','how long in business','experience','background','team']],
    reply: () => `MTARISE CONSTRUCTION LTD was founded in 2026 by <strong>Avtandil Bitsadze</strong>${hi()} — a qualified tradesperson with <strong>9 years of hands-on residential construction experience</strong> across Dublin and surrounding areas.<br><br>What makes us different:<br>• Family-run with genuine personal investment in every project<br>• 9 years of combined team experience<br>• RECI &amp; RGII certified tradespeople<br>• €6.5m public liability insurance<br>• 12-month workmanship guarantee<br><br>We build your tomorrow, today. 🏗️`,
    quick: ['Our services','Get a free quote','Contact details','Our guarantee'],
  },

  // ── Thanks ─────────────────────────────────────────
  {
    id: 'thanks',
    patterns: [['thanks','thank you','cheers','appreciate','helpful','great','perfect','brilliant','excellent','love it','amazing','fantastic','wonderful','superb']],
    reply: () => `You're very welcome${hi()}! 😊 It's our pleasure to help.<br><br>Is there anything else I can answer — or are you ready to get your free quote started?`,
    quick: ['Get a free quote','Our services','Contact details'],
  },

  // ── Concern ────────────────────────────────────────
  {
    id: 'concern',
    patterns: [['worried','concern','nervous','bad experience','previous builder','problem','issue','trust','scared','nightmare','dodgy','cowboy','bad builder','ripped off']],
    reply: () => `We completely understand${hi()} — bad builder experiences are unfortunately common in Ireland. Here's why MTARISE is different:<br><br>✅ <strong>Fully insured</strong> — €6.5m public liability<br>✅ <strong>Written contract</strong> — everything agreed upfront<br>✅ <strong>Stage payments</strong> — you never pay in full upfront<br>✅ <strong>Dedicated project manager</strong> — one point of contact<br>✅ <strong>12-month guarantee</strong> — we stand behind our work<br>✅ <strong>120+ verified reviews</strong> — real clients, real results<br><br>We're happy to provide local references to build confidence.`,
    quick: ['Read our reviews','Our guarantee','Get a free quote','Contact details'],
  },

  // ── Yes / Confirm ──────────────────────────────────
  {
    id: 'yes',
    patterns: [['yes','yeah','yep','yup','sure','okay','ok','go ahead','sounds good','please','of course','definitely']],
    reply: () => STATE.lastTopic
      ? (() => { const e = KB.find(x => x.id === STATE.lastTopic); return e ? e.reply() : `Great${hi()}! How can I help you further?`; })()
      : `Great${hi()}! What would you like to know? I can help with quotes, pricing, services, timelines, and more.`,
    quick: ['Get a free quote','Our services','Pricing info','Contact details'],
  },

  // ── Goodbye ────────────────────────────────────────
  {
    id: 'goodbye',
    patterns: [['bye','goodbye','later','cya','see you','done','no thanks','that\'s all','all good','got what i need','talk later']],
    reply: () => `Thanks for chatting with us${hi()}! 👋<br><br>Don't hesitate to get in touch anytime — we'd love to hear about your project.<br><br>📞 <a href="${PHONE_TEL}">${PHONE}</a> &nbsp;|&nbsp; ✉️ <a href="mailto:${EMAIL}">${EMAIL}</a>`,
    quick: ['Get a free quote'],
  },
];

// ─── Quick reply action map ───────────────────────────
const QR = {
  'Get a free quote':               () => promptLead(),
  'Start my quote now':             () => { location.href = 'quote.html'; },
  'Fill in quote form':             () => { location.href = 'quote.html'; },
  'Leave my details here':          () => promptLead(),
  'Book a free assessment':         () => promptLead(),
  'Get a free site visit':          () => promptLead(),
  'Get a free assessment':          () => promptLead(),
  'View before & after':            () => { location.href = 'beforeafter.html'; },
  'See before & after':             () => { location.href = 'beforeafter.html'; },
  'Before & after':                 () => { location.href = 'beforeafter.html'; },
  'View our projects':              () => { location.href = 'projects.html'; },
  'View projects':                  () => { location.href = 'projects.html'; },
  'See our projects':               () => { location.href = 'projects.html'; },
  'Our projects':                   () => { location.href = 'projects.html'; },
  'Read all reviews':               () => { location.href = 'testimonials.html'; },
  'Read our reviews':               () => { location.href = 'testimonials.html'; },
  'Our services':                   () => respond('services'),
  'Contact details':                () => respond('contact'),
  'Are you insured?':               () => respond('insurance'),
  'Are you certified?':             () => respond('certifications'),
  'Are you RECI registered?':       () => respond('certifications'),
  'Are you RGII certified?':        () => respond('certifications'),
  'Our guarantee':                  () => respond('guarantee'),
  'Guarantee info':                 () => respond('guarantee'),
  'Our process':                    () => respond('process'),
  'Payment terms':                  () => respond('payment'),
  'Pricing info':                   () => respond('pricing'),
  'How long does it take?':         () => respond('timeline'),
  'How long does a quote take?':    () => respond('quote_time'),
  'Do I need planning permission?': () => respond('planning'),
  'Do I need planning?':            () => respond('planning'),
  'Do you supply fixtures?':        () => respond('bathroom_fixtures'),
  'Do I supply fixtures?':          () => respond('bathroom_fixtures'),
  'Bathroom renovation':            () => respond('bathroom'),
  'Bathroom pricing':               () => respond('pricing'),
  'Kitchen renovation':             () => respond('kitchen'),
  'Kitchen pricing':                () => respond('pricing'),
  'Can you design it?':             () => respond('kitchen_design'),
  'What worktops are available?':   () => postBot('We offer a range of worktops:<br><br>🏆 <strong>Quartz</strong> — most popular, durable, low maintenance<br>🪨 <strong>Granite</strong> — natural stone, unique patterns<br>🌳 <strong>Solid oak/walnut</strong> — warm, traditional<br>💎 <strong>Dekton</strong> — ultra-premium, heat-resistant<br>✅ <strong>Laminate</strong> — budget-friendly, wide choice<br><br>We\'ll help you choose based on your budget and style at the consultation.', ['Get a free quote', 'Kitchen renovation']),
  'House extension':                () => respond('extension'),
  'House extension info':           () => respond('extension'),
  'Extension pricing':              () => respond('pricing'),
  'Open plan kitchen':              () => respond('open_plan'),
  'Attic conversion':               () => respond('attic'),
  'Attic conversion info':          () => respond('attic'),
  'Is my attic suitable?':          () => respond('attic_suitable'),
  'Attic with en-suite':            () => respond('attic'),
  'Painting':                       () => respond('painting'),
  'Painting & decorating':          () => respond('painting'),
  'Exterior painting':              () => respond('painting'),
  'Interior painting':              () => respond('painting'),
  'Colour consultation':            () => postBot('Yes — we offer a colour consultation as part of our painting projects. We advise on colour schemes, sheen levels, and finishes to suit your home\'s style and lighting. Just mention it when requesting your quote.', ['Get a free quote', 'Painting service']),
  'Wallpaper':                      () => postBot('Our decorators handle all types of wallpaper — paste-the-wall, traditional, feature walls, and specialist finishes. We also handle full wallpaper removal and surface preparation.', ['Get a free quote', 'Painting service']),
  'Plumbing':                       () => respond('plumbing'),
  'Boiler replacement':             () => postBot('We replace gas and oil boilers — supply and installation. We work with leading brands and advise on the most efficient system for your home. SEAI grants may apply. RGII certification on completion.', ['Get a free quote', 'Plumbing services', 'Are you RGII certified?']),
  'Underfloor heating':             () => postBot('We install both water-fed and electric underfloor heating. Water-fed systems suit large areas and heat pumps. Electric systems are ideal for bathrooms and smaller rooms. We\'ll advise during your site visit.', ['Get a free quote', 'Bathroom renovation', 'Plumbing services']),
  'Emergency repair':               () => respond('emergency'),
  'Call now':                       () => postBot(`Please call us directly on 📞 <a href="${PHONE_TEL}"><strong>${PHONE}</strong></a><br><br>We\'re available Mon–Fri 8am–6pm and Saturday 9am–2pm. For genuine emergencies outside hours, please leave a voicemail and we\'ll respond as soon as possible.`, ['Contact details']),
  'Call you directly':              () => respond('contact'),
  'Send email':                     () => postBot(`You can email us at ✉️ <a href="mailto:${EMAIL}">${EMAIL}</a><br><br>We respond to all emails within 2 hours during business hours. Please include a brief project description and your contact number.`, ['Get a free quote', 'Contact details']),
  'Electrical':                     () => respond('electrical'),
  'Electrical services':            () => respond('electrical'),
  'Rewire my home':                 () => respond('electrical'),
  'Consumer unit upgrade':          () => respond('electrical'),
  'EV charger':                     () => respond('ev_charger'),
  'Repairs':                        () => respond('repairs'),
  'Damp problems':                  () => respond('damp'),
  'Roof repair':                    () => respond('repairs'),
  'Who manages the project?':       () => respond('project_manager'),
  'What info do you need?':         () => postBot('To prepare an accurate quote, it helps to have:<br><br>📋 <strong>Type of project</strong> — bathroom, kitchen, extension, etc.<br>📐 <strong>Rough size</strong> — floor area or room dimensions<br>🏠 <strong>Property type</strong> — house, apartment, bungalow<br>📍 <strong>Location</strong> — your address or area<br>💰 <strong>Budget range</strong> — if you have one in mind<br>📅 <strong>Ideal start date</strong> — rough timeframe<br><br>Don\'t worry if you don\'t have all of this — we gather details during the free site visit.', ['Get a free quote', 'Leave my details here']),
  'SEAI grant info':                () => postBot('SEAI (Sustainable Energy Authority of Ireland) offers grants for energy upgrades:<br><br>⚡ <strong>EV charger:</strong> up to €300<br>🏠 <strong>Insulation:</strong> up to €8,000<br>🌡️ <strong>Heat pump:</strong> up to €6,500<br>🪟 <strong>Windows &amp; doors:</strong> up to €1,500<br><br>We work with SEAI-registered contractors and advise on which grants apply. Visit seai.ie for full details.', ['Get a free quote', 'EV charger', 'Contact details']),
  'Do I need to move out?':         () => respond('move_out'),
  'Full renovation info':           () => respond('renovation'),
  'What affects the price?':        () => respond('price_factors'),
  'About the company':              () => respond('about'),
};

// ─── Scoring engine ───────────────────────────────────
function scoreEntry(entry, text) {
  let score = 0;
  for (const group of entry.patterns) {
    if (group.some(kw => text.includes(kw))) score++;
  }
  return score;
}

function findBestMatch(text) {
  let best = null, bestScore = 0;
  for (const entry of KB) {
    const s = scoreEntry(entry, text);
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  return bestScore > 0 ? best : null;
}

function respond(id) {
  const entry = KB.find(e => e.id === id);
  if (entry) postBot(entry.reply(), entry.quick);
}

// ─── Lead capture ─────────────────────────────────────
function promptLead() {
  if (STATE.leadStage >= 4) {
    postBot(`We already have your details${hi()} — our team will be in touch very soon! 😊 Is there anything else I can help with?`, ['Our services', 'Contact details']);
    return;
  }
  postBot(`I can take your details right now and have someone call you back! 🚀<br><br>What's your name?`, []);
  STATE.awaitLead = 'name';
}

function handleLead(text) {
  if (STATE.awaitLead === 'name') {
    STATE.userName = text.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    STATE.userName = STATE.userName.charAt(0).toUpperCase() + STATE.userName.slice(1);
    STATE.leadStage = 1;
    STATE.awaitLead = 'email';
    postBot(`Lovely to meet you, <strong>${STATE.userName}</strong>! 😊<br><br>What's the best email address for us to reach you?`, []);
    return true;
  }
  if (STATE.awaitLead === 'email') {
    STATE.userEmail = text;
    STATE.leadStage = 2;
    STATE.awaitLead = 'phone';
    postBot(`Perfect! And your phone number so we can arrange the free site visit?`, []);
    return true;
  }
  if (STATE.awaitLead === 'phone') {
    STATE.userPhone = text;
    STATE.leadStage = 3;
    STATE.awaitLead = 'project';
    postBot(`Almost done${hi()}! Last thing — what type of project are you thinking about? (e.g. bathroom, kitchen, extension, full renovation...)`, []);
    return true;
  }
  if (STATE.awaitLead === 'project') {
    STATE.leadStage = 4;
    STATE.awaitLead = null;
    postBot(`Brilliant, ${STATE.userName}! 🎉 We have everything we need.<br><br>Our team will be in touch within <strong>24 hours</strong> to arrange your free site visit and quotation.<br><br>In the meantime, feel free to browse our <a href="projects.html">completed projects</a> or <a href="beforeafter.html">before &amp; after gallery</a> for inspiration!`, ['View our projects', 'Before & after', 'Our services']);
    return true;
  }
  return false;
}

// ─── DOM Helpers ──────────────────────────────────────
function toggleChat() {
  STATE.open = !STATE.open;
  $('chatWindow').classList.toggle('hidden', !STATE.open);
  $('chatOpenIcon').classList.toggle('hidden', STATE.open);
  $('chatCloseIcon').classList.toggle('hidden', !STATE.open);
  $('chatUnread').classList.add('hidden');
  if (STATE.open && !STATE.started) { STATE.started = true; setTimeout(greet, 350); }
  if (STATE.open) setTimeout(() => $('chatInput') && $('chatInput').focus(), 300);
}

function scrollBottom() {
  const m = $('chatMessages');
  if (m) m.scrollTop = m.scrollHeight;
}

function addMessage(html, role) {
  const d = document.createElement('div');
  d.className = 'chat-msg ' + role;
  d.innerHTML = `<div class="chat-bubble">${html}</div>`;
  $('chatMessages').appendChild(d);
  STATE.history.push({ role, html });
  scrollBottom();
}

function showTypingIndicator() {
  const t = document.createElement('div');
  t.id = 'typingIndicator'; t.className = 'chat-msg bot';
  t.innerHTML = '<div class="chat-bubble typing-bubble"><span></span><span></span><span></span></div>';
  $('chatMessages').appendChild(t);
  scrollBottom();
}

function hideTypingIndicator() {
  const t = $('typingIndicator');
  if (t) t.remove();
}

function setQuickReplies(items) {
  const qr = $('quickReplies');
  if (!qr) return;
  qr.innerHTML = '';
  (items || []).forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'qr-btn'; btn.textContent = label;
    btn.onclick = () => handleQuickReply(label);
    qr.appendChild(btn);
  });
}

function postBot(html, quick, delay) {
  setQuickReplies([]);
  showTypingIndicator();
  clearTimeout(STATE.typingTimer);
  const d = delay || Math.min(600 + html.length * 0.8, 2200);
  STATE.typingTimer = setTimeout(() => {
    hideTypingIndicator();
    addMessage(html, 'bot');
    setQuickReplies(quick || []);
    STATE.messageCount++;
    scrollBottom();
  }, d);
}

// ─── Main message processor ───────────────────────────
function sendUserMessage() {
  const input = $('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMessage(text, 'user');
  setQuickReplies([]);
  if (STATE.awaitLead) { handleLead(text); return; }
  processText(text);
}

function handleQuickReply(label) {
  addMessage(label, 'user');
  setQuickReplies([]);
  if (STATE.awaitLead) { handleLead(label); return; }
  if (QR[label]) { QR[label](); return; }
  processText(label.toLowerCase());
}

function processText(raw) {
  const text = raw.toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();

  const match = findBestMatch(text);

  if (match) {
    STATE.lastTopic = match.id;
    STATE.seenTopics.add(match.id);
    postBot(match.reply(), match.quick);
  } else {
    const fallbacks = [
      `I want to make sure I give you the right answer${hi()} — could you rephrase that, or pick from the options below? Our team is also available directly on 📞 <a href="${PHONE_TEL}">${PHONE}</a>`,
      `Good question! For the most accurate answer I'd recommend speaking with our team directly — but I can also help get your free quote started right now.`,
      `I'm not 100% sure I have that answer${hi()}, but our team definitely will! Call us on 📞 <a href="${PHONE_TEL}">${PHONE}</a> or leave your details and we'll call you back.`,
    ];
    postBot(fallbacks[STATE.messageCount % fallbacks.length], ['Get a free quote', 'Our services', 'Contact details', 'Leave my details here']);
  }
}

// ─── Greeting ─────────────────────────────────────────
function greet() {
  addMessage(
    `${getGreeting()}! 👋 Welcome to <strong>MTARISE CONSTRUCTION LTD</strong>.<br>I'm here to answer your questions about our residential construction and renovation services — and help you get started with a <strong>free quote</strong>.<br><br>What can I help you with today?`,
    'bot'
  );
  setTimeout(() => setQuickReplies(['Get a free quote', 'Our services', 'Bathroom renovation', 'Kitchen renovation', 'House extension', 'Attic conversion', 'Pricing info', 'Contact details']), 200);
}

// ─── Unread badge after 3s ────────────────────────────
setTimeout(() => {
  if (!STATE.open) $('chatUnread') && $('chatUnread').classList.remove('hidden');
}, 3000);
