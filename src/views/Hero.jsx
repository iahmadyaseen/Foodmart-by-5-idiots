import React from 'react';

const Hero = () => {
    return (
        <div id="home" className="scroll-mt-20 bg-green-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="z-10 bg-green-50 lg:max-w-2xl lg:w-full">
                        <div className="sm:text-center lg:text-left">
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                <span className="block xl:inline">Fresh groceries</span>{' '}
                                <span className="block text-green-600 xl:inline">delivered to you</span>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                Shop the freshest fruits, vegetables, and daily essentials from the comfort of your home. Quality guaranteed.
                            </p>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                <div className="rounded-md shadow">
                                    <a
                                        href="#shop"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                                    >
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            className="w-full h-64 sm:h-72 md:h-96 object-cover rounded-lg shadow-xl"
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1567&q=80"
                            alt="Fresh vegetables in a market"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
