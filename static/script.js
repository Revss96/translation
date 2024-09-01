document.getElementById('startRecordingButton').addEventListener('click', function() {
    const language = document.getElementById('speechLanguageSelect').value;
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    recognition.lang = 'en-US'; // Update this if needed
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        fetch('/convert_speech?language=' + language, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('originalText').textContent = data.original_text;
            document.getElementById('translatedText').textContent = data.translated_text;
            document.getElementById('sentiment').textContent = data.sentiment;
            speakOutput(data.translated_text, language);  // Speak the translated text
        })
        .catch(error => console.error('Error:', error));
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };
});

document.getElementById('translateTextButton').addEventListener('click', function() {
    const text = document.getElementById('textInput').value;
    const language = document.getElementById('textLanguageSelect').value;

    fetch('/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text, language: language })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('originalText').textContent = data.original_text;
        document.getElementById('translatedText').textContent = data.translated_text;
        document.getElementById('sentiment').textContent = data.sentiment;
        speakOutput(data.translated_text, language);  // Speak the translated text
    })
    .catch(error => console.error('Error:', error));
});

function speakOutput(text, language) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Text-to-speech is not supported in this browser.');
    }
}
