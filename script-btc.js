// ==UserScript==
// @name         Script-Free-BTC
// @namespace    https://github.com/HaygoNunes/Script-FreeBTC
// @version      2.0
// @description  Script para automatizar ações no FreeBitco.in, incluindo interação com CAPTCHA e clique automático no "Claim".
// @author       Hyago Nunes
// @match        https://freebitco.in/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // Função para selecionar elementos do DOM
    function selecionarElemento(seletor) {
        return document.querySelector(seletor);
    }

    // Função para verificar se um elemento está visível
    function elementoEstaVisivel(elemento) {
        return elemento && elemento.offsetParent !== null;
    }

    // Função para interagir com o hCaptcha
    function interagirComHCaptcha() {
        const HC_CHECK_BOX = "#checkbox"; 
        const HC_ARIA_CHECKED = "aria-checked"; 

        const caixaHCaptcha = selecionarElemento(HC_CHECK_BOX);

        if (elementoEstaVisivel(caixaHCaptcha)) {
            if (caixaHCaptcha.getAttribute(HC_ARIA_CHECKED) === "true") {
                console.log("hCaptcha já resolvido.");
                return true;
            } else if (caixaHCaptcha.getAttribute(HC_ARIA_CHECKED) === "false") {
                caixaHCaptcha.click();
                console.log("Caixa do hCaptcha clicada com sucesso.");
                return true;
            }
        } else {
            console.log("Caixa do hCaptcha não encontrada ou não visível.");
            return false;
        }
    }

    // Função para interagir com o reCAPTCHA
    function interagirComReCaptcha() {
        const CHECK_BOX = ".recaptcha-checkbox-border"; 
        const RECAPTCHA_STATUS = "#recaptcha-accessible-status"; 
        const DOSCAPTCHA = ".rc-doscaptcha-body"; 

        const caixaReCaptcha = selecionarElemento(CHECK_BOX);
        const statusReCaptcha = selecionarElemento(RECAPTCHA_STATUS);
        const mensagemAutomatedQueries = selecionarElemento(DOSCAPTCHA);

        if (elementoEstaVisivel(caixaReCaptcha)) {
            caixaReCaptcha.click();
            console.log("Caixa do reCAPTCHA clicada com sucesso.");

            // Verifica se o reCAPTCHA foi resolvido
            if (statusReCaptcha && statusReCaptcha.innerText.includes("verification")) {
                console.log("reCAPTCHA resolvido com sucesso.");
                return true;
            }
        } else {
            console.log("Caixa do reCAPTCHA não encontrada ou não visível.");
        }

        // Verifica se há mensagem de queries automatizadas
        if (mensagemAutomatedQueries && mensagemAutomatedQueries.innerText.length > 0) {
            console.log("Mensagem de queries automatizadas detectada.");
        }

        return false;
    }

    // Função para clicar no botão "Claim" se o CAPTCHA estiver resolvido
    function verificarEClicarClaim() {
        const botaoClaim = selecionarElemento('#claim'); 
        const hCaptchaResolvido = selecionarElemento("#checkbox[aria-checked='true']"); 
        const reCaptchaResolvido = selecionarElemento(".recaptcha-checkbox[aria-checked='true']"); 

        if (elementoEstaVisivel(botaoClaim) && (hCaptchaResolvido || reCaptchaResolvido)) {
            botaoClaim.click();
            console.log("Botão 'Claim' clicado com sucesso.");
            return true;
        } else {
            console.log("Botão 'Claim' não disponível ou CAPTCHA não resolvido.");
            return false;
        }
    }

    // Função para clicar no botão "PLAY WITHOUT CAPTCHA"
    function clicarPlaySemCaptcha() {
        const botaoPlaySemCaptcha = selecionarElemento('#play_without_captchas_button');
        if (elementoEstaVisivel(botaoPlaySemCaptcha)) {
            botaoPlaySemCaptcha.click();
            console.log("Botão 'PLAY WITHOUT CAPTCHA' clicado com sucesso.");
        } else {
            console.log("Botão 'PLAY WITHOUT CAPTCHA' não encontrado ou não visível.");
        }
    }

    // Função para clicar no botão "ROLL"
    function clicarRoll() {
        const botaoRoll = selecionarElemento('#free_play_form_button');
        if (elementoEstaVisivel(botaoRoll)) {
            botaoRoll.click();
            console.log("Botão 'ROLL' clicado com sucesso.");
        } else {
            console.log("Botão 'ROLL' não encontrado ou não visível.");
        }
    }

    // Função principal para executar as ações
    function executarAcoes() {
        console.log("Script iniciado. Aguardando tempo para ações...");

        // Verifica periodicamente se o CAPTCHA está resolvido e clica no "Claim" se estiver disponível
        const intervaloVerificacaoClaim = setInterval(() => {
            if (verificarEClicarClaim()) {
                clearInterval(intervaloVerificacaoClaim);
            }
        }, 2000); 

        
        const intervaloHCaptcha = setInterval(() => {
            if (interagirComHCaptcha()) {
                clearInterval(intervaloHCaptcha);
            }
        }, 3000);

        
        const intervaloReCaptcha = setInterval(() => {
            if (interagirComReCaptcha()) {
                clearInterval(intervaloReCaptcha);
            }
        }, 3000);

        
        setTimeout(() => {
            clicarPlaySemCaptcha();
        }, 7000);

        
        setTimeout(() => {
            clicarRoll();
        }, 10000);

        
        setTimeout(() => {
            clicarRoll();
        }, 15000);
    }

    // Inicia o script quando a página estiver totalmente carregada
    window.addEventListener('load', () => {
        console.log("Página carregada. Iniciando script...");
        executarAcoes();
    });
})();