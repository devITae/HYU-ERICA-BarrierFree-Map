import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export const useSpeechToText = () => {
    const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition()

    const toggleListening = () => {
        if (!browserSupportsSpeechRecognition) {
            console.error('브라우저가 음성 인식을 지원하지 않습니다.')
            //alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
            return
        }
        
        if (listening) {
            SpeechRecognition.stopListening()
        } else {
            // transcript를 초기화하고 음성 인식을 시작합니다.
            //SpeechRecognition.abortListening()
            resetTranscript()
            SpeechRecognition.startListening({ language: 'ko-KR', continuous: true })
        }
    }

    const abortListening = () => {
        SpeechRecognition.abortListening()
    }
    return { transcript, listening, toggleListening, abortListening, browserSupportsSpeechRecognition }
}