import { useRouter } from "next/router";

export function usePage() {
  const router = useRouter();

  const queryPage = router.query.page as string;
  const currentPage =
    queryPage && Number(queryPage) > 0 ? Number(queryPage) : 1;

  const setCurrentPage = (page: number) => {
    if (page < 1) return;
    router.push(`/dashboard?page=${page}`);
  };

  return { currentPage, setCurrentPage };
}
