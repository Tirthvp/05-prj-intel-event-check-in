// --------------------
// Intel Summit Check-In (LevelUp)
// --------------------
// First js completely done. 
// DOM elementsw
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const attendeeCountEl = document.getElementById("attendeeCount");
const progressBarEl = document.getElementById("progressBar");
const greetingEl = document.getElementById("greeting");

const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

const attendeeListEl = document.getElementById("attendeeList");

// Config
const maxCount = 50;

// LocalStorage keys
const STORAGE_KEY = "intel_summit_checkin_v1";

// State
let state = {
  total: 0,
  teams: { water: 0, zero: 0, power: 0 },
  attendees: [] // { name: string, team: "water"|"zero"|"power", teamLabel: string }
};

// Helpers
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);

    // Light validation so bad storage doesn't break the page
    if (typeof parsed?.total === "number" && parsed?.teams && Array.isArray(parsed?.attendees)) {
      state = parsed;
    }
  } catch {
    // ignore corrupted storage
  }
}

function teamLabelFromValue(teamValue) {
  const map = {
    water: "Team Water Wise",
    zero: "Team Net Zero",
    power: "Team Renewables",
  };
  return map[teamValue] || "Team";
}

function updateCountsUI() {
  attendeeCountEl.textContent = String(state.total);
  waterCountEl.textContent = String(state.teams.water);
  zeroCountEl.textContent = String(state.teams.zero);
  powerCountEl.textContent = String(state.teams.power);
}

function updateProgressUI() {
  const pct = Math.min(100, Math.round((state.total / maxCount) * 100));
  progressBarEl.style.width = pct + "%";
}

function renderAttendeeList() {
  if (!attendeeListEl) return;

  attendeeListEl.innerHTML = "";

  // Newest on top (common for check-in UIs)
  const items = [...state.attendees].reverse();

  for (const a of items) {
    const li = document.createElement("li");

    const left = document.createElement("span");
    left.textContent = a.name;

    const right = document.createElement("span");
    right.className = `tag ${a.team}`;
    right.textContent = a.teamLabel;

    li.appendChild(left);
    li.appendChild(right);
    attendeeListEl.appendChild(li);
  }
}

function showMessage(text) {
  greetingEl.textContent = text;
  greetingEl.classList.add("success-message");
  greetingEl.style.display = "block";
}

function getWinningTeam() {
  const entries = Object.entries(state.teams); // [ [team, count], ... ]
  const max = Math.max(...entries.map(([, c]) => c));
  const winners = entries.filter(([, c]) => c === max).map(([t]) => t);

  // Tie handling: if multiple winners, return all
  return { winners, max };
}

function celebrateIfGoalReached() {
  if (state.total !== maxCount) return;

  const { winners } = getWinningTeam();
  if (winners.length === 1) {
    const winnerLabel = teamLabelFromValue(winners[0]);
    showMessage(`🎉 Goal reached! ${winnerLabel} is winning!`);
  } else {
    const labels = winners.map(teamLabelFromValue).join(" & ");
    showMessage(`🎉 Goal reached! It's a tie between ${labels}!`);
  }
}

// Init: load saved progress and paint UI
loadState();
updateCountsUI();
updateProgressUI();
renderAttendeeList();
celebrateIfGoalReached();

// Handle form submit
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const teamValue = teamSelect.value;

  if (!name || !teamValue) return;

  if (state.total >= maxCount) {
    showMessage(`We’re at capacity (${maxCount}/${maxCount}). No more check-ins.`);
    return;
  }

  const teamLabel = teamSelect.options[teamSelect.selectedIndex]?.text || teamLabelFromValue(teamValue);

  // Update state
  state.total += 1;
  state.teams[teamValue] += 1;
  state.attendees.push({ name, team: teamValue, teamLabel });

  // Save + update UI
  saveState();
  updateCountsUI();
  updateProgressUI();
  renderAttendeeList();

  // Greeting (normal)
  showMessage(`Welcome, ${name}! You're checked in with ${teamLabel}.`);

  // Celebration (if reached max)
  celebrateIfGoalReached();

  form.reset();
});