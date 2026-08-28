"use strict";

/*
  INTERNAL TEST ACCOUNT
  No real payments are connected.
*/

const VIPS = [
  { level:1,  price:4,   tasks:1,  reward:.20 },
  { level:2,  price:10,  tasks:2,  reward:.22 },
  { level:3,  price:20,  tasks:3,  reward:.24 },
  { level:4,  price:35,  tasks:4,  reward:.26 },
  { level:5,  price:55,  tasks:5,  reward:.28 },
  { level:6,  price:80,  tasks:6,  reward:.30 },
  { level:7,  price:110, tasks:7,  reward:.32 },
  { level:8,  price:150, tasks:8,  reward:.34 },
  { level:9,  price:200, tasks:9,  reward:.36 },
  { level:10, price:275, tasks:10, reward:.38 }
];


let user = JSON.parse(
  localStorage.getItem("goldtask_user") || "null"
);

let transactions = JSON.parse(
  localStorage.getItem("goldtask_transactions") || "[]"
);

let selectedWalletAction = null;


/* =========================
   ELEMENTS
========================= */

const balanceEl =
  document.getElementById("balance");

const walletBalanceEl =
  document.getElementById("walletBalance");

const usernameEl =
  document.getElementById("username");

const vipLevelEl =
  document.getElementById("vipLevel");

const taskCountEl =
  document.getElementById("taskCount");

const taskLimitEl =
  document.getElementById("taskLimit");

const refCountEl =
  document.getElementById("refCount");

const refCodeEl =
  document.getElementById("refCode");

const refBigEl =
  document.getElementById("referralsBig");

const refEarnEl =
  document.getElementById("refEarnings");

const tasksEl =
  document.getElementById("tasks");

const vipListEl =
  document.getElementById("vipList");

const transactionsEl =
  document.getElementById("transactions");

const statusEl =
  document.getElementById("accountStatus");


/* =========================
   SAVE
========================= */

function save(){

  localStorage.setItem(
    "goldtask_user",
    JSON.stringify(user)
  );

  localStorage.setItem(
    "goldtask_transactions",
    JSON.stringify(transactions)
  );

}


/* =========================
   DATE
========================= */

function today(){

  const d = new Date();

  return d.toISOString().slice(0,10);

}


/* =========================
   DAILY RESET
========================= */

function prepareDaily(){

  if(!user) return;

  if(user.taskDate !== today()){

    user.taskDate = today();

    user.completed = 0;

    save();

  }

}


/* =========================
   LOGIN
========================= */

function login(){

  const input =
    document.getElementById("nameInput");

  const name =
    input.value.trim();

  if(name.length < 3){

    alert("Enter at least 3 characters.");

    return;

  }


  if(!user){

    user = {

      id:
        crypto.randomUUID(),

      username:
        name,

      balance:
        0,

      vip:
        0,

      completed:
        0,

      taskDate:
        today(),

      referralCode:
        makeReferral(),

      referrals:
        0,

      referralEarnings:
        0

    };

  }else{

    user.username = name;

  }


  save();

  document
    .getElementById("loginModal")
    .classList.remove("show");

  render();

}


function makeReferral(){

  return Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();

}


/* =========================
   RENDER USER
========================= */

function render(){

  prepareDaily();

  if(!user) return;


  usernameEl.textContent =
    user.username;

  balanceEl.textContent =
    money(user.balance);

  walletBalanceEl.textContent =
    money(user.balance);

  vipLevelEl.textContent =
    user.vip;

  refCountEl.textContent =
    user.referrals;

  refBigEl.textContent =
    user.referrals;

  refEarnEl.textContent =
    money(user.referralEarnings);

  refCodeEl.textContent =
    user.referralCode;


  const membership =
    VIPS.find(
      v => v.level === user.vip
    );


  const limit =
    membership
      ? membership.tasks
      : 0;


  taskLimitEl.textContent =
    limit;

  taskCountEl.textContent =
    user.completed;


  if(user.vip){

    statusEl.textContent =
      `VIP ${user.vip} active. Your daily tasks are available.`;

  }else{

    statusEl.textContent =
      "Select a membership to unlock tasks.";

  }


  renderTasks();

  renderVIP();

  renderTransactions();

}


/* =========================
   MONEY
========================= */

function money(value){

  return Number(value || 0)
    .toFixed(2);

}


/* =========================
   TASKS
========================= */

function renderTasks(){

  tasksEl.innerHTML = "";

  const membership =
    VIPS.find(
      v => v.level === user.vip
    );


  if(!membership){

    tasksEl.innerHTML = `
      <div class="task">
        <div class="task-number">—</div>

        <div class="task-info">
          <b>Membership required</b>
          <span>Select VIP to access daily tasks.</span>
        </div>
      </div>
    `;

    return;

  }


  for(
    let i = 1;
    i <= membership.tasks;
    i++
  ){

    const done =
      i <= user.completed;


    const task =
      document.createElement("div");

    task.className =
      "task";


    task.innerHTML = `

      <div class="task-number">
        ${String(i).padStart(2,"0")}
      </div>

      <div class="task-info">
        <b>Daily Task ${i}</b>
        <span>
          Complete activity
          ${done ? "• Completed" : "• Available"}
        </span>
      </div>

      <div class="task-reward">
        +$${money(membership.reward)}
      </div>

      <button
        class="task-btn"
        ${done ? "disabled" : ""}
      >
        ${done ? "COMPLETED" : "START"}
      </button>
    `;


    const button =
      task.querySelector(".task-btn");


    if(!done){

      button.addEventListener(
        "click",
        () => completeTask(button)
      );

    }


    tasksEl.appendChild(task);

  }

}


/* =========================
   COMPLETE TASK
========================= */

function completeTask(button){

  if(!user.vip){

    alert(
      "Select a VIP membership first."
    );

    return;

  }


  const membership =
    VIPS.find(
      v => v.level === user.vip
    );


  if(
    user.completed >= membership.tasks
  ){

    return;

  }


  button.disabled = true;

  let seconds = 3;

  button.textContent =
    seconds;


  const timer =
    setInterval(() => {

      seconds--;

      if(seconds > 0){

        button.textContent =
          seconds;

        return;

      }


      clearInterval(timer);


      user.completed++;

      user.balance =
        Number(user.balance) +
        Number(membership.reward);


      transactions.unshift({

        type:
          "Task reward",

        amount:
          membership.reward,

        date:
          new Date().toLocaleString()

      });


      save();

      render();

    },1000);

}


/* =========================
   VIP
========================= */

function renderVIP(){

  vipListEl.innerHTML = "";


  VIPS.forEach(vip => {

    const card =
      document.createElement("div");

    card.className =
      "vip-card" +
      (user.vip === vip.level
        ? " current"
        : "");


    card.innerHTML = `

      <div class="vip-top">

        <div class="vip-name">
          VIP ${vip.level}
        </div>

        <div class="vip-price">
          $${money(vip.price)}
          <small> / level</small>
        </div>

      </div>

      <div class="vip-details">

        <div>
          <span>Daily tasks</span>
          <b>${vip.tasks}</b>
        </div>

        <div>
          <span>Task credit</span>
          <b>$${money(vip.reward)}</b>
        </div>

        <div>
          <span>Status</span>
          <b>
            ${user.vip === vip.level
              ? "ACTIVE"
              : "AVAILABLE"}
          </b>
        </div>

      </div>

      <button
        class="vip-select"
        ${user.vip === vip.level ? "disabled" : ""}
      >
        ${
          user.vip === vip.level
            ? "CURRENT LEVEL"
            : "SELECT LEVEL"
        }
      </button>
    `;


    const button =
      card.querySelector(".vip-select");


    if(user.vip !== vip.level){

      button.addEventListener(
        "click",
        () => selectVIP(vip.level)
      );

    }


    vipListEl.appendChild(card);

  });

}


/* =========================
   SELECT VIP
========================= */

function selectVIP(level){

  const vip =
    VIPS.find(
      v => v.level === level
    );


  if(!vip) return;


  user.vip =
    level;

  user.completed =
    0;

  user.taskDate =
    today();


  transactions.unshift({

    type:
      `VIP ${level} selected`,

    amount:
      0,

    date:
      new Date().toLocaleString()

  });


  save();

  render();

  showPage("homePage");

}


/* =========================
   TRANSACTIONS
========================= */

function renderTransactions(){

  if(!transactions.length){

    transactionsEl.innerHTML = `
      <div class="transaction">
        <div>
          <b>No transactions yet</b>
          <small>Activity will appear here.</small>
        </div>
      </div>
    `;

    return;

  }


  transactionsEl.innerHTML = "";


  transactions
    .slice(0,30)
    .forEach(tx => {

      const row =
        document.createElement("div");

      row.className =
        "transaction";


      row.innerHTML = `

        <div>
          <b>${escapeHTML(tx.type)}</b>
          <small>${escapeHTML(tx.date)}</small>
        </div>

        <div class="amount">
          ${
            tx.amount > 0
              ? "+$" + money(tx.amount)
              : "—"
          }
        </div>
      `;


      transactionsEl.appendChild(row);

    });

}


/* =========================
   WALLET
========================= */

function openWallet(type){

  selectedWalletAction =
    type;

  const modal =
    document.getElementById(
      "walletModal"
    );

  const title =
    document.getElementById(
      "walletModalTitle"
    );

  const label =
    document.getElementById(
      "walletModalLabel"
    );

  const button =
    document.getElementById(
      "walletAction"
    );


  if(type === "deposit"){

    label.textContent =
      "ACCOUNT";

    title.textContent =
      "Deposit";

    button.textContent =
      "ADD CREDITS";

  }else{

    label.textContent =
      "ACCOUNT";

    title.textContent =
      "Withdraw";

    button.textContent =
      "REQUEST";

  }


  document
    .getElementById("walletAmount")
    .value = "";

  modal.classList.add("show");

}


function closeWallet(){

  document
    .getElementById("walletModal")
    .classList.remove("show");

}


document
  .getElementById("walletAction")
  .addEventListener(
    "click",
    walletAction
  );


function walletAction(){

  const input =
    document.getElementById(
      "walletAmount"
    );

  const amount =
    Number(input.value);


  if(!amount || amount <= 0){

    alert("Enter a valid amount.");

    return;

  }


  /*
    No real payment is processed.
    This is only account testing.
  */

  if(
    selectedWalletAction ===
    "deposit"
  ){

    user.balance += amount;

    transactions.unshift({

      type:
        "Account credit",

      amount:
        amount,

      date:
        new Date().toLocaleString()

    });

  }else{

    if(amount > user.balance){

      alert(
        "Insufficient account balance."
      );

      return;

    }


    user.balance -= amount;

    transactions.unshift({

      type:
        "Withdrawal test",

      amount:
        -amount,

      date:
        new Date().toLocaleString()

    });

  }


  save();

  closeWallet();

  render();

}


/* =========================
   REFERRAL
========================= */

function copyReferral(){

  if(!user) return;


  navigator.clipboard
    .writeText(user.referralCode)
    .then(() => {

      alert(
        "Referral code copied."
      );

    })
    .catch(() => {

      alert(
        user.referralCode
      );

    });

}


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll(".nav")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showPage(
          button.dataset.page
        );

      }
    );

  });


function showPage(pageId){

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove(
        "active"
      );

    });


  document
    .getElementById(pageId)
    .classList.add(
      "active"
    );


  document
    .querySelectorAll(".nav")
    .forEach(nav => {

      nav.classList.toggle(
        "active",
        nav.dataset.page === pageId
      );

    });


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================
   DATE
========================= */

document
  .getElementById("taskDate")
  .textContent =
  new Date().toLocaleDateString(
    undefined,
    {
      month:"short",
      day:"numeric",
      year:"numeric"
    }
  );


/* =========================
   SECURITY HTML
========================= */

function escapeHTML(value){

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================
   START
========================= */

if(!user){

  document
    .getElementById("loginModal")
    .classList.add("show");

}else{

  document
    .getElementById("loginModal")
    .classList.remove("show");

  render();

}
