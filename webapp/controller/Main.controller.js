sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',
    'sap/m/MessageToast',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, DateFormat, Spreadsheet, exportLibrary, MessageToast) {
        "use strict";
        const EdmType = exportLibrary.EdmType;
        return Controller.extend("zqa33.controller.Main", {
            onInit: function () {
                const oSmartTableFilter = this.getView().byId("smartFilterBar");
                const oPage = this.getView().byId("page");
                const that = this
                oSmartTableFilter.attachSearch(function () {
                    const oDialog = that.getView().byId("BusyDialog");
                    oDialog.open();
                    // Get the values
                    const sPrueflos = oSmartTableFilter.getFilterData().LotDeControle;
                    const sMatnr = oSmartTableFilter.getFilterData().Article;
                    const sWerk = oSmartTableFilter.getFilterData().Division;
                    const sLifnr = oSmartTableFilter.getFilterData().Fournisseur;
                    const sMef = oSmartTableFilter.getFilterData().Mef;
                    const sPaendterm = oSmartTableFilter.getFilterData().FinControle;
                    const sEnstehdat = oSmartTableFilter.getFilterData().DateLclCreationLot;

                    // debugger;
                    let Filters = new Array();
                    // Create Filters
                    sPrueflos && Filters.push(
                        that._onGetFilters(sPrueflos, "LotDeControle")
                    )
                    sMatnr && Filters.push(
                        that._onGetFilters(sMatnr, "Article")
                    )
                    sWerk && Filters.push(
                        that._onGetFilters(sWerk, "Division")
                    )
                    sLifnr && Filters.push(
                        that._onGetFilters(sLifnr, "Fournisseur")
                    )
                    sPaendterm && Filters.push(
                        that._onGetFiltersDate(sPaendterm, "FinControle")
                    )
                    sEnstehdat && Filters.push(
                        that._onGetFiltersDate(sEnstehdat, "DateLclCreationLot")
                    )
                    // debugger
                    const oModel = that.getOwnerComponent().getModel()
                    // debugger;
                    oModel.read('/ZCDS_CN_QALS', {
                        filters: Filters,
                        success: function (oData) {
                            console.log('ODATA RES');
                            console.log(oData.results.length);

                            // Sorting
                            oData.results.sort((a, b) => {
                                const LotDeControle1 = a.LotDeControle;
                                const LotDeControle2 = b.LotDeControle;

                                if (LotDeControle1 < LotDeControle2) {
                                    return -1;
                                } else if (LotDeControle1 > LotDeControle2) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            if (sMef == '1') {
                                if (sap.ui.getCore().byId("idMef2")) {
                                    sap.ui.getCore().byId("idMef2").destroy()
                                    sap.ui.getCore().byId("Title2").destroy()
                                    sap.ui.getCore().byId("Toolbar2").destroy()
                                    sap.ui.getCore().byId("Vbox2").destroy()
                                }
                                if (sap.ui.getCore().byId("idMef1")) {
                                    sap.ui.getCore().byId("idMef1").destroy()
                                    sap.ui.getCore().byId("Title1").destroy()
                                    sap.ui.getCore().byId("Toolbar1").destroy()
                                    sap.ui.getCore().byId("Vbox1").destroy()
                                }
                                oPage.addContent(that._onGetMEF11(oData.results))
                            } else if (sMef == '2') {
                                if (sap.ui.getCore().byId("idMef1")) {
                                    sap.ui.getCore().byId("idMef1").destroy()
                                    sap.ui.getCore().byId("Title1").destroy()
                                    sap.ui.getCore().byId("Toolbar1").destroy()
                                    sap.ui.getCore().byId("Vbox1").destroy()
                                }
                                if (sap.ui.getCore().byId("idMef2")) {
                                    sap.ui.getCore().byId("idMef2").destroy()
                                    sap.ui.getCore().byId("Title2").destroy()
                                    sap.ui.getCore().byId("Toolbar2").destroy()
                                    sap.ui.getCore().byId("Vbox2").destroy()
                                }
                                oPage.addContent(that._onGetMEF22(oData.results))
                            } else {
                                alert('Not implemented, use a value Help in the MEF Field !')
                            }
                            oDialog.close()
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    })
                }, { passive: true });
            },
            _onGetFilters: function (sValueSFB, fieldName) {
                if (typeof sValueSFB === 'number') {
                    sValueSFB = JSON.stringify(sValueSFB)
                }
                // console.log(fieldName);

                if (typeof sValueSFB === 'object') {
                    if (sValueSFB.low.split('-').length == 2) {
                        const oFilterBT = new Filter(fieldName, FilterOperator.BT, sValueSFB.low.split('-')[0], sValueSFB.low.split('-')[1]);
                        return oFilterBT;
                    }

                    if (sValueSFB.low.split('-').length == 1) {
                        const oFilterEq = new Filter(fieldName, FilterOperator.EQ, sValueSFB.low.split('-')[0]);
                        return oFilterEq;
                    }
                } else {
                    const oFilterEq = new Filter(fieldName, FilterOperator.EQ, sValueSFB);
                    return oFilterEq;
                }
            },
            _onGetFiltersDate: function (sValueDate, fieldName) {
                // console.log(sValueDate);
                return new Filter(fieldName, FilterOperator.BT, sValueDate.low, sValueDate.high)
            },
            _onGetMEF11: function (filteredData) {
                const that = this
                // Create the OverflowToolbar
                const oToolbar = new sap.m.OverflowToolbar({
                    id: 'Toolbar1',
                    design: "Transparent",
                    height: "3rem"
                });
                const numberOfRecords = filteredData.length
                oToolbar.addContent(new sap.m.Title({
                    id: 'Title1',
                    text: "{i18n>titleMEF1}" + `  - (${numberOfRecords} ${this.getOwnerComponent().getModel("i18n").getResourceBundle().getText('Etr')})`
                }));
                oToolbar.addContent(new sap.m.ToolbarSpacer({
                    id: '_IDGenToolbarSpacer1'
                }));

                oToolbar.addContent(new sap.m.Button({
                    id: '_IDGenButton2',
                    icon: "sap-icon://refresh",
                    press: function () {
                        that.onClearAllFilters('idMef1')
                    }
                }));

                oToolbar.addContent(new sap.m.Button({
                    id: 'ButtonMef',
                    type: "Accept",
                    icon: "sap-icon://excel-attachment",
                    press: function () {
                        that._onExtractData('idMef1')
                    }
                }));


                // Create the Table
                const oTable = new sap.ui.table.Table({
                    id: "idMef1",
                    visibleRowCount: 6,
                    selectionMode: sap.ui.table.SelectionMode.MultiToggle,
                    alternateRowColors: true,
                    fixedColumnCount: 11,
                    rows: {
                        path: "/MEF2",
                        template: new sap.ui.table.Row({
                            cells: [
                                new sap.m.Text({
                                    text: "{LotDeControle}"
                                }),
                                new sap.m.Text({
                                    text: "{LotFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{Lot}"
                                }),
                                new sap.m.Text({
                                    text: "{NomFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{Description}"
                                }),
                                new sap.m.Text({
                                    text: "{QteLotControle} {UniteQteBase}"
                                }),
                                new sap.m.Text({
                                    text: "{DateDocument}"
                                }),
                                new sap.m.Text({
                                    text: "{NumArticleFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{DelaiRecepInspection}"
                                }),
                                new sap.m.Text({
                                    text: "{DelaiRecepCoA}"
                                }),
                                new sap.m.Text({
                                    text: "{DelaiRecepDecition}"
                                }),
                                new sap.m.Text({
                                    text: "{DelaiAvisInitie}"
                                })
                            ]
                        })
                    },
                    columns: [
                        new sap.ui.table.Column({
                            label: "{i18n>LotDeControle}",
                            template: new sap.m.Text().bindProperty("text", "LotDeControle"),
                            sortProperty: 'LotDeControle',
                            filterProperty: 'LotDeControle',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>LotFournisseur}",
                            template: new sap.m.Text().bindProperty("text", "LotFournisseur"),
                            sortProperty: 'LotFournisseur',
                            filterProperty: 'LotFournisseur',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Lot}",
                            template: new sap.m.Text().bindProperty("text", "Lot"),
                            sortProperty: 'Lot',
                            filterProperty: 'Lot',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>NomFournisseur}",
                            template: new sap.m.Text().bindProperty("text", "NomFournisseur"),
                            sortProperty: 'NomFournisseur',
                            filterProperty: 'NomFournisseur',
                            width: '25rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Description}",
                            template: new sap.m.Text().bindProperty("text", "Description"),
                            sortProperty: 'Description',
                            filterProperty: 'Description',
                            width: '25rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Quantite}",
                            template: new sap.m.Text().bindProperty("text", {
                                parts: ["QteLotControle", "UniteQteBase"],
                                formatter: function (QteLotControle, UniteQteBase) {
                                    return QteLotControle + " " + UniteQteBase;
                                }
                            }),
                            sortProperty: 'QteLotControle',
                            filterProperty: 'QteLotControle',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DateDocument}",
                            template: new sap.m.Text().bindProperty("text", "DateDocument"),
                            sortProperty: 'DateDocument',
                            filterProperty: 'DateDocument',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>NumArticleFournisseur}",
                            template: new sap.m.Text().bindProperty("text", "NumArticleFournisseur"),
                            sortProperty: 'NumArticleFournisseur',
                            filterProperty: 'NumArticleFournisseur',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DelaiRecepInspection}",
                            template: new sap.m.Text().bindProperty("text", "DelaiRecepInspection"),
                            sortProperty: 'DelaiRecepInspection',
                            filterProperty: 'DelaiRecepInspection',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DelaiRecepCoA}",
                            template: new sap.m.Text().bindProperty("text", "DelaiRecepCoA"),
                            sortProperty: 'DelaiRecepCoA',
                            filterProperty: 'DelaiRecepCoA',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DelaiRecepDecition}",
                            template: new sap.m.Text().bindProperty("text", "DelaiRecepDecition"),
                            sortProperty: 'DelaiRecepDecition',
                            filterProperty: 'DelaiRecepDecition',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DelaiAvisInitie}",
                            template: new sap.m.Text().bindProperty("text", "DelaiAvisInitie"),
                            sortProperty: 'DelaiAvisInitie',
                            filterProperty: 'DelaiAvisInitie',
                            width: '11rem'
                        })

                    ]
                });

                const oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({ 'MEF2': filteredData });

                // Binding
                oTable.setModel(oModel);

                // Create a Vertical Layout (VBox) to stack the OverflowToolbar and Table
                const oVBox = new sap.m.VBox({
                    id: 'Vbox1',
                    items: [oToolbar, oTable]
                });

                return oVBox;
            },
            _onGetMEF22: function (filteredData) {
                const that = this
                // Create the OverflowToolbar
                const oToolbar = new sap.m.OverflowToolbar({
                    id: 'Toolbar2',
                    design: "Transparent",
                    height: "3rem"
                });

                const numberOfRecords = filteredData.length
                oToolbar.addContent(new sap.m.Title({
                    id: 'Title2',
                    text: "{i18n>titleMEF2}" + `  - (${numberOfRecords} ${this.getOwnerComponent().getModel("i18n").getResourceBundle().getText('Etr')})`
                }));
                oToolbar.addContent(new sap.m.ToolbarSpacer({
                    id: '_IDGenToolbarSpacer1'
                }));

                oToolbar.addContent(new sap.m.Button({
                    id: '_IDGenButton2',
                    icon: "sap-icon://refresh",
                    press: function () {
                        that.onClearAllFilters('idMef2')
                    }
                }));

                oToolbar.addContent(new sap.m.Button({
                    id: 'ButtonMef',
                    type: "Accept",
                    icon: "sap-icon://excel-attachment",
                    press: function () {
                        that._onExtractData('idMef2')
                    }
                }));

                // Create Table
                const oTable = new sap.ui.table.Table({
                    id: "idMef2",
                    visibleRowCount: 6,
                    selectionMode: sap.ui.table.SelectionMode.MultiToggle,
                    rows: {
                        path: "/MEF1",
                        template: new sap.ui.table.Row({
                            cells: [
                                new sap.m.Text({
                                    text: "{LotDeControle}"
                                }),
                                new sap.m.Text({
                                    text: "{LotFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{Lot}"
                                }),
                                new sap.m.Text({
                                    text: "{Article}"
                                }),
                                new sap.m.Text({
                                    text: "{Description}"
                                }),
                                new sap.m.Text({
                                    text: "{NumArticleFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{Division}"
                                }),
                                new sap.m.Text({
                                    text: "{QteLotControle} {UniteQteBase}"
                                }),
                                new sap.m.Text({
                                    text: "{DateDocument}"
                                }),
                                new sap.m.Text({
                                    text: "{DecisionUtiOrig}"
                                }),
                                new sap.m.Text({
                                    text: "{DecisionUtiModif}"
                                }),
                                new sap.m.Text({
                                    text: "{DateDecisionOrig}"
                                }),
                                new sap.m.Text({
                                    text: "{DateUtiModifiee}"
                                }),
                                new sap.m.Text({
                                    text: "{Utilisateur}"
                                }),
                                new sap.m.Text({
                                    text: "{StatutStock}"
                                }),
                                new sap.m.Text({
                                    text: "{StatutRecepCoA}"
                                })
                            ]
                        })
                    },
                    columns: [
                        new sap.ui.table.Column({
                            label: "{i18n>LotDeControle}",
                            template: new sap.m.Text().bindProperty("text", "LotDeControle"),
                            sortProperty: 'LotDeControle',
                            filterProperty: 'LotDeControle',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>LotFournisseur}",
                            template: new sap.m.Text().bindProperty("text", "LotFournisseur"),
                            sortProperty: 'LotFournisseur',
                            filterProperty: 'LotFournisseur',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Lot}",
                            template: new sap.m.Text().bindProperty("text", "Lot"),
                            sortProperty: 'Lot',
                            filterProperty: 'Lot',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Article}",
                            template: new sap.m.Text().bindProperty("text", "Article"),
                            sortProperty: 'Article',
                            filterProperty: 'Article',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Description}",
                            template: new sap.m.Text().bindProperty("text", "Description"),
                            sortProperty: 'Description',
                            filterProperty: 'Description',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>NumArticleFournisseur}",
                            template: new sap.m.Text().bindProperty("text", "NumArticleFournisseur"),
                            sortProperty: 'NumArticleFournisseur',
                            filterProperty: 'NumArticleFournisseur',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Division}",
                            template: new sap.m.Text().bindProperty("text", "Division"),
                            sortProperty: 'Division',
                            filterProperty: 'Division',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Quantite}",
                            template: new sap.m.Text().bindProperty("text", {
                                parts: ["QteLotControle", "UniteQteBase"],
                                formatter: function (QteLotControle, UniteQteBase) {
                                    return QteLotControle + " " + UniteQteBase;
                                }
                            }),
                            sortProperty: 'QteLotControle',
                            filterProperty: 'QteLotControle',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DateDocument}",
                            template: new sap.m.Text().bindProperty("text", "DateDocument"),
                            sortProperty: 'DateDocument',
                            filterProperty: 'DateDocument',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DecisionUtiOrig}",
                            template: new sap.m.Text().bindProperty("text", "DecisionUtiOrig"),
                            sortProperty: 'DecisionUtiOrig',
                            filterProperty: 'DecisionUtiOrig',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DecisionUtiModif}",
                            template: new sap.m.Text().bindProperty("text", "DecisionUtiModif"),
                            sortProperty: 'DecisionUtiModif',
                            filterProperty: 'DecisionUtiModif',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DateDecisionOrig}",
                            template: new sap.m.Text().bindProperty("text", "DateDecisionOrig"),
                            sortProperty: 'DateDecisionOrig',
                            filterProperty: 'DateDecisionOrig',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DateUtiModifiee}",
                            template: new sap.m.Text().bindProperty("text", "DateUtiModifiee"),
                            sortProperty: 'DateUtiModifiee',
                            filterProperty: 'DateUtiModifiee',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Utilisateur}",
                            template: new sap.m.Text().bindProperty("text", "Utilisateur"),
                            sortProperty: 'Utilisateur',
                            filterProperty: 'Utilisateur',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>StatutStock}",
                            template: new sap.m.Text().bindProperty("text", "StatutStock"),
                            sortProperty: 'StatutStock',
                            filterProperty: 'StatutStock',
                            width: '11rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>StatutRecepCoA}",
                            template: new sap.m.Text().bindProperty("text", "StatutRecepCoA"),
                            sortProperty: 'StatutRecepCoA',
                            filterProperty: 'StatutRecepCoA',
                            width: '11rem'
                        })

                    ]
                });

                const oModel = new sap.ui.model.json.JSONModel();
                // ConvertDate
                const oDateFormat = DateFormat.getInstance({
                    pattern: "dd-MM-yyyy"
                });

                const formattedData = filteredData.map(item => {
                    // console.log(item);
                    if (item.DateDecisionOrig) {
                        // debugger
                        // console.log(item.DateDecisionOrig);
                        item.DateDecisionOrig = oDateFormat.format(item.DateDecisionOrig);
                    }
                    if (item.DateDocument) {
                        // console.log(item.DateDocument);
                        item.DateDocument = oDateFormat.format(item.DateDocument);
                    }
                    // debugger
                    if (item.DateUtiModifiee) {
                        item.DateUtiModifiee = oDateFormat.format(item.DateUtiModifiee);
                    }
                    return item;
                });

                oModel.setData({ 'MEF1': formattedData });

                // Binding
                oTable.setModel(oModel);

                // Create a Vertical Layout (VBox) to stack the OverflowToolbar and Table
                const oVBox = new sap.m.VBox({
                    id: 'Vbox2',
                    items: [oToolbar, oTable]
                });

                return oVBox;
            },
            _onExtractData: function (oIdTable) {
                const oTable = sap.ui.getCore().byId(oIdTable)
                const oBinding = oTable.getBinding("rows")
                let aCols = [];
                oTable.getColumns().forEach(function (oColumn) {
                    const sLabel = oColumn.getLabel().getText();
                    const sPropertyName = oColumn.getTemplate().getBindingPath("text");
                    const sWidth = oColumn.getWidth();
                    // Assuming you have a formatter function for some columns
                    // const oFormatter = oColumn.getTemplate().getBinding("text").getFormatter();
                    const oCol = {
                        label: sLabel,
                        property: sPropertyName,
                        type: EdmType.String, // Adjust this based on your data type
                        template: sPropertyName, // Use formatter if available
                        width: sWidth
                    };

                    aCols.push(oCol);
                });
                console.log(aCols);

                let oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oBinding,
                    fileName: `Rapport-Suivi_${this._formatDate(new Date())}.xlsx`,
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                let oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });

            },
            _formatDate: function (oDate) {
                if (!oDate) {
                    return "";
                }

                const oDateFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
                return oDateFormat.format(new Date(oDate));
            },
            onClearAllFilters: function (id, that) {
                // Get the table
                const oTable = sap.ui.getCore().byId(id);
                // debugger
                const oListBinding = oTable.getBinding();
                // Clear selection
                oTable.clearSelection();

                if (oListBinding) {
                    oListBinding.aSorters = null;
                    oListBinding.aFilters = null;
                }

                for (let iColCounter = 0; iColCounter < oTable.getColumns().length; iColCounter++) {
                    oTable.getColumns()[iColCounter].setSorted(false);
                    oTable.getColumns()[iColCounter].setFilterValue("");
                    oTable.getColumns()[iColCounter].setFiltered(false);
                }

                // Update Binding
                // Remove any filters
                oListBinding.filter([]);
            },
            _onGetHTMLExcel : function(pMef, pData){
                
            },
            _onGetHTMLFullCode : function(pHtmlCode){
                let fullHTML = `
                    <!DOCTYPE html>
                    <html lang="en">
                    
                    <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>ss</title>
                    </head>
                    <body>
                        ${pHtmlCode}
                    </body>
                    </html>
                    `

                fullHTML = fullHTML.replace(/ /g, "%20");
                return fullHTML
            }
        });
    });
