/* ===================================================
   COMPANY NAME — Chatbot
   chatbot.js  — rule-based, no external API needed
   =================================================== */
'use strict';

// ─── State ────────────────────────────────────────────
let chatOpen      = false;
let typingTimer   = null;
let awaitingName  = false;
let awaitingEmail = false;
let awaitingPhone = false;
let leadStage     = 0;  // 0=none, 1=got name, 2=got email, 3=done
let userName      = '';
let chatStarted   = false;

// ─── Knowledge base ──────────────────────────────────
const KB = [
  {
    keys: ['hello','hi','hey','howya','good morning','good afternoon','morning','afternoon','evening'],
    reply: () => `Hi${userName ? ' ' + userName : ''}! 👋 Welcome to <strong>COMPANY NAME</strong>. I'm here to help you with any questions about our construction and renovation services.<br><br>What can I help you with today?`,
    quick: ['Get a free quote','Our services','Bathroom renovation','Kitchen renovation','House extension','Pricing','Contact details']
  },
  {
    keys: ['quote','quotation','price','pricing','cost','how much','estimate','free quote'],
    reply: () => `We offer <strong>completely free, no-obligation quotations</strong> on all projects. 🏗️<br><br>To get started, simply:<br>• Fill in our <a href="#" onclick="showPage('quote');toggleChat()">online quote form</a><br>• Or call us on <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a><br><br>We'll arrange a free site visit and send you a detailed written quote within 5 working days.`,
    quick: ['Fill in quote form','What services do you offer?','How long does it take?','Call you now']
  },
  {
    keys: ['service','services','what do you do','what do you offer','offer','work'],
    reply: () => `We offer a full range of residential construction services: 🔨<br><br>🏗️ Residential Construction<br>🔨 Full Home Renovation<br>🏠 House Extensions<br>🪜 Attic Conversions<br>🛁 Bathroom Renovation<br>🍳 Kitchen Renovation<br>🪣 Painting &amp; Decorating<br>🔧 Plumbing Works<br>⚡ Electrical Works<br>🔩 Repairs &amp; Maintenance`,
    quick: ['Get a quote','Bathroom renovation','Kitchen renovation','House extension','Pricing']
  },
  {
    keys: ['bathroom','bath','shower','wet room','en suite','ensuite','toilet'],
    reply: () => `Our bathroom renovation service is very popular! 🛁<br><br>We handle everything:<br>• Full strip-out &amp; replastering<br>• Walk-in showers &amp; wet rooms<br>• Premium tiling (floor &amp; walls)<br>• Underfloor heating<br>• Plumbing &amp; electrical<br><br>Typical bathroom renovation: <strong>1–2 weeks</strong>. Would you like a free quote?`,
    quick: ['Get a free quote','How much does it cost?','How long does it take?','See before & after']
  },
  {
    keys: ['kitchen','fitted kitchen','worktop','units','cabinet'],
    reply: () => `A new kitchen completely transforms your home! 🍳<br><br>We provide:<br>• Supply &amp; fit of kitchen units<br>• Quartz, granite or solid wood worktops<br>• Tiling &amp; splashback work<br>• All plumbing &amp; electrical connections<br>• Lighting design<br><br>Typical kitchen renovation: <strong>2–4 weeks</strong>. Want a free quote?`,
    quick: ['Get a free quote','How much does it cost?','See our projects','Contact details']
  },
  {
    keys: ['extension','extend','rear extension','side extension','double storey','build on','add on','annex'],
    reply: () => `A house extension is a great way to gain space without moving! 🏠<br><br>We build:<br>• Rear &amp; side extensions<br>• Double-storey extensions<br>• Wrap-around extensions<br>• Garage conversions<br>• Attic conversions<br><br>We also liaise with architects and handle planning where required. Interested in a free quote?`,
    quick: ['Get a free quote','Do I need planning permission?','How long does it take?','Pricing']
  },
  {
    keys: ['attic','loft','roof room','roof conversion'],
    reply: () => `Attic conversions are one of the best ways to add a bedroom without extending outwards! 🪜<br><br>We handle:<br>• Structural assessment &amp; steel work<br>• Velux or dormer windows<br>• New staircase installation<br>• Insulation &amp; fire compliance<br>• Full decoration<br><br>Most attic conversions take <strong>4–8 weeks</strong>. Would you like a quote?`,
    quick: ['Get a free quote','How much does it cost?','Do I need planning?']
  },
  {
    keys: ['paint','painting','decorating','decorator','redecorate','colour','wall','ceiling'],
    reply: () => `Our professional painters deliver an impeccable finish every time! 🪣<br><br>We offer:<br>• Interior &amp; exterior painting<br>• Full surface preparation<br>• Wallpaper hanging &amp; removal<br>• Specialist finishes<br>• Colour consultation<br><br>Interior paint jobs typically start within 1–2 weeks of booking. Want a quote?`,
    quick: ['Get a free quote','Pricing','Contact details']
  },
  {
    keys: ['plumb','plumbing','boiler','heating','radiator','pipe','leak','water'],
    reply: () => `Our fully qualified, RGII-certified plumbers handle all residential plumbing. 🔧<br><br>Services include:<br>• Full property plumbing<br>• Heating systems<br>• Bathroom &amp; kitchen plumbing<br>• Leak detection &amp; repair<br>• Emergency call-out<br><br>Want us to take a look? Get a free site visit.`,
    quick: ['Get a free quote','Contact details','Are you insured?']
  },
  {
    keys: ['electric','electrical','rewire','socket','lighting','lights','fuse','consumer','ev charger'],
    reply: () => `All our electrical work is carried out by <strong>RECI registered electricians</strong> and fully certified. ⚡<br><br>We handle:<br>• Full rewires<br>• Consumer unit upgrades<br>• New sockets &amp; lighting<br>• EV charger installation<br>• Smoke &amp; CO alarms<br><br>All work is certified on completion. Would you like a quote?`,
    quick: ['Get a free quote','Are you certified?','Contact details']
  },
  {
    keys: ['renovation','renovate','refurbish','refurbishment','full house','whole house','complete','overhaul'],
    reply: () => `A full home renovation is our most popular service! 🔨<br><br>We manage everything:<br>• Full strip-out &amp; redesign<br>• Replastering &amp; drylining<br>• New flooring<br>• Electrical rewire<br>• Plumbing upgrade<br>• Complete decoration<br><br>We handle all trades in-house so you deal with one team. Want a free quote?`,
    quick: ['Get a free quote','How long does renovation take?','Pricing','See our projects']
  },
  {
    keys: ['insure','insured','insurance','liability','cover','covered'],
    reply: () => `Yes — we are <strong>fully insured</strong>! 🛡️<br><br>We carry:<br>• Public Liability Insurance: €6.5 million<br>• Employer's Liability Insurance<br>• All subcontractors are vetted for appropriate cover<br><br>Insurance certificates are available on request.`,
    quick: ['Get a free quote','Are you certified?','Contact details']
  },
  {
    keys: ['certif','reci','rgii','registered','qualif'],
    reply: () => `All our tradespeople are fully qualified and certified: ✅<br><br>• Electricians: <strong>RECI registered</strong><br>• Plumbers: <strong>RGII certified</strong><br>• All electrical &amp; gas works are formally certified on completion<br><br>You receive all compliance documentation at project handover.`,
    quick: ['Get a free quote','Are you insured?','Contact details']
  },
  {
    keys: ['guarantee','warranty','after care','aftercare','guarantee'],
    reply: () => `We back all our work with a <strong>12-month workmanship guarantee</strong>. ⭐<br><br>If any issue arises from our work within 12 months, we return and rectify it promptly at no extra charge.<br><br>Your satisfaction is our priority — not just on the day of handover, but long after.`,
    quick: ['Get a free quote','Contact details','About us']
  },
  {
    keys: ['planning','permission','council','exempt','exemption'],
    reply: () => `Planning permission depends on the project type. 📋<br><br>Many extensions fall under <strong>Exempted Development</strong> in Ireland and don't need planning. We assess this at the site visit stage.<br><br>Where planning is required, we work with trusted architects and can manage the whole process for you.`,
    quick: ['Get a free quote','House extension info','Contact details']
  },
  {
    keys: ['how long','time','duration','timeline','weeks','months','days','take'],
    reply: () => `Project timelines vary by scope: ⏱️<br><br>🛁 Bathroom renovation: <strong>1–2 weeks</strong><br>🍳 Kitchen renovation: <strong>2–4 weeks</strong><br>🏠 House extension: <strong>8–14 weeks</strong><br>🪜 Attic conversion: <strong>4–8 weeks</strong><br>🔨 Full renovation: <strong>3–6 months</strong><br><br>We provide a detailed schedule before any work starts.`,
    quick: ['Get a free quote','Our services','Contact details']
  },
  {
    keys: ['area','areas','cover','dublin','wicklow','kildare','meath','louth','where','location','local'],
    reply: () => `We cover a wide area across Ireland: 📍<br><br>• <strong>Dublin 1–24</strong> (all areas)<br>• Co. Wicklow<br>• Co. Kildare<br>• Co. Meath<br>• Co. Louth<br>• Selected nationwide projects<br><br>Not sure if we cover your area? Just ask us!`,
    quick: ['Get a free quote','Contact details','Our services']
  },
  {
    keys: ['contact','phone','call','email','ring','reach','speak','talk','office'],
    reply: () => `Here's how to reach us: 📞<br><br>📞 <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a><br>✉️ <a href="mailto:info@companyname.ie">info@companyname.ie</a><br>📍 123 Business Street, Dublin<br><br>🕐 <strong>Mon–Fri:</strong> 8am–6pm<br>🕐 <strong>Saturday:</strong> 9am–2pm`,
    quick: ['Get a free quote','Our services','Areas we cover']
  },
  {
    keys: ['before after','transformation','compare','before and after','results','photos','gallery'],
    reply: () => `Our before &amp; after gallery shows some stunning transformations! 📸<br><br>Check out real projects including kitchen, bathroom, living room, and exterior transformations — with interactive comparison sliders so you can see exactly what we achieved.`,
    quick: ['View before & after','Get a free quote','Our services']
  },
  {
    keys: ['testimonial','review','rating','feedback','client','customer','happy','satisfied'],
    reply: () => `We're proud of our client reviews! ⭐<br><br>We hold a <strong>5.0 rating</strong> across Google, Houzz and Checkatrade — based on 120+ verified reviews.<br><br>Our clients consistently praise our reliability, quality, and clean working habits.`,
    quick: ['Read reviews','Get a free quote','Contact details']
  },
  {
    keys: ['project','portfolio','completed','work','example','sample','show me'],
    reply: () => `We've completed over <strong>500 residential projects</strong> across Dublin and surrounding counties! 🏗️<br><br>Browse our full portfolio — filtered by project type — on our Projects page.`,
    quick: ['View projects','Get a free quote','Before & after']
  },
  {
    keys: ['thanks','thank you','cheers','appreciate','great','perfect','brilliant','excellent','helpful'],
    reply: () => `You're very welcome${userName ? ', ' + userName : ''}! 😊 Is there anything else I can help with?`,
    quick: ['Get a free quote','Contact details','Our services']
  },
  {
    keys: ['bye','goodbye','later','cya','see you','done','no thanks'],
    reply: () => `Thanks for chatting with us${userName ? ', ' + userName : ''}! 👋<br><br>Don't hesitate to get back in touch anytime. We look forward to helping with your project!`,
    quick: ['Get a free quote','Contact details']
  }
];

// Quick reply action map
const QR_ACTIONS = {
  'Get a free quote':      () => { showPage('quote'); toggleChat(); },
  'Fill in quote form':    () => { showPage('quote'); toggleChat(); },
  'Our services':          () => { showPage('services'); toggleChat(); },
  'View projects':         () => { showPage('projects'); toggleChat(); },
  'View before & after':   () => { showPage('beforeafter'); toggleChat(); },
  'See before & after':    () => { showPage('beforeafter'); toggleChat(); },
  'Before & after':        () => { showPage('beforeafter'); toggleChat(); },
  'Read reviews':          () => { showPage('testimonials'); toggleChat(); },
  'Contact details':       () => postBot(KB.find(k => k.keys.includes('contact')).reply(), KB.find(k => k.keys.includes('contact')).quick),
  'About us':              () => { showPage('about'); toggleChat(); },
  'See our projects':      () => { showPage('projects'); toggleChat(); },
  'Call you now':          () => postBot('You can call us directly on 📞 <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a><br>We\'re available Mon–Fri 8am–6pm and Sat 9am–2pm.', ['Get a free quote','Our services']),
  'Pricing':               () => postBot('We offer free, no-obligation quotations tailored to your specific project. Because every job is different, we don\'t publish standard prices — but we are always transparent and competitive. Request a free quote and you\'ll have a full written breakdown within 5 working days.', ['Get a free quote','Contact details']),
  'How much does it cost?':() => postBot('Every project is priced individually based on scope, materials, and access. We provide a <strong>detailed written quotation</strong> — always free and with no obligation. No hidden costs, ever.', ['Get a free quote','Contact details']),
  'How long does it take?':() => { const r = KB.find(k=>k.keys.includes('how long')); postBot(r.reply(), r.quick); },
  'Are you insured?':      () => { const r = KB.find(k=>k.keys.includes('insure')); postBot(r.reply(), r.quick); },
  'Are you certified?':    () => { const r = KB.find(k=>k.keys.includes('certif')); postBot(r.reply(), r.quick); },
  'Do I need planning permission?': () => { const r = KB.find(k=>k.keys.includes('planning')); postBot(r.reply(), r.quick); },
  'Do I need planning?':   () => { const r = KB.find(k=>k.keys.includes('planning')); postBot(r.reply(), r.quick); },
  'Bathroom renovation':   () => { const r = KB.find(k=>k.keys.includes('bathroom')); postBot(r.reply(), r.quick); },
  'Kitchen renovation':    () => { const r = KB.find(k=>k.keys.includes('kitchen')); postBot(r.reply(), r.quick); },
  'House extension info':  () => { const r = KB.find(k=>k.keys.includes('extension')); postBot(r.reply(), r.quick); },
  'House extension':       () => { const r = KB.find(k=>k.keys.includes('extension')); postBot(r.reply(), r.quick); },
  'Areas we cover':        () => { const r = KB.find(k=>k.keys.includes('area')); postBot(r.reply(), r.quick); },
};

// ─── DOM helpers ──────────────────────────────────────
const $ = id => document.getElementById(id);

function toggleChat() {
  chatOpen = !chatOpen;
  $('chatWindow').classList.toggle('hidden', !chatOpen);
  $('chatOpenIcon').classList.toggle('hidden', chatOpen);
  $('chatCloseIcon').classList.toggle('hidden', !chatOpen);
  $('chatUnread').classList.add('hidden');

  if (chatOpen && !chatStarted) {
    chatStarted = true;
    setTimeout(() => greet(), 400);
  }
  if (chatOpen) setTimeout(() => $('chatInput').focus(), 300);
}

function scrollToBottom() {
  const msgs = $('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

function postMessage(html, side) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg ' + side;
  wrap.innerHTML = `<div class="chat-bubble">${html}</div>`;
  $('chatMessages').appendChild(wrap);
  scrollToBottom();
}

function showTyping() {
  const t = document.createElement('div');
  t.className = 'chat-msg bot';
  t.id = 'typingIndicator';
  t.innerHTML = '<div class="chat-bubble typing-bubble"><span></span><span></span><span></span></div>';
  $('chatMessages').appendChild(t);
  scrollToBottom();
}

function hideTyping() {
  const t = $('typingIndicator');
  if (t) t.remove();
}

function setQuickReplies(items) {
  const qr = $('quickReplies');
  qr.innerHTML = '';
  if (!items || !items.length) return;
  items.forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'qr-btn';
    btn.textContent = label;
    btn.onclick = () => handleQuickReply(label);
    qr.appendChild(btn);
  });
}

function postBot(html, quick, delay = 900) {
  setQuickReplies([]);
  showTyping();
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    hideTyping();
    postMessage(html, 'bot');
    setQuickReplies(quick || []);
    scrollToBottom();
  }, delay);
}

// ─── Greeting & lead capture ─────────────────────────
function greet() {
  postMessage('👋 Hi there! Welcome to <strong>COMPANY NAME</strong>.<br>I\'m here to help you with any questions about our construction and renovation services.', 'bot');
  setTimeout(() => {
    setQuickReplies(['Get a free quote','Our services','Bathroom renovation','Kitchen renovation','House extension','Pricing','Contact details']);
  }, 400);
}

// ─── Message handling ─────────────────────────────────
function sendUserMessage() {
  const input = $('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  postMessage(text, 'user');
  setQuickReplies([]);

  // Lead capture flow
  if (awaitingName) {
    userName = text.split(' ')[0];
    awaitingName = false;
    leadStage = 1;
    postBot(`Great to meet you, <strong>${userName}</strong>! 😊 What's the best email address to send your quote to?`, []);
    awaitingEmail = true;
    return;
  }
  if (awaitingEmail) {
    awaitingEmail = false;
    leadStage = 2;
    postBot(`Perfect! And a phone number so we can arrange the free site visit?`, []);
    awaitingPhone = true;
    return;
  }
  if (awaitingPhone) {
    awaitingPhone = false;
    leadStage = 3;
    postBot(`Brilliant, ${userName}! 🎉 We'll be in touch within 24 hours to arrange your free site visit and quotation. In the meantime, feel free to also <a href="#" onclick="showPage('quote');toggleChat()">fill in our full quote form</a> with more project details.`, ['Our services','Before & after','Contact details']);
    return;
  }

  processInput(text.toLowerCase());
}

function handleQuickReply(label) {
  postMessage(label, 'user');
  setQuickReplies([]);

  if (label === 'Get a free quote' || label === 'Fill in quote form') {
    postBot('Great! I can help you get started right now. 🚀<br><br>You can either:<br>• <a href="#" onclick="showPage(\'quote\');toggleChat()">Fill in our full quote form</a><br>• Or let me take a few quick details and we\'ll call you back!<br><br>Would you like to leave your details here?', ['Yes, take my details','Go to quote form']);
    return;
  }
  if (label === 'Yes, take my details') {
    postBot('Perfect! What\'s your name?', []);
    awaitingName = true;
    return;
  }
  if (label === 'Go to quote form') {
    showPage('quote');
    toggleChat();
    return;
  }

  if (QR_ACTIONS[label]) {
    QR_ACTIONS[label]();
    return;
  }

  processInput(label.toLowerCase());
}

function processInput(text) {
  // Match knowledge base
  const match = KB.find(entry =>
    entry.keys.some(k => text.includes(k))
  );

  if (match) {
    postBot(match.reply(), match.quick);
  } else {
    // Fallback
    postBot(
      `I'm not sure I have a specific answer for that, but our team can help! 😊<br><br>You can:<br>• <a href="#" onclick="showPage('quote');toggleChat()">Request a free quote</a><br>• Call us on <a href="tel:+353XXXXXXXXX">+353 XX XXX XXXX</a><br>• Email us at <a href="mailto:info@companyname.ie">info@companyname.ie</a>`,
      ['Get a free quote','Our services','Contact details','Pricing']
    );
  }
}

// ─── Show unread badge after delay ───────────────────
setTimeout(() => {
  if (!chatOpen) {
    $('chatUnread').classList.remove('hidden');
  }
}, 3000);
