from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import re
import difflib

app = Flask(__name__)

# Conexión a MongoDB local
client = MongoClient('mongodb://localhost:27017/')
db = client['chatbotdb']
respuestas_col = db['chatbot_respuestas']

# Lista de especies para priorizar coincidencias
ESPECIES = [
    'pollo', 'pollos', 'gallina', 'gallinas', 'codorniz', 'codornices', 'pato', 'patos', 'ganso', 'gansos',
    'faisán', 'faisanes', 'avestruz', 'avestruces'
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip().lower()

    # Respuestas rápidas para saludos y despedidas (con tolerancia a typos)
    saludos = ['hola', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'holi', 'saludos', 'que tal', 'qué tal']
    despedidas = ['adios', 'adiós', 'hasta luego', 'nos vemos', 'bye', 'chao', 'me despido', 'hasta pronto']

    def typo_match(user, opciones, ratio=0.75):
        for op in opciones:
            if difflib.SequenceMatcher(None, user, op).ratio() > ratio or op in user:
                return True
        return False

    if typo_match(user_message, saludos, 0.75):
        return jsonify({'reply': '¡Hola! ¿En qué puedo ayudarte?'})
    if typo_match(user_message, despedidas, 0.75):
        return jsonify({'reply': '¡Hasta luego! Si tienes más dudas, aquí estaré.'})

    # 1. Buscar coincidencia exacta
    doc = respuestas_col.find_one({'pregunta': user_message})
    if doc:
        reply = doc.get('respuesta', 'Lo siento, no encontré una respuesta.')
        return jsonify({'reply': reply})

    preguntas = list(respuestas_col.find({}, {'pregunta': 1, 'respuesta': 1, '_id': 0}))
    user_words = set(user_message.split())

    # 2. Priorizar coincidencia de especie
    especie_encontrada = None
    for especie in ESPECIES:
        if especie in user_message:
            especie_encontrada = especie
            break
    if especie_encontrada:
        candidatas = [p for p in preguntas if especie_encontrada in p['pregunta']]
        if candidatas:
            # Elegir la candidata con más palabras clave en común
            max_matches = 0
            best_reply = None
            for p in candidatas:
                pregunta_words = set(p['pregunta'].split())
                matches = len(user_words & pregunta_words)
                if matches > max_matches:
                    max_matches = matches
                    best_reply = p['respuesta']
            if best_reply:
                return jsonify({'reply': best_reply})

    # 3. Buscar por mayor cantidad de palabras clave coincidentes
    max_matches = 0
    best_reply = None
    for p in preguntas:
        pregunta_words = set(p['pregunta'].split())
        matches = len(user_words & pregunta_words)
        if matches > max_matches:
            max_matches = matches
            best_reply = p['respuesta']
    if max_matches > 0:
        return jsonify({'reply': best_reply})

    # 4. Buscar similitud usando difflib solo si no hay coincidencias de palabras clave
    preguntas_texto = [p['pregunta'] for p in preguntas]
    match = difflib.get_close_matches(user_message, preguntas_texto, n=1, cutoff=0.65)
    if match:
        pregunta_encontrada = match[0]
        for p in preguntas:
            if p['pregunta'] == pregunta_encontrada:
                reply = p['respuesta']
                return jsonify({'reply': reply})

    # 5. Buscar por similitud de typo en todas las preguntas si no hubo coincidencia
    best_typo = None
    best_ratio = 0.0
    for p in preguntas:
        ratio = difflib.SequenceMatcher(None, user_message, p['pregunta']).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_typo = p['respuesta']
    if best_ratio > 0.65:
        return jsonify({'reply': best_typo})

    # 6. Si no hay coincidencia
    return jsonify({'reply': 'Lo siento, no encontré una respuesta para tu pregunta.'})

if __name__ == '__main__':
    app.run(debug=True)
