# CodeMentor IA

CodeMentor IA é um mini sistema de chat integrado com Inteligência Artificial, criado para a Atividade Prática da disciplina de Engenharia de Inteligência Artificial.

A proposta do projeto é demonstrar como uma aplicação web pode se comunicar com um modelo de IA por meio de uma API externa, usando requisições HTTP, JSON e um prompt personalizado.

## Especialização

A IA foi configurada para atuar como uma mentora especialista em Programação e Desenvolvimento de Software.

Ela pode ajudar com:

- Lógica de programação
- Java, Python, JavaScript, SQL, C# e HTML/CSS
- APIs
- Banco de dados
- Testes
- Debug
- Boas práticas
- Arquitetura de software
- Análise de código
- Análise de imagens e prints

## Funcionalidades

- Chat com IA integrada à OpenRouter
- Interface web com HTML, CSS e JavaScript
- Backend em Flask
- Comunicação via JSON
- Requisição HTTP `POST`
- Prompt de sistema personalizado
- Histórico de conversas salvo em SQLite
- Painel de histórico animado
- Upload de arquivos de código
- Upload de imagens
- Seleção de linguagem e categoria pelo botão `+`
- Renderização de Markdown nas respostas
- Blocos de código com botão de copiar
- Tema claro/escuro
- Tratamento de erros da API

## Tecnologias

- Python
- Flask
- SQLite
- HTML
- CSS
- JavaScript
- OpenRouter API

## Estrutura

```text
CodeMentor-IA/
├── ia_chat_project/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── configurar_openrouter.ps1
│   ├── executar.ps1
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── favicon.svg
│       ├── script.js
│       └── style.css
├── .gitignore
└── README.md
```

## Como Executar

Entre na pasta do projeto:

```bash
cd ia_chat_project
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

No Windows, se `pip` não for reconhecido:

```powershell
py -m pip install -r requirements.txt
```

Configure sua chave da OpenRouter:

```powershell
$env:OPENROUTER_API_KEY="sua_chave_aqui"
```

Ou use o script:

```powershell
.\configurar_openrouter.ps1
```

Execute o servidor:

```bash
python app.py
```

No Windows, se `python` não for reconhecido:

```powershell
py app.py
```

Acesse no navegador:

```text
http://127.0.0.1:5000
```

## Como Funciona

1. O usuário digita uma mensagem na interface web.
2. O JavaScript envia a mensagem para o backend Flask usando `fetch`.
3. A requisição é enviada para a rota `/chat` no formato JSON.
4. O Flask adiciona o prompt de sistema e chama a API da OpenRouter.
5. A OpenRouter retorna a resposta gerada pelo modelo de IA.
6. O backend devolve a resposta para o frontend.
7. O chat exibe a resposta na tela.

## Personalização da IA

A especialização é feita no arquivo `app.py`, por meio do `SYSTEM_PROMPT`.

Esse prompt define que o modelo deve responder como um professor/mentor especializado em programação e desenvolvimento de software.

## Segurança

Não envie sua chave da OpenRouter para o GitHub.

Arquivos que não devem ser enviados:

```text
.env
codementor_history.db
__pycache__/
```

Use o arquivo `.env.example` apenas como modelo.

## Autor

Projeto acadêmico desenvolvido para a disciplina de Engenharia de Inteligência Artificial.
