import { useState, useEffect } from 'react'
export const useTypingEffect = (text: string, speed: number = 50) => {
    const [displayedText, setDisplayedText] = useState<string>('')
  
    useEffect(() => {
      console.log(`text degisti...`)
      let i = 0
      if (!text) return setDisplayedText('')
      setDisplayedText(`${text.charAt(0)}`)
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, speed)
  
      return () => clearInterval(typingInterval)
    }, [text, speed])
    return {displayedText}
  }