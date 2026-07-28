import { products } from '../data/products';

export const productService = {
    /**
     * Get all products
     */
    getAllProducts: () => {
        return products;
    },

    /**
     * Get products grouped by category
     */
    getCategoriesWithProducts: () => {
        return {
            "Vegetables": products.filter(p => p.category === "Vegetables"),
            "Fruits": products.filter(p => p.category === "Fruits"),
            "Meat": products.filter(p => p.category === "Meat"),
            "Bakery & Eggs": products.filter(p => p.category === "Bakery & Eggs"),
        };
    }
};
