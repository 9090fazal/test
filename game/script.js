let currentLang = "en";
let xp = localStorage.getItem("xp") ? parseInt(localStorage.getItem("xp")) : 0;
document.getElementById("xp").textContent = xp;

// ------------------ MENU -------------------
function startGame(game) {
  document.getElementById("menu").classList.add("hidden");
  const gameArea = document.getElementById("gameArea");
  gameArea.classList.remove("hidden");
  gameArea.innerHTML = "";

  if (game === "quiz") startQuiz();
  else if (game === "memory") startMemory();
  else if (game === "dragdrop") startDragDrop();
  else if (game === "math") startMath();
}

function addXP(points) {
  xp += points;
  localStorage.setItem("xp", xp);
  document.getElementById("xp").textContent = xp;
}

// ------------------ QUIZ -------------------
const quizData = [
  {
    question: { en: "What is 2 + 2?", hi: "2 + 2 कितना है?" },
    options: { en: ["3", "4", "5"], hi: ["३", "४", "५"] },
    correct: 1
  },
  {
    question: { en: "Water formula?", hi: "पानी का सूत्र क्या है?" },
    options: { en: ["H2O", "CO2", "O2"], hi: ["H2O", "CO2", "O2"] },
    correct: 0
  }
];

let currentQ = 0, score = 0;

function startQuiz() {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `
    <h2 id="question"></h2>
    <div id="options"></div>
    <button id="nextBtn" disabled>Next</button>
  `;
  loadQuestion();
}

function loadQuestion() {

  const q = quizData[currentQ];
  document.getElementById("question").textContent = q.question[currentLang];
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options[currentLang].forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);
    optionsDiv.appendChild(btn);
  });
  
  document.getElementById("nextBtn").disabled = true;
  document.getElementById("nextBtn").onclick = () => {
    currentQ++;
    if (currentQ < quizData.length) loadQuestion();
    else { addXP(score * 10); endGame(`Quiz Over! Score: ${score}`); }
  };
}

function selectAnswer(i) {
  const q = quizData[currentQ];
  if (i === q.correct) score++;
  document.getElementById("nextBtn").disabled = false;
}

// ------------------ MEMORY GAME -------------------
function startMemory() {
  const pairs = ["H2O","H2O","O2","O2","CO2","CO2"];
  let shuffled = pairs.sort(() => 0.5 - Math.random());
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = "<h2>Find the Pairs</h2>";

  let opened = [], matched = 0;
  shuffled.forEach((val,i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = val;
    card.textContent = "?";
    card.onclick = () => {
      if (opened.length < 2 && card.textContent === "?") {
        card.textContent = val;
        opened.push(card);
        if (opened.length === 2) {
          setTimeout(() => {
            if (opened[0].dataset.value === opened[1].dataset.value) {
              opened[0].style.background="#06d6a0";
              opened[1].style.background="#06d6a0";
              matched++;
              if (matched === pairs.length/2) {
                addXP(20);
                endGame("🎉 You matched all cards!");
              }
            } else {
              opened[0].textContent = "?";
              opened[1].textContent = "?";
            }
            opened = [];
          },800);
        }
      }
    };
    gameArea.appendChild(card);
  });
}

// ------------------ DRAG & DROP -------------------
function startDragDrop() {
  const gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = `
    <h2>Match Formula to Name</h2>
    <div>
      <div draggable="true" class="card" id="h2o">H2O</div>
      <div draggable="true" class="card" id="co2">CO2</div>
    </div>
    <div>
      <div class="card" data-accept="h2o">💧 Water</div>
      <div class="card" data-accept="co2">🌫️ Carbon Dioxide</div>
    </div>
  `;
  const draggables = document.querySelectorAll("[draggable]");
  const targets = document.querySelectorAll("[data-accept]");

  draggables.forEach(d => {
    d.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text", d.id);
    });
  });

  targets.forEach(t => {
    t.addEventListener("dragover", (e) => e.preventDefault());
    t.addEventListener("drop", (e) => {
      const draggedId = e.dataTransfer.getData("text");
      if (t.dataset.accept === draggedId) {
        t.style.background="#06d6a0";
        addXP(15);
        endGame("✅ Drag & Drop Complete!");
      } else {
        t.style.background="#ef476f";
      }
    });
  });
}

// ------------------ MATH FAST GAME -------------------
function startMath() {
  const gameArea = document.getElementById("gameArea");
  let num1 = Math.floor(Math.random()*10);
  let num2 = Math.floor(Math.random()*10);
  gameArea.innerHTML = `
    <h2>Solve Quickly!</h2>
    <p>${num1} + ${num2} = ?</p>
    <input type="number" id="ans"/>
    <button onclick="checkMath(${num1+num2})">Submit</button>
  `;
}

function checkMath(correct) {
  const ans = parseInt(document.getElementById("ans").value);
  if (ans === correct) { addXP(10); endGame("🎉 Correct Answer!"); }
  else endGame("❌ Wrong Answer!");
}

// ------------------ END GAME -------------------
function endGame(msg) {
  const gameArea = document.getElementById("gameArea");
  gameArea.classList.add("hidden");
  const resultBox = document.getElementById("resultBox");
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <h2>${msg}</h2>
    <button onclick="restart()">Back to Menu</button>
  `;
}

function restart() {
  document.getElementById("resultBox").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

// ------------------ LANGUAGE -------------------
document.getElementById("langSelect").addEventListener("change", (e) => {
  currentLang = e.target.value;
});

// ------------------ PWA -------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
