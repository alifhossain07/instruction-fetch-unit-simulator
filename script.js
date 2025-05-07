let instructions = [];
let pc = 0;
let halted = false;

function loadInstructions() {
  const input = document.getElementById("instructionInput").value.trim();
  instructions = input.split("\n").map(i => i.trim()).filter(i => i !== "");
  pc = 0;
  halted = false;
  document.getElementById("pc").textContent = pc;
  document.getElementById("currentInstruction").textContent = "Ready";
  document.getElementById("log").innerHTML = "";
  logMessage("Instructions loaded. Click 'Next Cycle' to start.");
}

function nextCycle() {
  if (halted || pc >= instructions.length) {
    logMessage("Program halted or finished.");
    return;
  }

  const instr = instructions[pc];
  document.getElementById("pc").textContent = pc;
  document.getElementById("currentInstruction").textContent = instr;

  const parts = instr.split(" ");
  const opcode = parts[0].toUpperCase();

  logMessage(`PC=${pc} | Executing: ${instr}`);

  switch (opcode) {
    case "LOAD":
    case "ADD":
    case "STORE":
      pc += 1;
      break;
    case "JMP":
      pc = parseInt(parts[1]);
      break;
    case "BEQ": {
      const reg1 = parts[1];
      const reg2 = parts[2];
      const target = parseInt(parts[3]);
      // Dummy check: simulate R1 == R2
      if (reg1 === reg2) {
        pc = target;
      } else {
        pc += 1;
      }
      break;
    }
    case "HALT":
      halted = true;
      logMessage("Program halted.");
      break;
    default:
      logMessage("Unknown instruction.");
      pc += 1;
  }
}

function logMessage(msg) {
  const log = document.getElementById("log");
  const li = document.createElement("li");
  li.textContent = msg;
  log.appendChild(li);
}
