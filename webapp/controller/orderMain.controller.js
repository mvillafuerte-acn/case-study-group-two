sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "com/ui5/train/grouptwocasestudy/util/formatter"
], function (Controller, MessageToast, MessageBox, Fragment, formatter) {
    "use strict";

    return Controller.extend("com.ui5.train.grouptwocasestudy.controller.orderMain", {

        formatter: formatter,

        onInit: function () {
            // Optionally keep a reference to the plantDesc model
            this._oPlantModel = this.getView().getModel("plantDesc");

            // Sort table by OrderNumber ascending once the binding exists
            var oTable = this.byId("idOrdersTable");
            var that = this;
            // attach updateFinished to ensure binding exists and sorting works after data loads
            oTable.attachEventOnce("updateFinished", function () {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.sort(new sap.ui.model.Sorter("OrderNumber", false)); // false = ascending
                }
            });
        },

        /* -------------------------
           SEARCH & CLEAR (simple)
           ------------------------- */
        onSearch: function () {
            var aFilters = [];
            var sOrder = this.byId("idOrderNumber").getValue();
            var sDate = this.byId("idCreationDate").getValue();
            var aStatus = this.byId("idStatus").getSelectedKeys();

            if (sOrder) {
                aFilters.push(new sap.ui.model.Filter("OrderNumber", sap.ui.model.FilterOperator.Contains, sOrder));
            }
            if (sDate) {
                aFilters.push(new sap.ui.model.Filter("CreationDate", sap.ui.model.FilterOperator.Contains, sDate));
            }
            if (aStatus && aStatus.length) {
                // OR filter for multiple statuses
                var aStatusFilters = aStatus.map(function (s) {
                    return new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, s);
                });
                aFilters.push(new sap.ui.model.Filter(aStatusFilters, false));
            }

            this.byId("idOrdersTable").getBinding("items").filter(aFilters);
        },

        onClear: function () {
            this.byId("idOrderNumber").setValue("");
            this.byId("idCreationDate").setValue("");
            this.byId("idStatus").removeAllSelectedItems();
            this.byId("idOrdersTable").getBinding("items").filter([]);
        },

        onCreate: function () {
            MessageToast.show("Create pressed (stub)");
        },

        onItemPress: function (oEvent) {
            var sOrder = oEvent.getSource().getBindingContext("mockOrders").getProperty("OrderNumber");
            MessageToast.show("Row pressed: " + sOrder);
        },

        /* -------------------------
           DELETE (uses fragment dialog)
           ------------------------- */
        onDelete: function () {
            var oTable = this.byId("idOrdersTable");
            var aSelected = oTable.getSelectedItems();

            if (!aSelected || aSelected.length === 0) {
                MessageBox.error("Please select at least one item to delete.");
                return;
            }

            // lazy-load fragment
            var that = this;
            if (!this._pDeleteDialog) {
                this._pDeleteDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.ui5.train.grouptwocasestudy.fragment.DeleteDialog",
                    controller: this
                }).then(function (oDialog) {
                    that.getView().addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pDeleteDialog.then(function (oDialog) {
                // update message with number selected
                var oText = oDialog.getContent()[0];
                if (oText) {
                    oText.setText("Are you sure you want to delete " + aSelected.length + " item(s)?");
                }
                // store selected items temporarily
                that._aItemsToDelete = aSelected;
                oDialog.open();
            });
        },

        onConfirmDelete: function () {
            var that = this;
            var aItems = this._aItemsToDelete || [];
            if (!aItems.length) {
                MessageToast.show("No items to delete.");
                return;
            }
            // remove each from model (mock)
            var oModel = this.getView().getModel("mockOrders");
            aItems.forEach(function (oItem) {
                var sPath = oItem.getBindingContext("mockOrders").getPath();
                // remove from array: mock model is simple JSON; remove by splice
                // compute index from path: "/Orders/0" => 0
                var aParts = sPath.split("/");
                var iIndex = parseInt(aParts[aParts.length - 1], 10);
                var aData = oModel.getProperty("/Orders") || [];
                if (!isNaN(iIndex) && aData[iIndex]) {
                    aData.splice(iIndex, 1);
                    oModel.setProperty("/Orders", aData);
                }
            });

            MessageToast.show(aItems.length + " item(s) removed.");
            // close dialog
            this.byId("idDeleteDialog").close();
        },

        onCancelDelete: function () {
            this.byId("idDeleteDialog").close();
        }

    });
});