"use strict";

/* =========================
   STATE
========================= */

let completedTasks = 0;
let currentVip = 0;

const DAILY_TASKS = 3;


/* =========================
   ELEMENTS
========================= */

const balanceElement =
  document.getElementById("balance");

const usernameElement =
  document.getElementById("username");

const vipLevelElement =
  document.getElementById("vipLevel");

const taskCounter =
  document.getElementById("taskCounter");

const progressBar =
  document.getElementById("progressBar");

const vipModal =
  document.getElementById("vipModal");

const openVipButton =
  document.getElementById("openVip");

const navVipButton =
  document.getElementById("navVip");

const closeVipButton =
  document.getElementById("closeVip");


/* =========================
   LOAD USER
========================= */

const savedUsername =
  localStorage.getItem("taskvip_username");

if(savedUsername){

  usernameElement.textContent =
    savedUsername;

}


/* =========================
   VIP MODAL
========================= */

function openVIP(){

  vipModal.classList.add("show");

}

function closeVIP(){

  vipModal.classList.remove("show");

}

openVipButton.addEventListener(
  "click",
  openVIP
);

navVipButton.addEventListener(
  "click",
  openVIP
);

closeVipButton.addEventListener(
  "click",
  closeVIP
);

vipModal.addEventListener(
  "click",
  function(event){

    if(event.target === vipModal){

      closeVIP();

    }

  }
);


/* =========================
   TASK SYSTEM
========================= */

const taskButtons =
document.querySelectorAll(
  ".task-button"
);

taskButtons.forEach(
  function(button){

    button.addEventListener(
      "click",
      function(){

        startTask(button);

      }
    );

  }
);


function startTask(button){

  /*
    Demo version:
    VIP is not connected to
    a real database yet.
  */

  if(currentVip < 1){

    alert(
      "You need an active VIP membership to complete tasks."
    );

    return;

  }


  if(button.disabled){

    return;

  }


  button.disabled = true;

  let seconds = 3;

  button.textContent =
    seconds;


  const timer =
    setInterval(
      function(){

        seconds--;

        if(seconds > 0){

          button.textContent =
            seconds;

          return;

        }


        clearInterval(timer);

        button.textContent =
          "✓ DONE";

        completedTasks++;

        updateProgress();

      },
      1000
    );

}


/* =========================
   PROGRESS
========================= */

function updateProgress(){

  taskCounter.textContent =
    completedTasks +
    " / " +
    DAILY_TASKS;

  progressBar.style.width =
    (
      completedTasks /
      DAILY_TASKS *
      100
    ) +
    "%";

}


/* =========================
   VIP DEMO
========================= */

const vipButtons =
document.querySelectorAll(
  ".vip-option button"
);

vipButtons.forEach(
  function(button,index){

    button.addEventListener(
      "click",
      function(){

        const selectedVip =
          index + 1;

        /*
          DEMO ONLY.
          Real purchase will later
          be connected to crypto.
        */

        currentVip =
          selectedVip;

        vipLevelElement.textContent =
          currentVip;

        closeVIP();

      }
    );

  }
);


/* =========================
   PREVENT DOUBLE TAP ZOOM
========================= */

let lastTouchEnd = 0;

document.addEventListener(
  "touchend",
  function(event){

    const now =
      Date.now();

    if(
      now - lastTouchEnd <= 300
    ){

      event.preventDefault();

    }

    lastTouchEnd = now;

  },
  {
    passive:false
  }
);


/* =========================
   START
========================= */

updateProgress();
