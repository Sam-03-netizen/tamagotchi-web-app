

// ===== SOUND ENGINE =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(freq = 600, duration = 0.08, type = "square") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.value = 0.04; // soft volume

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// ===== LOAD OR INIT DATA =====
let petData = JSON.parse(localStorage.getItem("petData")) || {
  pet: null,
  name: "",
  hunger: 30,
  happiness: 70,
  energy: 70,
  sleeping: false,
  age: 0,
  stage: "baby"
};

let lastStage = petData.stage;
const petDisplay = document.getElementById("pet");
const statusText = document.getElementById("status");
const petOptions = document.querySelectorAll(".pet-option");
const petSelectionBox = document.querySelector(".pet-selection");

// ===== HELPER =====
function clamp(val) {
  return Math.max(0, Math.min(100, val));
}

// ===== PET SELECTION (ONLY ONCE) =====
petOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    if (petData.pet) return;

    petData.pet = btn.dataset.pet;

    // Ask for name (once)
    let name = prompt("Name your pet 💗");
    petData.name = name && name.trim() ? name.trim() : "Buddy";

    localStorage.setItem("petData", JSON.stringify(petData));
    petSelectionBox.style.display = "none";
    updatePet();
  });
});


// Hide selection if pet already chosen
if (petData.pet) {
  petSelectionBox.style.display = "none";
}

// ===== UPDATE PET UI =====
function updatePet() {
  const petCard = document.querySelector(".pet-card");

  if (petData.sleeping) {
    petCard.classList.add("sleeping");
    statusText.textContent = "Zzz… sleeping";
  } else {
    petCard.classList.remove("sleeping");
  }

  petData.hunger = clamp(petData.hunger);
  petData.happiness = clamp(petData.happiness);
  petData.energy = clamp(petData.energy);
  document.getElementById("hungerBar").style.width = petData.hunger + "%";
  document.getElementById("happyBar").style.width = petData.happiness + "%";
  document.getElementById("energyBar").style.width = petData.energy + "%";


  if (!petData.pet) {
    petDisplay.textContent = "❓";
    statusText.textContent = "Choose a pet to begin";
    return;
  }

  let petFace = petData.pet;

  if (petData.stage === "baby") {
    petFace = "🐣";
  }
  else if (petData.stage === "teen") {
    petFace = petData.pet;
  }
  else if (petData.stage === "adult") {
    petFace = petData.pet + "✨";
  }
  petDisplay.textContent = petFace;

  const nameEl = document.getElementById("petName");
  nameEl.textContent = petData.name ? petData.name : "";

  // Evolution animation trigger
  if (petData.stage !== lastStage) {
    petDisplay.classList.add("evolving");

    setTimeout(() => {
      petDisplay.classList.remove("evolving");
    }, 600);

    lastStage = petData.stage;
  }


  // Mood logic
  // Mood logic (TEXT ONLY)
  if (petData.hunger > 70) {
    statusText.textContent = "I'm hungry…";
  } else if (petData.energy < 30) {
    statusText.textContent = "I'm sleepy…";
  } else if (petData.happiness < 30) {
    statusText.textContent = "I'm sad…";
  } else {
    statusText.textContent = "I'm happy!";
  }

  statusText.textContent += ` (${petData.stage})`;


  localStorage.setItem("petData", JSON.stringify(petData));
  // Button attention cues
  const feedBtn = document.getElementById("feed");
  const sleepBtn = document.getElementById("sleep");

  // reset
  feedBtn.classList.remove("pulse");
  sleepBtn.classList.remove("pulse");

  // hunger warning
  if (petData.hunger > 65) {
    feedBtn.classList.add("pulse");
  }

  // energy warning
  if (petData.energy < 35) {
    sleepBtn.classList.add("pulse");
  }

}

function updateEvolution() {
  if (petData.age >= 5 && petData.happiness >= 60 && petData.hunger < 60) {
    petData.stage = "adult";
  } else if (petData.age >= 2 && petData.happiness >= 40) {
    petData.stage = "teen";
  } else {
    petData.stage = "baby";
  }
}


// ===== ACTION BUTTONS =====
document.getElementById("feed").addEventListener("click", () => {
  if (!petData.pet) return;
  playBeep(700, 0.08);
  petData.hunger -= 20;
  petData.happiness += 10;
  updatePet();
});


document.getElementById("petBtn").addEventListener("click", () => {
  if (!petData.pet) return;

  playBeep(500, 0.06, "sine");

  if (petData.sleeping) {
    petData.sleeping = false;
  } else {
    petData.happiness += 15;
  }

  updatePet();
});



document.getElementById("sleep").addEventListener("click", () => {
  if (!petData.pet) return;

  playBeep(300, 0.1, "triangle");

  petData.sleeping = true;
  updatePet();
});



// ===== TAMAGOTCHI TIME LOOP =====
setInterval(() => {
  if (!petData.pet) return;

  petData.hunger += 5;
  petData.energy -= 5;

  if (petData.hunger > 60) {
    petData.happiness -= 5;
  }

  if (petData.sleeping) {
    petData.energy += 8;   // recovers faster
    petData.hunger += 2;   // still gets a bit hungry
  } else {
    petData.energy -= 5;
    petData.hunger += 5;
  }

  petData.age += 0.2; // increases every cycle (~1 min per 5 loops)
  updateEvolution();


  updatePet();
}, 12000);

// ===== INIT =====
updatePet();

document.getElementById("reset").addEventListener("click", () => {
  if (!petData.pet) return;

  playBeep(200, 0.15, "sawtooth");

  const confirmReset = confirm("Are you sure? Your pet will be gone forever 🥺");

  if (confirmReset) {
    localStorage.removeItem("petData");
    location.reload();
  }
});


