'use strict';
 
/* ── MACHINE DEFINITIONS ── */
const BLK = '_';
 
const MACHINES = {
  add: {
    name: 'Unary Addition',
    desc: 'Adds two unary numbers separated by B.\n\nTry: aaaBaa  →  aaaaa  (3 + 2 = 5)\n\nHow it works: Replace B with a, scan to end, erase the last symbol to merge both groups.',
    start: 'q0', acc: 'q_accept', rej: 'q_reject',
    tr: {
      'q0,a': ['q0','a','R'],
      'q0,B': ['q1','a','R'],
      'q1,a': ['q1','a','R'],
      'q1,_': ['q2','_','L'],
      'q2,a': ['q_accept','_','S']
    }
  },
 
  mul: {
    name: 'Unary Multiplication',
    desc: 'Multiplies two unary numbers separated by B.\n\nTry: aaBaaa  →  aaaaaa  (2 × 3 = 6)\n\nHow it works: For each a in group 1 (marked X), copy all b\'s (marked Y) as c\'s. After all a\'s processed, convert c\'s to a\'s.',
    start: 'q0', acc: 'q_accept', rej: 'q_reject',
    tr: {
      'q0,a': ['q1','X','R'], 'q0,X': ['q0','X','R'], 'q0,B': ['q5','B','R'],
      'q1,a': ['q1','a','R'], 'q1,B': ['q2','B','R'],
      'q2,b': ['q3','Y','R'], 'q2,Y': ['q2','Y','R'],
      'q2,c': ['q2','c','R'], 'q2,_': ['q4','_','L'],
      'q3,b': ['q3','b','R'], 'q3,Y': ['q3','Y','R'],
      'q3,c': ['q3','c','R'], 'q3,_': ['q4','c','L'],
      'q4,c': ['q4','c','L'], 'q4,Y': ['q2','Y','R'],
      'q4,b': ['q4','b','L'], 'q4,B': ['q4','B','L'],
      'q4,a': ['q4','a','L'], 'q4,X': ['q0','X','R'],
      'q5,b': ['q5','_','R'], 'q5,c': ['q6','a','R'], 'q5,_': ['q_accept','_','S'],
      'q6,c': ['q6','a','R'], 'q6,_': ['q_accept','_','S']
    }
  },
 
  abc: {
    name: 'aⁿbⁿcⁿ Language Acceptor',
    desc: 'Accepts strings with equal a\'s, b\'s, c\'s in order.\n\nTry: aabbcc  ✓    aaabbbccc  ✓    aabbc  ✗\n\nHow it works: Repeatedly cross off one a→X, one b→Y, one c→Z until all marked. If any remain unmatched → reject. Empty string accepted.',
    start: 'q0', acc: 'q_accept', rej: 'q_reject',
    tr: {
      'q0,_': ['q_accept','_','S'], 'q0,X': ['q0','X','R'],
      'q0,a': ['q1','X','R'],      'q0,b': ['q_reject','b','S'],
      'q0,c': ['q_reject','c','S'], 'q0,Y': ['q4','Y','R'],
      'q1,a': ['q1','a','R'], 'q1,X': ['q1','X','R'],
      'q1,Y': ['q1','Y','R'], 'q1,b': ['q2','Y','R'],
      'q1,_': ['q_reject','_','S'], 'q1,c': ['q_reject','c','S'],
      'q2,b': ['q2','b','R'], 'q2,Y': ['q2','Y','R'],
      'q2,Z': ['q2','Z','R'], 'q2,c': ['q3','Z','L'],
      'q2,_': ['q_reject','_','S'],
      'q3,Z': ['q3','Z','L'], 'q3,Y': ['q3','Y','L'],
      'q3,b': ['q3','b','L'], 'q3,a': ['q3','a','L'],
      'q3,X': ['q3','X','L'], 'q3,_': ['q0','_','R'],
      'q4,Y': ['q4','Y','R'], 'q4,Z': ['q4','Z','R'],
      'q4,_': ['q_accept','_','S'], 'q4,b': ['q_reject','b','S'],
      'q4,c': ['q_reject','c','S'], 'q4,a': ['q_reject','a','S']
    }
  }
};
 
/* ── STATE ── */
let tm       = null;
let tapeMap  = {};
let head     = 0;
let state    = '';
let steps    = 0;
let histArr  = [];
let custTr   = {};
let running  = false;
let timer    = null;
 
/* ── TAPE HELPERS ── */
function tg(i)   { return tapeMap[i] !== undefined ? tapeMap[i] : BLK; }
function ts(i,v) { tapeMap[i] = v; }
 
function initTape(str) {
  tapeMap = {};
  head = 0;
  if (str) for (let i = 0; i < str.length; i++) ts(i, str[i]);
}
 
/* ── RENDER TAPE ── */
const CELLS = 15;
 
function renderTape() {
  const sc  = document.getElementById('tscroll');
  let   ws  = parseInt(sc.value);
  if (head < ws)           ws = head;
  if (head >= ws + CELLS)  ws = head - CELLS + 1;
  sc.value = ws;
 
  const row = document.getElementById('tape');
  row.innerHTML = '';
 
  for (let i = ws; i < ws + CELLS; i++) {
    const sym = tg(i);
    const cell = document.createElement('div');
    cell.className = 'cell' + (i === head ? ' head' : '') + (sym === BLK ? ' blank' : '');
 
    const symEl = document.createElement('span');
    symEl.className = 'cell-sym';
    symEl.textContent = sym === BLK ? '□' : sym;
    cell.appendChild(symEl);
 
    const idxEl = document.createElement('div');
    idxEl.className = 'cell-idx';
    idxEl.textContent = i;
    cell.appendChild(idxEl);
 
    row.appendChild(cell);
  }
}
 
/* ── RENDER STATUS ── */
function updateStatus() {
  document.getElementById('stState').textContent = state || '—';
  document.getElementById('stHead').textContent  = head;
  const sym = tg(head);
  document.getElementById('stSym').textContent   = sym === BLK ? '□ (blank)' : sym;
 
  const el = document.getElementById('stStatus');
  if (!tm)                    { el.textContent = 'Not Loaded';   el.className = 'stat-val'; }
  else if (state === tm.acc)  { el.textContent = '✓ Accepted';   el.className = 'stat-val acc'; }
  else if (state === tm.rej)  { el.textContent = '✗ Rejected';   el.className = 'stat-val rej'; }
  else if (running)           { el.textContent = '⟳ Running';    el.className = 'stat-val run'; }
  else                        { el.textContent = 'Ready';         el.className = 'stat-val'; }
}
 
/* ── RENDER TRANSITION TABLE ── */
function renderTable() {
  const tb = document.getElementById('ttbody');
  tb.innerHTML = '';
  if (!tm) return;
  for (const key in tm.tr) {
    const [fs, rs] = key.split(',');
    const [ns, ws, mv] = tm.tr[key];
    const tr = document.createElement('tr');
    if (fs === state && rs === tg(head)) tr.className = 'active-row';
    tr.innerHTML = `<td>${fs}</td><td>${rs === BLK ? '□' : rs}</td><td>${ns}</td><td>${ws === BLK ? '□' : ws}</td><td>${mv}</td>`;
    tb.appendChild(tr);
  }
}
 
/* ── RENDER HISTORY ── */
function renderHist() {
  const h = document.getElementById('hist');
  h.textContent = histArr.length ? histArr.join('\n\n') : 'No history yet.';
  h.scrollTop   = h.scrollHeight;
}
 
/* ── LOAD MACHINE ── */
function loadMachine() {
  const def = MACHINES[document.getElementById('msel').value];
  tm    = { ...def };
  const input = document.getElementById('inp').value.trim();
  initTape(input);
  state   = tm.start;
  steps   = 0;
  histArr = [];
  running = false;
  clearInterval(timer);
 
  renderTape();
  updateStatus();
  renderTable();
  renderHist();
 
  document.getElementById('desc').textContent = tm.desc;
  document.getElementById('log').textContent  = 'Loaded: ' + tm.name;
}
 
/* ── RESET ── */
function resetMachine() {
  if (!tm) return;
  clearInterval(timer);
  running = false;
  loadMachine();
  document.getElementById('log').textContent = 'Machine reset.';
}
 
/* ── STOP ── */
function stopMachine() {
  running = false;
  clearInterval(timer);
  updateStatus();
}
 
/* ── STEP ── */
function stepMachine() {
  if (!tm) { document.getElementById('log').textContent = 'Load a machine first.'; return; }
  if (state === tm.acc || state === tm.rej) {
    document.getElementById('log').textContent = `Already halted in state: ${state}`;
    return;
  }
 
  const sym  = tg(head);
  const key  = `${state},${sym}`;
  const rule = tm.tr[key];
 
  if (!rule) {
    state = tm.rej;
    const msg = `No transition for (${key}) → machine rejects.`;
    document.getElementById('log').textContent = msg;
    histArr.push(msg);
    renderTape(); renderTable(); renderHist(); updateStatus();
    stopMachine();
    return;
  }
 
  const [ns, ws, mv] = rule;
  const old = state, oldH = head;
 
  ts(head, ws);
  state = ns;
  if (mv === 'R') head++;
  else if (mv === 'L') head--;
 
  steps++;
 
  const msg = `Step ${steps}: δ(${old}, ${sym === BLK ? '□' : sym}) → (${ns}, ${ws === BLK ? '□' : ws}, ${mv})\nHead: ${oldH} → ${head}`;
  document.getElementById('log').textContent = msg;
  histArr.push(msg);
 
  renderTape(); renderTable(); renderHist(); updateStatus();
 
  if (state === tm.acc) {
    const final = `✓ ACCEPTED in ${steps} step(s).`;
    document.getElementById('log').textContent += '\n\n' + final;
    histArr.push(final); renderHist(); stopMachine(); return;
  }
  if (state === tm.rej) {
    const final = `✗ REJECTED in ${steps} step(s).`;
    document.getElementById('log').textContent += '\n\n' + final;
    histArr.push(final); renderHist(); stopMachine(); return;
  }
  if (steps >= 600) {
    const lmsg = '⚠ Step limit (600) reached — possible infinite loop.';
    document.getElementById('log').textContent += '\n\n' + lmsg;
    histArr.push(lmsg); renderHist();
    document.getElementById('stStatus').textContent = '⚠ Possible Loop';
    stopMachine();
  }
}
 
/* ── RUN ── */
function runMachine() {
  if (!tm) { document.getElementById('log').textContent = 'Load a machine first.'; return; }
  if (running) return;
  running = true;
  updateStatus();
  const speed = parseInt(document.getElementById('spd').value);
  timer = setInterval(stepMachine, speed);
}
 
/* ── CUSTOM MACHINE ── */
function addRule() {
  const from  = document.getElementById('cFrom').value.trim();
  const read  = document.getElementById('cRead').value.trim() || BLK;
  const to    = document.getElementById('cTo').value.trim();
  const write = document.getElementById('cWrite').value.trim() || BLK;
  const mv    = document.getElementById('cMv').value;
  if (!from || !to) { document.getElementById('rulesBox').textContent = 'Enter valid states.'; return; }
  custTr[`${from},${read}`] = [to, write, mv];
  renderRules();
  document.getElementById('cFrom').value  = '';
  document.getElementById('cRead').value  = '';
  document.getElementById('cTo').value    = '';
  document.getElementById('cWrite').value = '';
}
 
function renderRules() {
  const keys = Object.keys(custTr);
  if (!keys.length) { document.getElementById('rulesBox').textContent = 'No transitions yet.'; return; }
  document.getElementById('rulesBox').textContent =
    keys.map(k => { const[ns,ws,mv]=custTr[k]; return `${k}  →  (${ns}, ${ws}, ${mv})`; }).join('\n');
}
 
function clearRules() { custTr = {}; renderRules(); }
 
function buildCustom() {
  if (!Object.keys(custTr).length) { document.getElementById('rulesBox').textContent = 'Add at least one rule first.'; return; }
  tm = {
    name: 'Custom Machine',
    desc: 'User-defined Turing Machine.',
    start: document.getElementById('cStart').value.trim() || 'q0',
    acc:   document.getElementById('cAcc').value.trim()   || 'q_accept',
    rej:   document.getElementById('cRej').value.trim()   || 'q_reject',
    tr:    { ...custTr }
  };
  initTape(document.getElementById('cInp').value.trim());
  state = tm.start; steps = 0; histArr = []; running = false; clearInterval(timer);
  renderTape(); updateStatus(); renderTable(); renderHist();
  document.getElementById('desc').textContent = tm.desc;
  document.getElementById('log').textContent  = 'Custom machine built.';
  switchTab('sim');
}
 
/* ── DECIDABILITY ── */
function decAnalyze() {
  const out = document.getElementById('decOut');
  if (!tm) { out.textContent = 'Load and run a machine first.'; return; }
 
  if (steps >= 600) {
    out.textContent =
`⚠  Looping Behavior Detected
 
This machine exceeded 600 steps without halting.
 
In Theory of Computation:
→ A machine that may never halt demonstrates a RECOGNIZABLE (but possibly not decidable) language.
→ For strings NOT in the language, a recognizer is allowed to loop forever — it cannot always say "no".
→ This is exactly the difference between DECIDABLE and RECOGNIZABLE languages.
 
The language recognized by a looping TM is Turing-Recognizable (RE) but may not be Recursive (decidable).`;
    return;
  }
 
  if (state === tm.acc) {
    out.textContent =
`✓  Machine Accepted the Input
 
The machine halted in state: ${state}
Steps taken: ${steps}
 
In Theory of Computation:
→ The machine produced a DEFINITE ANSWER (accept).
→ If this machine halts and answers correctly for EVERY possible input, the language it decides is DECIDABLE.
→ Decidable languages are also called RECURSIVE languages.
 
Example: aⁿbⁿcⁿ is decidable — our machine always halts with yes or no for any input.`;
    return;
  }
 
  if (state === tm.rej) {
    out.textContent =
`✗  Machine Rejected the Input
 
The machine halted in state: ${state}
Steps taken: ${steps}
 
In Theory of Computation:
→ The machine produced a DEFINITE ANSWER (reject).
→ A machine that always halts (accept or reject) for all inputs decides a DECIDABLE language.
→ If it only accepts correct strings but loops on others, it merely RECOGNIZES the language.`;
    return;
  }
 
  out.textContent =
`⟳  Machine Has Not Halted Yet
 
Steps so far: ${steps}
Current state: ${state}
 
Run or step the machine further to see its outcome.
→ If it eventually halts → the language may be decidable for this input.
→ If it loops forever → it demonstrates recognizable-but-not-decidable behavior.`;
}
 
function decHalting() {
  document.getElementById('decOut').textContent =
`Halting Problem — ATM is Undecidable
─────────────────────────────────────
 
Question: Given a Turing Machine M and input w, does M halt on w?
 
Answer: NO — this is UNDECIDABLE.
 
Proof Sketch (Turing, 1936):
  1. Assume a TM H exists that solves halting: H(M,w) = accept if M halts, reject if M loops.
  2. Build D(M): if H(M,M)=accept, then LOOP; if H(M,M)=reject, then HALT.
  3. Run D(D): if D halts → D loops. If D loops → D halts. CONTRADICTION.
 
Therefore no such H can exist.
 
Consequences:
→ We cannot always predict if a program will terminate.
→ Many important problems reduce TO the halting problem (proving them undecidable).
→ Software verification is fundamentally limited.`;
}
 
function decRecog() {
  document.getElementById('decOut').textContent =
`Recognizable vs Decidable Languages
────────────────────────────────────
 
DECIDABLE (Recursive):
  → TM always halts with ACCEPT or REJECT
  → Gives a definite answer for EVERY input
  → Also called: Recursive language
  → Example: aⁿbⁿcⁿ, all regular languages, context-free languages
 
RECOGNIZABLE (Turing-Recognizable / RE):
  → TM accepts all strings IN the language
  → For strings NOT in language: may REJECT or LOOP FOREVER
  → Every decidable language is also recognizable
  → Example: ATM = {⟨M,w⟩ | M accepts w} — recognizable but not decidable
 
CO-RECOGNIZABLE:
  → Complement is recognizable
  → A language is decidable ↔ it is BOTH recognizable AND co-recognizable
 
NOT RECOGNIZABLE:
  → No TM can accept even the correct strings
  → Example: complement of ATM
 
Hierarchy: Decidable ⊂ Recognizable ⊂ All Languages`;
}
 
function decMapping() {
  document.getElementById('decOut').textContent =
`Mapping Reductions — A ≤m B
────────────────────────────
 
Definition:
  Language A MAPPING-REDUCES to B (written A ≤m B) if there exists a computable function f such that:
    w ∈ A  ↔  f(w) ∈ B
 
Uses:
  → If A ≤m B and B is decidable → A is decidable
  → If A ≤m B and A is undecidable → B is undecidable
  → Transfers (un)decidability between problems
 
Classic Reductions:
  ATM ≤m HALTTM
    Deciding if M accepts w reduces to deciding if M halts on w.
 
  ATM ≤m ETM  (is the language of M empty?)
    If we could decide ETM, we could decide ATM → both undecidable.
 
  ATM ≤m EqTM  (do two TMs recognize same language?)
    EqTM is also undecidable by reduction from ATM.
 
Key Insight:
  Reduction is the main technique to prove a NEW problem is undecidable — show that solving it would let you solve ATM (which we know is impossible).`;
}
 
/* ── TABS ── */
function switchTab(id) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + id));
}
 
/* ── EVENT WIRING ── */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
 
document.getElementById('loadBtn').addEventListener('click', loadMachine);
document.getElementById('resetBtn').addEventListener('click', resetMachine);
document.getElementById('stepBtn').addEventListener('click', stepMachine);
document.getElementById('runBtn').addEventListener('click', runMachine);
document.getElementById('stopBtn').addEventListener('click', stopMachine);
document.getElementById('addRuleBtn').addEventListener('click', addRule);
document.getElementById('clearRulesBtn').addEventListener('click', clearRules);
document.getElementById('buildBtn').addEventListener('click', buildCustom);
document.getElementById('analyzeBtn').addEventListener('click', decAnalyze);
document.getElementById('haltBtn').addEventListener('click', decHalting);
document.getElementById('recogBtn').addEventListener('click', decRecog);
document.getElementById('mapBtn').addEventListener('click', decMapping);
 
document.getElementById('tscroll').addEventListener('input', renderTape);
 
document.getElementById('spd').addEventListener('input', function () {
  document.getElementById('spdVal').textContent = this.value + 'ms';
  if (running) { clearInterval(timer); timer = setInterval(stepMachine, parseInt(this.value)); }
});
 
/* ── INIT ── */
loadMachine();