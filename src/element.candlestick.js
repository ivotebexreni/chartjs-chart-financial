﻿'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers,
		globalOpts = Chart.defaults.global,
		defaultColor = globalOpts.defaultColor;

	globalOpts.elements.candlestick = {
		upCandleColor: "rgba(80, 160, 115, 1)",
		downCandleColor: "rgba(215, 85, 65, 1)",
		outlineCandleColor: "rgba(90, 90, 90, 1)",
		outlineCandleWidth: 1,
	};

	function isVertical(bar) {
		return bar._view.width !== undefined;
	}

	/**
	 * Helper function to get the bounds of the bar regardless of the orientation
	 * @private
	 * @param bar {Chart.Element.Rectangle} the bar
	 * @return {Bounds} bounds of the bar
	 */
	function getBarBounds(bar) {
		var vm = bar._view;
		var x1, x2, y1, y2;

		if (isVertical(bar)) {
			// vertical
			var halfWidth = vm.width / 2;
			x1 = vm.x - halfWidth;
			x2 = vm.x + halfWidth;
			y1 = Math.min(vm.y, vm.base);
			y2 = Math.max(vm.y, vm.base);
		} else {
			// horizontal bar
			var halfHeight = vm.height / 2;
			x1 = Math.min(vm.x, vm.base);
			x2 = Math.max(vm.x, vm.base);
			y1 = vm.y - halfHeight;
			y2 = vm.y + halfHeight;
		}

		return {
			left: x1,
			top: y1,
			right: x2,
			bottom: y2
		};
	}

	Chart.elements.Candlestick = Chart.Element.extend({
		draw: function() {
			var ctx = this._chart.ctx;
			var vm = this._view;
			var left, right, top, bottom, signX, signY, borderSkipped;
			var borderWidth = vm.borderWidth;


			var x = vm.x;
			var o = vm.candle.o;
			var h = vm.candle.h;
			var l = vm.candle.l;
			var c = vm.candle.c;

			ctx.strokeStyle = helpers.getValueOrDefault(vm.outlineCandleColor, globalOpts.elements.candlestick.outlineCandleColor);
			ctx.lineWidth = helpers.getValueOrDefault(vm.outlineCandleWidth, globalOpts.elements.candlestick.outlineCandleWidth);
			if (c < o) {
				ctx.fillStyle = helpers.getValueOrDefault(vm.upCandleColor, globalOpts.elements.candlestick.upCandleColor);
			} else if (c > o) {
				ctx.fillStyle = helpers.getValueOrDefault(vm.downCandleColor, globalOpts.elements.candlestick.downCandleColor);
			} else {
				ctx.fillStyle = helpers.getValueOrDefault(vm.outlineCandleColor, globalOpts.elements.candlestick.outlineCandleColor);
			}

			ctx.beginPath();
			ctx.moveTo(x, h);
			ctx.lineTo(x, l);
			ctx.stroke();
			ctx.fillRect(x - vm.width / 2, c, vm.width, o - c);
			ctx.strokeRect(x - vm.width / 2, c, vm.width, o - c);
			ctx.closePath();
		},
		height: function() {
			var vm = this._view;
			return vm.base - vm.y;
		},
		inRange: function(mouseX, mouseY) {
			var inRange = false;

			if (this._view) {
				var bounds = getBarBounds(this);
				inRange = mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
			}

			return inRange;
		},
		inLabelRange: function(mouseX, mouseY) {
			var me = this;
			if (!me._view) {
				return false;
			}

			var inRange = false;
			var bounds = getBarBounds(me);

			if (isVertical(me)) {
				inRange = mouseX >= bounds.left && mouseX <= bounds.right;
			} else {
				inRange = mouseY >= bounds.top && mouseY <= bounds.bottom;
			}

			return inRange;
		},
		inXRange: function(mouseX) {
			var bounds = getBarBounds(this);
			return mouseX >= bounds.left && mouseX <= bounds.right;
		},
		inYRange: function(mouseY) {
			var bounds = getBarBounds(this);
			return mouseY >= bounds.top && mouseY <= bounds.bottom;
		},
		getCenterPoint: function() {
			var vm = this._view;
			var x, y;
			if (isVertical(this)) {
				x = vm.x;
				y = (vm.y + vm.base) / 2;
			} else {
				x = (vm.x + vm.base) / 2;
				y = vm.y;
			}

			return { x: x, y: y };
		},
		getArea: function() {
			var vm = this._view;
			return vm.width * Math.abs(vm.y - vm.base);
		},
		tooltipPosition: function() {
			var vm = this._view;
			return {
				x: vm.x,
				y: vm.y
			};
		}
	});

};

