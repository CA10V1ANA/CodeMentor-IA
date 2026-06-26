import os
import sqlite3
import uuid
from datetime import datetime

import requests
from flask import Flask, jsonify, render_template, request


app = Flask(__name__)

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "codementor_history.db")


def load_local_env():
    env_path = os.path.join(BASE_DIR, ".env")

    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8-sig") as env_file:
        for line in env_file:
            line = line.strip()

            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                language TEXT,
                category TEXT,
                created_at TEXT NOT NULL
            )
            """
        )


def save_message(session_id, role, content, language=None, category=None):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO messages (session_id, role, content, language, category, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                role,
                content,
                language,
                category,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )


def get_recent_history(session_id, limit=8):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT role, content
            FROM messages
            WHERE session_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (session_id, limit),
        ).fetchall()

    return [
        {"role": row["role"], "content": row["content"]}
        for row in reversed(rows)
        if row["role"] in {"user", "assistant"}
    ]


def get_session_messages(session_id):
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT role, content, language, category, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY id ASC
            """,
            (session_id,),
        ).fetchall()

    return [
        {
            "role": row["role"],
            "content": row["content"],
            "language": row["language"],
            "category": row["category"],
            "createdAt": row["created_at"],
        }
        for row in rows
        if row["role"] in {"user", "assistant"}
    ]


def make_title(content):
    first_line = content.splitlines()[0].strip()
    title = first_line or "Conversa sem titulo"

    if len(title) > 48:
        return f"{title[:45]}..."

    return title


def list_sessions():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                session_id,
                MIN(CASE WHEN role = 'user' THEN content END) AS first_message,
                MAX(created_at) AS updated_at,
                COUNT(*) AS message_count
            FROM messages
            GROUP BY session_id
            HAVING first_message IS NOT NULL
            ORDER BY updated_at DESC
            """
        ).fetchall()

    return [
        {
            "sessionId": row["session_id"],
            "title": make_title(row["first_message"]),
            "updatedAt": row["updated_at"],
            "messageCount": row["message_count"],
        }
        for row in rows
    ]


def clear_history(session_id):
    with get_connection() as connection:
        connection.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))


load_local_env()
init_database()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o-mini")

SYSTEM_PROMPT = (
    "Voce e o CodeMentor IA, um professor universitario especialista em "
    "programacao e desenvolvimento de software. Responda sempre em portugues "
    "do Brasil, com explicacoes tecnicas, didaticas e objetivas. Use exemplos "
    "de codigo quando isso ajudar. Quando receber codigo do usuario, analise "
    "possiveis erros, explique a causa, sugira melhoria e mostre uma versao "
    "corrigida quando adequado. Priorize boas praticas, legibilidade, testes, "
    "seguranca, desempenho e arquitetura. Quando receber imagem, print ou foto, "
    "analise o conteudo visual e relacione com programacao, interface, erro, "
    "codigo ou contexto tecnico mostrado. Se a pergunta estiver fora da area "
    "de programacao, responda brevemente e redirecione para temas de software."
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    session_id = data.get("sessionId") or str(uuid.uuid4())
    user_message = data.get("message", "").strip()
    language = data.get("language", "Geral").strip() or "Geral"
    category = data.get("category", "Geral").strip() or "Geral"
    attachment = data.get("attachment") or {}

    if not user_message and not attachment.get("content"):
        return jsonify({"error": "Digite uma pergunta ou envie um arquivo."}), 400

    if not OPENROUTER_API_KEY:
        return (
            jsonify(
                {
                    "error": (
                        "A variavel OPENROUTER_API_KEY nao foi configurada. "
                        "Execute configurar_openrouter.ps1 e reinicie o servidor."
                    )
                }
            ),
            500,
        )

    context_prompt = (
        f"Linguagem escolhida pelo usuario: {language}.\n"
        f"Categoria da duvida: {category}.\n"
        "Responda usando essa linguagem e categoria como contexto principal."
    )

    final_user_message = user_message
    current_user_content = final_user_message

    if attachment.get("content"):
        file_name = attachment.get("name", "arquivo_enviado")
        file_content = attachment.get("content", "")
        file_kind = attachment.get("kind", "code")

        if file_kind == "image":
            final_user_message = (
                f"{user_message or 'Analise a imagem enviada.'}\n\n"
                f"Imagem enviada: {file_name}"
            ).strip()
            current_user_content = [
                {
                    "type": "text",
                    "text": (
                        f"{final_user_message}\n"
                        "Descreva o que aparece na imagem e ajude com a duvida do usuario."
                    ),
                },
                {"type": "image_url", "image_url": {"url": file_content}},
            ]
        else:
            final_user_message = (
                f"{user_message}\n\n"
                f"Arquivo enviado: {file_name}\n"
                "Analise o codigo abaixo:\n"
                f"```{language.lower()}\n{file_content}\n```"
            ).strip()
            current_user_content = final_user_message

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": context_prompt},
        *get_recent_history(session_id),
        {"role": "user", "content": current_user_content},
    ]

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5000",
        "X-Title": "CodeMentor IA",
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.35,
        "max_tokens": 1100,
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=35,
        )
        response.raise_for_status()
        response_data = response.json()
        answer = response_data["choices"][0]["message"]["content"]

        save_message(session_id, "user", final_user_message, language, category)
        save_message(session_id, "assistant", answer, language, category)

        return jsonify({"answer": answer, "sessionId": session_id})
    except requests.exceptions.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else 502
        if status_code in {401, 403}:
            error = "Chave da OpenRouter invalida ou sem permissao. Gere uma nova API Key."
        elif status_code == 429:
            error = "Limite de uso da API atingido. Aguarde um pouco e tente novamente."
        else:
            error = "A OpenRouter retornou um erro. Verifique o modelo e tente novamente."

        app.logger.exception("Erro HTTP ao chamar a OpenRouter: %s", exc)
        return jsonify({"error": error}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "A API demorou muito para responder. Tente novamente."}), 504
    except requests.exceptions.RequestException as exc:
        app.logger.exception("Erro de conexao com a OpenRouter: %s", exc)
        return jsonify({"error": "Falha de conexao com a OpenRouter ou com a internet."}), 502
    except (KeyError, IndexError, ValueError) as exc:
        app.logger.exception("Resposta inesperada da API: %s", exc)
        return jsonify({"error": "A API respondeu em um formato inesperado."}), 502


@app.route("/history/<session_id>", methods=["GET"])
def history(session_id):
    return jsonify({"messages": get_session_messages(session_id)})


@app.route("/sessions", methods=["GET"])
def sessions():
    return jsonify({"sessions": list_sessions()})


@app.route("/clear", methods=["POST"])
def clear():
    data = request.get_json(silent=True) or {}
    session_id = data.get("sessionId")

    if session_id:
        clear_history(session_id)

    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True)
