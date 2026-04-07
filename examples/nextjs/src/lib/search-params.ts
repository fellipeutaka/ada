import { dataTableParsers } from "@ada/ui/components/data-table/lib/nuqs-parsers";
import { createSearchParamsCache } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache(dataTableParsers);
