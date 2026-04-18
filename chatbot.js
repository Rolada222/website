/* ===================================================
   MTARISE CONSTRUCTION LTD — Advanced Chatbot v2
   chatbot.js — scored matching, context awareness,
   conversation memory, natural language handling
   =================================================== */
'use strict';

// ─── Conversation State ───────────────────────────────
const STATE = {
  open:         false,
  started:      false,
  userName:     '',
  userEmail:    '',
  userPhone:    '',
  leadStage:    0,        // 0=none 1=name 2=email 3=phone 4=done
  awaitLead:    null,     // 'name'|'email'|'phone'|'project'|null
  lastTopic:    null,     // last KB topic matched
  history:      [],       // [{role,text}]
  messageCount: 0,
  typingTimer:  null,
  seenTopics:   new Set(),
};

// ─── Helpers ──────────────────────────────────────────
const $  = id => document.getElementById(id);
const hi = () => STATE.userName ? `, ${STATE.userName}` : '';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Knowledge Base ───────────────────────────────────
// Each entry: { id, patterns[], reply(), quick[], follow[] }
// patterns: array of keyword groups — each group is OR'd, groups are AND'd
// score: how many patterns matched determines priority

const KB = [

  // ── Greetings ──────────────────────────────────────
  {
    id: 'greeting',
    patterns: [['hello','hi','hey','howya','how are','hiya','sup','good morning','good afternoon','good evening','morning','evening','afternoon','greetings']],
    reply: () => `${getGreeting()}${hi()}! 👋 Welcome to <strong>MTARISE CONSTRUCTION LTD</strong>.<br><br>I'm your virtual assistant, here to answer any questions about our residential construction and renovation services — and help you get a free quote.<br><br>What can I help you with today?`,
    quick: ['Get a free quote','Our services','Bathroom renovation','Kitchen renovation','House extension','Attic conversion','Pricing info','Contact details'],
  },

  // ── Quote / Pricing ────────────────────────────────
  {
    id: 'quote',
    patterns: [['quote','quotation','estimate','free quote','get a quote','request a quote']],
    reply: () => `Great news — all our quotations are <strong>100% free and with no obligation</strong>. 🏗️<br><br>Here's how it works:<br><ol style="padding-left:16px;margin-top:8px"><li>You fill in our <a href="#" onclick="location.href='quote.html'">online quote form</a> or call us</li><li>We arrange a <strong>free site visit</strong> at your convenience</li><li>You receive a detailed written quotation within <strong>5 working days</strong></li></ol><br>No hidden costs. No pressure. Just an honest breakdown of your project.`,
    quick: ['Fill in quote form','Leave my details here','Call you directly','What info do you need?','How long does a quote take?'],
  },
  {
    id: 'pricing',
    patterns: [['price','pricing','cost','how much','expensive','cheap','affordable','budget','rates','charge','fee']],
    reply: () => `Pricing depends on the scope and specification of each project — so we don't publish standard rates${hi()}. Here's a general guide: 💰<br><br><strong>Bathroom renovation:</strong> from €5,000–€25,000+<br><strong>Kitchen renovation:</strong> from €8,000–€40,000+<br><strong>House extension (25m²):</strong> from €50,000–€90,000+<br><strong>Attic conversion:</strong> from €30,000–€60,000+<br><strong>Full renovation:</strong> from €40,000–€200,000+<br><br>These are indicative ranges. Your free quote will give an exact figure based on your home and requirements.`,
    quick: ['Get a free quote','What affects the price?','Bathroom pricing','Kitchen pricing','Extension pricing'],
  },
  {
    id: 'price_factors',
    patterns: [['what affect','factor','influence','depend','why different','why vary','varies']],
    reply: () => `Great question${hi()}! Several factors affect the final cost of your project: 📋<br><br>• <strong>Size</strong> — floor area and number of rooms involved<br>• <strong>Specification</strong> — standard vs luxury materials and finishes<br>• <strong>Structural work</strong> — walls removed, beams, foundations<br>• <strong>Access</strong> — ease of site access for materials and skips<br>• <strong>Existing condition</strong> — older properties often need more prep work<br>• <strong>Location</strong> — Dublin city centre vs suburban areas<br><br>Our free site visit lets us account for all of these accurately.`,
    quick: ['Get a free quote','Our services','Contact details'],
  },

  // ── Services overview ──────────────────────────────
  {
    id: 'services',
    patterns: [['service','services','what do you do','what do you offer','what can you do','what work','offer','speciali']],
    reply: () => `We're a full-service residential construction company${hi()}. Here's everything we offer: 🔨<br><br>🏗️ <strong>Residential Construction</strong> — new builds &amp; structural work<br>🔨 <strong>Home Renovation</strong> — full property transformations<br>🏠 <strong>House Extensions</strong> — rear, side, double-storey<br>🪜 <strong>Attic Conversions</strong> — new bedroom or office<br>🛁 <strong>Bathroom Renovation</strong> — luxury redesigns<br>🍳 <strong>Kitchen Renovation</strong> — full fit-outs<br>🪣 <strong>Painting &amp; Decorating</strong> — interior &amp; exterior<br>🔧 <strong>Plumbing Works</strong> — full installation &amp; repair<br>⚡ <strong>Electrical Works</strong> — RECI certified<br>🔩 <strong>Repairs &amp; Maintenance</strong> — no job too small<br><br>Which service are you interested in?`,
    quick: ['Bathroom renovation','Kitchen renovation','House extension','Attic conversion','Painting','Plumbing','Electrical','Repairs'],
  },

  // ── Bathroom ───────────────────────────────────────
  {
    id: 'bathroom',
    patterns: [['bathroom','bath','shower','wet room','en suite','ensuite','toilet','washroom','wc']],
    reply: () => `Bathroom renovations are one of our most popular services${hi()}! 🛁<br><br>We handle the complete project:<br>• Full strip-out &amp; structural prep<br>• Replastering &amp; waterproofing<br>• Walk-in showers, wet rooms &amp; baths<br>• Large format &amp; mosaic tiling<br>• Bespoke vanity units &amp; storage<br>• Underfloor heating<br>• All plumbing &amp; electrical included<br><br>⏱ <strong>Typical timeline:</strong> 1–2 weeks<br>💰 <strong>Starting from:</strong> €5,000<br><br>Would you like a free quote for your bathroom?`,
    quick: ['Get a free quote','Bathroom pricing','How long does it take?','Do you supply fixtures?','See before & after'],
  },
  {
    id: 'bathroom_fixtures',
    patterns: [['supply','fixture','fitting','tile','sanitary','toilet','basin','sink','tap','shower tray']],
    reply: () => `We can work either way${hi()}:<br><br>✅ <strong>Supply &amp; fit</strong> — we source and supply all fixtures, fittings, tiles, and sanitaryware using our trade accounts (often cheaper than retail)<br><br>✅ <strong>Fit only</strong> — if you've already chosen and purchased your own fixtures, we're happy to fit them to your spec<br><br>We'll advise on both options during the free site visit.`,
    quick: ['Get a free quote','Bathroom renovation','Kitchen renovation'],
  },

  // ── Kitchen ────────────────────────────────────────
  {
    id: 'kitchen',
    patterns: [['kitchen','fitted kitchen','worktop','units','cabinet','cupboard','island','splashback']],
    reply: () => `A new kitchen completely transforms your home and adds serious value${hi()}! 🍳<br><br>Our kitchen service includes:<br>• Design consultation &amp; planning<br>• Supply &amp; fit of kitchen units<br>• Worktops: quartz, granite, solid wood, or laminate<br>• Tiled splashbacks &amp; floor tiling<br>• All plumbing &amp; appliance connections<br>• Electrical points, under-cabinet &amp; ceiling lighting<br>• Full replastering where needed<br><br>⏱ <strong>Typical timeline:</strong> 2–4 weeks<br>💰 <strong>Starting from:</strong> €8,000<br><br>Want us to visit and quote your kitchen?`,
    quick: ['Get a free quote','Kitchen pricing','Can you design it?','What worktops are available?','See our projects'],
  },
  {
    id: 'kitchen_design',
    patterns: [['design','designer','plan','layout','3d','render','concept']],
    reply: () => `We work closely with specialist kitchen designers${hi()}. Our process:<br><br>1. We assess your space and discuss your style preferences<br>2. A kitchen designer creates a detailed layout and 3D render<br>3. You approve before anything is ordered<br>4. We handle the full installation<br><br>Design is coordinated through our trusted partners and included in your project quotation.`,
    quick: ['Get a free quote','Kitchen renovation','Contact details'],
  },

  // ── Extension ──────────────────────────────────────
  {
    id: 'extension',
    patterns: [['extension','extend','rear extension','side extension','double storey','single storey','build on','add on','annex','conservatory']],
    reply: () => `A house extension is the smartest way to gain space without the cost and stress of moving${hi()}! 🏠<br><br>We build:<br>• Single-storey rear extensions<br>• Side return extensions<br>• Double-storey extensions<br>• Wrap-around extensions<br>• Garage conversions<br>• Porch additions<br><br>We handle everything: planning consultation, structural engineering, build, and full internal fit-out.<br><br>⏱ <strong>Typical timeline:</strong> 8–16 weeks<br>💰 <strong>From €50,000</strong> for a 25m² single-storey<br><br>Would you like a free site assessment?`,
    quick: ['Get a free quote','Do I need planning permission?','How long does it take?','Extension pricing','Open plan kitchen'],
  },
  {
    id: 'open_plan',
    patterns: [['open plan','knock wall','remove wall','knock through','open up','wall removed','wall down','structural wall']],
    reply: () => `Knocking through to create open-plan living is one of the most popular home improvements${hi()}! 🏗️<br><br>What's involved:<br>• Structural survey to identify load-bearing walls<br>• Steel beam (RSJ) installation where required<br>• Building control approval if needed<br>• Replastering, flooring &amp; decoration<br><br>⚠️ Always use a professional for structural wall removal — we ensure full compliance with Irish building regulations.<br><br>Want us to assess your property?`,
    quick: ['Get a free quote','House extension','Do I need planning?','Pricing info'],
  },

  // ── Attic ──────────────────────────────────────────
  {
    id: 'attic',
    patterns: [['attic','loft','roof room','roof conversion','attic bedroom','attic office','loft conversion']],
    reply: () => `An attic conversion is one of the best-value ways to add a bedroom — without going outward${hi()}! 🪜<br><br>We handle:<br>• Structural assessment &amp; steel work<br>• Velux or dormer window installation<br>• New timber floor &amp; insulation<br>• Staircase design &amp; installation<br>• En-suite bathroom if required<br>• Full fire compliance (doors, alarms)<br>• Complete plastering &amp; decoration<br><br>⏱ <strong>Typical timeline:</strong> 4–8 weeks<br>💰 <strong>Starting from:</strong> €30,000<br><br>We can assess your attic's suitability for free!`,
    quick: ['Get a free quote','Is my attic suitable?','Do I need planning?','Attic with en-suite','How long does it take?'],
  },
  {
    id: 'attic_suitable',
    patterns: [['suitable','height','head','room','fit','usable','possible','can i convert']],
    reply: () => `Great question${hi()}! Here's what determines attic suitability:<br><br>✅ <strong>Minimum head height:</strong> 2.2m at the ridge<br>✅ <strong>Roof pitch:</strong> ideally 30° or steeper<br>✅ <strong>Structural condition:</strong> rafters and joists must be assessed<br>✅ <strong>Floor space:</strong> typically 15m²+ usable area<br><br>We assess all of this completely free during a site visit. Most attics in standard Irish homes can be converted.`,
    quick: ['Book a free assessment','Get a free quote','Attic conversion info'],
  },

  // ── Painting ───────────────────────────────────────
  {
    id: 'painting',
    patterns: [['paint','painting','decorating','decorator','decorate','redecorate','colour','color','wall','ceiling','exterior paint','interior paint']],
    reply: () => `Our professional painters deliver a flawless finish every time${hi()}! 🪣<br><br>Services include:<br>• <strong>Interior painting</strong> — walls, ceilings, woodwork, coving<br>• <strong>Exterior painting</strong> — masonry, render, fascia, soffits<br>• Full surface preparation &amp; priming<br>• Anti-mould treatment where needed<br>• Wallpaper hanging &amp; removal<br>• Specialist &amp; feature wall finishes<br>• Colour consultation available<br><br>⏱ <strong>Full interior:</strong> 3–7 days<br>⏱ <strong>Exterior:</strong> 4–10 days depending on size<br><br>Would you like a free painting quote?`,
    quick: ['Get a free quote','Exterior painting','Interior painting','Colour consultation','Wallpaper'],
  },

  // ── Plumbing ───────────────────────────────────────
  {
    id: 'plumbing',
    patterns: [['plumb','plumbing','boiler','heating','radiator','pipe','leak','water','hot water','cylinder','heating system','pressure']],
    reply: () => `Our fully RGII-certified plumbers cover all residential plumbing needs${hi()}! 🔧<br><br>Services include:<br>• Full property plumbing installations<br>• Central heating system installation &amp; upgrades<br>• Boiler replacement (gas &amp; oil)<br>• Bathroom &amp; kitchen plumbing<br>• Underfloor heating systems<br>• Water pressure &amp; cylinder work<br>• Leak detection &amp; emergency repairs<br><br>All plumbing work is certified and fully guaranteed.`,
    quick: ['Get a free quote','Boiler replacement','Underfloor heating','Emergency repair','Are you RGII certified?'],
  },
  {
    id: 'emergency',
    patterns: [['emergency','urgent','asap','immediately','burst','flood','leak now','help now','today','right now']],
    reply: () => `For urgent issues${hi()}, please <strong>call us directly</strong> on 📞 <a href="tel:+353XXXXXXXXX"><strong>+353 XX XXX XXXX</strong></a> so we can assess the situation and get someone to you as quickly as possible.<br><br>For active leaks:<br>• Turn off your mains stopcock immediately<br>• Turn off electricity in affected areas if safe<br>• Call us and we'll advise from there`,
    quick: ['Call now','Contact details'],
  },

  // ── Electrical ─────────────────────────────────────
  {
    id: 'electrical',
    patterns: [['electric','electrical','rewire','socket','plug','lighting','light','fuse','consumer unit','board','ev charger','alarm','smoke','carbon']],
    reply: () => `All our electrical work is carried out by <strong>RECI registered electricians</strong> and fully certified${hi()}! ⚡<br><br>Services include:<br>• Full property electrical rewires<br>• Consumer unit (fuse board) upgrades<br>• Additional sockets, circuits &amp; lighting<br>• EV car charger installation<br>• Smoke &amp; carbon monoxide alarm systems<br>• External security lighting<br>• Electrical safety certificates (ECTI)<br><br>All completed work comes with full certification documents.`,
    quick: ['Get a free quote','EV charger','Rewire my home','Consumer unit upgrade','Are you RECI registered?'],
  },
  {
    id: 'ev_charger',
    patterns: [['ev charger','electric car','electric vehicle','car charger','home charger','seai','grant']],
    reply: () => `We install EV home chargers and can guide you through the <strong>SEAI grant process</strong>${hi()}! ⚡🚗<br><br>• SEAI grant available: up to <strong>€300</strong> off installation<br>• We install leading brands: Zappi, Ohme, Wallbox<br>• Smart chargers with app control<br>• Installation typically takes <strong>3–4 hours</strong><br>• Full electrical certification provided<br><br>Want us to handle the full installation and grant application?`,
    quick: ['Get a free quote','SEAI grant info','Electrical services','Contact details'],
  },

  // ── Repairs ────────────────────────────────────────
  {
    id: 'repairs',
    patterns: [['repair','maintenance','fix','snag','snagging','small job','minor','damp','roof','gutter','fascia','soffit','crack','window','door']],
    reply: () => `No job is too small for us${hi()}! 🔩<br><br>Our repair and maintenance service covers:<br>• General snag &amp; repair works<br>• Roof repairs &amp; tile replacement<br>• Gutter cleaning &amp; repair<br>• Fascia &amp; soffit replacement<br>• Window &amp; door repairs<br>• Damp treatment &amp; proofing<br>• Cracked render &amp; plaster repair<br>• General property upkeep<br><br>We can often visit for smaller jobs within 3–5 working days.`,
    quick: ['Get a free quote','Damp problems','Roof repair','Contact details'],
  },
  {
    id: 'damp',
    patterns: [['damp','mould','mold','moisture','rising damp','penetrating damp','condensation','wet wall','black mould']],
    reply: () => `Damp is one of the most common issues in Irish homes — but it's very treatable${hi()}! 💧<br><br>We identify the type first:<br>• <strong>Rising damp</strong> — enters from the ground<br>• <strong>Penetrating damp</strong> — enters through walls or roof<br>• <strong>Condensation</strong> — from ventilation issues<br><br>Treatment includes:<br>• Damp-proof course (DPC) injection<br>• Waterproof render application<br>• Ventilation improvement<br>• Full replastering after treatment<br><br>We offer a free assessment to identify the cause.`,
    quick: ['Get a free assessment','Repairs &amp; maintenance','Contact details'],
  },

  // ── Full renovation ────────────────────────────────
  {
    id: 'renovation',
    patterns: [['renovate','renovation','refurbish','refurbishment','full house','whole house','complete house','overhaul','transform','full renovation','gut','gut out']],
    reply: () => `A full home renovation is our most comprehensive service${hi()} — and the most rewarding! 🔨<br><br>We manage everything under one contract:<br>• Detailed project plan &amp; schedule<br>• Full strip-out &amp; structural alterations<br>• Replastering &amp; drylining throughout<br>• New flooring (timber, tile, LVT)<br>• Full electrical rewire<br>• Plumbing upgrade &amp; re-route<br>• New kitchen &amp; bathrooms<br>• Complete interior decoration<br><br>One dedicated project manager. One point of contact. No juggling multiple trades.<br><br>⏱ <strong>Typical timeline:</strong> 3–6 months<br>💰 <strong>Starting from:</strong> €40,000`,
    quick: ['Get a free quote','Do I need to move out?','How long does it take?','Project management','Pricing info'],
  },
  {
    id: 'move_out',
    patterns: [['move out','stay','live in','vacate','leave house','stay home','move away','alternative','accommodation']],
    reply: () => `This depends on the scale of the work${hi()}:<br><br>🏠 <strong>Partial renovation</strong> (one room at a time) — most clients stay in the property. We seal off working areas and maintain living standards.<br><br>🔨 <strong>Full home renovation</strong> — we recommend alternative accommodation for the main construction phase (typically 8–12 weeks). We work with you to plan this in advance.<br><br>We discuss this in detail during the site visit and plan the project schedule to minimise disruption.`,
    quick: ['Get a free quote','Full renovation info','How long does it take?'],
  },

  // ── Process ────────────────────────────────────────
  {
    id: 'process',
    patterns: [['process','how does it work','what happens','step','procedure','start to finish','beginning','what to expect','stages']],
    reply: () => `Our process is simple and transparent${hi()}:<br><br><strong>Step 1 — Contact us</strong><br>Call, email, or fill in our quote form<br><br><strong>Step 2 — Free site visit</strong><br>We visit your property, listen to your vision, and assess the scope<br><br><strong>Step 3 — Written quotation</strong><br>Detailed, itemised quote within 5 working days — no hidden costs<br><br><strong>Step 4 — Contract &amp; scheduling</strong><br>You approve, we agree a start date and assign your project manager<br><br><strong>Step 5 — Build &amp; communication</strong><br>Regular updates throughout, clean worksite daily<br><br><strong>Step 6 — Handover &amp; aftercare</strong><br>Final walkthrough, snag completion, 12-month guarantee`,
    quick: ['Get a free quote','How long does a quote take?','Who manages the project?','Payment terms'],
  },
  {
    id: 'project_manager',
    patterns: [['project manager','who manages','who is in charge','contact person','manage','oversee','supervisor','site manager']],
    reply: () => `Every project gets a <strong>dedicated project manager</strong> assigned before work starts${hi()}.<br><br>Your PM is your single point of contact throughout the entire project. They:<br>• Coordinate all trades on site<br>• Send you regular progress updates<br>• Handle any issues that arise immediately<br>• Manage the project schedule<br>• Conduct the final walkthrough with you<br><br>No chasing multiple people. One call gets you answers.`,
    quick: ['Get a free quote','Our process','Contact details'],
  },

  // ── Timeline ───────────────────────────────────────
  {
    id: 'timeline',
    patterns: [['how long','time','duration','timeline','weeks','months','days','take','when','start','finish','complete']],
    reply: () => `Here are typical project timelines${hi()} ⏱️<br><br>🛁 <strong>Bathroom renovation:</strong> 1–2 weeks<br>🍳 <strong>Kitchen renovation:</strong> 2–4 weeks<br>🪣 <strong>Painting (full interior):</strong> 3–7 days<br>🪜 <strong>Attic conversion:</strong> 4–8 weeks<br>🏠 <strong>Single-storey extension:</strong> 10–14 weeks<br>🏗️ <strong>Double-storey extension:</strong> 14–20 weeks<br>🔨 <strong>Full home renovation:</strong> 12–24 weeks<br><br>All timelines include a detailed schedule agreed before work starts. We always deliver on time.`,
    quick: ['Get a free quote','Our process','Bathroom renovation','Kitchen renovation','House extension'],
  },
  {
    id: 'quote_time',
    patterns: [['how long quote','how long quotation','quote time','when will i get','how fast quote','how quick']],
    reply: () => `After our free site visit, you'll receive your detailed written quotation within <strong>5 working days</strong>${hi()}.<br><br>For smaller jobs (painting, repairs), we often turn quotes around in <strong>48 hours</strong>.<br><br>The quote includes a full itemised breakdown — materials, labour, and timeline — so you know exactly what you're getting.`,
    quick: ['Get a free quote','Our process','Contact details'],
  },

  // ── Insurance & Certs ──────────────────────────────
  {
    id: 'insurance',
    patterns: [['insure','insured','insurance','liability','cover','covered','policy']],
    reply: () => `Yes — we carry <strong>full professional insurance</strong> on every project${hi()} 🛡️<br><br>• <strong>Public Liability:</strong> €6.5 million coverage<br>• <strong>Employer's Liability:</strong> fully covered<br>• All subcontractors are vetted for appropriate insurance<br><br>Certificates are available on request and provided as standard before any work commences on your property.`,
    quick: ['Are you certified?','Guarantee info','Get a free quote','Contact details'],
  },
  {
    id: 'certifications',
    patterns: [['certif','reci','rgii','registered','qualif','license','licence','accredit','approved']],
    reply: () => `All our tradespeople are fully qualified and certified${hi()} ✅<br><br>⚡ <strong>Electricians:</strong> RECI registered<br>🔧 <strong>Plumbers:</strong> RGII certified<br>🏗️ <strong>Construction:</strong> fully compliant with Irish Building Regulations<br><br>On completion you receive:<br>• Electrical certification (ECTI)<br>• Plumbing certification (RGII)<br>• Building compliance documentation<br><br>All certifications are provided as standard — no extra charge.`,
    quick: ['Are you insured?','Our guarantee','Get a free quote'],
  },
  {
    id: 'guarantee',
    patterns: [['guarantee','warranty','aftercare','after care','after-care','stand behind','backing','warranted']],
    reply: () => `We back every project with a <strong>12-month workmanship guarantee</strong>${hi()} ⭐<br><br>Here's our commitment:<br>• If any defect arises from our work within 12 months, we return and fix it at <strong>no cost</strong><br>• We respond to aftercare requests within <strong>48 hours</strong><br>• Our reputation depends on the quality of finished work — we take that very seriously<br><br>Beyond 12 months, manufacturers' warranties apply to materials and products.`,
    quick: ['Get a free quote','Our process','Are you insured?','Contact details'],
  },

  // ── Payment ────────────────────────────────────────
  {
    id: 'payment',
    patterns: [['pay','payment','deposit','stage payment','instalment','installment','how do i pay','when to pay','finance']],
    reply: () => `We operate on a transparent <strong>stage payment</strong> system${hi()} 💳<br><br>Typically:<br>• <strong>Deposit</strong> on contract signing (10–20% depending on project size)<br>• <strong>Stage payments</strong> tied to agreed project milestones<br>• <strong>Final payment</strong> on your sign-off at handover<br><br>You only pay for work that has been completed and inspected. Full payment terms are clearly outlined in your written contract before any work begins.`,
    quick: ['Get a free quote','Our process','Contact details'],
  },

  // ── Planning permission ────────────────────────────
  {
    id: 'planning',
    patterns: [['planning','permission','council','planning permission','exempt','exemption','planning application','permitted development']],
    reply: () => `Whether you need planning permission depends on the project type${hi()} 📋<br><br><strong>Usually doesn't need planning:</strong><br>• Rear extensions under 40m² (with conditions)<br>• Attic conversions (no dormer to front)<br>• Internal renovations<br>• Painting &amp; maintenance<br><br><strong>Usually needs planning:</strong><br>• Large extensions exceeding exemption limits<br>• Front extensions<br>• Significant structural alterations<br>• Change of use<br><br>We assess this at the free site visit and can refer you to our trusted architects where planning is required.`,
    quick: ['Get a free site visit','House extension info','Attic conversion','Our process'],
  },

  // ── Areas covered ──────────────────────────────────
  {
    id: 'areas',
    patterns: [['area','areas','cover','where','location','local','dublin','wicklow','kildare','meath','louth','south dublin','north dublin','county']],
    reply: () => `We cover a wide area across the greater Dublin region and beyond${hi()} 📍<br><br><strong>Dublin:</strong> All Dublin 1–24 postcodes<br><strong>Co. Dublin:</strong> Dún Laoghaire, Blackrock, Stillorgan, Clontarf, Malahide, Swords, Tallaght &amp; all areas<br><strong>Co. Wicklow:</strong> Bray, Greystones, Wicklow town &amp; surrounding areas<br><strong>Co. Kildare:</strong> Naas, Newbridge, Maynooth &amp; surrounding areas<br><strong>Co. Meath:</strong> Navan, Trim, Dunshaughlin &amp; surrounding areas<br><strong>Co. Louth:</strong> Drogheda, Dundalk &amp; surrounding areas<br><br>Not sure if we cover your area? Just ask!`,
    quick: ['Get a free quote','Contact details','Our services'],
  },

  // ── Contact ────────────────────────────────────────
  {
    id: 'contact',
    patterns: [['contact','phone','call','email','ring','reach','speak','talk','office','hours','open','find you','address','visit you']],
    reply: () => `Here's how to reach us${hi()} 📞<br><br>📞 <a href="tel:+353XXXXXXXXX"><strong>+353 XX XXX XXXX</strong></a><br>✉️ <a href="mailto:info@companyname.ie">info@companyname.ie</a><br>📍 123 Business Street, Dublin, Ireland<br><br>🕐 <strong>Mon–Fri:</strong> 8:00am – 6:00pm<br>🕐 <strong>Saturday:</strong> 9:00am – 2:00pm<br>🕐 <strong>Sunday:</strong> Closed<br><br>We typically respond to enquiries within <strong>2 hours</strong> during business hours.`,
    quick: ['Get a free quote','Leave my details here','Send email','Our services'],
  },

  // ── Before & After ─────────────────────────────────
  {
    id: 'beforeafter',
    patterns: [['before after','before and after','transformation','compare','comparison','results','photos','gallery','see work','show me','example']],
    reply: () => `Our before &amp; after gallery shows some incredible transformations${hi()}! 📸<br><br>We have real comparison sliders for:<br>• 🍳 Kitchen transformation — Rathmines<br>• 🛁 Luxury en-suite — Clontarf<br>• 🏠 Open-plan living — Rathgar<br>• 🏡 Full exterior repaint — Terenure<br><br>Every image is from a real completed project — no stock photos, no staging.`,
    quick: ['View before & after','View projects','Get a free quote'],
  },

  // ── Testimonials / Reviews ─────────────────────────
  {
    id: 'reviews',
    patterns: [['review','reviews','testimonial','rating','feedback','recommend','reputation','trust','reliable','past client','previous work']],
    reply: () => `We're very proud of our client reviews${hi()} ⭐<br><br>We hold a <strong>5.0 rating</strong> across Google, Houzz, and Checkatrade based on <strong>120+ verified reviews</strong>.<br><br>Clients consistently highlight:<br>✅ On-time delivery<br>✅ Clean &amp; tidy worksite<br>✅ Clear communication<br>✅ Quality of finish<br>✅ Honest pricing<br><br>We can provide references from recent local projects on request.`,
    quick: ['Read all reviews','Get a free quote','Our projects','Contact details'],
  },

  // ── Pre-sale / value ───────────────────────────────
  {
    id: 'presale',
    patterns: [['sell','selling','for sale','property value','value','add value','return','investment','estate agent','ber','energy rating']],
    reply: () => `Great thinking${hi()}! The right renovations can add significant value before a sale. Here are the highest-return projects:<br><br>🥇 <strong>Kitchen update:</strong> can add 5–10% to sale price<br>🥈 <strong>Bathroom renovation:</strong> strong buyer appeal<br>🥉 <strong>Full redecoration:</strong> immediate visual impact<br>🏅 <strong>Extension:</strong> largest value increase<br><br>We've helped many clients achieve above-asking-price sales. We can advise on the best return for your budget.`,
    quick: ['Get a free quote','Kitchen renovation','Bathroom renovation','Painting & decorating'],
  },

  // ── Cleanliness / disruption ───────────────────────
  {
    id: 'cleanliness',
    patterns: [['clean','mess','dust','tidy','dirty','disruption','noise','neighbours','daily','end of day']],
    reply: () => `We take the cleanliness and tidiness of your home very seriously${hi()}.<br><br>Our site standards:<br>• <strong>Daily clean-up</strong> — tools stored, dust sheets maintained<br>• <strong>Dust barriers</strong> — working areas properly sealed<br>• <strong>Waste management</strong> — skips and materials properly managed<br>• <strong>Shoe covers</strong> or boots-off policy in living areas<br>• <strong>No loud work</strong> before 8am or after 6pm<br>• <strong>Neighbour consideration</strong> — we let neighbours know in advance<br><br>We treat your home exactly as we'd treat our own.`,
    quick: ['Get a free quote','Our process','Our guarantee'],
  },

  // ── Subcontractors ─────────────────────────────────
  {
    id: 'subcontractors',
    patterns: [['subcontract','subbies','your own team','who does the work','in-house','employed','staff','workers','tradespeople']],
    reply: () => `Great question${hi()}! We use a combination of:<br><br>👷 <strong>Directly employed tradespeople</strong> — our core team covering the main trades<br>🤝 <strong>Vetted specialist subcontractors</strong> — for specialist trades (e.g. structural engineering, specialist tiling)<br><br>All subcontractors are:<br>• Personally vetted and regularly used<br>• Fully insured and certified<br>• Held to our quality and cleanliness standards<br><br>You deal with us throughout — not with multiple contractors.`,
    quick: ['Our process','Are you insured?','Get a free quote'],
  },

  // ── Architect / engineer ───────────────────────────
  {
    id: 'architect',
    patterns: [['architect','architectural','engineer','structural','drawing','plan','technical','spec','specification','bcms','building control']],
    reply: () => `We work closely with trusted architects and structural engineers${hi()}.<br><br>For projects requiring professional design or planning:<br>• We refer you to trusted local architects we regularly work with<br>• We coordinate with them throughout the build<br>• Structural engineering is handled through our network<br>• Building Control compliance is managed by us<br><br>You don't need to find your own architect — we can facilitate the entire process.`,
    quick: ['House extension','Planning permission','Our process','Get a free quote'],
  },

  // ── Gratitude / positive ───────────────────────────
  {
    id: 'thanks',
    patterns: [['thanks','thank you','cheers','appreciate','helpful','great','perfect','brilliant','excellent','love it','amazing','fantastic','wonderful']],
    reply: () => `You're very welcome${hi()}! 😊 It's our pleasure to help.<br><br>Is there anything else I can help with — or are you ready to take the next step and get your free quote?`,
    quick: ['Get a free quote','Our services','Contact details'],
  },

  // ── Negative / complaints ──────────────────────────
  {
    id: 'concern',
    patterns: [['worried','concern','nervous','bad experience','previous builder','problem','issue','trust','scared','nightmare','dodgy','cowboy']],
    reply: () => `We completely understand${hi()} — bad experiences with builders are unfortunately common. Here's why MTARISE CONSTRUCTION LTD is different:<br><br>✅ <strong>Fully insured</strong> — €6.5m public liability<br>✅ <strong>Written contract</strong> — everything agreed upfront<br>✅ <strong>Stage payments</strong> — you never pay in advance<br>✅ <strong>Dedicated project manager</strong> — one point of contact<br>✅ <strong>12-month guarantee</strong> — we stand behind our work<br>✅ <strong>120+ verified reviews</strong> — real clients, real results<br><br>We're happy to provide references from recent local projects if it would help build confidence.`,
    quick: ['Read our reviews','Our guarantee','Get a free quote','Contact details'],
  },

  // ── Goodbye ────────────────────────────────────────
  {
    id: 'goodbye',
    patterns: [['bye','goodbye','later','cya','see you','done','no thanks','that\'s all','all good','got what i need']],
    reply: () => `Thanks for chatting with us${hi()}! 👋<br><br>Don't hesitate to reach out anytime — we're always happy to help. We look forward to hearing about your project!<br><br>📞 <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a> | ✉️ <a href="mailto:info@companyname.ie">info@companyname.ie</a>`,
    quick: ['Get a free quote'],
  },
];

// ─── Quick reply action map ───────────────────────────
const QR = {
  'Get a free quote':         () => promptLead(),
  'Fill in quote form':       () => { showPage('quote'); toggleChat(); },
  'Leave my details here':    () => promptLead(),
  'Book a free assessment':   () => promptLead(),
  'Get a free site visit':    () => promptLead(),
  'Get a free assessment':    () => promptLead(),
  'View before & after':      () => { showPage('beforeafter'); toggleChat(); },
  'See before & after':       () => { showPage('beforeafter'); toggleChat(); },
  'View projects':            () => { showPage('projects'); toggleChat(); },
  'See our projects':         () => { showPage('projects'); toggleChat(); },
  'Read all reviews':         () => { showPage('testimonials'); toggleChat(); },
  'Read our reviews':         () => { showPage('testimonials'); toggleChat(); },
  'Our services':             () => respond('services'),
  'Contact details':          () => respond('contact'),
  'Are you insured?':         () => respond('insurance'),
  'Are you certified?':       () => respond('certifications'),
  'Are you RECI registered?': () => respond('certifications'),
  'Are you RGII certified?':  () => respond('certifications'),
  'Our guarantee':            () => respond('guarantee'),
  'Guarantee info':           () => respond('guarantee'),
  'Our process':              () => respond('process'),
  'Payment terms':            () => respond('payment'),
  'Pricing info':             () => respond('pricing'),
  'How long does it take?':   () => respond('timeline'),
  'How long does a quote take?':() => respond('quote_time'),
  'Do I need planning permission?':() => respond('planning'),
  'Do I need planning?':      () => respond('planning'),
  'Do I supply fixtures?':    () => respond('bathroom_fixtures'),
  'Do you supply fixtures?':  () => respond('bathroom_fixtures'),
  'Bathroom renovation':      () => respond('bathroom'),
  'Bathroom pricing':         () => respond('pricing'),
  'Kitchen renovation':       () => respond('kitchen'),
  'Kitchen pricing':          () => respond('pricing'),
  'Can you design it?':       () => respond('kitchen_design'),
  'What worktops are available?':() => postBot('We offer a range of worktop materials:<br><br>🏆 <strong>Quartz</strong> — most popular, durable, low maintenance<br>🪨 <strong>Granite</strong> — natural stone, unique patterns<br>🌳 <strong>Solid oak/walnut</strong> — warm, traditional feel<br>💎 <strong>Dekton/Sintered stone</strong> — ultra-premium, heat-resistant<br>✅ <strong>Laminate</strong> — budget-friendly, wide choice<br><br>We\'ll help you choose based on your budget and style during the design consultation.', ['Get a free quote','Kitchen renovation']),
  'House extension':          () => respond('extension'),
  'House extension info':     () => respond('extension'),
  'Extension pricing':        () => respond('pricing'),
  'Open plan kitchen':        () => respond('open_plan'),
  'Attic conversion':         () => respond('attic'),
  'Is my attic suitable?':    () => respond('attic_suitable'),
  'Attic with en-suite':      () => respond('attic'),
  'Painting':                 () => respond('painting'),
  'Painting & decorating':    () => respond('painting'),
  'Exterior painting':        () => respond('painting'),
  'Interior painting':        () => respond('painting'),
  'Colour consultation':      () => postBot('Yes — we offer a colour consultation service as part of our painting projects. We can advise on colour schemes, sheen levels, and finish options to suit your home\'s style and lighting. Just mention this when requesting your quote.', ['Get a free quote','Painting service']),
  'Wallpaper':                () => postBot('Our decorators are experienced with all types of wallpaper — paste-the-wall, traditional, feature walls, and specialist finishes. We also handle wallpaper removal and full surface preparation before application.', ['Get a free quote','Painting service']),
  'Plumbing':                 () => respond('plumbing'),
  'Boiler replacement':       () => postBot('We replace gas and oil boilers — supply and installation. We work with leading brands and can advise on the most efficient system for your home. SEAI grants may be available for certain upgrades. RGII certification provided on completion.', ['Get a free quote','Plumbing services','Are you RGII certified?']),
  'Underfloor heating':       () => postBot('We install both water-fed and electric underfloor heating systems. Water-fed systems are ideal for large areas and work with heat pumps. Electric systems are best for bathrooms and smaller areas. We\'ll advise on the right system during your site visit.', ['Get a free quote','Bathroom renovation','Plumbing services']),
  'Emergency repair':         () => respond('emergency'),
  'Call now':                 () => postBot('Please call us directly on 📞 <a href="tel:+353XXXXXXXXX"><strong>+353 XX XXX XXXX</strong></a><br><br>We\'re available Mon–Fri 8am–6pm and Saturday 9am–2pm. For genuine emergencies outside hours, please leave a voicemail and we\'ll respond as soon as possible.', ['Contact details']),
  'Call you directly':        () => respond('contact'),
  'Send email':               () => postBot('You can email us at ✉️ <a href="mailto:info@companyname.ie">info@companyname.ie</a><br><br>We respond to all emails within 2 hours during business hours. Please include a brief description of your project and your contact number.', ['Get a free quote','Contact details']),
  'Electrical':               () => respond('electrical'),
  'Rewire my home':           () => respond('electrical'),
  'Consumer unit upgrade':    () => respond('electrical'),
  'EV charger':               () => respond('ev_charger'),
  'Repairs':                  () => respond('repairs'),
  'Damp problems':            () => respond('damp'),
  'Roof repair':              () => respond('repairs'),
  'Who manages the project?': () => respond('project_manager'),
  'What info do you need?':   () => postBot('To prepare an accurate quote, it helps to know:<br><br>📋 <strong>Type of project</strong> — bathroom, kitchen, extension, etc.<br>📐 <strong>Rough size</strong> — floor area or room dimensions<br>🏠 <strong>Property type</strong> — house, apartment, bungalow<br>📍 <strong>Location</strong> — your address or area<br>💰 <strong>Budget range</strong> — if you have one in mind<br>📅 <strong>Ideal start date</strong> — rough timeframe<br><br>Don\'t worry if you don\'t have all of this — we gather the details during the free site visit.', ['Get a free quote','Leave my details here']),
  'SEAI grant info':          () => postBot('SEAI (Sustainable Energy Authority of Ireland) offers grants for various home energy upgrades:<br><br>⚡ <strong>EV charger:</strong> up to €300<br>🏠 <strong>Insulation:</strong> up to €8,000<br>🌡️ <strong>Heat pump:</strong> up to €6,500<br>🪟 <strong>Windows &amp; doors:</strong> up to €1,500<br><br>We work with SEAI-registered contractors and can advise on which grants apply to your project. Visit seai.ie for full details.', ['Get a free quote','EV charger','Contact details']),
  'Do I need to move out?':   () => respond('move_out'),
  'Full renovation info':     () => respond('renovation'),
  'What affects the price?':  () => respond('price_factors'),
};

// ─── Scoring engine ───────────────────────────────────
function scoreEntry(entry, text) {
  let score = 0;
  for (const group of entry.patterns) {
    const hit = group.some(kw => text.includes(kw));
    if (hit) score++;
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

// ─── Respond by KB id ─────────────────────────────────
function respond(id) {
  const entry = KB.find(e => e.id === id);
  if (entry) postBot(entry.reply(), entry.quick);
}

// ─── Lead capture ─────────────────────────────────────
function promptLead() {
  if (STATE.leadStage >= 4) {
    postBot(`We already have your details${hi()} — our team will be in touch very soon! 😊 Is there anything else I can help with?`, ['Our services','Contact details']);
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
    postBot(`Almost done${hi()}! One last thing — what type of project are you thinking about? (e.g. bathroom, kitchen, extension, full renovation...)`, []);
    return true;
  }
  if (STATE.awaitLead === 'project') {
    STATE.leadStage = 4;
    STATE.awaitLead = null;
    postBot(`Brilliant, ${STATE.userName}! 🎉 We have everything we need.<br><br>Our team will be in touch within <strong>24 hours</strong> to arrange your free site visit and quotation.<br><br>In the meantime, feel free to browse our <a href="#" onclick="location.href='projects.html'">completed projects</a> or <a href="#" onclick="location.href='beforeafter.html'">before &amp; after gallery</a> for inspiration!`, ['View projects','Before & after','Our services']);
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
  // Longer delay for longer messages — feels more natural
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

  // Lead capture in progress
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
    // Smart fallback based on last topic
    const fallbacks = [
      `I want to make sure I give you the right answer${hi()} — could you rephrase that, or pick from the options below? Our team is also available directly on 📞 <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a>`,
      `Good question! For the most accurate answer, I'd recommend speaking directly with our team — but I can also help you get a free quote started right now.`,
      `I'm not 100% sure I have the answer to that${hi()}, but our team definitely will! You can call us on 📞 <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a> or leave your details and we'll call you back.`,
    ];
    const fallback = fallbacks[STATE.messageCount % fallbacks.length];
    postBot(fallback, ['Get a free quote','Our services','Contact details','Leave my details here']);
  }
}

// ─── Greeting ─────────────────────────────────────────
function greet() {
  addMessage(
    `${getGreeting()}! 👋 Welcome to <strong>MTARISE CONSTRUCTION LTD</strong>.<br>I'm here to answer your questions about our residential construction and renovation services — and help you get started with a <strong>free quote</strong>.<br><br>What can I help you with today?`,
    'bot'
  );
  setTimeout(() => setQuickReplies(['Get a free quote','Our services','Bathroom renovation','Kitchen renovation','House extension','Attic conversion','Pricing info','Contact details']), 200);
}

// ─── Unread badge after 3s ────────────────────────────
setTimeout(() => {
  if (!STATE.open) $('chatUnread') && $('chatUnread').classList.remove('hidden');
}, 3000);
