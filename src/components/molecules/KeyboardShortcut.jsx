import React from "react"

const KeyboardShortcut = ({ keys, description, className = "" }) => {
  return (
    <div className={`flex items-center justify-between text-sm ${className}`}>
      <span className="text-gray-600">{description}</span>
      <div className="flex items-center space-x-1">
        {keys.split('+').map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <span className="text-gray-400">+</span>}
            <kbd className="kbd">{key}</kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default KeyboardShortcut