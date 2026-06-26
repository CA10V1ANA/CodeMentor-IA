# Documentação da API - CodeMentor IA

## 1. Visão Geral

O CodeMentor IA é uma aplicação web de chat integrada com Inteligência Artificial. O objetivo do sistema é permitir que o usuário envie perguntas sobre programação e desenvolvimento de software e receba respostas geradas por um modelo de linguagem.

A comunicação com a IA é feita por meio da API da OpenRouter, que funciona como uma plataforma intermediária para acesso a diferentes modelos de Inteligência Artificial.

No projeto, o usuário interage com uma interface web. Essa interface envia os dados para um backend em Flask, que por sua vez monta a requisição e envia para a API da OpenRouter.

## 2. API Externa Utilizada

A API externa utilizada no projeto é a API da OpenRouter.

Endpoint utilizado:

```text
https://openrouter.ai/api/v1/chat/completions
```

Esse endpoint é responsável por receber mensagens no formato de conversa e retornar uma resposta gerada pelo modelo de IA escolhido.

## 3. Modelo Utilizado

O modelo utilizado no projeto é configurado pela variável de ambiente:

```text
OPENROUTER_MODEL
```

Por padrão, o projeto utiliza:

```text
openai/gpt-4o-mini
```

Esse modelo foi escolhido por ser adequado para respostas rápidas, didáticas e compatíveis com aplicações de chat.

## 4. Autenticação

Para utilizar a API da OpenRouter, é necessário possuir uma API Key.

A chave é enviada no cabeçalho HTTP da requisição:

```text
Authorization: Bearer OPENROUTER_API_KEY
```

No projeto, a chave não fica escrita diretamente no código. Ela é lida por variável de ambiente ou por um arquivo `.env` local.

Exemplo de configuração no Windows PowerShell:

```powershell
$env:OPENROUTER_API_KEY="sua_chave_aqui"
```

Essa prática evita que a chave da API seja exposta em repositórios públicos.

## 5. Rota Interna Do Sistema

O frontend não se comunica diretamente com a OpenRouter. Primeiro, ele envia a mensagem para o backend Flask.

Rota principal do backend:

```text
POST /chat
```

Essa rota recebe a mensagem do usuário, adiciona o prompt de sistema e faz a chamada para a API externa.

## 6. Requisição Do Frontend Para O Backend

O arquivo `script.js` envia os dados para o backend usando `fetch`.

Exemplo de requisição:

```javascript
fetch("/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        sessionId: "id-da-conversa",
        message: "Explique orientação a objetos em Java",
        language: "Java",
        category: "Geral",
        attachment: null
    })
});
```

O corpo da requisição é enviado em JSON.

Exemplo de JSON enviado:

```json
{
  "sessionId": "id-da-conversa",
  "message": "Explique orientação a objetos em Java",
  "language": "Java",
  "category": "Geral",
  "attachment": null
}
```

## 7. Campos Enviados Pelo Frontend

| Campo | Descrição |
|---|---|
| `sessionId` | Identificador da conversa atual |
| `message` | Mensagem digitada pelo usuário |
| `language` | Linguagem escolhida pelo usuário |
| `category` | Categoria da dúvida |
| `attachment` | Arquivo ou imagem anexada, quando existir |

## 8. Personalização Da IA

A especialização da IA é feita por meio de um prompt de sistema definido no arquivo `app.py`.

Esse prompt orienta o modelo a responder como uma IA especialista em programação.

Trecho usado no projeto:

```python
SYSTEM_PROMPT = (
    "Voce e o CodeMentor IA, um professor universitario especialista em "
    "programacao e desenvolvimento de software..."
)
```

Esse prompt é enviado junto com cada pergunta do usuário. Dessa forma, mesmo que o usuário faça perguntas diferentes, a IA mantém o comportamento de uma mentora técnica focada em desenvolvimento de software.

## 9. Montagem Do Payload Para A OpenRouter

Após receber os dados do frontend, o backend monta um payload para enviar à OpenRouter.

Exemplo simplificado:

```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Voce e o CodeMentor IA..."
    },
    {
      "role": "system",
      "content": "Linguagem escolhida pelo usuario: Java. Categoria da duvida: Geral."
    },
    {
      "role": "user",
      "content": "Explique orientação a objetos em Java"
    }
  ],
  "temperature": 0.35,
  "max_tokens": 1100
}
```

## 10. Estrutura Das Mensagens

A API utiliza uma lista de mensagens. Cada mensagem possui dois campos principais:

| Campo | Função |
|---|---|
| `role` | Define o papel da mensagem |
| `content` | Conteúdo da mensagem |

Principais papéis usados:

| Role | Descrição |
|---|---|
| `system` | Define instruções e comportamento da IA |
| `user` | Representa a pergunta enviada pelo usuário |
| `assistant` | Representa respostas anteriores da IA no histórico |

## 11. Histórico De Conversa

O projeto salva mensagens em um banco SQLite local.

Arquivo usado:

```text
codementor_history.db
```

Esse histórico permite:

- Listar conversas antigas;
- Reabrir uma conversa anterior;
- Usar mensagens recentes como contexto;
- Criar títulos automáticos com base na primeira pergunta do usuário.

A rota usada para listar conversas é:

```text
GET /sessions
```

A rota usada para carregar uma conversa específica é:

```text
GET /history/<session_id>
```

## 12. Upload De Arquivos E Imagens

O sistema permite anexar arquivos de código e imagens.

Arquivos de código são enviados como texto para a IA analisar.

Exemplo:

```json
{
  "kind": "code",
  "name": "exemplo.py",
  "type": "text/plain",
  "content": "print('Olá mundo')"
}
```

Imagens são enviadas como `data URL`, permitindo que o modelo analise prints, telas ou fotos.

Exemplo simplificado:

```json
{
  "kind": "image",
  "name": "erro.png",
  "type": "image/png",
  "content": "data:image/png;base64,..."
}
```

Quando uma imagem é enviada, o backend monta a mensagem em formato multimodal para a OpenRouter.

## 13. Resposta Da API

A OpenRouter retorna um JSON contendo a resposta do modelo.

O backend extrai o texto da resposta neste caminho:

```text
choices[0].message.content
```

Depois, o Flask devolve para o frontend um JSON como:

```json
{
  "answer": "Resposta gerada pela IA",
  "sessionId": "id-da-conversa"
}
```

## 14. Exibição Da Resposta No Frontend

O frontend recebe o JSON retornado pelo backend e exibe a resposta no chat.

Além disso, o sistema renderiza Markdown, permitindo que a resposta apareça com:

- Títulos;
- Negrito;
- Listas;
- Links;
- Código inline;
- Blocos de código;
- Botão para copiar código.

## 15. Tratamento De Erros

O backend trata diferentes tipos de erro para melhorar a experiência do usuário.

Erros tratados:

- Mensagem vazia;
- API Key não configurada;
- Chave inválida;
- Falha de conexão;
- Timeout;
- Limite da API atingido;
- Resposta inesperada da API.

Exemplo de erro retornado:

```json
{
  "error": "A API demorou muito para responder. Tente novamente."
}
```

O frontend recebe esse erro e mostra a mensagem dentro do chat.

## 16. Fluxo Completo Da Comunicação

Fluxo do sistema:

```text
Usuário
  ↓
Interface HTML/CSS/JavaScript
  ↓
Requisição POST em JSON para /chat
  ↓
Backend Flask
  ↓
Payload com prompt + mensagem do usuário
  ↓
API da OpenRouter
  ↓
Resposta gerada pelo modelo
  ↓
Backend Flask
  ↓
Resposta JSON para o frontend
  ↓
Exibição no chat
```

## 17. Rotas Do Projeto

| Rota | Método | Função |
|---|---|---|
| `/` | GET | Carrega a interface principal |
| `/chat` | POST | Envia mensagem para a IA |
| `/sessions` | GET | Lista conversas salvas |
| `/history/<session_id>` | GET | Carrega mensagens de uma conversa |
| `/clear` | POST | Limpa uma conversa |

## 18. Conclusão

A integração com a API da OpenRouter permite que o CodeMentor IA funcione como uma aplicação moderna de Inteligência Artificial.

O projeto demonstra conceitos importantes da disciplina, como:

- Comunicação entre frontend e backend;
- Uso de JSON;
- Requisições HTTP;
- Integração com API externa;
- Personalização de comportamento por prompt;
- Tratamento de respostas e erros;
- Uso de histórico para melhorar o contexto da conversa.

Dessa forma, o sistema atende à proposta da atividade prática e mostra como aplicações reais podem utilizar modelos de IA por meio de APIs.
