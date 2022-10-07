'use strict';

(function () {
    // new speech recognition object
    const HINDI_LANG_CODE = 'hi-IN';

    const SpeechRecognition = window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition ||
        window.oSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = HINDI_LANG_CODE;
    recognition.continuous = true;

    const recognitionOut = $('#recognition-out');
    const recognitionBtn = $('#recognition-btn');

    // This runs when the speech recognition service starts
    recognition.onstart = function () {
        console.log('Recognition started, speak into mike');
    };

    recognition.onspeechend = function () {
        console.log('User done speaking');
        recognition.abort();

        if (recognitionBtn.listening) {
            console.log('stating again')
            recognition.start();
        }
    }

    // This runs when the speech recognition service returns result
    recognition.onresult = function (event) {
        const results = event.results;
        const currentResult = results[results.length - 1][0];

        const transcript = currentResult.transcript;
        const confidence = currentResult.confidence;

        showTranscript(transcript);

        console.log('Result ' + transcript);
    };

    function showTranscript(text) {
        recognitionOut.val(recognitionOut.val() + text);
    }



    recognitionBtn.on('click', () => {
        if (recognitionBtn.listening) {
            recognition.abort();

            recognitionBtn.text('Start Listening');
            recognitionBtn.listening = false;
        } else {
            recognition.start();

            recognitionBtn.text('Stop Listening');
            recognitionBtn.listening = true;
        }
    });

    const copyAllBth = $('#copy-all-btn');

    copyAllBth.on('click', () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(recognitionOut.val().trim());
        }
    });
})();
