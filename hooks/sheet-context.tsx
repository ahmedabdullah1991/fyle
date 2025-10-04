import { useState, useContext, createContext, ReactNode } from 'react'

interface SheetContextType {
  openSheet: () => void
  closeSheet: () => void
  setIsOpen: (open: boolean) => void
  isOpen: boolean
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openSheet = () => setIsOpen(true)
  const closeSheet = () => setIsOpen(false)

  return (
    <SheetContext.Provider value={{ openSheet, closeSheet, isOpen, setIsOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

export const useSheet = (): SheetContextType => {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider')
  }

  return context
}
