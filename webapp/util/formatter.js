sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Look up plant description from plantDesc model.
         * Called with a Receiving/Delivering plant code (e.g. "9101")
         */
        plantDescription: function (sPlant) {
            try {
                var oView = this.getView();
                var oPlantModel = oView.getModel("plantDesc");
                // plantDesc model format: { "9101": "9101 - Singapore", ... }
                var oMap = oPlantModel ? oPlantModel.getProperty("/") : null;
                if (oMap && oMap[sPlant]) {
                    return oMap[sPlant];
                }
            } catch (e) {
                // fallback
            }
            return sPlant || "";
        },

        /**
         * return CSS class name for status to be used in XML class binding
         */
        statusClass: function (sStatus) {
            switch (sStatus) {
                case "Created": return "statusCreated";
                case "Released": return "statusReleased";
                case "Partially Completed": return "statusPartiallyCompleted";
                case "Delivered": return "statusDelivered";
                default: return "";
            }
        }
    };
});