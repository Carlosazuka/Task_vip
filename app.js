"use strict";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "https://egackwuidatyuihmdhvo.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CC43Qm8KEQHxFByzi0VieQ_lLkSdPsl";

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================
   STATE
========================================= */

let currentUser = null;


/* =========================================
   ELEMENTS
========================================= */

const usernameElement =
  document.getElementById("username");

const vipLevelElement =
  document.getElementById("vipLevel");

const balanceElement =
  document.getElementById("balance");

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


/* =========================================
   LOGIN / REGISTER SCREEN
========================================= */

function createLoginScreen(){

  const box =
    document.createElement("div");

  box.id = "loginScreen";

  box.innerHTML = `
    <div class="login-overlay">

      <div class="login-box">

        <div class="login-logo">
          TASK<span>VIP</span>
        </div>

        <p class="login-subtitle">
          Create your account
        </p>

        <input
          id="usernameInput"
          maxlength="16"
          autocomplete="off"
          placeholder="Username"
        >

        <button id="loginButton">
          CONTINUE
        </button>

        <div id="loginMessage"></div>

      </div>

    </div>
  `;

  document.body.appendChild(box);

  addLoginStyles();

  document
    .getElementById("loginButton")
    .addEventListener(
      "click",
      loginOrRegister
    );

  document
    .getElementById("usernameInput")
    .addEventListener(
      "keydown",
      function(event){

        if(event.key === "Enter"){

          loginOrRegister();

        }

      }
    );

}


/* =========================================
   LOGIN CSS
========================================= */

function addLoginStyles(){

  const style =
    document.createElement("style");

  style.textContent = `

    .login-overlay{
      position:fixed;
      inset:0;
      z-index:999;
      background:#070a12;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    }

    .login-box{
      width:100%;
      max-width:400px;
      padding:28px 22px;
      border-radius:24px;
      background:#111725;
      border:1px solid #293248;
      box-shadow:0 20px 80px #000b;
      text-align:center;
    }

    .login-logo{
      font-size:34px;
      font-weight:900;
      margin-bottom:8px;
    }

    .login-logo span{
      color:#7968ff;
    }

    .login-subtitle{
      color:#7f8aa4;
      margin:0 0 22px;
    }

    #usernameInput{
      width:100%;
      padding:16px;
      border-radius:14px;
      border:1px solid #2b344b;
      background:#080d18;
      color:white;
      outline:none;
      font-size:16px;
      margin-bottom:10px;
    }

    #usernameInput:focus{
      border-color:#7565ff;
    }

    #loginButton{
      width:100%;
      padding:16px;
      border:0;
      border-radius:14px;
      background:#7565ff;
      color:white;
      font-weight:900;
      font-size:15px;
    }

    #loginMessage{
      min-height:20px;
      margin-top:12px;
      color:#8791aa;
      font-size:13px;
    }

  `;

  document.head.appendChild(style);

}


/* =========================================
   REFERRAL CODE
========================================= */

function generateReferralCode(){

  return Math.random()
    .toString(36)
    .substring(2,10)
    .toUpperCase();

}


/* =========================================
   LOGIN / REGISTER
========================================= */

async function loginOrRegister(){

  const input =
    document.getElementById(
      "usernameInput"
    );

  const message =
    document.getElementById(
      "loginMessage"
    );

  const username =
    input.value.trim();


  if(!username){

    message.textContent =
      "Enter a username.";

    return;

  }


  if(username.length < 3){

    message.textContent =
      "Username must be at least 3 characters.";

    return;

  }


  const button =
    document.getElementById(
      "loginButton"
    );

  button.disabled = true;

  message.textContent =
    "Connecting...";


  try{

    /* FIND EXISTING USER */

    const existing =
      await supabase
        .from("users")
        .select("*")
        .eq(
          "username",
          username
        )
        .maybeSingle();


    if(existing.error){

      throw existing.error;

    }


    /* EXISTING USER */

    if(existing.data){

      currentUser =
        existing.data;

    }

    /* NEW USER */

    else{

      const newUser =
        await supabase
          .from("users")
          .insert({

            username:
              username,

            vip:
              0,

            balance:
              0,

            referral_code:
              generateReferralCode()

          })
          .select()
          .single();


      if(newUser.error){

        throw newUser.error;

      }


      currentUser =
        newUser.data;

    }


    /* SAVE LOCAL SESSION */

    localStorage.setItem(
      "taskvip_username",
      currentUser.username
    );


    localStorage.setItem(
      "taskvip_user_id",
      currentUser.id
    );


    updateUserInterface();

    removeLoginScreen();


  }catch(error){

    console.error(
      "LOGIN ERROR:",
      error
    );

    message.textContent =
      "Error: " +
      error.message;

    button.disabled = false;

  }

}


/* =========================================
   REMOVE LOGIN
========================================= */

function removeLoginScreen(){

  const screen =
    document.getElementById(
      "loginScreen"
    );

  if(screen){

    screen.remove();

  }

}


/* =========================================
   UPDATE USER UI
========================================= */

function updateUserInterface(){

  if(!currentUser){

    return;

  }


  usernameElement.textContent =
    currentUser.username;


  vipLevelElement.textContent =
    currentUser.vip;


  balanceElement.textContent =
    Number(
      currentUser.balance || 0
    ).toFixed(2);

}


/* =========================================
   LOAD SAVED USER
========================================= */

async function loadUser(){

  const savedId =
    localStorage.getItem(
      "taskvip_user_id"
    );


  if(!savedId){

    createLoginScreen();

    return;

  }


  const result =
    await supabase
      .from("users")
      .select("*")
      .eq(
        "id",
        savedId
      )
      .maybeSingle();


  if(result.error){

    console.error(
      result.error
    );

    localStorage.removeItem(
      "taskvip_user_id"
    );

    localStorage.removeItem(
      "taskvip_username"
    );

    createLoginScreen();

    return;

  }


  if(!result.data){

    localStorage.removeItem(
      "taskvip_user_id"
    );

    createLoginScreen();

    return;

  }


  currentUser =
    result.data;

  updateUserInterface();

}


/* =========================================
   VIP MODAL
========================================= */

function openVIP(){

  vipModal.classList.add(
    "show"
  );

}

function closeVIP(){

  vipModal.classList.remove(
    "show"
  );

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

    if(
      event.target ===
      vipModal
    ){

      closeVIP();

    }

  }
);


/* =========================================
   TASK SYSTEM
========================================= */

let completedTasks = 0;

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


async function startTask(button){

  if(!currentUser){

    return;

  }


  /* VIP REQUIRED */

  if(
    Number(currentUser.vip) < 1
  ){

    alert(
      "You need VIP 1 or higher to complete tasks."
    );

    openVIP();

    return;

  }


  if(button.disabled){

    return;

  }


  if(
    completedTasks >= 3
  ){

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


/* =========================================
   PROGRESS
========================================= */

function updateProgress(){

  taskCounter.textContent =
    completedTasks +
    " / 3";


  progressBar.style.width =
    (
      completedTasks /
      3 *
      100
    ) +
    "%";

}


/* =========================================
   DEMO VIP SELECTION
========================================= */

const vipButtons =
  document.querySelectorAll(
    ".vip-option button"
  );


vipButtons.forEach(
  function(button,index){

    button.addEventListener(
      "click",
      async function(){

        if(!currentUser){

          return;

        }


        /*
          DEMO ONLY.

          This changes the local
          membership through the
          current database setup.

          REAL PAYMENT IS NOT
          CONNECTED HERE.
        */

        const selectedVip =
          index + 1;


        currentUser.vip =
          selectedVip;


        vipLevelElement.textContent =
          selectedVip;


        closeVIP();

      }
    );

  }
);


/* =========================================
   MOBILE ZOOM PROTECTION
========================================= */

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


    lastTouchEnd =
      now;

  },
  {
    passive:false
  }
);


/* =========================================
   START
========================================= */

updateProgress();

loadUser();
