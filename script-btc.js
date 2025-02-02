// ==UserScript==
// @name         Script-Free-BTC
// @namespace    https://github.com/HaygoNunes/Script-FreeBTC
// @version      2.0
// @description  https://freebitco.in/?r=1393623
// @author       Hyago Nunes
// @match        https://freebitco.in/*
// @grant        none
// @license      MIT
// @downloadURL https://greasyfork.org/pt-BR/scripts/493924-script-free-btc/code
// ==/UserScript==

(function () {
    'use strict';

    // Função para selecionar elemento via seletor CSS
    function selecionarElemento(seletor) {
        return document.querySelector(seletor);
    }

    // Função para selecionar elemento via XPath
    function selecionarElementoXPath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    // Função para verificar se um elemento está visível
    function elementoEstaVisivel(elemento) {
        return elemento && elemento.offsetParent !== null;
    }

    // Aguarda o elemento identificado pelo XPath estar disponível e visível.
    // Quando encontrado, aguarda 3 segundos e executa a callback.
    function aguardarElemento(xpath, callback) {
        const intervalo = setInterval(() => {
            const elemento = selecionarElementoXPath(xpath);
            if (elementoEstaVisivel(elemento)) {
                clearInterval(intervalo);
                console.log("Elemento CAPTCHA resolvido encontrado. Aguardando 3 segundos...");
                setTimeout(callback, 3000);
            }
        }, 1000);
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

    // Tenta dar Roll (clicar no botão) até 3 vezes. Se não conseguir, chama o 'PLAY WITHOUT CAPTCHA' e tenta novamente.
    function tentarRoll() {
        let tentativas = 0;
        const intervaloTentativas = setInterval(() => {
            tentativas++;
            // Verifica novamente se o CAPTCHA está resolvido (usando o mesmo XPath)
            const captchaResolvido = selecionarElementoXPath("/html/body//div/div/div[3]");
            if (captchaResolvido && elementoEstaVisivel(captchaResolvido)) {
                const botaoRoll = selecionarElementoXPath("/html/body/div[2]/div/div/div[7]/p[3]/input");
                if (elementoEstaVisivel(botaoRoll)) {
                    botaoRoll.click();
                    console.log("Botão 'Roll' clicado com sucesso na tentativa " + tentativas + ".");
                    clearInterval(intervaloTentativas);
                } else {
                    console.log("Botão 'Roll' não encontrado ou não visível na tentativa " + tentativas + ".");
                }
            } else {
                console.log("CAPTCHA não está resolvido na tentativa " + tentativas + ".");
            }

            // Após 3 tentativas, se não foi possível clicar, aciona o PLAY WITHOUT CAPTCHA e tenta novamente após 2 segundos.
            if (tentativas >= 3) {
                clearInterval(intervaloTentativas);
                console.log("3 tentativas de Roll falharam. Tentando 'PLAY WITHOUT CAPTCHA'...");
                clicarPlaySemCaptcha();
                setTimeout(() => {
                    const botaoRoll = selecionarElementoXPath("/html/body/div[2]/div/div/div[7]/p[3]/input");
                    if (elementoEstaVisivel(botaoRoll)) {
                        botaoRoll.click();
                        console.log("Botão 'Roll' clicado com sucesso após 'PLAY WITHOUT CAPTCHA'.");
                    } else {
                        console.log("Botão 'Roll' não encontrado após 'PLAY WITHOUT CAPTCHA'.");
                    }
                }, 2000);
            }
        }, 2000);
    }

    // Função principal que inicia a sequência de ações.
    function executarAcoes() {
        console.log("Script iniciado. Aguardando a resolução do CAPTCHA...");
        aguardarElemento("/html/body//div/div/div[3]", tentarRoll);
    }

    window.addEventListener('load', () => {
        console.log("Página carregada. Iniciando script...");
        executarAcoes();
    });
})();
