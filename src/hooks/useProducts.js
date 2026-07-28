import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = () => {
            const allProducts = productService.getAllProducts();
            const categorizedProducts = productService.getCategoriesWithProducts();
            setProducts(allProducts);
            setCategories(categorizedProducts);
            setLoading(false);
        };

        fetchProducts();
    }, []);

    return { products, categories, loading };
};
