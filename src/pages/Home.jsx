import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Hero from '../views/Hero';
import About from '../views/About';
import Contact from '../views/Contact';
import { useProducts } from '../hooks/useProducts';

const Home = () => {
    const { categories, loading } = useProducts();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <Hero />

            <main className="flex-grow z-0">
                <About />

                <div id="shop" className="scroll-mt-20 max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Shop by Category
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Explore our wide range of fresh products.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        Object.entries(categories).map(([categoryName, items]) => (
                            <div key={categoryName} className="mb-16">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 border-green-200">
                                    {categoryName}
                                </h3>
                                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                                    {items.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Contact />
            </main>

            <Footer />
        </div>
    );
};

export default Home;
