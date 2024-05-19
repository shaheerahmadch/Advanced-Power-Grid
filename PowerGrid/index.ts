import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./style.css";
import {
    ColDef,
    ColGroupDef,
    GridApi,
    GridOptions,
    RowContainerCtrl,
    createGrid,
} from "ag-grid-community";
import { compare } from "semver";

let selectedRows: any;
let _rows: [];
let gridApi: any;
export class PowerGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    /**
     * Empty constructor.
     */
    constructor() {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        console.log("innit");
        let _cont = container;
        _cont.style.height = `${context.mode.allocatedHeight - 0}px`;
        _cont.style.width = `${context.mode.allocatedWidth - 0}px`;
        _cont.classList.add("ag-theme-quartz");
        try {
            if (context.parameters.Items.raw) {
                _rows = JSON.parse(context.parameters.Items.raw);
            }
            else {
                _rows = [];
            }
        } catch (e) {
            _rows = [];
            console.log(e)
        }
        // let agGrid = document.createElement("div");
        // agGrid.id = "myGrid";
        // agGrid.style.height = context.
        // agGrid.style.width = _cont.style.width;
        // _cont.appendChild(agGrid);


        interface IRow {
            make: string;
            model: string;
            price: number;
            electric: boolean;
        }

        // Grid API: Access to Grid API methods

        const gridOptions: any = {
            columnDefs: [
                { field: "athlete", minWidth: 150, rowGroup: true, headerCheckboxSelection: true, checkboxSelection: true },
                { field: "age", maxWidth: 90, rowGroup: true },
                { field: "country", minWidth: 150, rowGroup: true },
                { field: "year", maxWidth: 90, rowGroup: true },
                { field: "date", minWidth: 150, rowGroup: true },
                { field: "sport", minWidth: 150, rowGroup: true },
                { field: "gold" },
                { field: "silver" },
                { field: "bronze" },
                { field: "total" },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 100,
            },
            rowSelection: "multiple",
            onSelectionChanged: onSelectionChanged,
            // sideBar: {
            //     toolPanels: ['columns', 'filters']
            // },
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [10, 25, 50, 100],
            // suppressRowClickSelection: true,
            groupSelectsChildren: true,
            pivotPanelShow: "always",
            rowGroupPanelShow: 'always',
            checkboxSelection: true
        };



        // setup the grid after the page has finished loading
        gridApi = createGrid(_cont, gridOptions);

        gridApi!.setGridOption("rowData", _rows)
        // fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
        //     .then((response) => response.json())
        //     .then((data: any) => gridApi!.setGridOption("rowData", data));

        function onSelectionChanged() {
            selectedRows = gridApi!.getSelectedRows();
            console.log("selected",selectedRows)
            notifyOutputChanged();
        }
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
        console.log("update",context.updatedProperties)
        try {
            if (context.parameters.Items.raw) {
                _rows = JSON.parse(context.parameters.Items.raw);
            }
            else {
                _rows = [];
            }
        } catch (e) {
            _rows = [];
            console.log(e)
        }
       // gridApi!.setGridOption("rowData", _rows)
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            SelectedItems: JSON.stringify(selectedRows),
            SelectedItemsCount: selectedRows.length,
            ItemsCount: _rows.length + ""
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
