// Interface do usuário para o Script FreeBTC
(function() {
    'use strict';

    const UI = {
        config: null,
        state: null,

        styles: `
            .btc-control-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                background: #2c3e50;
                color: #ecf0f1;
                padding: 15px;
                border-radius: 8px;
                z-index: 9999;
                width: 300px;
                font-family: Arial, sans-serif;
            }
            .btc-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .btc-minimize {
                cursor: pointer;
                padding: 2px 6px;
                background: #34495e;
                border-radius: 4px;
            }
            .btc-content {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .btc-stats {
                background: #34495e;
                padding: 10px;
                border-radius: 4px;
            }
            .btc-config {
                display: grid;
                gap: 5px;
            }
            .btc-button {
                background: #3498db;
                border: none;
                padding: 5px 10px;
                color: white;
                border-radius: 4px;
                cursor: pointer;
            }
        `,

        criarPainel() {
            const div = document.createElement('div');
            div.className = 'btc-control-panel';
            div.innerHTML = `
                <div class="btc-header">
                    <span>FreeBTC Control</span>
                    <span class="btc-minimize">_</span>
                </div>
                <div class="btc-content">
                    <div class="btc-stats">
                        <div>Próximo Roll: <span id="btc-next-roll">--:--</span></div>
                        <div>Total Rolls: <span id="btc-total-rolls">0</span></div>
                        <div>Modo: <span id="btc-mode">Normal</span></div>
                        <div>Saldo BTC: <span id="btc-balance">0.00000000</span></div>
                    </div>
                    <div class="btc-config">
                        <button class="btc-button" id="btc-toggle-mode">Alternar Modo</button>
                        <button class="btc-button" id="btc-clear-stats">Limpar Estatísticas</button>
                    </div>
                </div>
            `;
            return div;
        },

        inicializar() {
            // Adicionar estilos
            const style = document.createElement('style');
            style.textContent = this.styles;
            document.head.appendChild(style);

            // Adicionar painel
            const painel = this.criarPainel();
            document.body.appendChild(painel);

            // Eventos
            this.configurarEventos();

            // Adicionar interval para atualização do timer e saldo
            setInterval(() => {
                this.atualizarTimer();
                this.atualizarSaldoBTC();
            }, 1000);
        },

        configurarEventos() {
            document.querySelector('.btc-minimize').onclick = () => {
                const content = document.querySelector('.btc-content');
                content.style.display = content.style.display === 'none' ? 'flex' : 'none';
            };

            document.getElementById('btc-toggle-mode').onclick = () => {
                const modoAtual = localStorage.getItem('btcMode') || 'normal';
                const novoModo = modoAtual === 'normal' ? 'semCaptcha' : 'normal';
                localStorage.setItem('btcMode', novoModo);
                window.dispatchEvent(new CustomEvent('btcModeChange', {
                    detail: { modo: novoModo }
                }));
                this.atualizarInterface();
            };

            document.getElementById('btc-clear-stats').onclick = () => {
                if (confirm('Limpar todas as estatísticas?')) {
                    localStorage.removeItem('btcStats');
                    window.dispatchEvent(new CustomEvent('btcClearStats'));
                    this.atualizarInterface();
                }
            };

            // Escutar eventos do script principal
            window.addEventListener('btcScriptStart', (e) => {
                this.config = e.detail.config;
                this.state = e.detail.state;
                this.atualizarInterface();
            });
        },

        atualizarInterface() {
            const stats = JSON.parse(localStorage.getItem('btcStats') || '{"totalRolls":0}');
            const modo = localStorage.getItem('btcMode') || 'normal';

            document.getElementById('btc-total-rolls').textContent = stats.totalRolls;
            document.getElementById('btc-mode').textContent = modo === 'normal' ? 'Normal' : 'Sem Captcha';
        },

        atualizarTimer() {
            const timer = document.querySelector('#time_remaining');
            if (timer) {
                const sections = timer.querySelectorAll('.countdown_section');
                if (sections.length >= 2) {
                    const minutes = sections[0].querySelector('.countdown_amount').textContent.padStart(2, '0');
                    const seconds = sections[1].querySelector('.countdown_amount').textContent.padStart(2, '0');
                    document.getElementById('btc-next-roll').textContent = `${minutes}:${seconds}`;
                }
            }
        },

        atualizarSaldoBTC() {
            const balanceElement = document.evaluate('/html/body/div[1]/div/nav/section/ul/li[20]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (balanceElement) {
                const balance = balanceElement.textContent.trim();
                document.getElementById('btc-balance').textContent = balance;
            }
        }
    };

    // Inicializar UI quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UI.inicializar());
    } else {
        UI.inicializar();
    }
})();
