import React from "react"

const Loading = ({ rows = 3 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-gray-200 rounded h-16 w-full" />
      ))}
    </div>
  )
}

export default Loading