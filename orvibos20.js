var Orvibo = require('node-orvibo');
var o = new Orvibo();
var dev;
var time1 = [];
var time2 = [];

module.exports = function(RED) {

	function orviboS20(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.status({
			fill: "red",
			shape: "ring",
			text: "disconnected"
		});

		o.on("deviceadded", function(device) {
			node.log("A device has been added:", device.type);
			clearInterval(time1);
			o.discover();

			time2[device.macAddress] = setInterval(function() {
				o.subscribe(device);
			}, 1000)
		})

		o.on("subscribed", function(device) {
			node.log("Subscription to %s successful!", device.macAddress);
			dev = device;
			node.status({
				fill: "green",
				shape: "ring",
				text: "connected"
			});
			clearInterval(time2[device.macAddress]);
		})

		o.on("externalstatechanged", function(device, state) {
			node.log("new state " + device.name + ": " + state);
			var msg = {
				payload: state
			}
			node.send(msg);
		});

		this.on('input', function(msg) {
			node.log("message received: " + msg.payload);
			// console.log(dev);
			var state = msg.payload;
			o.setState({
				device: dev,
				state: state
			});
		});

		this.on('close', function() {
			// o = null;
		});

	};

	o.listen(function() {
		time1 = setInterval(function() {
			// console.log("Discover S20....");
			o.discover();
		}, 10000)
	});


	RED.nodes.registerType("OrviboS20", orviboS20);


}
