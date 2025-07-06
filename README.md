# Estructura recomendada para un proyecto Flask con chatbot

chatbot/
├── app.py
├── requirements.txt
├── static/
│   ├── css/
│   │   └── main.css
│   ├── scripts/
│   │   └── chatbot.js
│   └── images/
├── templates/
│   └── index.html
└── README.md

- El archivo `app.py` contiene la aplicación Flask.
- La carpeta `static/` almacena recursos estáticos: CSS, JS y posibles imágenes.
- La carpeta `templates/` almacena los archivos HTML (Jinja2), por convención de Flask.
- El archivo `requirements.txt` lista las dependencias de Python.
- El archivo `README.md` documenta el proyecto.