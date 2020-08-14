var q = function(key){ return document.querySelector(key); };
var goData = q("#goData");
var goCalc = q("#goCalc");
var goContact = q("#goContact");


function displayOn(item){
	var items = [
		"#networkData",
		"#calculatorData"
		];
	for (var i=0; i<items.length; i++){
		if (item == items[i]){
			document.querySelector(item).style.display = "";
		} else {
			document.querySelector(items[i]).style.display = "none";
		}
	}
}
function openCalc(wasBtn){
	displayOn("#calculatorData");
	if (wasBtn){
		window.location.hash = "calculator";
	}
}
function openNetwork(wasBtn){
	displayOn("#networkData");
	if (wasBtn){
		window.location.hash = "network";
	}
}
routie('calculator', function() {
	openCalc(false);
});
routie('network', function() {
	openNetwork(false);
});