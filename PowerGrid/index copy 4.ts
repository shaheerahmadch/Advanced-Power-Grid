import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./style.css";
import {
    ColDef,
    createGrid,
} from "ag-grid-community";
import * as _ from "lodash";

let selectedRows: any;
let _rows: any;
let gridApi: any;
let columnDefs: ColDef[] = [];
let hiddenColumns: string[];

export class PowerGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    constructor() {}

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        console.log("init");
        let _cont = container;
        hiddenColumns = context.parameters.HideColumns.raw ? context.parameters.HideColumns.raw.split(",") : [];
        _cont.style.height = `${context.mode.allocatedHeight}px`;
        _cont.style.width = `${context.mode.allocatedWidth}px`;
        _cont.classList.add("ag-theme-quartz");

        try {
            if (context.parameters.Items.raw) {
                _rows = JSON.parse(context.parameters.Items.raw);
            } else {
                _rows = [];
            }
        } catch (e) {
            _rows = [];
            console.log(e);
        }

        if (_rows.length > 0) {
            this.updateColumnDefs(_rows[0]);
            console.log("columnDefs", columnDefs);
        } else {
            console.error("rowData is empty. Cannot generate column definitions.");
        }

        const gridOptions: any = {
            columnDefs: columnDefs,
            defaultColDef: {
                flex: 1,
                minWidth: 100,
            },
            rowSelection: "multiple",
            onSelectionChanged: onSelectionChanged,
            sideBar: true,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [10, 25, 50, 75, 100],
            groupSelectsChildren: true,
            pivotPanelShow: "always",
            rowGroupPanelShow: 'always',
            checkboxSelection: true,
            statusBar: {
                statusPanels: [
                    { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                    { statusPanel: 'agTotalRowCountComponent', align: 'center' },
                    { statusPanel: 'agFilteredRowCountComponent' },
                    { statusPanel: 'agSelectedRowCountComponent' },
                    { statusPanel: 'agAggregationComponent' },
                ]
            },
        };

        gridApi = createGrid(_cont, gridOptions);
        gridApi!.setGridOption("rowData", _rows);

        function onSelectionChanged() {
            selectedRows = gridApi!.getSelectedRows();
            console.log("selected", selectedRows);
            notifyOutputChanged();
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const searchText = context.parameters.SearchText.raw || "";
        
        hiddenColumns = context.parameters.HideColumns.raw ? context.parameters.HideColumns.raw.split(",") : [];
        let filteredRows = JSON.parse(context.parameters.Items.raw ? context.parameters.Items.raw : "");

        if (searchText) {
            filteredRows = this.filterRowsByText(filteredRows, searchText);
        }
        console.log("Is Equal:", _.isEqual(filteredRows, _rows))
        if (!_.isEqual(filteredRows, _rows)) {
            _rows = filteredRows;
            gridApi!.setGridOption("rowData", _rows);
            selectedRows = [];
            if (filteredRows.length > 0) {
                this.updateColumnDefs(filteredRows[0]);
                console.log("columnDefs", columnDefs);
                gridApi!.setGridOption("columnDefs", columnDefs);
            } else {
                console.error("rowData is empty. Cannot generate column definitions.");
            }
        }
    }

    public getOutputs(): IOutputs {
        return {
            SelectedItems: JSON.stringify(selectedRows),
            SelectedItemsCount: selectedRows.length,
            ItemsCount: _rows.length + "",
            SelectedItemJSON: JSON.stringify(selectedRows[0])
        };
    }

    public destroy(): void {}

    private filterRowsByText(rows: any[], searchText: string): any[] {
        const lowerSearchText = searchText.toLowerCase();
    
        return rows.filter(row => {
            return Object.values(row).some(value => {
                if (value !== null && value !== undefined) {
                    return value.toString().toLowerCase().includes(lowerSearchText);
                }
                return false;
            });
        });
    }

    // private updateColumnDefs(row: any): void {
    //     columnDefs = Object.keys(row).map((key, index) => {
    //         const colDef: ColDef = { field: key, minWidth: 150 };
    //         if (index === 0 && !hiddenColumns.includes(key)) {
    //             colDef.headerCheckboxSelection = true;
    //             colDef.checkboxSelection = true;
    //         } else if(index === 1){
    //             colDef.headerCheckboxSelection = true;
    //             colDef.checkboxSelection = true;
    //         }
    //         return colDef;
    //     }).filter(colDef => colDef.field !== undefined && !hiddenColumns.includes(colDef.field));
    // }
    private updateColumnDefs(row: any): void {
        const columnKeys = Object.keys(row);
        const hiddenColumnsSet = new Set(hiddenColumns);
        
        columnDefs = columnKeys.map((key, index) => {
            const colDef: ColDef = { field: key, minWidth: 150 };
            if (!hiddenColumnsSet.has(key)) {
                if ((index === 0) || (index === 1 && hiddenColumnsSet.has(columnKeys[0]))) {
                    colDef.headerCheckboxSelection = true;
                    colDef.checkboxSelection = true;
                }
            }
            return colDef;
        }).filter(colDef => colDef.field !== undefined && !hiddenColumnsSet.has(colDef.field as string));
    }
}
