const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let dragging = null;

function resizeCanvas() {
  const containerWidth = Math.min(920, window.innerWidth - 30);
  canvas.width = containerWidth;
  canvas.height = Math.max(520, containerWidth * 0.68);
}

// Data
let nouns = [
  {text: "མི་", expected: "གི་", baseX: 0.12, baseY: 0.22, placed: null, status: null, hintId: "hint1"},
  {text: "སློབ་དཔོན་", expected: "གྱི་", baseX: 0.42, baseY: 0.22, placed: null, status: null, hintId: "hint2"},
  {text: "དུས་ཚོད་", expected: "ཀྱི་", baseX: 0.72, baseY: 0.22, placed: null, status: null, hintId: "hint3"},
  {text: "བླམ་", expected: "གི་", baseX: 0.12, baseY: 0.52, placed: null, status: null, hintId: "hint4"},
  {text: "རྒྱལ་པོ", expected: "འི་", baseX: 0.42, baseY: 0.52, placed: null, status: null, hintId: "hint5"},
  {text: "མེ་ཏོག་", expected: "གི་", baseX: 0.72, baseY: 0.52, placed: null, status: null, hintId: "hint6"}
];

const particleData = [
  {text: "གི་", color: "#e74c3c"},
  {text: "གྱི་", color: "#3498db"},
  {text: "ཀྱི་", color: "#2ecc71"},
  {text: "གི་", color: "#f39c12"},
  {text: "འི་",  color: "#9b59b6"},
  {text: "གི་", color: "#e91e63"}
];

let particles = [];

// Shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function resetParticles() {
  const slotWidth = canvas.width / 7;
  const shuffled = shuffle([...particleData]);
  particles = shuffled.map((p, i) => ({
    ...p,
    x: slotWidth * (1.2 + i),
    y: canvas.height * 0.82
  }));
}

function getScaledValues() {
  const scale = Math.min(canvas.width / 920, 1);
  return {
    slotW: 180 * scale,
    slotH: 80 * scale,
    nounFontSize: Math.max(22, 26 * scale),
    particleFontSize: Math.max(26, 32 * scale)
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const s = getScaledValues();

  nouns.forEach(n => {
    const x = n.baseX * canvas.width;
    const y = n.baseY * canvas.height;

    // Background
    if (n.status === 'correct') ctx.fillStyle = "#d4edda";
    else if (n.status === 'wrong') ctx.fillStyle = "#f8d7da";
    else ctx.fillStyle = n.placed ? "#e8f5e9" : "#f8f9fa";
    ctx.fillRect(x, y, s.slotW, s.slotH);

    // Border
    if (n.status === 'correct') ctx.strokeStyle = "#28a745";
    else if (n.status === 'wrong') ctx.strokeStyle = "#dc3545";
    else if (n.placed) ctx.strokeStyle = "#4caf50";
    else ctx.strokeStyle = "#666";
    
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, s.slotW, s.slotH);

    // Noun
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `bold ${s.nounFontSize}px 'myfont', sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(n.text, x + 20, y + s.slotH/2);

    if (n.placed) {
      ctx.fillStyle = n.placed.color;
      ctx.font = `bold ${s.particleFontSize}px 'myfont', sans-serif`;
      ctx.fillText(n.placed.text, x + s.slotW - 65, y + s.slotH/2);
    }
  });

  // Particles
  particles.forEach(p => {
    if (dragging && p === dragging) return;
    ctx.fillStyle = p.color;
    ctx.font = `bold ${s.particleFontSize}px 'myfont', sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(p.text, p.x, p.y);
  });

  if (dragging) {
    ctx.fillStyle = dragging.color;
    ctx.font = `bold ${s.particleFontSize}px 'myfont', sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(dragging.text, dragging.x, dragging.y);
  }
}

// Drag & Drop Functions
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left,
    y: (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top
  };
}

function startDrag(e) {
  e.preventDefault();
  const pos = getMousePos(e);
  for (let p of particles) {
    if (Math.hypot(pos.x - p.x, pos.y - p.y) < 45) {
      dragging = p;
      return;
    }
  }
}

function moveDrag(e) {
  if (!dragging) return;
  const pos = getMousePos(e);
  dragging.x = pos.x;
  dragging.y = pos.y;
  draw();
}

function endDrag(e) {
  if (!dragging) return;
  const pos = getMousePos(e);
  let dropped = false;

  nouns.forEach(n => {
    const x = n.baseX * canvas.width;
    const y = n.baseY * canvas.height;
    const s = getScaledValues();

    if (pos.x > x && pos.x < x + s.slotW && pos.y > y && pos.y < y + s.slotH) {
      n.placed = { text: dragging.text, color: dragging.color };
      dropped = true;
    }
  });

  if (dropped) {
    particles = particles.filter(p => p !== dragging);
  } else {
    dragging.x = particles.find(p => p.text === dragging.text)?.x || dragging.x;
  }

  dragging = null;
  draw();
}

// Event Listeners
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', moveDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);

canvas.addEventListener('touchstart', startDrag, {passive: false});
canvas.addEventListener('touchmove', moveDrag, {passive: false});
canvas.addEventListener('touchend', endDrag, {passive: false});

// Check Answers - Fixed Version
function checkAnswers() {
  let correctCount = 0;

  nouns.forEach(n => {
    const isCorrect = n.placed && n.placed.text === n.expected;
    n.status = isCorrect ? 'correct' : 'wrong';
    if (isCorrect) correctCount++;
    document.getElementById(n.hintId).style.display = isCorrect ? "none" : "block";
  });

  const feedback = document.getElementById('feedback');
  const nextBtn = document.getElementById('nextLevelBtn');

  if (correctCount === nouns.length) {
    feedback.innerHTML = "🎉 བཀྲ་ཤིས་བདེ་ལེགས། All correct! Excellent!";
    feedback.className = "correct";
    if (nextBtn) nextBtn.style.display = "inline-block";
  } else {
    feedback.textContent = `${correctCount}/${nouns.length} correct. Try again!`;
    feedback.className = "";
    if (nextBtn) nextBtn.style.display = "none";
  }
  
  draw();
}

function resetGame() {
  nouns.forEach(n => {
    n.placed = null;
    n.status = null;
  });
  
  resetParticles();
  document.getElementById('feedback').innerHTML = '';
  document.querySelectorAll('.hint').forEach(h => h.style.display = 'none');
  const nextBtn = document.getElementById('nextLevelBtn');
  if (nextBtn) nextBtn.style.display = "none";
  draw();
}

function goToNextLevel() {
  window.location.href = "https://wordwall.net/play/113469/967/829";   // ← Change this to your next level
}

// Initialize
window.onload = () => {
  resizeCanvas();
  resetParticles();
  draw();
};

window.onresize = () => {
  resizeCanvas();
  resetParticles();
  draw();
};