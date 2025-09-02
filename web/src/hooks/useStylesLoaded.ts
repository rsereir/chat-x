import { useEffect, useState } from "react"

export function useStylesLoaded() {
  const [stylesLoaded, setStylesLoaded] = useState(false)

  useEffect(() => {
    const checkStylesLoaded = () => {
      const testElement = document.createElement('div')
      testElement.className = 'ant-btn'
      testElement.style.position = 'absolute'
      testElement.style.visibility = 'hidden'
      document.body.appendChild(testElement)

      const computedStyle = window.getComputedStyle(testElement)
      const hasAntStyles = computedStyle.padding !== '0px' ||
                          computedStyle.border !== '0px none rgb(0, 0, 0)' ||
                          computedStyle.borderRadius !== '0px'

      document.body.removeChild(testElement)

      if (hasAntStyles) {
        setStylesLoaded(true)
      } else {
        setTimeout(checkStylesLoaded, 50)
      }
    }

    const timer = setTimeout(checkStylesLoaded, 100)

    return () => clearTimeout(timer)
  }, [])

  return stylesLoaded
}
