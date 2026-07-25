import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'

type TypewriterWordsProps = {
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
}

/**
 * Type / pause / delete word cycle — same as original Gitart hero:
 * words: ["commands","scripts","terminal","code","deploys"]
 * typingSpeed: 120, deletingSpeed: 80, pauseDuration: 2000
 */
export function TypewriterWords({
  words,
  className = '',
  typingSpeed = 120,
  deletingSpeed = 80,
  pauseDuration = 2000,
}: TypewriterWordsProps) {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!words.length) return
    const full = words[wordIndex]

    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && text === full) {
      // Finished typing — pause, then delete
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration)
    } else if (isDeleting && text === '') {
      // Finished deleting — next word
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setWordIndex((i) => (i + 1) % words.length)
      }, typingSpeed)
    } else if (isDeleting) {
      timeout = setTimeout(() => setText(full.slice(0, text.length - 1)), deletingSpeed)
    } else {
      timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), typingSpeed)
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className={cn(className)}>
      {text}
      <span className="animate-blink">|</span>
    </span>
  )
}
