from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    # Aquí puedes conectar con una base de datos o lógica de respuestas
    if user_message.lower() == 'hola':
        reply = '¡Hola! ¿En qué puedo ayudarte?'
    else:
        reply = 'Lo siento, no entendí tu mensaje.'
    return jsonify({'reply': reply})

if __name__ == '__main__':
    app.run(debug=True)
