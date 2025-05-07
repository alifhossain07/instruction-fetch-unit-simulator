class IFUSim {
  constructor() {
    this.PC = 0;
    this.IMEM = Array(256).fill('00');
    this.IR = '00';
  }
  loadMemory(arr) {
    this.IMEM = Array(256).fill('00');
    arr.forEach((v,i) => this.IMEM[i] = v);
  }
  reset() {
    this.PC = 0;
    this.IR = '00';
  }
}

const sim = new IFUSim();

// DOM elements
const pcBox = document.getElementById('pc-box');
const imemBox = document.getElementById('imem-box');
const irBox = document.getElementById('ir-box');
const pcAdder = document.getElementById('pc-adder');
const busPCIMEM = document.getElementById('bus-pc-imem');
const busIMEMIR = document.getElementById('bus-imem-ir');
const pcVal = document.getElementById('pc-value');
const imemVal = document.getElementById('imem-value');
const irVal = document.getElementById('ir-value');
const memoryGrid = document.getElementById('memory');
const codeInput = document.getElementById('codeInput');
const currentStage = document.getElementById('current-stage');
const executionLog = document.getElementById('execution-log');
const commentInstr = document.getElementById('comment-instr');

// Render memory grid
function renderMemory() {
  memoryGrid.innerHTML = '';
  for(let i = 0; i < 24; i++) {
    const cell = document.createElement('div');
    cell.className = 'p-1 text-center font-mono text-xs border border-gray-700 rounded bg-gray-900';
    cell.textContent = sim.IMEM[i];
    if(i === sim.PC) cell.classList.add('bg-yellow-400', 'text-black');
    memoryGrid.appendChild(cell);
  }
}

// Update UI
function updateUI() {
  pcVal.textContent = '0x' + sim.PC.toString(16).padStart(4, '0');
  imemVal.textContent = `[${sim.IMEM[sim.PC] || '00'}]`;
  irVal.textContent = '0x' + sim.IR;
  renderMemory();
  [pcBox, imemBox, irBox, pcAdder].forEach(b => b.classList.remove('active-box'));
  [busPCIMEM, busIMEMIR].forEach(b => b.classList.remove('bus-anim'));
  document.querySelectorAll('#step-commentary li').forEach(li => 
    li.classList.remove('commentary-highlight'));
  commentInstr.textContent = "";
}

// Log message
function logMessage(message) {
  const now = new Date().toLocaleTimeString();
  executionLog.innerHTML = `[${now}] ${message}<br>` + executionLog.innerHTML;
}

// Animate fetch phases
async function fullFetchCycle() {
  currentStage.textContent = "Phase 1: PC → IMEM (Sending address to memory)";
  document.getElementById('step1').classList.add('commentary-highlight');
  pcBox.classList.add('active-box');
  busPCIMEM.classList.add('bus-anim');
  logMessage(`PC (0x${sim.PC.toString(16).padStart(4,'0')}) sends address to Instruction Memory`);
  await new Promise(r => setTimeout(r, 800));
  busPCIMEM.classList.remove('bus-anim');
  pcBox.classList.remove('active-box');
  imemBox.classList.add('active-box');
  await new Promise(r => setTimeout(r, 400));

  document.getElementById('step1').classList.remove('commentary-highlight');
  document.getElementById('step2').classList.add('commentary-highlight');
  currentStage.textContent = "Phase 2: IMEM → IR (Fetching instruction)";
  sim.IR = sim.IMEM[sim.PC];
  imemVal.textContent = `[${sim.IMEM[sim.PC]}]`;
  busIMEMIR.classList.add('bus-anim');
  commentInstr.textContent = `Fetched Instruction: 0x${sim.IR}`;
  logMessage(`Fetched instruction 0x${sim.IR} from IMEM`);
  await new Promise(r => setTimeout(r, 800));
  irVal.textContent = '0x' + sim.IR;
  busIMEMIR.classList.remove('bus-anim');
  imemBox.classList.remove('active-box');
  irBox.classList.add('active-box');
  await new Promise(r => setTimeout(r, 400));

  document.getElementById('step2').classList.remove('commentary-highlight');
  document.getElementById('step3').classList.add('commentary-highlight');
  currentStage.textContent = "Phase 3: PC → PC + 4 (Incrementing PC)";
  pcAdder.classList.add('active-box');
  logMessage(`Incremented PC by 4`);
  await new Promise(r => setTimeout(r, 600));
  sim.PC += 4;
  pcAdder.classList.remove('active-box');

  document.getElementById('step3').classList.remove('commentary-highlight');
  document.getElementById('step4').classList.add('commentary-highlight');
  currentStage.textContent = "Phase 4: Updated PC is stored";
  logMessage(`Updated PC: 0x${sim.PC.toString(16).padStart(4,'0')}`);
  await new Promise(r => setTimeout(r, 400));
  updateUI();
  currentStage.textContent = "Ready for next fetch cycle";
}

// Event handlers
document.getElementById('stepBtn').addEventListener('click', async () => {
  await fullFetchCycle();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  const inputVals = codeInput.value.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[0-9A-F]{2}$/.test(s));
  sim.loadMemory(inputVals);
  sim.reset();
  updateUI();
  executionLog.innerHTML = 'System reset. Ready to fetch instructions.<br>';
  currentStage.textContent = "Ready to begin fetch cycle";
});

codeInput.addEventListener('keypress', e => {
  if(e.key === 'Enter') {
    document.getElementById('resetBtn').click();
  }
});

// Initial setup
document.getElementById('resetBtn').click();
