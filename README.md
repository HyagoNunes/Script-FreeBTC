# Script-Free-BTC

O **Script-Free-BTC** é um userscript desenvolvido para automatizar interações com o site [FreeBitco.in](https://freebitco.in/?r=1393623). Com foco em facilitar a execução das rotinas do site, o script gerencia cliques, monitoramento do timer e até mesmo a resolução de captcha, sempre buscando otimizar a experiência do usuário.

---

## Sumário

- [Recursos](#recursos)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração e Funcionamento](#configuração-e-funcionamento)
- [Execução e Comandos](#execução-e-comandos)
- [Como Contribuir](#como-contribuir)
- [Licença](#licença)
- [Suporte](#suporte)

---

## Recursos

- **Automação de cliques:** O script identifica e aciona automaticamente o botão de "roll" sempre que as condições permitirem.
- **Gerenciamento de timer:** Monitora a contagem regressiva e verifica se o timer está ativo para evitar interações desnecessárias.
- **Verificação e resolução de captcha:** Caso o captcha não seja identificado ou não esteja visível, o script recarrega a página para retomar a operação.
- **Diferenciação de tentativas:** Possui dois modos de operação (normal e especial), que alternam a quantidade de tentativas de execução do clique.
- **Persistência de estado:** Utiliza funções do Greasemonkey/Tampermonkey para salvar o estado e garantir a continuidade da automação mesmo em recarregamentos.

---

## Requisitos

- **Navegador compatível:** O script deve ser executado em navegadores que suportem userscripts (ex.: Firefox com Greasemonkey ou Tampermonkey, Google Chrome com Tampermonkey).
- **Permissões:** É necessário conceder as permissões definidas (GM_getValue, GM_setValue, GM_registerMenuCommand) para que o script funcione corretamente.
- **Acesso ao site:** O script é configurado para atuar no domínio `https://freebitco.in/*`.

---

## Instalação

### 1. Instale um Gerenciador de Userscripts

Caso ainda não possua, instale uma extensão para gerenciamento de userscripts, como:
- [Tampermonkey](https://www.tampermonkey.net/)
- [Greasemonkey](https://www.greasespot.net/)

### 2. Instale o Script

Você pode instalar o script de duas formas:

#### Via Repositório

1. Acesse o repositório oficial: [Script-FreeBTC](https://github.com/HaygoNunes/Script-FreeBTC)
2. Clique no arquivo do script e selecione a opção para instalá-lo com seu gerenciador de userscripts.

#### Via Greasy Fork

1. Acesse a página do script no Greasy Fork:  
   [Script-Free-BTC no Greasy Fork](https://greasyfork.org/pt-BR/scripts/493924-script-free-btc/code)
2. Clique em "Instalar este script" e siga as instruções apresentadas pela extensão instalada.

---

## Configuração e Funcionamento

O script já vem configurado com valores padrão que equilibram as tentativas de execução e os intervalos de verificação. A seguir, uma breve explicação sobre os parâmetros principais:

- **tentativasNormais:** Número de tentativas no modo normal.
- **tentativasEspeciais:** Número de tentativas no modo especial.
- **intervaloVerificacao:** Intervalo de tempo (em milissegundos) para a verificação do estado do timer em primeiro plano.
- **intervaloBackground:** Intervalo de tempo para a verificação quando a página está em segundo plano.
- **xpathTimer, xpathRoll, xpathCaptcha:** Localizadores XPath utilizados para identificar os elementos do timer, do botão de roll e do captcha, respectivamente.

### Funcionamento Interno

1. **Inicialização:** Ao carregar, o script lê o estado salvo (se houver) e registra eventos para monitorar a visibilidade da página.
2. **Monitoramento contínuo:** Um ciclo periódico verifica se é possível realizar a ação de "roll". Se o timer estiver inativo, o script prossegue para:
   - Checar e gerenciar o captcha.
   - Executar o clique no botão de "roll" de acordo com o número de tentativas configurado.
   - Realizar ações pós-execução, como clicar em botões especiais, quando necessário.
3. **Persistência de estado:** O estado atual é salvo periodicamente para manter a continuidade do processo mesmo após recarregamentos.

---

## Execução e Comandos

### Funcionamento Automático

Após a instalação, o script inicia automaticamente sempre que você acessar uma página do FreeBitco.in. Não há necessidade de interação manual para iniciar a automação.

### Menu de Configurações

O script registra um comando de menu que pode ser acessado através do gerenciador de userscripts (Tampermonkey/Greasemonkey). Para acessar:
- Clique no ícone do gerenciador de userscripts.
- Selecione o comando **"Configurações do Script"**.  
  Será exibido um alerta informando o modo atual (Normal ou Especial) e o número de tentativas realizadas.

### Logs no Console

O script também atualiza periodicamente o console do navegador com informações sobre o timer, ajudando no monitoramento do funcionamento:
- Caso o timer esteja visível, é exibido o tempo restante.
- Caso contrário, o console informa que o timer não está visível.

---

## Como Contribuir

Contribuições para aprimorar o script são bem-vindas.


