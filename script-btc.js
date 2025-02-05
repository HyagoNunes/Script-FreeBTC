// ==UserScript==
// @name         Script-Free-BTC
// @namespace    https://github.com/HaygoNunes/Script-FreeBTC
// @version      2.2
// @description  https://freebitco.in/?r=1393623
// @author       Hyago Nunes
// @match        https://freebitco.in/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @license      MIT
// @downloadURL  https://greasyfork.org/pt-BR/scripts/493924-script-free-btc/code
// ==/UserScript==

(function() {
    'use strict';

    // Configurações avançadas
    const config = {
        tentativasNormais: 3,
        tentativasEspeciais: 4,
        intervaloVerificacao: 1000,
        intervaloBackground: 30000,
        xpathTimer: '/html/body/div[2]/div/div/div[7]/div[4]/div[1]',
        xpathRoll: '/html/body/div[2]/div/div/div[7]/p[3]/input',
        xpathCaptcha: '/html/body//div/div/div[3]'
    };

    // Estado persistente
    let estado = {
        etapa: 0,
        tentativas: 0,
        ultimaExecucao: 0,
        timerAtivo: false
    };

    // Inicialização
    function init() {
        carregarEstado();
        configurarVisibilidade();
        iniciarMonitoramentoContinuo();
        console.log('Script em operação (modo primeiro plano ativado)');
    }

    function carregarEstado() {
        const saved = GM_getValue('scriptEstado');
        if (saved) estado = {...estado, ...saved};
    }

    function salvarEstado() {
        GM_setValue('scriptEstado', estado);
    }

    // Controle de visibilidade da página
    function configurarVisibilidade() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Otimizando para modo segundo plano...');
            } else {
                console.log('Retomando operação em primeiro plano');
                verificarEstadoTimer();
            }
        });
    }

    // Sistema de monitoramento independente
    function iniciarMonitoramentoContinuo() {
        setInterval(() => {
            if (deveExecutar()) {
                executarCicloPrincipal();
            }
        }, document.hidden ? config.intervaloBackground : config.intervaloVerificacao);
    }

    function deveExecutar() {
        return !estado.timerAtivo && (Date.now() - estado.ultimaExecucao) > config.intervaloVerificacao;
    }

    // Controle principal
    async function executarCicloPrincipal() {
        estado.ultimaExecucao = Date.now();

        if (await verificarEstadoTimer()) {
            await gerenciarCaptcha();
            await executarTentativas();
            await posExecucao();
        }

        salvarEstado();
    }

    // Verificação do timer
    async function verificarEstadoTimer() {
        const timerElement = document.evaluate(
            config.xpathTimer,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        estado.timerAtivo = timerElement &&
                          timerElement.offsetParent !== null &&
                          timerElement.textContent.trim() !== '00:00:00';

        return !estado.timerAtivo;
    }

    function monitorarTimerNoConsole() {
    let ultimoTempo = '';

    const formatarTempo = (elemento) => {
        const secoes = elemento.querySelectorAll('.countdown_section');
        if(secoes.length < 2) return null;

        const minutos = secoes[0].querySelector('.countdown_amount').textContent.padStart(2, '0');
        const segundos = secoes[1].querySelector('.countdown_amount').textContent.padStart(2, '0');

        return `${minutos}:${segundos}`;
    };

    const atualizarConsole = () => {
        const timer = document.getElementById('time_remaining');

        if(timer && timer.offsetParent !== null) {
            const tempoFormatado = formatarTempo(timer);

            if(tempoFormatado && tempoFormatado !== ultimoTempo) {
                console.clear();
                console.log(`⏳ Timer: ${tempoFormatado}`);
                ultimoTempo = tempoFormatado;
            }
        } else {
            if(ultimoTempo !== 'oculto') {
                console.log('⏸️ Timer não está visível');
                ultimoTempo = 'oculto';
            }
        }
    };

    
    setInterval(atualizarConsole, 1000);
    atualizarConsole(); 
}

monitorarTimerNoConsole();


    // Gerenciamento de captcha
    async function gerenciarCaptcha() {
        const captchaResolvido = document.evaluate(
            config.xpathCaptcha,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (!captchaResolvido || captchaResolvido.offsetParent === null) {
            window.location.reload();
            return new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // Execução das tentativas
    async function executarTentativas() {
        const maxTentativas = estado.etapa === 1 ? config.tentativasEspeciais : config.tentativasNormais;

        for (let i = 0; i < maxTentativas; i++) {
            if (await tentarRoll()) break;
            await new Promise(r => setTimeout(r, 2000));
        }

        if (estado.tentativas >= maxTentativas) {
            estado.etapa = estado.etapa === 0 ? 1 : 0;
            estado.tentativas = 0;
        }
    }

    async function tentarRoll() {
        const rollButton = document.evaluate(
            config.xpathRoll,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (rollButton && rollButton.offsetParent !== null) {
            rollButton.click();
            estado.tentativas++;
            return true;
        }
        return false;
    }

    // Pós-execução
    async function posExecucao() {
        if (estado.etapa === 1) {
            const specialButton = document.querySelector('#play_without_captchas_button');
            if (specialButton) {
                specialButton.click();
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    // Inicialização ao carregar
    window.addEventListener('load', () => {
        GM_registerMenuCommand('Configurações do Script', () => {
            alert(`Modo atual: ${estado.etapa === 0 ? 'Normal' : 'Especial'}\nTentativas: ${estado.tentativas}`);
        });

        init();
    });

    // persistência em background
    if (typeof GM_getValue === 'undefined') {
        window.GM_getValue = function(key) {
            return localStorage.getItem(key);
        };
        window.GM_setValue = function(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        };
    }
})();