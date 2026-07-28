import React from 'react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="h-48 overflow-hidden bg-gray-200">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                    {product.category}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-gray-900">{product.price}</span>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition-colors duration-200 shadow-sm">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
