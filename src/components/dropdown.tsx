import React, { useState, useRef, useEffect } from 'react'
import '../customstyles/dropdown.css' // For styling
import { IDashboardBase, IFolder } from '@looker/sdk'

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string|null|undefined>(null)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const handleOptionClick = (option: IDashboardBase) => {
    setSelectedOption(option?.title)
    setIsOpen(false)
    onSelect(option) // Notify parent component of the selection
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div className="dropdown-header" onClick={toggleDropdown}>
        {selectedOption || 'Select an option'}
        <span className={`arrow ${isOpen ? 'up' : 'down'}`} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option: IFolder, index: number) => (
              <div className="dropdown-group" key={index}>
                <span>{option?.name}</span>
                {option?.dashboards?.map((dashboard: IDashboardBase, inde: number) => (
                  <div
                    key={inde}
                    className="dropdown-item"
                    onClick={() => handleOptionClick(dashboard)}
                  >
                    {dashboard.title}
                  </div>
                ))}
              </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
