'use strict';

(function () {
    // new speech recognition object
    const HINDI_LANG_CODE = 'hi-IN';

    const SpeechRecognition = getSpeechRecognition();

    const recognition = new SpeechRecognition();
    recognition.lang = HINDI_LANG_CODE;
    recognition.continuous = true;

    const recognitionOut = $('#recognition-out');
    const recognitionBtn = $('#recognition-btn');

    setupSpeechRecognitionEvents(recognition);

    const controls = getSpeechRecognitionControls(recognition);

    setupInteractionButton(recognitionBtn, recognition);

    setupCopyButton();

    function getSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            window.mozSpeechRecognition ||
            window.msSpeechRecognition ||
            window.oSpeechRecognition;

        if (!SpeechRecognition) {
            throw Error("SpeechRecogition is not supported by this browser");
        }

        return SpeechRecognition;
    }

    function setupSpeechRecognitionEvents(recognition) {
        // This runs when the speech recognition service starts
        recognition.onstart = function () {
            console.log('Recognition started, speak into mike');
        };

        recognition.onspeechend = function () {
            console.log('User done speaking');
            controls.startListening();
        }

        // This runs when the speech recognition service returns result
        recognition.onresult = function (event) {
            const results = event.results;
            const currentResult = results[results.length - 1][0];

            const transcript = currentResult.transcript;
            const confidence = currentResult.confidence;

            showTranscript(transcript);

            console.log('Result ' + transcript);

            controls.startListening();
        };

        recognition.onerror = function (event) {
            console.log('error during speech recognition, restarting: ' + event.error);

            controls.startListening();
        }
    }

    function showTranscript(transcript) {
        console.log(transcript);

        var currentText = recognitionOut.val();
        const lastChar = currentText.length && currentText.charAt(currentText.length - 1);

        var newText = null;

        if(lastChar === ' ' || lastChar === '\t' || lastChar === '\n' ) {
            newText = recognitionOut.val() + transcript;
        } else {
            newText = recognitionOut.val() + ' ' + transcript;
        }

        recognitionOut.val(newText);
    }

    function getSpeechRecognitionControls(recognition) {
        var lastStartedAt = null;
        var restartCount = 0;

        trackTooManyRestartsPerSecond();

        function startListening() {
            console.log('starting listening');

            if (!lastStartedAt) {
                recognition.start();

                console.log('started speech recognition');

                lastStartedAt = new Date().getTime();
                restartCount++;
            } else {
                // play nicely with the browser, and never restart annyang automatically more than once per second
                restartCount++;
                
                const timeSinceLastStart = new Date().getTime() - lastStartedAt;

                if (timeSinceLastStart < 1000) {
                    setTimeout(function () {
                        startListening();
                    }, 1000 - timeSinceLastStart);
                } else {
                    restart();
                }
            }
        }

        function trackTooManyRestartsPerSecond() {
            var lastRestartCount = restartCount;

            setInterval(() => {
                const restartDiff = restartCount - lastRestartCount;

                if (restartDiff > 10) {
                    console.warn('Speech Recognition is repeatedly stopping and starting.maybe you have two windows with speech recognition open?');
    
                    alert('too many restarts, refresh browser');
                } else {
                    lastRestartCount = restartCount;
                }
            }, 1000)
        }

        function restart() {
            recognition.stop();
            try {
                recognition.start();
            } catch(error) {
                console.warn('Ignoring start() errors, ' + error);
            }

            lastStartedAt = new Date().getTime();
            restartCount++;

            console.log('restarted')
        }

        function stopListening() {
            recognition.stop();
        }

        return { startListening, stopListening };
    }

    function setupInteractionButton(recognitionBtn, recognition) {
        recognitionBtn.on('click', () => {
            if (recognitionBtn.listening) {
                controls.stopListening();

                recognitionBtn.text('Start Listening');
                recognitionBtn.listening = false;
            } else {
                controls.startListening();

                recognitionBtn.text('Stop Listening');
                recognitionBtn.listening = true;
            }
        });
    }

    function setupCopyButton() {
        const copyAllBth = $('#copy-all-btn');

        copyAllBth.on('click', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(recognitionOut.val().trim());
            }
        });
    }
})();
