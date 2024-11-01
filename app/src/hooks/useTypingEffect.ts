import { useState, useEffect } from 'react'
export const useTypingEffect = (text: string, speed: number = 50) => {
    const [displayedText, setDisplayedText] = useState('')
  
    useEffect(() => {
      let i = 0
      setDisplayedText('')
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
  
    return displayedText
  }