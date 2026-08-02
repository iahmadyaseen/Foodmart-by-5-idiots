import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-2xl font-bold text-green-500">FOOD MART</h2>
                        <p className="mt-2 text-gray-400 text-sm">Freshness you can taste, quality you can trust.</p>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Facebook</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Instagram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06h.63zm1.418-1.898c-2.73 0-3.053.011-4.088.058-1.069.049-1.954.216-2.787.531-1.319.497-2.316 1.493-2.813 2.813-.314.833-.482 1.718-.53 2.787-.048 1.036-.059 1.359-.059 4.088v.63c0 2.73.011 3.053.059 4.088.048 1.069.215 1.954.53 2.787.496 1.32 1.494 2.316 2.813 2.813.832.315 1.718.482 2.787.53 1.035.049 1.358.059 4.088.059h.63c2.73 0 3.053-.01 4.088-.059 1.068-.049 1.954-.216 2.787-.53 1.319-.497 2.316-1.494 2.813-2.813.315-.833.483-1.718.531-2.787.048-1.035.058-1.359.058-4.088v-.63c0-2.73-.01-3.053-.058-4.088-.049-1.069-.216-1.954-.531-2.787a7.653 7.653 0 00-2.813-2.813c-.833-.315-1.719-.482-2.787-.531-1.035-.048-1.359-.058-4.088-.058h-.63zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 1.838a4.324 4.324 0 110 8.648 4.324 4.324 0 010-8.648zm6.406-1.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
                    Food Mart - Only Frontend Project. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
