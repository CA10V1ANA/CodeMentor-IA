# CodeMentor IA

CodeMentor IA é um mini sistema de chat integrado com Inteligência Artificial, desenvolvido para a Atividade Prática da disciplina de Engenharia de Inteligência Artificial.

A aplicação utiliza Flask no backend, HTML/CSS/JavaScript no frontend e a API da OpenRouter para gerar respostas com um modelo de linguagem.

## Especialização da IA

A IA foi personalizada para atuar como uma mentora especialista em Programação e Desenvolvimento de Software.

Ela responde dúvidas sobre:

- Lógica de programação
- Java, Python, JavaScript, SQL, C# e HTML/CSS
- APIs
- Banco de dados
- Testes
- Debug
- Boas práticas
- Arquitetura de software
- Análise de código e imagens

## Funcionalidades

- Chat com IA integrada via API
- Interface web responsiva
- Envio de mensagens usando JSON
- Requisição HTTP `POST` para o backend Flask
- Prompt de sistema personalizado
- Escolha de linguagem de programação
- Escolha de categoria da dúvida
- Upload de arquivos de código
- Upload de imagens para análise
- Respostas com Markdown renderizado
- Blocos de código formatados com botão de copiar
- Histórico de conversas salvo em SQLite
- Painel de histórico animado
- Tema claro/escuro
- Botão `+` com opções de linguagem, categoria e anexos
- Tratamento de erros da API

## Tecnologias Utilizadas

- Python
- Flask
- SQLite
- HTML
- CSS
- JavaScript
- OpenRouter API

## Estrutura do Projeto

```text
ia_chat_project/
├── app.py
├── requirements.txt
├── .env.example
├── configurar_openrouter.ps1
├── executar.ps1
├── templates/
│   └── index.html
└── static/
    ├── favicon.svg
    ├── script.js
    └── style.css
```

## Como Executar

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio/ia_chat_project
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

No Windows, caso `pip` não seja reconhecido:

```powershell
py -m pip install -r requirements.txt
```

### 3. Configurar a API Key da OpenRouter

Crie uma conta em:

```text
https://openrouter.ai
```

Depois gere uma API Key e configure a variável de ambiente.

No Windows PowerShell:

```powershell
$env:OPENROUTER_API_KEY="sua_chave_aqui"
```

No Linux/macOS:

```bash
export OPENROUTER_API_KEY="sua_chave_aqui"
```

Também é possível usar o script do projeto no Windows:

```powershell
.\configurar_openrouter.ps1
```

### 4. Executar o servidor

```bash
python app.py
```

No Windows, caso `python` não seja reconhecido:

```powershell
py app.py
```

Ou execute:

```powershell
.\executar.ps1
```

### 5. Acessar no navegador

```text
http://127.0.0.1:5000
```

## Como Funciona

1. O usuário digita uma pergunta na interface web.
2. O `script.js` envia a mensagem para o backend Flask usando `fetch`.
3. A mensagem é enviada em JSON para a rota `/chat`.
4. O `app.py` adiciona o prompt de sistema, monta o payload e chama a API da OpenRouter.
5. A OpenRouter processa a mensagem usando um modelo de IA.
6. O backend recebe a resposta e devolve em JSON para o frontend.
7. O JavaScript renderiza a resposta no chat.

## Personalização da IA

A personalização da IA é feita no arquivo `app.py`, por meio da variável `SYSTEM_PROMPT`.

Exemplo:

```python
SYSTEM_PROMPT = (
    "Voce e o CodeMentor IA, um professor universitario especialista em "
    "programacao e desenvolvimento de software..."
)
```

Esse prompt orienta o modelo a responder como uma IA especializada em programação.

## Rotas Principais

| Rota | Método | Descrição |
|---|---|---|
| `/` | GET | Carrega a interface principal |
| `/chat` | POST | Envia a mensagem para a IA |
| `/sessions` | GET | Lista conversas salvas |
| `/history/<session_id>` | GET | Carrega o histórico de uma conversa |
| `/clear` | POST | Limpa uma conversa |

## Segurança

Não envie sua chave da OpenRouter para o GitHub.

Antes de subir o projeto, confirme que estes arquivos não serão enviados:

```text
.env
codementor_history.db
__pycache__/
```

O projeto já possui um `.gitignore` para evitar o envio desses arquivos.

## Possíveis Melhorias Futuras

- Login de usuários
- Exportação de conversas em PDF
- Exclusão individual de conversas
- Suporte a mais modelos de IA
- Deploy em nuvem
- Melhorias de acessibilidade

## Autor

Projeto desenvolvido como atividade prática acadêmica para a disciplina de Engenharia de Inteligência Artificial.
