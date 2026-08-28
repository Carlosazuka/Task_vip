/* =========================================================
   GOLDTASK — SCRIPT
   TEST / FRONTEND VERSION
========================================================= */

"use strict";

/* =========================================================
   VIP PLANS
========================================================= */

const VIP_PLANS = [
  { level: 1, price: 4, tasks: 1, reward: 0.20 },
  { level: 2, price: 10, tasks: 2, reward: 0.25 },
  { level: 3, price: 20, tasks: 3, reward: 0.30 },
  { level: 4, price: 35, tasks: 4, reward: 0.35 },
  { level: 5, price: 55, tasks: 5, reward: 0.40 },
  { level: 6, price: 80, tasks: 6, reward: 0.50 },
  { level: 7, price: 120, tasks: 7, reward: 0.60 },
  { level: 8, price: 180, tasks: 8, reward: 0.70 },
  { level: 9, price: 260, tasks: 9, reward: 0.80 },
  { level: 10, price: 350, tasks: 10, reward: 1.00 }
];


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "goldtask_user";

let user = loadUser();


function loadUser() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return null;

    return JSON.parse(saved);

  } catch (error) {

    console.error("Storage error:", error);

    return null;
  }
}


function saveUser() {

  if (!user) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(user)
  );
}


/* =========================================================
   CREATE USER
========================================================= */

function createUser(name, email, password, referral) {

  const code =
    "GOLD" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  return {

    name,
    email,
    password,

    referralUsed:
      referral || "",

    referralCode:
      code,

    vip: 1,

    balance: 0,

    tasksDone: 0,

    lastTaskDate:
      getToday(),

    transactions: [],

    referrals: 0,

    referralEarnings: 0

  };
}


/* =========================================================
   DATE
========================================================= */

function getToday() {

  const date = new Date();

  return date.toISOString()
    .split("T")[0];
}


/* =========================================================
   DAILY RESET
========================================================= */

function checkDailyReset() {

  if (!user) return;

  const today = getToday();

  if (user.lastTaskDate !== today) {

    user.tasksDone = 0;

    user.lastTaskDate = today;

    saveUser();
  }
}


/* =========================================================
   AUTH
========================================================= */

function showRegister() {

  const login =
    document.getElementById("loginBox");

  const register =
    document.getElementById("registerBox");

  if (login)
    login.style.display = "none";

  if (register)
    register.style.display = "block";
}


function showLogin() {

  const login =
    document.getElementById("loginBox");

  const register =
    document.getElementById("registerBox");

  if (login)
    login.style.display = "block";

  if (register)
    register.style.display = "none";
}


/* =========================================================
   REGISTER
========================================================= */

function registerUser() {

  const name =
    document.getElementById("registerName")
      ?.value
      .trim();

  const email =
    document.getElementById("registerEmail")
      ?.value
      .trim();

  const password =
    document.getElementById("registerPassword")
      ?.value;

  const password2 =
    document.getElementById("registerPassword2")
      ?.value;

  const referral =
    document.getElementById("referralCode")
      ?.value
      .trim();


  if (!name) {

    alert("შეიყვანე მომხმარებლის სახელი.");

    return;
  }


  if (!email) {

    alert("შეიყვანე ელფოსტა.");

    return;
  }


  if (!password) {

    alert("შეიყვანე პაროლი.");

    return;
  }


  if (password.length < 4) {

    alert("პაროლი მინიმუმ 4 სიმბოლო უნდა იყოს.");

    return;
  }


  if (password !== password2) {

    alert("პაროლები ერთმანეთს არ ემთხვევა.");

    return;
  }


  /*
    TEST MODE:
    referral code is intentionally NOT validated.
    Any value or empty field is accepted.
  */


  user =
    createUser(
      name,
      email,
      password,
      referral
    );


  saveUser();

  enterSite();

}


/* =========================================================
   LOGIN
========================================================= */

function loginUser() {

  const email =
    document.getElementById("loginEmail")
      ?.value
      .trim();

  const password =
    document.getElementById("loginPassword")
      ?.value;


  if (!email || !password) {

    alert("შეავსე ორივე ველი.");

    return;
  }


  /*
    FRONTEND TEST LOGIN

    If an account exists in localStorage,
    credentials are checked.

    If no account exists, a temporary
    test account is created.
  */


  if (user) {

    if (
      (
        user.email === email ||
        user.name === email
      ) &&
      user.password === password
    ) {

      enterSite();

      return;

    }

    alert("მომხმარებელი ან პაროლი არასწორია.");

    return;
  }


  user =
    createUser(
      email,
      email,
      password,
      ""
    );


  saveUser();

  enterSite();
}


/* =========================================================
   ENTER SITE
========================================================= */

function enterSite() {

  checkDailyReset();

  const auth =
    document.getElementById("authPage");

  const main =
    document.getElementById("mainPage");


  if (auth)
    auth.classList.remove("active");

  if (main)
    main.classList.add("active");


  updateUserInterface();

  renderTasks();

  renderVIPs();

  renderTransactions();

  renderReferral();
}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

  /*
    Only leaves the current session.
    The account remains stored.
  */

  const auth =
    document.getElementById("authPage");

  const main =
    document.getElementById("mainPage");


  if (main)
    main.classList.remove("active");

  if (auth)
    auth.classList.add("active");

  showLogin();
}


/* =========================================================
   NAVIGATION
========================================================= */

function openPage(pageId, button) {

  const pages =
    document.querySelectorAll(
      "#mainPage main > .page"
    );


  pages.forEach(page => {

    page.classList.remove("active");

  });


  const target =
    document.getElementById(pageId);

  if (target)
    target.classList.add("active");


  document
    .querySelectorAll(".bottom-nav .nav")
    .forEach(nav => {

      nav.classList.remove("active");

    });


  if (button)
    button.classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   USER UI
========================================================= */

function updateUserInterface() {

  if (!user) return;


  const balance =
    Number(user.balance || 0)
      .toFixed(2);


  const vip =
    Number(user.vip || 1);


  const plan =
    VIP_PLANS.find(
      item => item.level === vip
    ) || VIP_PLANS[0];


  setText(
    "userName",
    user.name
  );


  setText(
    "balance",
    balance
  );


  setText(
    "topBalance",
    balance
  );


  setText(
    "walletBalance",
    balance
  );


  setText(
    "currentVip",
    vip
  );


  setText(
    "tasksDone",
    user.tasksDone
  );


  setText(
    "tasksTotal",
    plan.tasks
  );


  setText(
    "remainingTasks",
    Math.max(
      plan.tasks - user.tasksDone,
      0
    )
  );


  setText(
    "myReferralCode",
    user.referralCode
  );


  setText(
    "refCount",
    user.referrals || 0
  );


  setText(
    "refEarnings",
    Number(
      user.referralEarnings || 0
    ).toFixed(2)
  );
}


function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element)
    element.textContent = value;
}


/* =========================================================
   TASKS
========================================================= */

function renderTasks() {

  const container =
    document.getElementById("tasks");

  if (!container || !user)
    return;


  checkDailyReset();


  const plan =
    VIP_PLANS.find(
      item =>
        item.level === Number(user.vip)
    ) || VIP_PLANS[0];


  container.innerHTML = "";


  for (
    let i = 1;
    i <= plan.tasks;
    i++
  ) {

    const completed =
      i <= user.tasksDone;


    const task =
      document.createElement("div");

    task.className = "task";


    task.innerHTML = `

      <div class="task-number">
        ${String(i).padStart(2, "0")}
      </div>

      <div class="task-info">

        <b>
          Daily Task ${i}
        </b>

        <span>
          ${
            completed
              ? "დავალება შესრულებულია"
              : "ხელმისაწვდომია შესრულებისთვის"
          }
        </span>

      </div>

      <div class="task-reward">
        $${plan.reward.toFixed(2)}
      </div>

      <button
        class="task-btn"
        ${
          completed
            ? "disabled"
            : ""
        }
        onclick="completeTask(${i}, this)"
      >

        ${
          completed
            ? "DONE"
            : "START"
        }

      </button>

    `;


    container.appendChild(task);
  }


  updateUserInterface();
}


/* =========================================================
   COMPLETE TASK
========================================================= */

function completeTask(
  taskNumber,
  button
) {

  if (!user) return;


  checkDailyReset();


  const plan =
    VIP_PLANS.find(
      item =>
        item.level === Number(user.vip)
    ) || VIP_PLANS[0];


  if (
    user.tasksDone >= plan.tasks
  ) {

    alert(
      "დღევანდელი ყველა დავალება უკვე შესრულებულია."
    );

    return;
  }


  /*
    Tasks must be completed in order.
  */

  if (
    taskNumber !==
    user.tasksDone + 1
  ) {

    alert(
      "ჯერ წინა დავალება შეასრულე."
    );

    return;
  }


  if (button) {

    button.disabled = true;

    button.textContent = "WAIT...";

  }


  /*
    3 SECOND TASK
  */

  let seconds = 3;


  const timer =
    setInterval(() => {

      seconds--;

      if (button)
        button.textContent =
          `${seconds}s`;

      if (seconds <= 0) {

        clearInterval(timer);

        finishTask(
          plan,
          taskNumber,
          button
        );

      }

    }, 1000);
}


/* =========================================================
   FINISH TASK
========================================================= */

function finishTask(
  plan,
  taskNumber,
  button
) {

  user.tasksDone += 1;


  const reward =
    Number(plan.reward);


  user.balance =
    Number(user.balance || 0)
    + reward;


  user.balance =
    Number(
      user.balance.toFixed(2)
    );


  user.transactions.unshift({

    type: "Task reward",

    amount: reward,

    date:
      new Date().toLocaleString()

  });


  saveUser();


  if (button) {

    button.textContent = "DONE";

    button.disabled = true;

  }


  updateUserInterface();

  renderTasks();

  renderTransactions();

}


/* =========================================================
   VIP
========================================================= */

function renderVIPs() {

  const container =
    document.getElementById("vipList");

  if (!container)
    return;


  container.innerHTML = "";


  VIP_PLANS.forEach(plan => {

    const current =
      Number(user?.vip || 1) ===
      plan.level;


    const card =
      document.createElement("div");


    card.className =
      "vip-card" +
      (
        current
          ? " current"
          : ""
      );


    card.innerHTML = `

      <div class="vip-top">

        <div class="vip-name">
          VIP ${plan.level}
        </div>

        <div class="vip-price">
          $${plan.price}
          <small>/ membership</small>
        </div>

      </div>


      <div class="vip-details">

        <div>
          <span>Daily tasks</span>
          <b>${plan.tasks}</b>
        </div>

        <div>
          <span>Reward / task</span>
          <b>$${plan.reward.toFixed(2)}</b>
        </div>

        <div>
          <span>Status</span>
          <b>
            ${
              current
                ? "ACTIVE"
                : "AVAILABLE"
            }
          </b>
        </div>

      </div>


      <button
        class="vip-select"
        ${
          current
            ? "disabled"
            : ""
        }
        onclick="selectVIP(${plan.level})"
      >

        ${
          current
            ? "CURRENT PLAN"
            : "SELECT VIP " + plan.level
        }

      </button>

    `;


    container.appendChild(card);

  });
}


/* =========================================================
   SELECT VIP
========================================================= */

function selectVIP(level) {

  if (!user) return;


  const plan =
    VIP_PLANS.find(
      item => item.level === level
    );


  if (!plan) return;


  if (level <= Number(user.vip)) {

    alert(
      "ეს VIP უკვე აქტიურია ან უფრო დაბალი დონეა."
    );

    return;
  }


  /*
    TEST MODE:
    VIP upgrade happens locally.
    No real payment is processed.
  */


  user.vip = level;

  user.tasksDone = 0;

  user.lastTaskDate = getToday();


  user.transactions.unshift({

    type:
      `VIP ${level} selected`,

    amount: 0,

    date:
      new Date().toLocaleString()

  });


  saveUser();


  updateUserInterface();

  renderVIPs();

  renderTasks();

  renderTransactions();


  alert(
    `VIP ${level} გააქტიურდა ტესტირების რეჟიმში.`
  );
}


/* =========================================================
   TRANSACTIONS
========================================================= */

function renderTransactions() {

  const container =
    document.getElementById(
      "transactions"
    );

  if (!container || !user)
    return;


  const list =
    user.transactions || [];


  if (!list.length) {

    container.innerHTML = `

      <div class="transaction">

        <div>

          <b>No transactions yet</b>

          <small>
            შენი აქტივობა აქ გამოჩნდება.
          </small>

        </div>

        <div class="amount">
          $0.00
        </div>

      </div>

    `;

    return;
  }


  container.innerHTML = "";


  list
    .slice(0, 15)
    .forEach(transaction => {

      const row =
        document.createElement("div");

      row.className =
        "transaction";


      const amount =
        Number(
          transaction.amount || 0
        ).toFixed(2);


      row.innerHTML = `

        <div>

          <b>
            ${escapeHTML(
              transaction.type
            )}
          </b>

          <small>
            ${escapeHTML(
              transaction.date
            )}
          </small>

        </div>

        <div class="amount">
          ${
            Number(amount) > 0
              ? "+" 
              : ""
          }$${amount}
        </div>

      `;


      container.appendChild(row);

    });
}


/* =========================================================
   REFERRAL
========================================================= */

function renderReferral() {

  if (!user)
    return;


  setText(
    "myReferralCode",
    user.referralCode
  );


  setText(
    "refCount",
    user.referrals || 0
  );


  setText(
    "refEarnings",
    Number(
      user.referralEarnings || 0
    ).toFixed(2)
  );
}


function copyReferral() {

  if (!user) return;


  const code =
    user.referralCode;


  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(code)
      .then(() => {

        alert(
          "მოწვევის კოდი დაკოპირდა."
        );

      })
      .catch(() => {

        fallbackCopy(code);

      });

  } else {

    fallbackCopy(code);

  }
}


function fallbackCopy(text) {

  const input =
    document.createElement("textarea");

  input.value = text;

  document.body.appendChild(input);

  input.select();

  document.execCommand("copy");

  input.remove();

  alert(
    "მოწვევის კოდი დაკოპირდა."
  );
}


/* =========================================================
   WALLET MODALS
========================================================= */

function openDeposit() {

  const modal =
    document.getElementById(
      "depositModal"
    );

  if (modal)
    modal.classList.add("show");
}


function openWithdraw() {

  const modal =
    document.getElementById(
      "withdrawModal"
    );

  if (modal)
    modal.classList.add("show");
}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal)
    modal.classList.remove("show");
}


/* =========================================================
   DEMO DEPOSIT
========================================================= */

function demoDeposit() {

  const input =
    document.getElementById(
      "depositAmount"
    );


  const amount =
    Number(input?.value);


  if (
    !amount ||
    amount <= 0
  ) {

    alert(
      "შეიყვანე თანხა."
    );

    return;
  }


  /*
    This is a local testing balance only.
  */

  user.balance =
    Number(user.balance || 0)
    + amount;


  user.balance =
    Number(
      user.balance.toFixed(2)
    );


  user.transactions.unshift({

    type:
      "Test balance credit",

    amount,

    date:
      new Date().toLocaleString()

  });


  saveUser();


  if (input)
    input.value = "";


  closeModal(
    "depositModal"
  );


  updateUserInterface();

  renderTransactions();
}


/* =========================================================
   DEMO WITHDRAW
========================================================= */

function demoWithdraw() {

  const input =
    document.getElementById(
      "withdrawAmount"
    );


  const amount =
    Number(input?.value);


  if (
    !amount ||
    amount <= 0
  ) {

    alert(
      "შეიყვანე თანხა."
    );

    return;
  }


  if (
    amount >
    Number(user.balance || 0)
  ) {

    alert(
      "არასაკმარისი ბალანსი."
    );

    return;
  }


  /*
    Test-only withdrawal.
    No real payment is sent anywhere.
  */

  user.balance =
    Number(user.balance || 0)
    - amount;


  user.balance =
    Number(
      user.balance.toFixed(2)
    );


  user.transactions.unshift({

    type:
      "Test withdrawal",

    amount:
      -amount,

    date:
      new Date().toLocaleString()

  });


  saveUser();


  if (input)
    input.value = "";


  closeModal(
    "withdrawModal"
  );


  updateUserInterface();

  renderTransactions();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
  "click",
  event => {

    if (
      event.target.classList
        .contains("modal")
    ) {

      event.target
        .classList
        .remove("show");

    }

  }
);


/* =========================================================
   PREVENT DOUBLE-TAP ZOOM
========================================================= */

document.addEventListener(
  "dblclick",
  event => {

    event.preventDefault();

  },
  {
    passive:false
  }
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
      If an account already exists,
      automatically open the site.
    */

    if (user) {

      enterSite();

    } else {

      const auth =
        document.getElementById(
          "authPage"
        );

      const main =
        document.getElementById(
          "mainPage"
        );

      if (auth)
        auth.classList.add("active");

      if (main)
        main.classList.remove("active");

    }

  }
);
