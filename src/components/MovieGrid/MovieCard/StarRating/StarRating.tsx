import React, { useState } from 'react'
import './style.css'

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value

  const getRatingFromMouse = (
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const isHalf = event.clientX - rect.left < rect.width / 2
    return isHalf ? starIndex - 0.5 : starIndex
  }

  const renderStar = (starIndex: number) => {
    let starClass = 'empty'
    if (displayValue >= starIndex) starClass = 'full'
    else if (displayValue >= starIndex - 0.5) starClass = 'half'

    if (readonly) {
      return (
        <span
          key={starIndex}
          className={`star star--${starClass}`}
          aria-hidden="true"
        >
          <span className="star__base">★</span>
          <span className="star__fill">★</span>
        </span>
      )
    }

    return (
      <button
        key={starIndex}
        type="button"
        className={`star star--${starClass}`}
        onMouseMove={(e) => setHoverValue(getRatingFromMouse(e, starIndex))}
        onMouseLeave={() => setHoverValue(null)}
        onClick={(e) => onChange?.(getRatingFromMouse(e, starIndex))}
        aria-label={`Rate ${starIndex} stars`}
      >
        <span className="star__base">★</span>
        <span className="star__fill">★</span>
      </button>
    )
  }

  return (
    <div
      className={`star-rating star-rating--${size}${readonly ? ' star-rating--readonly' : ''}`}
      role={readonly ? 'img' : 'group'}
      aria-label={readonly ? `Rating: ${value} out of 5` : 'Rate this movie'}
    >
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  )
}