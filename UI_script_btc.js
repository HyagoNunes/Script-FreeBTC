(function() {
    'use strict';

    // Função para carregar dinamicamente o roll_script_btc.js do GitHub
    function loadRollScript(callback) {
        var script = document.createElement('script');
        script.src = "https://raw.githubusercontent.com/HyagoNunes/Script-FreeBTC/main/roll_script_btc.js";
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Cria a interface gráfica que substituirá a div alvo
    function createUI() {
        const container = document.createElement('div');
        container.id = 'custom-ui';
        container.style.cssText = "background: #f0f0f0; padding: 20px; border: 1px solid #ccc;";
        container.innerHTML = `
            <h2>Interface de Controle FreeBTC</h2>
            <div id="ui-info">Aguardando informações...</div>
            <button id="ui-action">Executar Ação Roll</button>
        `;
        // Exemplo: acionar função do roll quando o botão for clicado
        container.querySelector('#ui-action').addEventListener('click', function(){
            if (window.rollInit) {
                window.rollInit();
                document.getElementById('ui-info').textContent = "Função Roll iniciada!";
            }
        });
        return container;
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

    // Inicializa a interface e carrega o script de roll
    function initUI() {
        replaceTargetDiv();
        loadRollScript(function() {
            console.log("Roll script carregado.");
            
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();