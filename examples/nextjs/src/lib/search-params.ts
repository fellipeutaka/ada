import { dataTableParsers } from "@ada/ui/components/data-table/integrations/nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache(dataTableParsers);
