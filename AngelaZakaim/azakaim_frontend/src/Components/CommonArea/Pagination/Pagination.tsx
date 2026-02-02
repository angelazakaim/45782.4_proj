import type { JSX } from "react";
import "./Pagination.css";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    onPageChange: (newPage: number) => void;
}

function Pagination(props: PaginationProps): JSX.Element {
    return (
        <div className="Pagination">
            <button 
                disabled={!props.hasPrev} 
                onClick={() => props.onPageChange(props.currentPage - 1)}
            >
                ← Previous
            </button>
            
            <span className="page-info">
                Page <b>{props.currentPage}</b> of <b>{props.totalPages}</b>
            </span>
            
            <button 
                disabled={!props.hasNext} 
                onClick={() => props.onPageChange(props.currentPage + 1)}
            >
                Next →
            </button>
        </div>
    );
}

export default Pagination;