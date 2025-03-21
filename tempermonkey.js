// ==UserScript==
// @name         Void Coin FreeBitco
// @namespace    https://github.com/HyagoNunes/Script-FreeBTC
// @version      2.0
// @description  Script
// @author       Sr.Fox / Hyago Nunes
// @match        https://freebitco.in/*
// @grant        none
// @require      https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/UI_script_btc.js
// @require      https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/roll_script_btc.js
// ==/UserScript==

(function(){
    'use strict';
    console.log("Tempermonkey script iniciado");
    initUI();
    if(window.rollInit) {
        window.rollInit();
    }
})();