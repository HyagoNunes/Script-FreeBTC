// ==UserScript==
// @name         Void Coin FreeBitco 
// @namespace    https://github.com/HaygoNunes/Script-FreeBTC
// @version      2.0
// @description  https://freebitco.in/?r=1393623
// @author       Sr.Fox / Hyago Nunes
// @match        https://freebitco.in/*
// @match        https://*/recaptcha/*
// @match        https://*.hcaptcha.com/*hcaptcha-challenge*
// @match        https://*.hcaptcha.com/*checkbox*
// @match        https://*.hcaptcha.com/*captcha*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // UTILITÁRIOS BÁSICOS
    function qSelector(selector) { return document.querySelector(selector); }
    function isHidden(el) { return (el.offsetParent === null); }
    function random(min, max) { return min + (max - min) * Math.random(); }

    // CONFIGURAÇÃO 
    const CONFIG = {
        tentativasMaximas: 7,
        intervaloCaptcha: 3000,            
        rollDelay: 7000,                   
        playWithoutCaptchaDelay: 12000,     
        secondRollDelay: 14000,            
        intervaloVerificacao: 1000,         
        intervaloBackground: 30000,         
        // Seletores para captchas e botões
        hcCheckBox: "#checkbox",
        hcAriaChecked: "aria-checked",
        rcCheckBox: ".recaptcha-checkbox-border",
        rcStatus: "#recaptcha-accessible-status",
        rcDosCaptcha: ".rc-doscaptcha-body",
        rollButton: "#free_play_form_button",
        playWithoutCaptchaButton: "#play_without_captchas_button",
        timerElement: "#time_remaining",
        // Cloudflare Turnstile
        cfIframeSelector: 'iframe[src*="challenges.cloudflare.com"]',
        cfResponseInput: "#cf-chl-widget-a1bva_response",
        cfSuccessSelector: "#success-i > circle",
        // 2Captcha (para resolver o Turnstile, se necessário)
        use2Captcha: true,
        turnstileSitekey: "a1bva",
        apiKey2Captcha: "e6e564ccebe70607715fa0e7a2188482"
    };

    // ESTADO – persistência simples
    let state = {
        modoOperacao: 0, // 0 = Normal, 1 = Sem Captcha
        tentativas: 0,
        ultimaExecucao: 0
    };

    function carregarEstado() {
        try {
            const saved = GM_getValue('stateFreeBTC');
            if (saved) state = Object.assign(state, JSON.parse(saved));
        } catch (e) { console.error(e); }
    }
    function salvarEstado() {
        try {
            GM_setValue('stateFreeBTC', JSON.stringify(state));
        } catch (e) { console.error(e); }
    }

    // POPUP MANAGER
    const PopupManager = {
        fecharPopups() {
            ['.pushly_popover-container', '#onesignal-slidedown-container', '#notification_permission']
                .forEach(sel => { const el = qSelector(sel); if (el) el.style.display = 'none'; });
        }
    };

    // CAPTCHAS – Soluções para Hcaptcha, Recaptcha e Cloudflare Turnstile
    function resolverHcaptcha() {
        if (window.location.href.includes("hcaptcha")) {
            const interval = setInterval(() => {
                const checkbox = qSelector(CONFIG.hcCheckBox);
                if (!checkbox) return;
                if (checkbox.getAttribute(CONFIG.hcAriaChecked) === "true") {
                    clearInterval(interval);
                    console.log("Hcaptcha resolvido");
                } else if (!isHidden(checkbox) && checkbox.getAttribute(CONFIG.hcAriaChecked) === "false") {
                    checkbox.click();
                    clearInterval(interval);
                    console.log("Hcaptcha: abrindo checkbox");
                }
            }, Number(CONFIG.intervaloCaptcha));
        }
    }
    function resolverRecaptcha() {
        if (window.location.href.includes("recaptcha")) {
            setTimeout(() => {
                let initialStatus = qSelector(CONFIG.rcStatus) ? qSelector(CONFIG.rcStatus).innerText : "";
                try {
                    if (qSelector(CONFIG.rcCheckBox) && !isHidden(qSelector(CONFIG.rcCheckBox))) {
                        qSelector(CONFIG.rcCheckBox).click();
                        console.log("Recaptcha: abrindo checkbox");
                    }
                    if (qSelector(CONFIG.rcStatus) && qSelector(CONFIG.rcStatus).innerText !== initialStatus) {
                        console.log("Recaptcha resolvido");
                    }
                    if (qSelector(CONFIG.rcDosCaptcha) && qSelector(CONFIG.rcDosCaptcha).innerText.length > 0) {
                        console.log("Recaptcha: consulta automatizada detectada");
                    }
                } catch (err) { console.error(err.message); }
            }, Number(CONFIG.intervaloCaptcha));
        }
    }
    function resolverTurnstileClique() {
        const cfIframe = qSelector(CONFIG.cfIframeSelector);
        if (cfIframe && cfIframe.contentDocument) {
            const checkbox = cfIframe.contentDocument.querySelector('.mark');
            if (checkbox && !isHidden(checkbox)) {
                if (simularCliqueHumano(checkbox)) {
                    console.log("Turnstile resolvido via clique");
                    return true;
                }
            }
        }
        return false;
    }
    function resolverTurnstile2Captcha(callback) {
        const reqUrl = `http://2captcha.com/in.php?key=${CONFIG.apiKey2Captcha}&method=turnstile&sitekey=${CONFIG.turnstileSitekey}&pageurl=${encodeURIComponent(window.location.href)}&json=1`;
        console.log("Enviando requisição 2Captcha para Turnstile");
        GM_xmlhttpRequest({
            method: "GET",
            url: reqUrl,
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (data.status === 1) {
                        pollToken(data.request, callback);
                    } else {
                        console.error("2Captcha Error: " + data.request);
                        callback(false);
                    }
                } catch (e) {
                    console.error(e); callback(false);
                }
            },
            onerror: function(err) { console.error(err); callback(false); }
        });
    }
    function pollToken(captchaId, callback) {
        const pollUrl = `http://2captcha.com/res.php?key=${CONFIG.apiKey2Captcha}&action=get&id=${captchaId}&json=1`;
        let attempts = 0;
        const pollInterval = setInterval(() => {
            attempts++;
            GM_xmlhttpRequest({
                method: "GET",
                url: pollUrl,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.status === 1) {
                            clearInterval(pollInterval);
                            const token = data.request;
                            const input = qSelector(CONFIG.cfResponseInput);
                            if (input) {
                                input.value = token;
                                console.log("Turnstile resolvido via 2Captcha");
                                callback(true);
                            } else {
                                console.error("Input para Turnstile não encontrado");
                                callback(false);
                            }
                        } else if (data.request !== "CAPCHA_NOT_READY") {
                            clearInterval(pollInterval);
                            console.error("Erro polling: " + data.request);
                            callback(false);
                        }
                    } catch (e) { console.error(e); callback(false); }
                },
                onerror: function(err) { console.error(err); callback(false); }
            });
            if (attempts >= 24) {
                clearInterval(pollInterval);
                console.error("Timeout 2Captcha polling");
                callback(false);
            }
        }, 5000);
    }

    // FUNÇÃO PARA SIMULAR CLIQUE HUMANO 
    function simularCliqueHumano(elemento) {
        if (!elemento) return false;
        let sucesso = false;
        try {
            const rect = elemento.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            elemento.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
            elemento.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
            elemento.click();
            console.info("Clique simulado com MouseEvents");
            sucesso = true;
        } catch (e) { console.warn("MouseEvents falharam:", e); }
        if (!sucesso) {
            try {
                const rect = elemento.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                elemento.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
                elemento.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
                elemento.click();
                console.info("Clique simulado com PointerEvents");
                sucesso = true;
            } catch (e) { console.warn("PointerEvents falharam:", e); }
        }
        if (!sucesso) {
            try {
                elemento.focus();
                elemento.click();
                console.info("Clique simulado com Focus + Click");
                sucesso = true;
            } catch (e) { console.error("Focus + Click falharam:", e); }
        }
        return sucesso;
    }

    // GERENCIAMENTO DOS CAPTCHAS
    function gerenciarCaptcha() {
        if (window.location.href.includes("hcaptcha")) resolverHcaptcha();
        if (window.location.href.includes("recaptcha")) resolverRecaptcha();
        if (qSelector(CONFIG.cfIframeSelector)) {
            if (!resolverTurnstileClique() && CONFIG.use2Captcha) {
                resolverTurnstile2Captcha(function(success) {
                    if (!success) console.error("Falha ao resolver Turnstile via 2Captcha");
                });
            }
        }
    }

    // ACIONAMENTO DOS BOTÕES PLAY/ROLL
    function acionarRoll() {
        const btn = qSelector(CONFIG.rollButton);
        if (btn && !isHidden(btn)) { btn.click(); console.log("ROLL acionado"); }
        else console.warn("Botão ROLL não encontrado");
    }
    function acionarPlayWithoutCaptcha() {
        const btn = qSelector(CONFIG.playWithoutCaptchaButton);
        if (btn && !isHidden(btn)) { btn.click(); console.log("PLAY WITHOUT CAPTCHA acionado"); }
        else console.warn("Botão PLAY WITHOUT CAPTCHA não encontrado");
    }

    // AÇÕES TEMPORIZADAS
    function iniciarAcoesTemporizadas() {
        setTimeout(acionarRoll, CONFIG.rollDelay);
        setTimeout(acionarPlayWithoutCaptcha, CONFIG.playWithoutCaptchaDelay);
        setTimeout(acionarRoll, CONFIG.secondRollDelay);
    }

    // MONITORAMENTO DO TIMER 
    function monitorarTimer() {
        setInterval(() => {
            const timer = qSelector(CONFIG.timerElement);
            if (timer && timer.textContent.trim().includes("00:00:00")) {
                console.log("Timer zerado – acionar ações");
                gerenciarCaptcha();
                iniciarAcoesTemporizadas();
            }
        }, 1000);
    }

    // MONITORAMENTO VISUAL DO TIMER NO CONSOLE (formata com countdown_section se disponível)
    function monitorarTimerNoConsole() {
        let ultimoTempo = '';
        const formatarTempo = (elemento) => {
            const secoes = elemento.querySelectorAll('.countdown_section');
            if (secoes.length < 2) return null;
            const minutos = secoes[0].querySelector('.countdown_amount').textContent.padStart(2, '0');
            const segundos = secoes[1].querySelector('.countdown_amount').textContent.padStart(2, '0');
            return `${minutos}:${segundos}`;
        };
        const atualizarConsole = () => {
            const timer = qSelector(CONFIG.timerElement);
            if (timer && timer.offsetParent !== null) {
                const tempoFormatado = formatarTempo(timer);
                if (tempoFormatado && tempoFormatado !== ultimoTempo) {
                    console.clear();
                    console.log(`⏳ Timer: ${tempoFormatado}`);
                    ultimoTempo = tempoFormatado;
                }
            } else {
                if (ultimoTempo !== 'oculto') {
                    console.log(' Timer não visível');
                    ultimoTempo = 'oculto';
                }
            }
        };
        setInterval(atualizarConsole, 1000);
        atualizarConsole();
    }

    // CONTROLE DE VISIBILIDADE
    function configurarVisibilidade() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log("Retomando operação em primeiro plano");
                
            } else {
                console.log("Modo segundo plano ativado");
            }
        });
    }

    // AJUSTE DO PRELOAD DO CLOUDFLARE
    function ajustarPreloadCloudflare() {
        try {
            const link = document.querySelector('link[rel="preload"][href*="challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/cmg/1"]');
            if (link) {
                link.setAttribute('as', 'script');
                console.info("Atributo 'as' ajustado para 'script' no link de preload");
            }
        } catch (e) { console.error(e); }
    }

    // HANDLERS GLOBAIS DE ERROS
    const IGNORED_PATTERNS = ["third-party cookies", "preloaded using link preload"];
    window.addEventListener('error', event => {
        try {
            if (event.message && IGNORED_PATTERNS.some(p => event.message.includes(p))) {
                event.preventDefault();
                return;
            }
            if (event.filename && event.filename.includes('challenges.cloudflare.com')) {
                console.warn("Erro do Cloudflare ignorado:", event.message);
                event.preventDefault();
            } else {
                console.error(event.message, event);
            }
        } catch (e) { console.error(e); }
    });
    window.addEventListener('unhandledrejection', event => {
        try {
            if (event.reason && event.reason.message && IGNORED_PATTERNS.some(p => event.reason.message.includes(p))) {
                event.preventDefault();
                return;
            }
            if (event.reason && event.reason.message && event.reason.message.includes('challenges.cloudflare.com')) {
                console.warn("Rejeição do Cloudflare ignorada:", event.reason.message);
                event.preventDefault();
            } else {
                console.error(event.reason);
            }
        } catch (e) { console.error(e); }
    });

    // Polyfill para GM_getValue/GM_setValue se necessário
    if (typeof GM_getValue === 'undefined') {
        window.GM_getValue = key => JSON.parse(localStorage.getItem(key));
        window.GM_setValue = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    }

    // MENU DE CONTROLE
    GM_registerMenuCommand('Configurações do Script', () => {
        alert(`Modo: ${state.modoOperacao === 0 ? 'Normal' : 'Sem Captcha'}\nTentativas: ${state.tentativas}`);
    });

    // INICIALIZAÇÃO
    function init() {
        carregarEstado();
        PopupManager.fecharPopups();
        monitorarTimer();
        monitorarTimerNoConsole();
        configurarVisibilidade();
        gerenciarCaptcha();
        iniciarAcoesTemporizadas();
        console.log("Script iniciado no Freebitco.in");
    }

    window.addEventListener('load', () => {
        ajustarPreloadCloudflare();
        init();
    });
})();
