import React from 'react'

function RestaurantCard({ restaurant, onClick }) {
  return (
    <button onClick={onClick} className="text-left group w-full">
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
        <div className="relative aspect-video overflow-hidden">
          <img src={restaurant.image_url || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe'} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black/40 px-2 py-1 rounded">{restaurant.cuisine}</div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{restaurant.name}</h3>
            <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">★ {restaurant.rating?.toFixed?.(1) || restaurant.rating}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{restaurant.delivery_time} mins • {restaurant.location || 'Nearby'}</p>
        </div>
      </div>
    </button>
  )
}

export default RestaurantCard
