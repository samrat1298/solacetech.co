class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
        }
    }

    startListening(onResultCallback, onEndCallback) {
        if (!this.recognition) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }
        this.isListening = true;
        this.recognition.start();

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResultCallback(transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (onEndCallback) onEndCallback();
        };

        this.recognition.onerror = () => {
            this.isListening = false;
            if (onEndCallback) onEndCallback();
        };
    }

    speak(text) {
        if (!this.synthesis) return;
        this.synthesis.cancel(); // Stop active speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synthesis.speak(utterance);
    }
}

window.voiceEngine = new VoiceEngine();