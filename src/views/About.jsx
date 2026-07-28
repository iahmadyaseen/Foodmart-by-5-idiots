import React from 'react';

const About = () => {
    return (
        <section id="about" className="scroll-mt-20 py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl uppercase mb-4">About Us</h2>
                    <p className="mt-2 text-xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                        Bringing Freshness to Your Doorstep
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        Food Mart was established with a simple mission: to make high-quality, fresh produce accessible to everyone. We work directly with local farmers to ensure you get the best products at the best prices.
                    </p>
                </div>

                <div className="mt-10">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Quality Guaranteed</h3>
                            <p className="mt-2 text-base text-gray-500 text-center">
                                We hand-pick every item to ensure it meets our strict quality standards.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Fast Delivery</h3>
                            <p className="mt-2 text-base text-gray-500 text-center">
                                Order today and get your groceries delivered within 24 hours.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Eco-Friendly</h3>
                            <p className="mt-2 text-base text-gray-500 text-center">
                                We use sustainable packaging and support eco-friendly farming practices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
