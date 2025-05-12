// ==UserScript==
// @name         Flora AI to ElevenLabs (Auto TTS + Trigger)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Sends Flora text to ElevenLabs for TTS playback, then re-triggers the loop by clicking "Run all"
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    const ELEVENLABS_API_KEY = 'YOUR-ELEVENLABS-API-Key'; // Your ElevenLabs API Key
    const VOICE_ID = '7NsaqHdLuKNFvEfjpUno'; // Your ElevenLabs voice ID

    function triggerFloraRun() {
        const button = document.querySelector('button[title="Run all"]');
        if (button) {
            console.log("🔁 Triggering 'Run all' button...");
            button.click();
        } else {
            console.warn("⚠️ 'Run all' button not found.");
        }
    }

    function sendToElevenLabs(text) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            headers: {
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
                "xi-api-key": ELEVENLABS_API_KEY
            },
            data: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.7
                }
            }),
            responseType: "blob",
            onload: function (res) {
                const blob = res.response;
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);

                audio.play();
                console.log("🔊 Playing audio from ElevenLabs");

                audio.onended = function () {
                    console.log("✅ Audio finished. Re-triggering Flora...");
                    triggerFloraRun();
                };
            },
            onerror: function (err) {
                console.error("❌ Error sending to ElevenLabs:", err);
            }
        });
    }

    function checkTextareaAndSend() {
        const textarea = document.querySelector('[data-id="text-block-output-textarea"]');
        if (textarea && textarea.value && textarea.value !== window.__lastSentToEleven) {
            const text = textarea.value;
            GM_setClipboard(text, "text");
            window.__lastSentToEleven = text;
            console.log("📋 Copied to clipboard and sending to ElevenLabs...");
            sendToElevenLabs(text);
        }
    }

    setInterval(checkTextareaAndSend, 3000); // check every 3 seconds
})();
