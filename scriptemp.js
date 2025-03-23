// ==UserScript==
// @name         Void-Hub FreeBTC
// @namespace    https://github.com/HaygoNunes/Script-FreeBTC
// @namespace    https://greasyfork.org/en/users/1295753-hyago-nunes
// @version      10.0
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
// @updateURL    https://update.greasyfork.org/scripts/493924/Void%20Coin%20FreeBitco.user.js
// @license      MIT
// ==/UserScript==

(function() {
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
        hcCheckBox: "#checkbox",
        hcAriaChecked: "aria-checked",
        rcCheckBox: ".recaptcha-checkbox-border",
        rcStatus: "#recaptcha-accessible-status",
        rcDosCaptcha: ".rc-doscaptcha-body",
        rollButton: "#free_play_form_button",
        playWithoutCaptchaButton: "#play_without_captchas_button",
        timerElement: "#time_remaining",
        cfIframeSelector: 'iframe[src*="challenges.cloudflare.com"]',
        cfResponseInput: "#cf-chl-widget-a1bva_response",
        cfSuccessSelector: "#success-i > circle",
        use2Captcha: true,
        turnstileSitekey: "a1bva",
        apiKey2Captcha: "e6e564ccebe70607715fa0e7a2188482",
        btcBalanceSelector: '#balance',
        btcStorageKeys: {
            initial: 'voidhub_initial_btc',
            gained: 'voidhub_gained_btc',
            lastRoll: 'voidhub_last_roll'
        }
    };

    // ESTADO
    let state = {
        modoOperacao: 0,
        tentativas: 0,
        ultimaExecucao: 0
    };

    // Criação da Interface
    function createUI() {
        // Nova interface (copiada de ui.js) substituindo a antiga
        const uiContainer = document.createElement('div');
        uiContainer.id = 'voidhub-ui';
        Object.assign(uiContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '320px',
            background: 'rgba(18, 18, 18, 0.95)',
            color: '#e0e0e0',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 10px 25px rgba(138,43,226,0.7)',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            zIndex: '9999',
            cursor: 'move',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(138, 43, 226, 0.5)',
            transition: 'transform 0.3s ease'
        });

        // Adiciona fonte arcade ao head do documento
        const fontStyle = document.createElement('link');
        fontStyle.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        fontStyle.rel = 'stylesheet';
        document.head.appendChild(fontStyle);

        // Cabeçalho com título e créditos aprimorados
        const header = document.createElement('div');
        Object.assign(header.style, {
            textAlign: 'center',
            marginBottom: '20px',
            padding: '15px 0',
            borderBottom: '2px solid rgba(138,43,226,0.5)',
            position: 'relative',
            overflow: 'hidden'
        });

        // Adiciona o ícone
        const iconContainer = document.createElement('div');
        Object.assign(iconContainer.style, {
            width: '64px',
            height: '64px',
            margin: '0 auto 10px auto',
            position: 'relative'
        });

        const icon = document.createElement('img');
        // Corrigindo a URL do ícone para usar o link raw do GitHub
        icon.src = 'https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/icon.png';
        icon.alt = 'Void-Hub Icon';
        Object.assign(icon.style, {
            width: '50%',
            height: '50%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(138,43,226,0.8))',
            animation: 'pulseIcon 2s infinite ease-in-out'
        });

        // Animação do ícone
        const iconAnimation = document.createElement('style');
        iconAnimation.textContent = `
            @keyframes pulseIcon {
                0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(138,43,226,0.8)); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(138,43,226,1)); }
                100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(138,43,226,0.8)); }
            }
            @keyframes neonPulse {
                0% { box-shadow: 0 0 5px #8a2be2, 0 0 10px #8a2be2, 0 0 15px #8a2be2; }
                50% { box-shadow: 0 0 10px #8a2be2, 0 0 20px #8a2be2, 0 0 30px #8a2be2; }
                100% { box-shadow: 0 0 5px #8a2be2, 0 0 10px #8a2be2, 0 0 15px #8a2be2; }
            }
        `;
        document.head.appendChild(iconAnimation);

        iconContainer.appendChild(icon);
        header.appendChild(iconContainer);

        // Container do título com efeito de reflexo
        const titleContainer = document.createElement('div');
        Object.assign(titleContainer.style, {
            position: 'relative',
            padding: '10px',
            background: 'linear-gradient(45deg, rgba(18,18,18,0.9), rgba(38,38,38,0.9))',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(138,43,226,0.3)',
            margin: '0 -10px'
        });

        // Título principal com efeitos
        const title = document.createElement('h1');
        title.textContent = 'VOID-HUB';
        Object.assign(title.style, {
            margin: '0 0 5px 0',
            fontSize: '28px',
            fontFamily: '"Press Start 2P", cursive',
            color: '#fff',
            textShadow: '0 0 10px rgba(138,43,226,0.8)',
            position: 'relative',
            letterSpacing: '2px'
        });

        // Subtítulo FreeBTC
        const subTitle = document.createElement('div');
        subTitle.textContent = 'FREE BTC';
        Object.assign(subTitle.style, {
            fontSize: '16px',
            fontFamily: '"Press Start 2P", cursive',
            color: '#8a2be2',
            marginTop: '8px',
            textShadow: '0 0 5px rgba(138,43,226,0.5)'
        });

        // Adiciona animação RGB ao título
        const rgbAnimation = document.createElement('style');
        rgbAnimation.textContent = `
            @keyframes rgbText {
                0% { filter: hue-rotate(0deg) brightness(1.2); }
                50% { filter: hue-rotate(180deg) brightness(1.5); }
                100% { filter: hue-rotate(360deg) brightness(1.2); }
            }
            @keyframes shine {
                0% { transform: translateX(-100%) rotate(35deg); }
                100% { transform: translateX(200%) rotate(35deg); }
            }
        `;
        document.head.appendChild(rgbAnimation);

        title.style.animation = 'rgbText 10s infinite linear';

        // Efeito de reflexo platinado
        const shineEffect = document.createElement('div');
        Object.assign(shineEffect.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '50%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
            animation: 'shine 5s infinite linear',
            transform: 'translateX(1%) rotate(35deg)'
        });

        // Desenvolvedor credit
        const devCredit = document.createElement('div');
        devCredit.textContent = 'by Sr.Fox';
        Object.assign(devCredit.style, {
            fontSize: '10px',
            color: '#666',
            marginTop: '5px',
            fontFamily: 'monospace',
            letterSpacing: '1px'
        });

        titleContainer.appendChild(shineEffect);
        titleContainer.appendChild(title);
        titleContainer.appendChild(subTitle);
        titleContainer.appendChild(devCredit);
        header.appendChild(titleContainer);
        uiContainer.appendChild(header);

        // Seção de informações com cards para "BTC Ganho" e "Próximo Roll"
        const infoSection = document.createElement('div');
        Object.assign(infoSection.style, {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '15px'
        });
        const btcCard = document.createElement('div');
        Object.assign(btcCard.style, {
            flex: '1',
            background: '#222',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center'
        });
        btcCard.innerHTML = `<div style="font-size: 14px; margin-bottom: 5px;"><strong>BTC Ganho</strong></div>
                             <div id="btcGanho" style="font-size: 16px;">0.00000000</div>`;
        const rollCard = document.createElement('div');
        Object.assign(rollCard.style, {
            flex: '1',
            background: '#222',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center'
        });
        rollCard.innerHTML = `<div style="font-size: 14px; margin-bottom: 5px;"><strong>Próximo Roll</strong></div>
                              <div id="uiTimer" style="font-size: 16px;">00:00</div>`;
        infoSection.appendChild(btcCard);
        infoSection.appendChild(rollCard);
        uiContainer.appendChild(infoSection);

        // Seção de publicidade e doação com divisor neon entre as imagens:
        const adSection = document.createElement('div');
        Object.assign(adSection.style, {
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginBottom: '15px'
        });
        // Botão do GitHub com fundo neon, sombra e efeito hover
        const githubLink = document.createElement('a');
        githubLink.href = 'https://github.com/HyagoNunes';
        githubLink.target = '_blank';
        githubLink.title = 'GitHub do Desenvolvedor';
        githubLink.innerHTML = '<img src="https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/github_PNG23.png" alt="GitHub" style="width:60px; transition: transform 0.3s;">';
        Object.assign(githubLink.style, {
            background: 'rgba(138,43,226,0.3)',
            borderRadius: '8px',
            padding: '5px',
            boxShadow: '0 0 3px rgb(138,43,226)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '70px',
            height: '40px'
        });
        // Botão de Doação com fundo neon, sombra e efeito hover
        const donationIcon = document.createElement('div');
        donationIcon.style.cursor = 'pointer';
        donationIcon.title = 'Copiar carteira BTC';
        donationIcon.innerHTML = '<img src="https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/donate.png" alt="Doação BTC" style="width:60px; transition: transform 0.3s;">';
        Object.assign(donationIcon.style, {
            background: 'rgba(138,43,226,0.3)',
            borderRadius: '8px',
            padding: '5px',
            boxShadow: '0 0 3px rgb(138,43,226)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '70px',
            height: '40px'
        });
        // Divisor neon roxo entre as imagens
        const divider = document.createElement('div');
        Object.assign(divider.style, {
            width: '2px',
            background: '#8a2be2',
            height: '60px'
        });
        adSection.appendChild(githubLink);
        adSection.appendChild(divider);
        adSection.appendChild(donationIcon);
        uiContainer.appendChild(adSection);

        // Adiciona efeito hover para as imagens (aumenta um pouco o tamanho)
        const addHoverEffect = (img) => {
            img.addEventListener('mouseover', () => {
                img.style.transform = 'scale(1.1)';
            });
            img.addEventListener('mouseout', () => {
                img.style.transform = 'scale(1)';
            });
        };
        addHoverEffect(githubLink.querySelector('img'));
        addHoverEffect(donationIcon.querySelector('img'));

        // Evento para copiar a carteira BTC e mostrar tooltip
        const btcAddress = '17jGRDbuMb5oxsjTG64FFB2Ax4BNBhqrV';
        donationIcon.addEventListener('click', () => {
            navigator.clipboard.writeText(btcAddress).then(() => {
                showTooltip(donationIcon, 'Carteira copiada!');
            });
        });

        // Função para exibir tooltip
        function showTooltip(element, message) {
            const tooltip = document.createElement('div');
            tooltip.textContent = message;
            Object.assign(tooltip.style, {
                position: 'absolute',
                background: '#8a2be2',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '12px',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: '0',
                pointerEvents: 'none',
                transition: 'opacity 0.3s'
            });
            element.style.position = 'relative';
            element.appendChild(tooltip);
            setTimeout(() => { tooltip.style.opacity = '1'; }, 50);
            setTimeout(() => { tooltip.style.opacity = '0'; }, 2000);
            setTimeout(() => { element.removeChild(tooltip); }, 2500);
        }

        // Função de arrastar a janela
        let offsetX = 0, offsetY = 0;
        uiContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            offsetX = e.clientX - uiContainer.offsetLeft;
            offsetY = e.clientY - uiContainer.offsetTop;
            document.addEventListener('mousemove', moveAt);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', moveAt);
            }, { once: true });
        });
        function moveAt(e) {
            uiContainer.style.left = (e.clientX - offsetX) + 'px';
            uiContainer.style.top = (e.clientY - offsetY) + 'px';
        }

        document.body.appendChild(uiContainer);
        return uiContainer;
    }

    // GERENCIAMENTO DE ESTADO
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

    // CAPTCHA HANDLERS
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

    // TURNSTILE HANDLERS
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

    // Em vez de sobrescrever console, usar Logger diretamente
    function init() {
        const ui = createUI();
        carregarEstado();
        PopupManager.fecharPopups();
        gerenciarCaptcha();
        iniciarAcoesTemporizadas();
        monitorarTimer();
        configurarVisibilidade();
        ajustarPreloadCloudflare();

        console.log("Void-Hub FreeBTC iniciado com sucesso!");
    }

    // Substituir todas as chamadas console.log por Logger.log no código
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
        if (btn && !isHidden(btn)) {
            btn.click();
            console.log("ROLL acionado");
        }
        else console.warn("Botão ROLL não encontrado");
    }

    function acionarPlayWithoutCaptcha() {
        const btn = qSelector(CONFIG.playWithoutCaptchaButton);
        if (btn && !isHidden(btn)) {
            btn.click();
            console.log("PLAY WITHOUT CAPTCHA acionado");
        }
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
            if (timer) {
                const tempoFormatado = formatarTempoSimples(timer);
                const uiTimer = document.getElementById('uiTimer');
                if (uiTimer) {
                    uiTimer.textContent = tempoFormatado;
                }

                if (timer.textContent.trim().includes("00:00:00")) {
                    gerenciarCaptcha();
                    iniciarAcoesTemporizadas();
                }
            }
            monitorarBTC();
        }, 1000);
    }

    function formatarTempoSimples(elemento) {
        const secoes = elemento.querySelectorAll('.countdown_section');
        if (secoes.length < 2) return "00:00";
        const minutos = secoes[0].querySelector('.countdown_amount').textContent.padStart(2, '0');
        const segundos = secoes[1].querySelector('.countdown_amount').textContent.padStart(2, '0');
        return `${minutos}:${segundos}`;
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
                console.log("Atributo 'as' ajustado para 'script' no link de preload");
            }
        } catch (e) { console.error(e); }
    }

    // Função para monitorar BTC
    function monitorarBTC() {
        const balanceEl = qSelector(CONFIG.btcBalanceSelector);
        if (!balanceEl) return;

        const currentBalance = parseFloat(balanceEl.textContent);

        // Inicializar valores do storage
        if (!localStorage.getItem(CONFIG.btcStorageKeys.initial)) {
            localStorage.setItem(CONFIG.btcStorageKeys.initial, currentBalance.toString());
            localStorage.setItem(CONFIG.btcStorageKeys.gained, '0');
            localStorage.setItem(CONFIG.btcStorageKeys.lastRoll, currentBalance.toString());
        }

        const lastRoll = parseFloat(localStorage.getItem(CONFIG.btcStorageKeys.lastRoll));
        let totalGained = parseFloat(localStorage.getItem(CONFIG.btcStorageKeys.gained));

        // Se houve mudança no saldo, atualizar ganhos
        if (currentBalance > lastRoll) {
            const rollGain = currentBalance - lastRoll;
            totalGained += rollGain;
            localStorage.setItem(CONFIG.btcStorageKeys.gained, totalGained.toString());
            localStorage.setItem(CONFIG.btcStorageKeys.lastRoll, currentBalance.toString());
        }

        // Atualizar UI
        const btcGanhoEl = document.getElementById('btcGanho');
        if (btcGanhoEl) {
            btcGanhoEl.textContent = totalGained.toFixed(8);
            btcGanhoEl.style.color = totalGained >= 0 ? '#4CAF50' : '#f44336';
        }
    }

    // Inicialização
    if (document.readyState === 'loading') {
        window.addEventListener('load', init);
    } else {
        init();
    }

})();
