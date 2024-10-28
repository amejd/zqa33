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
                    const sLotFournisseur = oSmartTableFilter.getFilterData().LotFournisseur;
                    const sMatnr = oSmartTableFilter.getFilterData().Article;
                    const sWerk = oSmartTableFilter.getFilterData().Division;
                    const sLifnr = oSmartTableFilter.getFilterData().Fournisseur;
                    const sMef = oSmartTableFilter.getFilterData().Mef;
                    const sStatut = oSmartTableFilter.getFilterData().Statut;
                    const sQmata = oSmartTableFilter.getFilterData().qmata;
                    const sPaendterm = oSmartTableFilter.getFilterData().FinControle;
                    const sEnstehdat = oSmartTableFilter.getFilterData().DateLclCreationLot;

                    let Filters = new Array();
                    // Create Filters
                    sLotFournisseur && Filters.push(
                        that._onGetFilters(sLotFournisseur, "LotFournisseur")
                    )
                    sPaendterm && Filters.push(
                        that._onGetFiltersDate(sPaendterm, "FinControle")
                    )
                    sEnstehdat && Filters.push(
                        that._onGetFiltersDate(sEnstehdat, "DateLclCreationLot")
                    )
                    // Multiple FilterType - below
                    if (sStatut) {
                        sStatut.items.map((e) => {
                            Filters.push(that._onGetFilters(e.key, "Statut"))
                        })
                    }
                    if (sLifnr) {
                        sLifnr.items.map((e) => {
                            Filters.push(that._onGetFilters(e.key, "Fournisseur"))
                        })
                    }
                    if (sWerk) {
                        sWerk.items.map((e) => {
                            Filters.push(that._onGetFilters(e.key, "Division"))
                        })
                    }
                    if (sQmata) {
                        sQmata.items.map((e) => {
                            Filters.push(that._onGetFilters(e.key, "qmata"))
                        })
                    }
                    if (sPrueflos) {
                        sPrueflos.items.map((e) => {
                            Filters.push(that._onGetFilters(e.key, "LotDeControle"))
                        }
                        )
                    }
                    if(sMatnr){
                       sMatnr.items.map((e)=>{
                        Filters.push(
                            that._onGetFilters(e.key, "Article")
                        )
                       })
                    }
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

                            // ConvertDate
                            const oDateFormat = DateFormat.getInstance({
                                pattern: "dd-MM-yyyy"
                            });

                            let formattedData = oData.results.map(item => {
                                // console.log(item);
                                if (item.DateDecisionOrig != null) {
                                    item.DateDecisionOrig = oDateFormat.format(item.DateDecisionOrig);
                                } else {
                                    item.DateDecisionOrig = ' '
                                }

                                if (item.DateDocument != null) {
                                    item.DateDocument = oDateFormat.format(item.DateDocument);
                                } else {
                                    item.DateDocument = ' '
                                }

                                if (item.DateUtiModifiee != null) {
                                    item.DateUtiModifiee = oDateFormat.format(item.DateUtiModifiee);
                                } else {
                                    item.DateUtiModifiee = ' '
                                }
                                return item;
                            });
                            if (sMef == '1') {
                                if (sap.ui.getCore().byId("idMef2")) {
                                    sap.ui.getCore().byId("idMef2").destroy()
                                    sap.ui.getCore().byId("Title2").destroy()
                                    sap.ui.getCore().byId("Toolbar2").destroy()
                                    sap.ui.getCore().byId("Vbox2").destroy()
                                }
                                if (sap.ui.getCore().byId("idMef3")) {
                                    sap.ui.getCore().byId("idMef3").destroy()
                                    sap.ui.getCore().byId("Title3").destroy()
                                    sap.ui.getCore().byId("Toolbar3").destroy()
                                    sap.ui.getCore().byId("Vbox3").destroy()
                                }
                                if (sap.ui.getCore().byId("idMef1")) {
                                    sap.ui.getCore().byId("idMef1").destroy()
                                    sap.ui.getCore().byId("Title1").destroy()
                                    sap.ui.getCore().byId("Toolbar1").destroy()
                                    sap.ui.getCore().byId("Vbox1").destroy()
                                }

                                oPage.addContent(that._onGetMEF11(formattedData))
                            } else if (sMef == '2') {
                                if (sap.ui.getCore().byId("idMef1")) {
                                    sap.ui.getCore().byId("idMef1").destroy()
                                    sap.ui.getCore().byId("Title1").destroy()
                                    sap.ui.getCore().byId("Toolbar1").destroy()
                                    sap.ui.getCore().byId("Vbox1").destroy()
                                }
                                if (sap.ui.getCore().byId("idMef3")) {
                                    sap.ui.getCore().byId("idMef3").destroy()
                                    sap.ui.getCore().byId("Title3").destroy()
                                    sap.ui.getCore().byId("Toolbar3").destroy()
                                    sap.ui.getCore().byId("Vbox3").destroy()
                                }
                                if (sap.ui.getCore().byId("idMef2")) {
                                    sap.ui.getCore().byId("idMef2").destroy()
                                    sap.ui.getCore().byId("Title2").destroy()
                                    sap.ui.getCore().byId("Toolbar2").destroy()
                                    sap.ui.getCore().byId("Vbox2").destroy()
                                }
                                oPage.addContent(that._onGetMEF22(formattedData))
                            } else if (sMef == '3') {
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
                                if (sap.ui.getCore().byId("idMef3")) {
                                    sap.ui.getCore().byId("idMef3").destroy()
                                    sap.ui.getCore().byId("Title3").destroy()
                                    sap.ui.getCore().byId("Toolbar3").destroy()
                                    sap.ui.getCore().byId("Vbox3").destroy()
                                }
                                // Remove duplicate entries
                                formattedData = formattedData.map(item => ({
                                    Statut: item.Statut,
                                    Article: item.Article,
                                    Description: item.Description,
                                    DateDocument: item.DateDocument,
                                    LotDeControle: item.LotDeControle,
                                    LotFournisseur: item.LotFournisseur,
                                    NomFournisseur: item.NomFournisseur,
                                    Division: item.Division,
                                    qmata: item.qmata
                                }));
                                formattedData = that._onRemoveDuplicates(formattedData)
                                oPage.addContent(that._onGetMEF33(formattedData))
                            }
                            else {
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
                        that._onExtractData(1, 'idMef1')
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
                                    text: "{Description}"
                                }),
                                new sap.m.Text({
                                    text: "{Article}"
                                }),
                                new sap.m.Text({
                                    text: "{NomFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{NumArticleFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{LotFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{LotDeControle}"
                                }),
                                new sap.m.Text({
                                    text: "{Lot}"
                                }),
                                new sap.m.Text({
                                    text: "{QteLotControle} {UniteQteBase}"
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
                            label: "{i18n>Description}",
                            template: new sap.m.Text().bindProperty("text", "Description"),
                            sortProperty: 'Description',
                            filterProperty: 'Description',
                            width: '25rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Article}",
                            template: new sap.m.Text().bindProperty("text", "Article"),
                            sortProperty: 'Article',
                            filterProperty: 'Article',
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
                            label: "{i18n>NumArticleFournisseur}",
                        //    template: new sap.m.Text().bindProperty("text", "NumArticleFournisseur"),
                        //    sortProperty: 'NumArticleFournisseur',
                        //    filterProperty: 'NumArticleFournisseur',
                            template: new sap.m.Text().bindProperty("text", "Fournisseur"),
                            sortProperty: 'Fournisseur',
                            filterProperty: 'Fournisseur',                        
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
                            label: "{i18n>LotDeControle}",
                            template: new sap.m.Text().bindProperty("text", "LotDeControle"),
                            sortProperty: 'LotDeControle',
                            filterProperty: 'LotDeControle',
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
                        that._onExtractData(2, 'idMef2')
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
                oModel.setData({ 'MEF1': filteredData });

                // Binding
                oTable.setModel(oModel);

                // Create a Vertical Layout (VBox) to stack the OverflowToolbar and Table
                const oVBox = new sap.m.VBox({
                    id: 'Vbox2',
                    items: [oToolbar, oTable]
                });

                return oVBox;
            },
            _onGetMEF33: function (filteredData) {
                const that = this
                // Create the OverflowToolbar
                const oToolbar = new sap.m.OverflowToolbar({
                    id: 'Toolbar3',
                    design: "Transparent",
                    height: "3rem"
                });

                const numberOfRecords = filteredData.length
                oToolbar.addContent(new sap.m.Title({
                    id: 'Title3',
                    text: "{i18n>titleMEF3}" + `  - (${numberOfRecords} ${this.getOwnerComponent().getModel("i18n").getResourceBundle().getText('Etr')})`
                }));
                oToolbar.addContent(new sap.m.ToolbarSpacer({
                    id: '_IDGenToolbarSpacer3'
                }));

                oToolbar.addContent(new sap.m.Button({
                    id: '_IDGenButton3',
                    icon: "sap-icon://refresh",
                    press: function () {
                        that.onClearAllFilters('idMef3')
                    }
                }));

                oToolbar.addContent(new sap.m.Button({
                    id: 'ButtonMef3',
                    type: "Accept",
                    icon: "sap-icon://excel-attachment",
                    press: function () {
                        that._onExtractData(3, 'idMef3')
                    }
                }));

                // Create Table
                const oTable = new sap.ui.table.Table({
                    id: "idMef3",
                    visibleRowCount: 6,
                    selectionMode: sap.ui.table.SelectionMode.MultiToggle,
                    rows: {
                        path: "/MEF3",
                        template: new sap.ui.table.Row({
                            cells: [
                                new sap.ui.core.Icon({
                                    color: {
                                        path: "Statut",
                                        formatter: function (value) {
                                            if (value == 'V') {
                                                return 'Positive'; // Set color to positive
                                            } else if (value == 'J') {
                                                return 'Critical'
                                            }
                                            else {
                                                return 'Negative'; // Default color
                                            }
                                        }
                                    },
                                    src: {
                                        path: "Statut",
                                        formatter: function (value) {
                                            if (value == 'V') {
                                                return 'sap-icon://sys-enter-2'; // Set color to positive
                                            } else if (value == 'J') {
                                                return 'sap-icon://alert'
                                            }
                                            else {
                                                return 'sap-icon://error'; // Default color
                                            }
                                        }
                                    }
                                }),
                                new sap.m.Text({
                                    text: "{Article}"
                                }),
                                new sap.m.Text({
                                    text: "{Description}"
                                }),
                                new sap.m.Text({
                                    text: "{Division}"
                                }),
                                new sap.m.Text({
                                    text: "{NomFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{DateDocument}"
                                }),
                                new sap.m.Text({
                                    text: "{LotDeControle}"
                                }),
                                new sap.m.Text({
                                    text: "{LotFournisseur}"
                                }),
                                new sap.m.Text({
                                    text: "{qmata}"
                                })
                            ]
                        })
                    },
                    columns: [
                        new sap.ui.table.Column({
                            label: "{i18n>Statut}",
                            template: new sap.ui.core.Icon({
                                color: {
                                    path: "Statut",
                                    formatter: function (value) {
                                        if (value == 'V') {
                                            return 'Positive'; // Set color to positive
                                        } else if (value == 'J') {
                                            return 'Critical'
                                        }
                                        else {
                                            return 'Negative'; // Default color
                                        }
                                    }
                                },
                                src: {
                                    path: "Statut",
                                    formatter: function (value) {
                                        if (value == 'V') {
                                            return 'sap-icon://sys-enter-2'; // Set color to positive
                                        } else if (value == 'J') {
                                            return 'sap-icon://alert'
                                        }
                                        else {
                                            return 'sap-icon://error'; // Default color
                                        }
                                    }
                                }
                            }),
                            width: '3rem'
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
                            width: '15rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>Division}",
                            template: new sap.m.Text().bindProperty("text", "Division"),
                            sortProperty: 'Division',
                            filterProperty: 'Division',
                            width: '10rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>NomFournisseur}",
                            template: new sap.m.Text().bindProperty("text", "NomFournisseur"),
                            sortProperty: 'NomFournisseur',
                            filterProperty: 'NomFournisseur',
                            width: '15rem'
                        }),
                        new sap.ui.table.Column({
                            label: "{i18n>DateDocument}",
                            template: new sap.m.Text().bindProperty("text", "DateDocument"),
                            sortProperty: 'DateDocument',
                            filterProperty: 'DateDocument',
                            width: '11rem'
                        }),
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
                            label: "{i18n>qmata}",
                            template: new sap.m.Text().bindProperty("text", "qmata"),
                            sortProperty: 'qmata',
                            filterProperty: 'qmata',
                            width: '11rem'
                        })
                    ]
                });

                const oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({ 'MEF3': filteredData });

                // Binding
                oTable.setModel(oModel);

                // Create a Vertical Layout (VBox) to stack the OverflowToolbar and Table
                const oVBox = new sap.m.VBox({
                    id: 'Vbox3',
                    items: [oToolbar, oTable]
                });

                return oVBox;
            },
            _onExtractData: function (oMef, oIdTable) {
                // Get Dialog
                const oDialog = this.getView().byId("BusyDialog");
                oDialog.open();
                // Access the resource bundle
                const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle()
                // Get Binding
                const oTable = sap.ui.getCore().byId(oIdTable)
                const oBinding = oTable.getBinding("rows");
                let dataType = "application/vnd.ms-excel";
                // Hidden Link
                const aId = this.createId("hiddenLink")
                let aHyperlink = document.getElementById(aId)
                // Binding
                if (oBinding && oBinding.getLength() > 0) {
                    const htmlCode = this._onGetHTMLExcel(oMef, oBinding.oList)
                    aHyperlink.href = `data:${dataType}, ${htmlCode}`;
                    if (oMef == 1) {
                        aHyperlink.download = `${oResourceBundle.getText('fileMef1')}-${this._formatDate(new Date())}.xls`;
                    } else if (oMef == 2) {
                        aHyperlink.download = `${oResourceBundle.getText('fileMef2')}-${this._formatDate(new Date())}.xls`;
                    } else {
                        aHyperlink.download = `${oResourceBundle.getText('fileMef3')}-${this._formatDate(new Date())}.xls`;
                    }
                    //triggering the function
                    aHyperlink.click();
                    oDialog.close()
                } else {
                    MessageToast.show("No data bound")
                    oDialog.close();
                    return;
                }
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
            _onGetHTMLExcel: function (pMef, pData) {
                // Get Smartfilterbar, to get Header
                const oSmartTableFilter = this.getView().byId("smartFilterBar");
                const sEnstehdat = oSmartTableFilter.getFilterData().DateLclCreationLot
                // Date
                const pDate = this._formatDate(new Date())
                // User
                const xnavservice = sap.ushell && sap.ushell.Container.getService && sap.ushell.Container.getService("UserInfo")
                const user = xnavservice != null ? xnavservice.getFullName() : 'Unknown'
                // Access the resource bundle
                const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle()
                let title = ''
                let htmlCode = ''

                if (pMef == 1) {
                    title = oResourceBundle.getText("titleMef1");
                    htmlCode = `
                            <div id="allfile">
                            <div class="container">
                            <h2>${title}</h2>
                            <p style="margin-bottom: 0px;"><b>Date&nbsp;:</b>&nbsp;${pDate}</p>
                            ${sEnstehdat != null ? `<p style="margin-top: 1px; margin-bottom: 2px;"><b>Selection&nbsp;:</b>&nbsp;${this._formatDate(sEnstehdat.low)} - ${this._formatDate(sEnstehdat.high)}</p>` : ''}
                            <p style="margin-top: 1px;margin-bottom: 0px;"><b>Utilisateur&nbsp;:</b>&nbsp;${user}</p>
                            </div>
                            <p></p>
                            <table id="customersTable" style="font-family:arial, sans-serif;border: 1px solid black; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr>
                                <th style="width: 15em; border: 1px solid black;">${oResourceBundle.getText("Description")}</th>
                                <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("Article")}</th>
                                <th style="width: 15em; border: 1px solid black;">${oResourceBundle.getText("NomFournisseur")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("NumArticleFournisseur")}</th>
                                <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("LotFournisseur")}</th>
                                <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("LotDeControle")}</th>
                                <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("Lot")}</th>
                                <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("Quantite")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DelaiRecepInspection")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DelaiRecepCoA")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DelaiRecepDecition")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DelaiAvisInitie")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pData && pData.map((e) => {
                        return (
                            `
                                            <tr>
                                            <td style="border: 1px solid black;text-align:center;">${e.Description}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Article}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.NomFournisseur}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.NumArticleFournisseur}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.LotFournisseur}</td>
                                            <td style="border: 1px solid black;text-align:center; mso-number-format:'\@';">${e.LotDeControle}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Lot}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.QteLotControle} ${e.UniteQteBase}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DelaiRecepInspection}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DelaiRecepCoA}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DelaiRecepDecition}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DelaiAvisInitie}</td>
                                            </tr>
                                            `
                        )
                    }).join('')

                        }
                                
                            </tbody>
                            </table>
                        </div>`

                    return this._onGetHTMLFullCode(htmlCode)
                }

                else if (pMef == 2) {
                    title = oResourceBundle.getText("titleMef2");
                    htmlCode = `
                            <div id="allfile">
                            <div class="container">
                            <h2>${title}</h2>
                            <p style="margin-bottom: 0px;"><b>Date&nbsp;:</b>&nbsp;${pDate}</p>
                            <p style="margin-top: 1px;margin-bottom: 0px;"><b>Utilisateur&nbsp;:</b>&nbsp;${user}</p>
                            ${sEnstehdat != null ? `<p style="margin-top: 1px;"><b>Selection&nbsp;:</b>&nbsp;${this._formatDate(sEnstehdat.low)} - ${this._formatDate(sEnstehdat.high)}</p>` : ''}
                            </div>
                            <p></p>
                            <table id="customersTable" style="font-family:arial, sans-serif;border: 1px solid black; border-collapse: collapse;">
                            <thead>
                                <tr>
                                <th style="width: 10em; border: 1px solid black;">Lot de Controle</th>
                                <th style="width: 10em; border: 1px solid black;">Lot fournisseur</th>
                                <th style="width: 10em; border: 1px solid black;">Lot</th>
                                <th style="width: 10em; border: 1px solid black;">Article</th>
                                <th style="width: 15em; border: 1px solid black;">Description</th>
                                <th style="width: 20em; border: 1px solid black;">Num Article Fournisseur</th>
                                <th style="width: 10em; border: 1px solid black;">Division</th>
                                <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("Quantite")}</th>
                                <th style="width: 15em; border: 1px solid black;">${oResourceBundle.getText("DateDocument")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DecisionUtiOrig")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DecisionUtiModif")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DateDecisionOrig")}</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DateUtiModifiee")}</th>
                                <th style="width: 20em; border: 1px solid black;">Utilisateur</th>
                                <th style="width: 20em; border: 1px solid black;">Statut du Stock</th>
                                <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("StatutRecepCoA")}</th>
                                
                                </tr>
                            </thead>
                            <tbody>
                                ${pData && pData.map((e) => {
                        return (
                            `
                                            <tr>
                                            <td style="border: 1px solid black;text-align:center; mso-number-format:'\@';">${e.LotDeControle}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.LotFournisseur}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Lot}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Article}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Description}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.NumArticleFournisseur}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Division}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.QteLotControle} ${e.UniteQteBase}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DateDocument}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DecisionUtiOrig}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DecisionUtiModif}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DateDecisionOrig}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.DateUtiModifiee}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.Utilisateur}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.StatutStock}</td>
                                            <td style="border: 1px solid black;text-align:center;">${e.StatutRecepCoA}</td>
                                            </tr>
                                            `
                        )
                    }).join('')

                        }
                                
                            </tbody>
                            </table>
                        </div>`

                    return this._onGetHTMLFullCode(htmlCode)
                } else if (pMef == 3) {
                    title = oResourceBundle.getText("titleMEF3");
                    htmlCode = `
                            <div id="allfile">
                            <div class="container">
                            <h2>${title}</h2>
                            <p style="margin-bottom: 0px;"><b>Date&nbsp;:</b>&nbsp;${pDate}</p>
                            ${sEnstehdat != null ? `<p style="margin-top: 1px; margin-bottom: 2px;"><b>Selection&nbsp;:</b>&nbsp;${this._formatDate(sEnstehdat.low)} - ${this._formatDate(sEnstehdat.high)}</p>` : ''}
                            <p style="margin-top: 1px;margin-bottom: 0px;"><b>Utilisateur&nbsp;:</b>&nbsp;${user}</p>
                            </div>
                            <p></p>
                            <table id="customersTable" style="font-family:arial, sans-serif;border: 1px solid black; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr>
                                    <th style="width: 5em; border: 1px solid black;">Statut</th>
                                    <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("Article")}</th>
                                    <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("Description")}</th>
                                    <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("Division")}</th>
                                    <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("NomFournisseur")}</th>
                                    <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("DateDocument")}</th>
                                    <th style="width: 10em; border: 1px solid black;">${oResourceBundle.getText("LotDeControle")}</th>
                                    <th style="width: 20em; border: 1px solid black;">${oResourceBundle.getText("LotFournisseur")}</th>
                                    <th style="width: 15em; border: 1px solid black;">${oResourceBundle.getText("qmata")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pData && pData.map((e) => {
                        return (
                            `
                                            <tr>
                                                
                                                <td style="border: 1px solid black;text-align:center; position: relative;">
                                                <span style="font-size:20px;">
                                                    <span style="font-size: 20px;">
                                                        ${e.Statut == 'R' ? `<span style='color: red; margin:0; padding:0;'>${oResourceBundle.getText("ExcelIcon")}</span>` : `<span style='color: gray;margin:0; padding:0;'>${oResourceBundle.getText("ExcelIcon")}</span>`}
                                                        ${e.Statut == 'J' ? `<span style='color: orange;'>${oResourceBundle.getText("ExcelIcon")}</span>` : `<span style='color: gray;'>${oResourceBundle.getText("ExcelIcon")}</span>`}
                                                        ${e.Statut == 'V' ? `<span style='color: green;'>${oResourceBundle.getText("ExcelIcon")}</span>` : `<span style='color: gray;'>${oResourceBundle.getText("ExcelIcon")}</span>`}
                                                    </span>
                                                </span>
                                                </td>
                                                <td style="border: 1px solid black;text-align:center;">${e.Article}</td>
                                                <td style="border: 1px solid black;text-align:center;">${e.Description}</td>
                                                <td style="border: 1px solid black;text-align:center;">${e.Division}</td>
                                                <td style="border: 1px solid black;text-align:center;">${e.NomFournisseur}</td>
                                                <td style="border: 1px solid black;text-align:center;">${e.DateDocument}</td>
                                                <td style="border: 1px solid black;text-align:center; mso-number-format:'\@';">${e.LotDeControle}</td>
                                                <td style="border: 1px solid black;text-align:center;">${e.LotFournisseur}</td>
                                                <td style="border: 1px solid black;text-align:center;">${e.qmata}</td>
                                            </tr>
                                            `
                        )
                    }).join('')

                        }
                                
                            </tbody>
                            </table>
                        </div>`

                    return this._onGetHTMLFullCode(htmlCode)
                } else {
                    alert('Not implemented ! ')
                    return;
                }



            },
            _onGetHTMLFullCode: function (pHtmlCode) {
                let fullHTML = `
                    <!DOCTYPE html>
                    <html lang="en">
                    
                    <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Excel ZQA33</title>
                    </head>
                    <body>
                        ${pHtmlCode}
                    </body>
                    </html>
                    `

                fullHTML = fullHTML.replace(/ /g, "%20");
                return fullHTML
            },
            _onRemoveDuplicates: function (items) {
                const uniqueIds = [];
                const uniqueData = items.filter(element => {
                    // Check If the uniqueIds array contains this item
                    const isDuplicate = uniqueIds.includes(element["LotDeControle"]);
                    // If it does not exists, push it and continue
                    if (!isDuplicate) {
                        uniqueIds.push(element["LotDeControle"]);
                        return true;
                    }
                    // If it exists, break
                    return false;
                });

                return uniqueData;
            }
        });
    });
