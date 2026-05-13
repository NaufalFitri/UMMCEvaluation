import React from 'react'

type SliderProps = {
  value: number | number[]
  onChange?: (v: number) => void
  onValueChange?: (v: number[]) => void
  min?: number
  max?: number
  step?: number
}

function Slider({ value, onChange, onValueChange, min = 1, max = 10, step = 1 }: SliderProps) {
  const currentValue = Array.isArray(value) ? value[0] : value

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={currentValue}
      onChange={(e) => {
        const nextValue = Number(e.target.value)
        onChange?.(nextValue)
        onValueChange?.([nextValue])
      }}
      className="w-full accent-[#175cc5]"
    />
  )
}

export { Slider }
export default Slider
