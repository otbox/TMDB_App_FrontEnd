import React, { useState } from 'react'
import './style.css'

type StarRatingProps = {
  value: number
  onChange: (value: number) => void
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value

  const getRatingFromMouse = (
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const isHalf = clickX < rect.width / 2

    return isHalf ? starIndex - 0.5 : starIndex
  }

  const handleMouseMove = (
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const nextHoverValue = getRatingFromMouse(event, starIndex)
    setHoverValue(nextHoverValue)
  }

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const nextValue = getRatingFromMouse(event, starIndex)
    console.log(nextValue)
    onChange(nextValue)
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  const renderStar = (starIndex: number): React.JSX.Element => {
    let starClass = 'empty'

    if (displayValue >= starIndex) {
      starClass = 'full'
    } else if (displayValue >= starIndex - 0.5) {
      starClass = 'half'
    }

    return (
      <button
        key={starIndex}
        type="button"
        className={`star star--${starClass}`}
        onMouseMove={(event) => handleMouseMove(event, starIndex)}
        onMouseLeave={handleMouseLeave}
        onClick={(event) => handleClick(event, starIndex)}
        aria-label={`Rate ${starIndex} stars`}
      >
        <span className="star__base">★</span>
        <span className="star__fill">★</span>
      </button>
    )
  }

  return (
    <div className="star-rating" role="group" aria-label="Rate this movie">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  )
}