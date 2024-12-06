import { XIcon, } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    filterableColumns?: {
        id: string;
        title: string;
        options: {
            label: string;
            value: string;
        }[];
    }[];
    searchKey?: string;
}

export function DataTableToolbar<TData>({
    table,
    filterableColumns = [],
    searchKey,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {searchKey && (
                    <Input
                        placeholder="Search..."
                        value={
                            (table
                                .getColumn(searchKey)
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn(searchKey)
                                ?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}

                {filterableColumns.map(
                    ({ id, title, options }) =>
                        table.getColumn(id) && (
                            <DataTableFacetedFilter
                                key={id}
                                column={table.getColumn(id)}
                                title={title}
                                options={options}
                            />
                        )
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <XIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
