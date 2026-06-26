import os

import requests
from flask import Flask, jsonify, render_template, request


app = Flask(__name__)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o-mini")

SYSTEM_PROMPT = (
    "Você é o CodeMentor IA, um professor universitário especialista em "
    "programação e desenvolvimento de software. Responda sempre em português, "
    "com linguagem técnica, didática e objetiva. Quando fizer sentido, use "
    "exemplos de código, explique o raciocínio passo a passo e destaque boas "
    "práticas. Se a pergunta estiver fora da área de programação, responda de "
    "forma breve e redirecione educadamente para temas como lógica, algoritmos, "
    "linguagens, frameworks, APIs, bancos de dados, testes, arquitetura e "
    "depuração de software."
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Digite uma pergunta antes de enviar."}), 400

    if not OPENROUTER_API_KEY:
        return (
            jsonify(
                {
                    "error": (
                        "A variável de ambiente OPENROUTER_API_KEY não foi "
                        "configurada. Defina a chave da OpenRouter e reinicie "
                        "o servidor."
                    )
                }
            ),
            500,
        )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5000",
        "X-Title": "CodeMentor IA",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.4,
        "max_tokens": 900,
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        response_data = response.json()
        answer = response_data["choices"][0]["message"]["content"]
        return jsonify({"answer": answer})
    except requests.exceptions.RequestException as exc:
        app.logger.exception("Erro ao chamar a API da OpenRouter: %s", exc)
        return (
            jsonify(
                {
                    "error": (
                        "Não foi possível se comunicar com a OpenRouter. "
                        "Verifique sua conexão, sua chave de API e o modelo "
                        "configurado."
                    )
                }
            ),
            502,
        )
    except (KeyError, IndexError, ValueError) as exc:
        app.logger.exception("Resposta inesperada da API: %s", exc)
        return (
            jsonify(
                {
                    "error": (
                        "A API respondeu em um formato inesperado. Tente "
                        "novamente em alguns instantes."
                    )
                }
            ),
            502,
        )


if __name__ == "__main__":
    app.run(debug=True)
