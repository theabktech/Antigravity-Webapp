// Mobile Voice Dictation Service using Web Speech API

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStateChangeCallback: ((listening: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStateChangeCallback?.(true);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStateChangeCallback?.(false);
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.onErrorCallback?.(event.error);
          this.isListening = false;
          this.onStateChangeCallback?.(false);
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.onResultCallback?.(finalTranscript, true);
          } else if (interimTranscript) {
            this.onResultCallback?.(interimTranscript, false);
          }
        };
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onStateChange?: (listening: boolean) => void,
    lang = 'en-US'
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition is not supported on this device/browser');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onStateChangeCallback = onStateChange || null;
    this.recognition.lang = lang;

    try {
      this.recognition.start();
    } catch (e: any) {
      console.warn('Failed to start speech recognition:', e);
      onError?.(e.message || 'Failed to start speech recognition');
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping speech recognition:', e);
      }
    }
  }

  public toggle(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onStateChange?: (listening: boolean) => void,
    lang = 'en-US'
  ) {
    if (this.isListening) {
      this.stop();
    } else {
      this.start(onResult, onError, onStateChange, lang);
    }
  }
}

export const speechService = new SpeechService();
