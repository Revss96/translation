from flask import Flask, request, jsonify, render_template
from googletrans import Translator
import speech_recognition as sr
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer()

def translate_text(text, dest_language):
    translator = Translator()
    try:
        translation = translator.translate(text, dest=dest_language)
        return translation.text
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return the original text if translation fails

def analyze_sentiment(text):
    sentiment = analyzer.polarity_scores(text)
    compound = sentiment['compound']
    
    if compound >= 0.6:
        return 'happy'
    elif 0.2 <= compound < 0.6:
        return 'positive'
    elif -0.2 < compound < 0.2:
        return 'neutral'
    elif -0.6 <= compound < -0.2:
        return 'sad'
    else:
        return 'angry'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate_text', methods=['POST'])
def translate_text_input():
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'en')  # Default to English if not provided
    
    # Translate the input text to the target language
    translated_text = translate_text(text, language)
    sentiment = analyze_sentiment(text)
    
    return jsonify({
        'original_text': text,
        'translated_text': translated_text,
        'sentiment': sentiment,
        'language': language
    })

@app.route('/convert_speech', methods=['POST'])
def convert_speech():
    data = request.get_json()
    text = data.get('text', '')
    
    language = request.args.get('language', 'en')
    translated_text = translate_text(text, language)
    sentiment = analyze_sentiment(text)
    
    return jsonify({
        'original_text': text,
        'translated_text': translated_text,
        'sentiment': sentiment,
        'language': language
    })

if __name__ == '__main__':
    app.run(debug=True)
