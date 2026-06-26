const chatForm = document.querySelector("#chat-form");
const chatMessages = document.querySelector("#chat-messages");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-button");
const themeButton = document.querySelector("#theme-button");
const languageSelect = document.querySelector("#language-select");
const categorySelect = document.querySelector("#category-select");
const codeFileInput = document.querySelector("#code-file");
const fileName = document.querySelector("#file-name");
const welcomePanel = document.querySelector("#welcome-panel");
const suggestionButtons = document.querySelectorAll("[data-suggestion]");
const historyList = document.querySelector("#history-list");
const newChatButton = document.querySelector("#new-chat-button");

const SESSION_KEY = "codementor_session_id";
const THEME_KEY = "codementor_theme";

let sessionId = localStorage.getItem(SESSION_KEY) || crypto.randomUUID();
localStorage.setItem(SESSION_KEY, sessionId);

function createWelcomePanel() {
    chatMessages.innerHTML = `
        <div class="welcome-panel" id="welcome-panel">
            <p class="welcome-kicker">Pronto para programar melhor</p>
            <h2>Como posso ajudar no seu codigo hoje?</h2>
            <p>Escolha uma linguagem, selecione uma categoria ou comece por uma sugestao rapida.</p>
            <div class="suggestions" aria-label="Sugestoes de perguntas">
                <button type="button" data-suggestion="Explique orientacao a objetos em Java com um exemplo simples.">Orientacao a objetos</button>
                <button type="button" data-suggestion="Corrija este codigo e explique o erro passo a passo.">Corrigir codigo</button>
                <button type="button" data-suggestion="Crie uma API REST em Java com exemplo de rota, service e controller.">Criar API em Java</button>
                <button type="button" data-suggestion="Explique como depurar um erro comum em Python.">Ajuda com debug</button>
            </div>
        </div>
    `;
    bindSuggestionButtons();
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(text) {
    let html = escapeHtml(text);

    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/`([^`]+)`/g, "<code class=\"inline-code\">$1</code>");
    html = html.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>",
    );

    return html;
}

function appendParagraph(container, lines) {
    if (!lines.length) {
        return;
    }

    const paragraph = document.createElement("p");
    paragraph.innerHTML = renderInlineMarkdown(lines.join(" "));
    container.appendChild(paragraph);
}

function appendList(container, items, ordered = false) {
    if (!items.length) {
        return;
    }

    const list = document.createElement(ordered ? "ol" : "ul");
    items.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = renderInlineMarkdown(item);
        list.appendChild(listItem);
    });
    container.appendChild(list);
}

function renderMarkdownBlock(container, text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    let paragraphLines = [];
    let unorderedItems = [];
    let orderedItems = [];

    function flushAll() {
        appendParagraph(container, paragraphLines);
        appendList(container, unorderedItems);
        appendList(container, orderedItems, true);
        paragraphLines = [];
        unorderedItems = [];
        orderedItems = [];
    }

    lines.forEach((rawLine) => {
        const line = rawLine.trim();

        if (!line) {
            flushAll();
            return;
        }

        const heading = line.match(/^(#{1,4})\s+(.+)$/);
        if (heading) {
            flushAll();
            const level = Math.min(heading[1].length + 2, 4);
            const title = document.createElement(`h${level}`);
            title.innerHTML = renderInlineMarkdown(heading[2]);
            container.appendChild(title);
            return;
        }

        const unordered = line.match(/^[-*]\s+(.+)$/);
        if (unordered) {
            appendParagraph(container, paragraphLines);
            appendList(container, orderedItems, true);
            paragraphLines = [];
            orderedItems = [];
            unorderedItems.push(unordered[1]);
            return;
        }

        const ordered = line.match(/^\d+[.)]\s+(.+)$/);
        if (ordered) {
            appendParagraph(container, paragraphLines);
            appendList(container, unorderedItems);
            paragraphLines = [];
            unorderedItems = [];
            orderedItems.push(ordered[1]);
            return;
        }

        appendList(container, unorderedItems);
        appendList(container, orderedItems, true);
        unorderedItems = [];
        orderedItems = [];
        paragraphLines.push(line);
    });

    flushAll();
}

function renderContent(container, text) {
    const normalizedText = text.replace(/'''/g, "```");
    const parts = normalizedText.split(/```([\s\S]*?)```/g);

    parts.forEach((part, index) => {
        if (index % 2 === 0) {
            renderMarkdownBlock(container, part);
            return;
        }

        const code = part.replace(/^\w+\n/, "");
        const pre = document.createElement("pre");
        const codeElement = document.createElement("code");
        const copyButton = document.createElement("button");

        codeElement.innerHTML = escapeHtml(code.trim());
        copyButton.className = "copy-button";
        copyButton.type = "button";
        copyButton.textContent = "Copiar";
        copyButton.addEventListener("click", () => navigator.clipboard.writeText(code.trim()));

        pre.append(copyButton, codeElement);
        container.appendChild(pre);
    });
}

function addMessage(text, type) {
    const currentWelcomePanel = document.querySelector("#welcome-panel");
    if (currentWelcomePanel) {
        currentWelcomePanel.remove();
    }

    const message = document.createElement("article");
    message.className = `message ${type}`;

    if (type.includes("assistant")) {
        renderContent(message, text);
    } else {
        message.textContent = text;
    }

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}

function addUserMessage(text, meta) {
    const message = addMessage(text, "user");

    if (meta) {
        const metaElement = document.createElement("div");
        metaElement.className = "message-meta";
        metaElement.textContent = meta;
        message.prepend(metaElement);
    }
}

function addLoadingMessage() {
    const message = document.createElement("article");
    message.className = "message assistant loading typing";
    message.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}

function resizeInput() {
    messageInput.style.height = "auto";
    messageInput.style.height = `${messageInput.scrollHeight}px`;
}

async function readSelectedFile() {
    const file = codeFileInput.files[0];

    if (!file) {
        return null;
    }

    const content = await file.text();
    return {
        name: file.name,
        content: content.slice(0, 12000),
    };
}

function setBusy(isBusy) {
    sendButton.disabled = isBusy;
    messageInput.disabled = isBusy;
    languageSelect.disabled = isBusy;
    categorySelect.disabled = isBusy;
    codeFileInput.disabled = isBusy;
}

async function sendMessage(event) {
    event.preventDefault();

    const text = messageInput.value.trim();
    const attachment = await readSelectedFile();

    if (!text && !attachment) {
        return;
    }

    const shownText = attachment
        ? `${text || "Analise este arquivo."}\n\nArquivo anexado: ${attachment.name}`
        : text;

    addUserMessage(shownText, `${languageSelect.value} - ${categorySelect.value}`);
    messageInput.value = "";
    codeFileInput.value = "";
    fileName.textContent = "Nenhum arquivo";
    resizeInput();

    const loading = addLoadingMessage();
    setBusy(true);

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId,
                message: text,
                language: languageSelect.value,
                category: categorySelect.value,
                attachment,
            }),
        });

        const data = await response.json();
        loading.remove();

        if (data.sessionId) {
            sessionId = data.sessionId;
            localStorage.setItem(SESSION_KEY, sessionId);
        }

        if (!response.ok) {
            addMessage(data.error || "Ocorreu um erro ao processar a mensagem.", "error");
            return;
        }

        addMessage(data.answer, "assistant");
        loadSessions();
    } catch (error) {
        loading.remove();
        addMessage("Nao foi possivel conectar ao servidor Flask.", "error");
        console.error(error);
    } finally {
        setBusy(false);
        messageInput.focus();
    }
}

async function clearConversation() {
    await fetch("/clear", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
    });

    chatMessages.innerHTML = "";
    addMessage("Conversa limpa. Pode enviar uma nova duvida de programacao.", "assistant");
    loadSessions();
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
}

function formatSessionDate(value) {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

async function loadSessions() {
    const response = await fetch("/sessions");
    const data = await response.json();

    historyList.innerHTML = "";

    if (!data.sessions.length) {
        historyList.innerHTML = "<p class=\"history-empty\">Nenhuma conversa salva ainda.</p>";
        return;
    }

    data.sessions.forEach((session) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "history-item";
        if (session.sessionId === sessionId) {
            button.classList.add("active");
        }

        button.innerHTML = `
            <span class="history-title">${escapeHtml(session.title)}</span>
            <span class="history-date">${formatSessionDate(session.updatedAt)} - ${session.messageCount} msgs</span>
        `;

        button.addEventListener("click", () => loadConversation(session.sessionId));
        historyList.appendChild(button);
    });
}

async function loadConversation(selectedSessionId) {
    const response = await fetch(`/history/${selectedSessionId}`);
    const data = await response.json();

    sessionId = selectedSessionId;
    localStorage.setItem(SESSION_KEY, sessionId);
    chatMessages.innerHTML = "";

    data.messages.forEach((message) => {
        if (message.role === "user") {
            const meta = `${message.language || "Geral"} - ${message.category || "Geral"}`;
            addUserMessage(message.content, meta);
            return;
        }

        addMessage(message.content, "assistant");
    });

    loadSessions();
}

function startNewConversation() {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
    messageInput.value = "";
    codeFileInput.value = "";
    fileName.textContent = "Nenhum arquivo";
    createWelcomePanel();
    loadSessions();
    messageInput.focus();
}

function bindSuggestionButtons() {
    document.querySelectorAll("[data-suggestion]").forEach((button) => {
        button.addEventListener("click", () => {
            messageInput.value = button.dataset.suggestion;
            resizeInput();
            messageInput.focus();
        });
    });
}

messageInput.addEventListener("input", resizeInput);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

themeButton.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme || "dark";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
});

clearButton.addEventListener("click", clearConversation);
chatForm.addEventListener("submit", sendMessage);

codeFileInput.addEventListener("change", () => {
    const file = codeFileInput.files[0];
    fileName.textContent = file ? file.name : "Nenhum arquivo";
});

newChatButton.addEventListener("click", startNewConversation);
bindSuggestionButtons();

applyTheme(localStorage.getItem(THEME_KEY) || "dark");
loadSessions();
