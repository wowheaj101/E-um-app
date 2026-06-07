/**
 * useSpeech — Web Speech API(SpeechRecognition) 래퍼.
 * 미지원 브라우저(특히 iOS Safari 일부)는 supported=false →
 * 화면이 텍스트 입력 fallback 으로 유도한다 (명세서 §4.3).
 */
import { onUnmounted, ref } from 'vue'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
}

export function useSpeech(lang = 'ko-KR') {
  const SR =
    (typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
    null

  const supported = ref<boolean>(Boolean(SR))
  const listening = ref(false)
  const transcript = ref('')
  const error = ref<string | null>(null)

  let recognition: SpeechRecognitionLike | null = null

  function start() {
    if (!SR) {
      supported.value = false
      return
    }
    error.value = null
    transcript.value = ''
    recognition = new SR()
    recognition!.lang = lang
    recognition!.continuous = false
    recognition!.interimResults = true

    recognition!.onresult = (e: any) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      transcript.value = text
    }
    recognition!.onerror = (e: any) => {
      error.value =
        e?.error === 'not-allowed'
          ? '마이크 권한이 필요해요.'
          : '음성 인식에 문제가 생겼어요. 직접 입력해 주세요.'
      listening.value = false
    }
    recognition!.onend = () => {
      listening.value = false
    }

    listening.value = true
    recognition!.start()
  }

  function stop() {
    recognition?.stop()
    listening.value = false
  }

  onUnmounted(() => {
    try {
      recognition?.stop()
    } catch {
      /* noop */
    }
  })

  return { supported, listening, transcript, error, start, stop }
}
