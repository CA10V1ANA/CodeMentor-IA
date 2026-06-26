# CodeMentor IA

Mini sistema de chat integrado com uma IA, desenvolvido para a Atividade Prática da disciplina de Engenharia de Inteligência Artificial.

## Especialização escolhida

A IA foi configurada para atuar como especialista em Programação e Desenvolvimento de Software. O objetivo é responder dúvidas técnicas de forma didática, objetiva e com exemplos de código quando necessário.

## Tecnologias utilizadas

- Python
- Flask
- HTML
- CSS
- JavaScript
- API da OpenRouter

## Estrutura do projeto

```text
ia_chat_project/
├── app.py
├── requirements.txt
├── .env.example
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## Como executar

### 1. Instalar as dependências

```bash
pip install -r requirements.txt
```

No Windows, se o comando `pip` não for reconhecido, use:

```powershell
py -m pip install -r requirements.txt
```

### 2. Configurar a chave da API

Crie uma conta em https://openrouter.ai e gere uma API Key.

No Windows, você pode executar o script abaixo dentro da pasta do projeto:

```powershell
.\configurar_openrouter.ps1
```

Cole sua chave quando o terminal pedir. O script salva as variáveis `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` no usuário do Windows.
Ele também cria um arquivo local `.env` dentro do projeto, para o Flask encontrar a chave mesmo se o PowerShell ainda não tiver recarregado as variáveis do Windows.

Se preferir configurar manualmente:

No Windows PowerShell:

```powershell
$env:OPENROUTER_API_KEY="sua_chave_aqui"
```

No Linux ou macOS:

```bash
export OPENROUTER_API_KEY="sua_chave_aqui"
```

Opcionalmente, é possível trocar o modelo usado pela aplicação:

```powershell
$env:OPENROUTER_MODEL="openai/gpt-4o-mini"
```

### 3. Executar o servidor

```bash
python app.py
```

No Windows, se o comando `python` não for reconhecido, use:

```powershell
py app.py
```

No Windows, também é possível executar:

```powershell
.\executar.ps1
```

### 4. Acessar no navegador

```text
http://127.0.0.1:5000
```

## Como funciona a comunicação

1. O usuário digita uma pergunta na interface web.
2. O arquivo `script.js` envia a mensagem para o backend Flask usando uma requisição HTTP POST para a rota `/chat`.
3. O corpo da requisição é enviado em JSON no formato `{ "message": "texto digitado" }`.
4. O arquivo `app.py` recebe a mensagem, adiciona o prompt de sistema que define a personalidade técnica da IA e envia os dados para a API da OpenRouter.
5. A OpenRouter retorna a resposta gerada pelo modelo de linguagem.
6. O Flask devolve a resposta em JSON para o frontend.
7. O JavaScript exibe a resposta no chat.

## Personalização da IA

A personalização está no `SYSTEM_PROMPT`, dentro do arquivo `app.py`.

```python
SYSTEM_PROMPT = (
    "Você é o CodeMentor IA, um professor universitário especialista em "
    "programação e desenvolvimento de software..."
)
```

Esse prompt é enviado junto com cada pergunta do usuário. Assim, o modelo recebe sempre a instrução de responder como uma IA especializada em programação.

## Tratamento de erros

O projeto valida mensagens vazias, verifica se a variável `OPENROUTER_API_KEY` foi configurada e trata falhas de comunicação com a API. Quando ocorre algum problema, o backend retorna uma mensagem de erro em JSON e o frontend exibe essa mensagem no chat.

## Melhorias implementadas

- Historico de conversa por sessao, permitindo que a IA use mensagens anteriores como contexto.
- Escolha da linguagem de programacao, como Java, Python, JavaScript, SQL e C#.
- Selecao de categoria da duvida, como Logica, APIs, Banco de Dados, Debug, Testes e Boas praticas.
- Respostas com blocos de codigo formatados e botao para copiar codigo.
- Tratamento de erros mais especifico para chave invalida, limite da API, timeout e falha de conexao.
- Salvamento das mensagens em banco SQLite local.
- Botao para limpar a conversa.
- Alternancia entre tema escuro e tema claro.
- Upload de arquivos de codigo e imagens para analise pela IA.
- Prompt de sistema mais detalhado, orientando a IA a responder como mentora tecnica de programacao.

## Possíveis dificuldades encontradas

- Configurar corretamente a chave da API da OpenRouter.
- Entender o formato de mensagens exigido pela API, com `role` e `content`.
- Fazer a comunicação entre frontend e backend usando JSON.
- Tratar erros quando a API não responde ou retorna um formato inesperado.
- Ajustar o prompt de sistema para deixar a IA mais focada em programação.
