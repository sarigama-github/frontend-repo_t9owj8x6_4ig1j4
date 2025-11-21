import React from 'react'

function Header({ cartCount, onViewCart }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" className="w-8 h-8" alt="logo" />
          <div>
            <h1 className="text-xl font-bold">QuickBite</h1>
            <p className="text-xs text-slate-500 -mt-1">Swiggy-style food ordering demo</p>
          </div>
        </div>
        <button onClick={onViewCart} className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition">
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">{cartCount}</span>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
