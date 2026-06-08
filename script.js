const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=601175947174&text=GuideSayaUntukJanaPendapatanDenganTelco&type=phone_number&app_absent=0";

const l1UsersInput = document.getElementById("l1Users");
const multiplierInput = document.getElementById("multiplier");
const planButtons = document.querySelectorAll(".plan-btn");
const breakdownBody = document.getElementById("breakdownBody");
const rankText = document.getElementById("rankText");
const baseCommission = document.getElementById("baseCommission");
const totalCommission = document.getElementById("totalCommission");
const activeLevelText = document.getElementById("activeLevelText");
const unlockText = document.getElementById("unlockText");
const progressFill = document.getElementById("progressFill");
const rankPill = document.getElementById("rankPill");

let selectedPlan = 50;

function formatMoney(value) {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getRate(level) {
  if (level === 1) return 0.13;
  if (level === 2) return 0.03;
  if (level === 3) return 0.08;
  if (level >= 4 && level <= 8) return 0.015;
  if (level >= 9 && level <= 13) return 0.01;
  return 0;
}

function getRateLabel(rate) {
  const percent = rate * 100;
  return `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

function getActiveLevels(baseCommissionValue) {
  if (baseCommissionValue >= 3500) return 13;
  if (baseCommissionValue >= 500) return 8;
  return 3;
}

function getRank(baseCommissionValue) {
  if (baseCommissionValue >= 3500) return "Senior Ambassador";
  if (baseCommissionValue >= 500) return "Ambassador";
  return "Elite Member";
}

function getRankPill(rank) {
  if (rank === "Senior Ambassador") return "SENIOR AMBASSADOR";
  if (rank === "Ambassador") return "AMBASSADOR";
  return "ELITE MEMBER";
}

function getProgress(baseCommissionValue) {
  if (baseCommissionValue >= 3500) return 100;

  if (baseCommissionValue >= 500) {
    const progressToSenior = ((baseCommissionValue - 500) / 3000) * 100;
    return Math.max(0, Math.min(100, progressToSenior));
  }

  const progressToAmbassador = (baseCommissionValue / 500) * 100;
  return Math.max(0, Math.min(100, progressToAmbassador));
}

function getUnlockMessage(baseCommissionValue, rank) {
  if (rank === "Senior Ambassador") {
    return "Senior Ambassador unlocked. L9 hingga L13 aktif secara automatik.";
  }

  if (rank === "Ambassador") {
    const amountNeeded = Math.max(0, 3500 - baseCommissionValue);
    return `Perlu lagi ${formatMoney(amountNeeded)} untuk capai rank Senior Ambassador.`;
  }

  const amountNeeded = Math.max(0, 500 - baseCommissionValue);
  return `Perlu lagi ${formatMoney(amountNeeded)} untuk capai rank Ambassador.`;
}

function sanitizeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

function calculate() {
  const l1Users = sanitizeInteger(l1UsersInput.value, 1);
  const multiplier = sanitizeInteger(multiplierInput.value, 1);

  let base = 0;

  for (let level = 1; level <= 3; level += 1) {
    const users = l1Users * Math.pow(multiplier, level - 1);
    const rate = getRate(level);
    base += users * selectedPlan * rate;
  }

  const activeLevels = getActiveLevels(base);
  const rank = getRank(base);
  let total = 0;

  breakdownBody.innerHTML = "";

  for (let level = 1; level <= 13; level += 1) {
    const users = l1Users * Math.pow(multiplier, level - 1);
    const rate = getRate(level);
    const isActive = level <= activeLevels;
    const commission = isActive ? users * selectedPlan * rate : 0;
    total += commission;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="level-badge">L${level}</span></td>
      <td>${formatNumber(users)}</td>
      <td>${getRateLabel(rate)}</td>
      <td>${formatMoney(commission)}</td>
      <td class="${isActive ? "status-active" : "status-locked"}">${isActive ? "Aktif" : "Locked"}</td>
    `;

    breakdownBody.appendChild(row);
  }

  rankText.textContent = rank;
  baseCommission.textContent = formatMoney(base);
  totalCommission.textContent = formatMoney(total);
  activeLevelText.textContent = `L1 hingga L${activeLevels} aktif.`;
  unlockText.textContent = getUnlockMessage(base, rank);
  rankPill.textContent = getRankPill(rank);
  progressFill.style.width = `${getProgress(base)}%`;
}

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    planButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedPlan = Number(button.dataset.plan);
    calculate();
  });
});

l1UsersInput.addEventListener("input", calculate);
multiplierInput.addEventListener("input", calculate);

calculate();
