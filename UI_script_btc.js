(function() {
    'use strict';

    // Função para carregar dinamicamente o roll_script_btc.js do GitHub
    function loadRollScript(callback) {
        var script = document.createElement('script');
        script.src = "https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/roll_script_btc.js";
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Atualiza a criação da interface para incluir a exibição do timer
    function createUI() {
        const container = document.createElement('div');
        container.id = 'custom-ui';
        container.style.cssText = "background: #f0f0f0; padding: 20px; border: 1px solid #ccc;";
        container.innerHTML = `
            <h2>Interface de Controle FreeBTC</h2>
            <div id="ui-info">Aguardando informações...</div>
            <div id="ui-timer">Timer: --:--</div>
            <button id="ui-action">Executar Ação Roll</button>
        `;
        container.querySelector('#ui-action').addEventListener('click', function(){
            if (window.rollInit) {
                window.rollInit();
                document.getElementById('ui-info').textContent = "Função Roll iniciada!";
            }
        });
        return container;
    }

    // Função para monitorar o timer e atualizar o console e a interface
    function monitorarTimerUI() {
        let ultimoTempo = '';
        function formatarTempo(timer) {
            const secoes = timer.querySelectorAll('.countdown_section');
            if (secoes.length < 2) return null;
            const minutos = secoes[0].querySelector('.countdown_amount').textContent.padStart(2, '0');
            const segundos = secoes[1].querySelector('.countdown_amount').textContent.padStart(2, '0');
            return `${minutos}:${segundos}`;
        }
        function atualizarUI() {
            const timer = document.querySelector('#time_remaining');
            if (timer && timer.offsetParent !== null) {
                const tempo = formatarTempo(timer);
                if (tempo && tempo !== ultimoTempo) {
                    console.clear();
                    console.log(`⏳ Timer: ${tempo}`);
                    const uiTimer = document.getElementById('ui-timer');
                    if (uiTimer) {
                        uiTimer.textContent = `Timer: ${tempo}`;
                    }
                    ultimoTempo = tempo;
                }
            } else {
                const uiTimer = document.getElementById('ui-timer');
                if (uiTimer) {
                    uiTimer.textContent = `Timer: --:--`;
                }
            }
        }
        setInterval(atualizarUI, 1000);
        atualizarUI();
    }

    // Função para registrar mudança de visibilidade e exibir status no console
    function configurarVisibilidade() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log("Retomando operação em primeiro plano");
            } else {
                console.log("Modo segundo plano ativado");
            }
        });
    }

    // Substitui a div alvo (localizada via XPath) pela nossa interface
    function replaceTargetDiv() {
        const xpath = "/html/body/div[2]/div/div/div[3]";
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const target = result.singleNodeValue;
        if (target && target.parentNode) {
            const ui = createUI();
            target.parentNode.replaceChild(ui, target);
        }
    }

    // Modificar a inicialização para chamar a atualização do timer e registrar a visibilidade
    function initUI() {
        replaceTargetDiv();
        loadRollScript(function() {
            console.log("Roll script carregado.");
        });
        monitorarTimerUI();
        configurarVisibilidade();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();