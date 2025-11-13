/*global QUnit*/

sap.ui.define([
	"com/ui5/train/grouptwocasestudy/controller/orderMain.controller"
], function (Controller) {
	"use strict";

	QUnit.module("orderMain Controller");

	QUnit.test("I should test the orderMain controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
