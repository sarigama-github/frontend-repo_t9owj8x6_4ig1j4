import React from 'react'

function Menu({ items, onAdd }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item._id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
          <img src={item.image_url || 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092'} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800">{item.name}</h4>
              <span className="font-medium">₹{item.price}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            <div className="text-xs text-slate-500 mt-0.5">{item.veg ? 'Veg' : 'Non-Veg'}{item.category ? ` • ${item.category}` : ''}</div>
          </div>
          <button onClick={() => onAdd(item)} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition">Add</button>
        </div>
      ))}
    </div>
  )
}

export default Menu
