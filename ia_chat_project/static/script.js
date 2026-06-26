const chatForm = document.querySelector("#chat-form");
const chatMessages = document.querySelector("#chat-messages");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");

function addMessage(text, type) {
    const message = document.createElement("article");
    message.className = `message ${type}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
}

function resizeInput() {
    messageInput.style.height = "auto";
    messageInput.style.height = `${messageInput.scrollHeight}px`;
}

async function sendMessage(event) {
    event.preventDefault();

    const text = messageInput.value.trim();
    if (!text) {
        return;
    }

    addMessage(text, "user");
    messageInput.value = "";
    resizeInput();

    const loading = addMessage("CodeMentor IA está analisando sua dúvida...", "assistant loading");
    sendButton.disabled = true;
    messageInput.disabled = true;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        loading.remove();

        if (!response.ok) {
            addMessage(data.error || "Ocorreu um erro ao processar a mensagem.", "error");
            return;
        }

        addMessage(data.answer, "assistant");
    } catch (error) {
        loading.remove();
        addMessage("Não foi possível conectar ao servidor Flask.", "error");
        console.error(error);
    } finally {
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

messageInput.addEventListener("input", resizeInput);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

chatForm.addEventListener("submit", sendMessage);
