import { usePage } from "../../../lib/hooks/use-page";

type Props = {
  totalPages: number;
};

const Pagination = ({ totalPages }: Props) => {
  const { currentPage, setCurrentPage } = usePage();

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#D7CCC8] bg-white text-sm font-medium ${
            currentPage === 1
              ? "text-[#BDBDBD] cursor-not-allowed"
              : "text-[#5D4037] hover:bg-[#EFEBE9] cursor-pointer"
          } transition-colors`}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              page === currentPage
                ? "z-10 bg-[#EFEBE9] border-[#8D6E63] text-[#5D4037]"
                : "bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#EFEBE9] cursor-pointer"
            } text-sm font-medium transition-colors`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#D7CCC8] bg-white text-sm font-medium ${
            currentPage === totalPages
              ? "text-[#BDBDBD] cursor-not-allowed"
              : "text-[#5D4037] hover:bg-[#EFEBE9] cursor-pointer"
          } transition-colors`}
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
