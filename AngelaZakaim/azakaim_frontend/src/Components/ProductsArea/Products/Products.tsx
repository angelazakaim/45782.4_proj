// Products.tsx - Final Clean Version
import React, { useEffect, useState } from "react";
import productService from "../../../Services/ProductsService";
import { type ProductsResponse, type SearchType } from "../../../Models/Product";
import { ProductCard } from "../ProductCard/ProductCard";
import Pagination from "../../CommonArea/Pagination/Pagination";
import "./Products.css";
import { NavLink } from "react-router-dom";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";

export const Products: React.FC = () => {
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);

    // Search state
    const [searchType, setSearchType] = useState<SearchType>('name');
    const [searchValue, setSearchValue] = useState<string>('');
    const [activeSearch, setActiveSearch] = useState<string>('');

    const isAdmin = useHasRole([UserRole.ADMIN]);
    const isManager = useHasRole([UserRole.MANAGER]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                let response: ProductsResponse;

                if (activeSearch) {
                    // Search mode
                    response = await productService.searchProducts(
                        searchType,
                        searchType === 'id' || searchType === 'category_id'
                            ? parseInt(activeSearch)
                            : activeSearch,
                        page,
                        20
                    );
                } else {
                    // Browse mode
                    response = await productService.getAllProducts(page, 20);
                }

                setData(response);
            } catch (err: any) {
                alert(err.message);
                setData({
                    products: [],
                    total: 0,
                    pages: 0,
                    current_page: page,
                    per_page: 20,
                    has_next: false,
                    has_prev: false
                });
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [page, activeSearch, searchType]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(searchValue);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchValue('');
        setActiveSearch('');
        setPage(1);
    };

    if (loading && !data) return <div className="loading">Loading products...</div>;

    return (
        <div className="ProductsContainer">
            <header>

                <h2>Products Management</h2>
                {(isAdmin || isManager) && <><div className="header-actions">
                    <NavLink to="/products/add" className="btn-add">
                        + Add Product
                    </NavLink>
                </div></>}




                {/* Search Form */}
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-controls">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as SearchType)}
                            className="search-type-selector"
                        >
                            <option value="name">Search by Name/Description</option>
                            <option value="id">Search by ID</option>
                            <option value="sku">Search by SKU</option>
                            <option value="slug">Search by Slug</option>
                            <option value="barcode">Search by Barcode</option>
                            <option value="category_id">Search by Category ID</option>
                        </select>

                        <input
                            type={searchType === 'id' || searchType === 'category_id' ? 'number' : 'text'}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder={`Enter ${searchType}...`}
                            className="search-input"
                        />

                        <button type="submit" className="search-button">
                            Search
                        </button>

                        {activeSearch && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="clear-button"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* Search status */}
                {activeSearch && (
                    <p className="search-status">
                        Searching for <strong>{searchType}</strong>: "{activeSearch}"
                        - Found {data?.total || 0} result(s)
                    </p>
                )}

                <p>Total Items: {data?.total}</p>
            </header>

            {data?.products.length === 0 ? (
                <div className="no-results">
                    <p>No products found.</p>
                    {activeSearch && (
                        <button onClick={handleClearSearch}>View all products</button>
                    )}
                </div>
            ) : (
                <>
                    <div className="ProductGrid">
                        {data?.products.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>

                    {data && data.pages > 1 && (
                        <Pagination
                            currentPage={data.current_page}
                            totalPages={data.pages}
                            hasNext={data.has_next}
                            hasPrev={data.has_prev}
                            onPageChange={(targetPage) => setPage(targetPage)}
                        />
                    )}
                </>
            )}
        </div>
    );
};
