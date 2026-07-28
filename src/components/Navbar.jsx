import React, { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <a href="#home" className="ml-2 text-xl font-bold text-green-600">FOOD MART</a>
                        </div>
                    </div>
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        <a href="#home" className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                        <a href="#about" className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                        <a href="#shop" className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Shop</a>
                        <a href="#contact" className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
                        <button className="bg-green-100 text-green-600 hover:bg-green-200 p-2 rounded-full relative transition-colors">
                            <span className="sr-only">Cart</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                    </div>
                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state. */}
            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1 px-2">
                        <a href="#home" className="bg-green-50 border-l-4 border-green-500 text-green-700 block pl-3 pr-4 py-2 text-base font-medium">Home</a>
                        <a href="#shop" className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium">Shop</a>
                        <a href="#about" className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium">About</a>
                        <a href="#contact" className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium">Contact</a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
