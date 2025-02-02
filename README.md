# Script-Free-BTC

Um script de automação para o site FreeBitco.in, desenvolvido para interagir com CAPTCHA e realizar ações como clicar no botão "Claim", "PLAY WITHOUT CAPTCHA" e "ROLL" de forma automatizada.

## 📋 Descrição

O **Script-Free-BTC** é um userscript desenvolvido para automatizar tarefas no site FreeBitco.in. Ele foi criado para facilitar a interação com CAPTCHA (hCaptcha e reCAPTCHA) e realizar ações como:

- Clicar no botão **"Claim"** assim que o CAPTCHA estiver resolvido.
- Clicar no botão **"PLAY WITHOUT CAPTCHA"** após um intervalo de tempo.
- Clicar no botão **"ROLL"** em intervalos programados.

O script é seguro, **não** viola os termos de serviço do site e **não resolve CAPTCHAs automaticamente**. Ele apenas simula cliques na caixa do CAPTCHA e interage com os elementos da página.

## 🚀 Funcionalidades

### Interação com CAPTCHA:
- Verifica e clica na caixa do **hCaptcha** ou **reCAPTCHA**.
- Detecta se o CAPTCHA já foi resolvido.

### Clique Automático no "Claim":
- Clica no botão **"Claim"** assim que o CAPTCHA estiver resolvido e o botão estiver disponível.

### Ações Programadas:
- Clica em **"PLAY WITHOUT CAPTCHA"** após **7 segundos**.
- Clica em **"ROLL"** após **10 e 15 segundos**.

### Verificação Contínua:
- Verifica periodicamente o status do CAPTCHA e a disponibilidade do botão "Claim".

## 🛠️ Como Usar

### **Pré-requisitos**

#### **Navegador Compatível:**
- O script é compatível com navegadores que suportam userscripts, como **Google Chrome**, **Firefox** ou **Microsoft Edge**.
- Recomenda-se o uso de extensões como **Tampermonkey** ou **Greasemonkey**.

#### **Instalar a Extensão:**
1. Instale o **Tampermonkey** ou **Greasemonkey** no seu navegador.

### **Instalação do Script**

1. **Copiar o Código:**
   - Copie o código do script disponível no repositório.

2. **Adicionar ao Tampermonkey/Greasemonkey:**
   - Abra o painel do **Tampermonkey/Greasemonkey**.
   - Clique em **"Criar um novo script"**.
   - Cole o código copiado e salve o script.

3. **Acessar o FreeBitco.in:**
   - Acesse o site **FreeBitco.in**.
   - O script será executado automaticamente quando a página carregar.

## ⚙️ Funcionamento

- O script inicia automaticamente quando a página do FreeBitco.in é carregada.
- Ele verifica periodicamente o status do CAPTCHA e clica no botão **"Claim"** assim que estiver disponível.
- Após **7 segundos**, o script clica em **"PLAY WITHOUT CAPTCHA"**.
- Após **10 e 15 segundos**, o script clica no botão **"ROLL"**.

## 📜 Logs e Depuração

O script exibe mensagens de log no console do navegador para facilitar o acompanhamento das ações. Exemplos de logs:

```
"hCaptcha já resolvido."
"Caixa do reCAPTCHA clicada com sucesso."
"Botão 'Claim' clicado com sucesso."
"Botão 'PLAY WITHOUT CAPTCHA' clicado com sucesso."
```

## ⚠️ Limitações

- O script **não** resolve CAPTCHAs automaticamente. Ele apenas **simula cliques** na caixa do CAPTCHA.
- O desempenho do script depende da estrutura do site. **Se houver alterações no HTML ou CSS do FreeBitco.in, o script pode precisar de ajustes**.
- O **uso excessivo de automação** pode resultar em bloqueios temporários pelo site. **Use com moderação**.

## 📄 Licença

Este projeto está licenciado sob a **licença MIT**. Consulte o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

**Hyago Nunes**
- GitHub: [HyagoNunes](https://github.com/HyagoNunes)
- Repositório: [Script-FreeBTC](https://github.com/HyagoNunes/Script-FreeBTC)

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver sugestões, melhorias ou encontrar problemas, sinta-se à vontade para **abrir uma issue** ou **enviar um pull request**.

## 📌 Notas Finais

Este script foi desenvolvido **para fins educacionais e de automação pessoal**. Use-o com responsabilidade e respeite os **termos de serviço do site FreeBitco.in**.

