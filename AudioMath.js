var engine 			= {};

engine.optionsTrg 	= "navigation";
engine.trainerTrg	= "site-wrap";
engine.sorobanTrg	= "soroban";
engine.btnTrg		= "engine-button";
engine.playSymbol	= "Play";
engine.stopSymbol	= "Stop";
	
engine.running		= false;
engine.series 		= [];
engine.strings		= [];

engine.calculations = { "type":"range", "target":"calculations", "text":"Calculations:", "value":50, "min":10, "step":10, "MAX":500};
engine.numbers 		= { "type":"range", "target":"numbers", "text":"Numbers:", "value":5, "min":2, "step":1, "MAX":10};
engine.digits 		= { "type":"range", "target":"digits", "text":"Digits:", "value":1, "min":1, "step":1, "MAX":2};
engine.delay 		= { "type":"range", "target":"abacus-delay", "text":"Abacus Delay:", "value":250, "min":0, "step":50, "MAX":500, "char":"%", "change":function(x) {return x/5}};
engine.rate 		= { "type":"range", "target":"speech-rate", "text":"Speech Rate:", "value":1.0, "min":0.5, "step":0.1, "MAX":2, "char":"%", "change":function(x) {return Math.round(x*100)}};
engine.voice		= { "type":"selector", "target":"speech-voices", "text":"Speech Voice:", "value":0, "selection": []};
engine.operation	= { "type":"selector", "target":"operation", "text":"Operation:", "value":"+/-",
						"selection": [
							"+/-",
							"+"
						]};
						
function getLayoutHTML() {
	var s = "";
	s += '<ul class="' + engine.optionsTrg + '"></ul>';
	s += '<input type="checkbox" id="nav-trigger" class="nav-trigger"/>';
	s += '<label for="nav-trigger"></label>';
	s += '<div class="' + engine.trainerTrg + '"></div>';
	return s;
}

function populateOptionsHTML() {
	var s = "",
		obj = engine;
	for(var key in obj) {
		if(obj.hasOwnProperty(key)) {
			if(obj[key]["type"] == "range" || obj[key]["type"] == "selector") {
				if(obj[key]["type"] == "range") {
					var ch = (obj[key]["char"]) ? obj[key]["char"] : "";
						txt = (obj[key]["change"]) ? obj[key]["change"](obj[key]["value"]) + ch : obj[key]["value"] + ch;
					s += '<li class="nav-item">';
					s += 	'<span class="range-label">' + obj[key]["text"] + ' </span><span id="' + obj[key]["target"] + '-span" class="range-label">' + txt+'</span>';
					s +=	'<input type="range" class="slider" id="' + obj[key]["target"] + '" min="' + obj[key]["min"] + '" max="' + obj[key]["MAX"] + '" step="' + obj[key]["step"] + '" value="' + obj[key]["value"] + '">';
					s += '</li>';
				} else if(obj[key]["type"] == "selector") {
					s += '<li class="nav-item">';
					s += 	'<label for="' + obj[key]["target"] + '">' + obj[key]["text"] + '</label>';
					s +=	'<select class="option" id="' + obj[key]["target"] + '">';
					for(var i = 0; i < obj[key]["selection"].length; i++)
						s +=	'<option>' + obj[key]["selection"][i] + '</option>';
					s +=	'</select>';
					s += '</li>';
				}
				$("." + engine.optionsTrg).append(s);
				onSettingChange(obj, key);
			}
		}
		s = "";
	}
	s += '<li class="nav-item">';
	s += 	'<p>Press the play button and listen to the calculations while watching the Soroban</p>';
	s += '</li>';
	$("." + engine.optionsTrg).append(s);
}

function onSettingChange(obj, key) {
	var el = "#" + obj[key]["target"];
	
	if(obj[key]["type"] == "range") {
		onChangeAttacher(el, function() {
			obj[key]["value"] = Number($("#" + obj[key]["target"]).val());
		});
		if($("#" + obj[key]["target"] + "-span"))
			onChangeAttacher(el, function() {
				$("#" + obj[key]["target"] + "-span").text(obj[key]["value"]);
			});
	} else if(obj[key]["type"] == "selector") {
		onChangeAttacher(el, function() {
			obj[key]["value"] = $("#" + obj[key]["target"]).val();
		});
	}
	
	if(obj[key]["change"] || obj[key]["char"]) {
		onChangeAttacher(el, function() {
			var ch = (obj[key]["char"]) ? obj[key]["char"] : "";
				txt = (obj[key]["change"]) ? obj[key]["change"](obj[key]["value"]) + ch : obj[key]["value"] + ch;
			$("#" + obj[key]["target"] + "-span").text(txt);
		});
	}
}

function onChangeAttacher(el, foo) {
	$(el).on("change", foo);
}

function populateTrainerHTML() {
    var s = "";
	s += '<div id="status-bar">';
	s += 	'<div id="text-of-calculation"></div>';
	s += '</div>';
	s += '<button id="' + engine.btnTrg + '" class="btn-standard"></button>';
	s += '<div id="' + engine.sorobanTrg + '"></div>';
    $("." + engine.trainerTrg).append(s);
}

function functionizer(e, f, t) {
	$(e).prop("onclick", null).attr("onclick", f);
	$(e).text(t);
}

function randomNumber(both, bool, partial) {
	
	var lower = Math.pow(10, engine.digits["value"] - 1); 
	
	if(both && bool && (partial - lower) > lower)
		return -Math.floor(Math.random() * clamp(partial - lower) + lower);
	else
		return Math.floor(Math.random() * 9 * Math.pow(10, engine.digits["value"] - 1) + lower);
}

function clamp(number) {
	
	var min = Math.pow(10, engine.digits["value"] - 1), MAX = 10 * Math.pow(10, engine.digits["value"] - 1);
	
	if(number >= MAX) {
		return ((MAX - 1) - min);
	} else if(number <= min) {
		return (min + 1);
	} else {
		return number;
	}
}

function generateArray() {
	
	engine.series = [];
	engine.strings = [];
	
	var procedures = [],
		numbers = [],
		sub = false,
		signs = [],
		first = 0,
		next = 0,
		string = "",
		count = 0;
	
	for(var i = 0; i < engine.calculations["value"]; i++) {
		procedures = [];
		numbers = [];
		
		sub = (engine.operation["value"] == "+/-") ? true : false;
		signs = [];
		first = randomNumber(0, 0, 0);
		next = 0;
		string = "";
		count = 0;
		
		count += first;
		string += String(first);
		
		numbers.push(first);
		procedures.push(first);
		
		for(var j = 1; j < engine.numbers["value"]; j++) {
			rndBool = Math.round(Math.random()) & 1;
			next = randomNumber(sub, rndBool, count);
			count += next;
			
			sign = (next < 0) ? " -": " +  ",
			signs.push(sign);
			string += sign + Math.abs(next);
			
			numbers.push(Math.abs(next));
			
			(function breakDown(num) {
				if(num<=0) return false;
				num = num.toFixed(0);

				var divisor = Math.pow(10, num.length-1),
					quotient = Math.floor(num/divisor);

				procedures.push(signs[j-1] + divisor*quotient);
				breakDown(num % divisor);
			})(numbers[j]);
		}
		
		procedures.push(" = ");	
		procedures.push(count);
		engine.series.push(procedures);
		
		engine.strings.push(string);
	}
	return engine.series;
}

function markupInitializer() {
	
	$("body").append(getLayoutHTML());
	populateTrainerHTML();
	populateOptionsHTML();

	functionizer("#" + engine.btnTrg, "start()", engine.playSymbol);
	
	soroban = new Abacus(engine.sorobanTrg, "soroban", 5, "Soroban", 0, "img/");
	var imgs = [
		"img/off/upper-bead-off.png",
		"img/off/lower-bead-off1.png",
		"img/off/lower-bead-off2.png",
		"img/off/lower-bead-off3.png",
		"img/off/lower-bead-off4.png",
		"img/on/upper-bead-on.png",
		"img/on/lower-bead-on1.png",
		"img/on/lower-bead-on2.png",
		"img/on/lower-bead-on3.png",
		"img/on/lower-bead-on4.png"
	];
	$.each(imgs, function(i, url) {
		(new Image()).src = url; 
		console.log("loaded image #" + i + ": " + url);
	});
	soroban.htmldraw();
}

function eventsInitializer() {
	
	speechSynthesis.cancel();
	
	function populateVoiceList() {
		var retry = setInterval(function() {
			if(!$("#" + engine.voice["target"]).val()) {
				engine.voice["selection"] = speechSynthesis.getVoices();
				$.each(engine.voice["selection"], function(index, value) {
					$("#" + engine.voice["target"]).append("<option data-index=" + index + ">" + value.name.replace(/Google/g, "") + "</option>");
				});
			}
			if(engine.voice["selection"].length != 0) {
				console.log("Voice ready!")
				clearInterval(retry);
			}
		}, 200);
		
	}
	populateVoiceList();
}

function start() {
	
	engine.running = true;

	functionizer("#" + engine.btnTrg, "stop()", engine.stopSymbol);

	generateArray();
	run();
}

function stop() {
	
	engine.running = false;
	clearTimeout(engine.playing);
	
	speechSynthesis.cancel();
	$("#text-of-calculation").text("");
	var interval = setInterval(function() {
		if(Number(soroban.currentvaluestring) <= 0) {
			clearInterval(interval);
			console.log("Abacus reset accomplished!");
		} else {
			soroban.reset();
		}
	}, 10);
	
	functionizer("#" + engine.btnTrg, "start()", engine.playSymbol);
}

function run(j, i, tmp) {
	
	j = (j == undefined) ? 0 : j;
	i = (i == undefined) ? 0 : i;
	count = tmp || 0;	
	
	var newUtt = new SpeechSynthesisUtterance(); 
	newUtt.voice = engine.voice["selection"][engine.voice["value"]]; 
	newUtt.rate = engine.rate["value"];
	newUtt.onend = function() {run(j+1, i, count)};
			
	if(engine.running) {
		if(j >= engine.series[i].length) {
			j = 0;
			i++;
			count = 0;
			soroban.reset();
		}
		if(i < engine.series.length) {
			if(j == 0)
				$("#text-of-calculation").text(engine.strings[i].replace(/\s{2,}/g,""));
			
			var num = String(engine.series[i][j]).replace(/\s{1,}/g, "");
			if(!isNaN(num) && j < engine.series[i].length - 1) {
				count += Number(num);
				engine.playing = setTimeout(function() {
					soroban.reset();
					soroban.assignstring(count);
				}, engine.delay["value"]*(engine.rate["MAX"] - engine.rate["value"]));
			}
			console.log(newUtt);
			newUtt.text = engine.series[i][j];
			speechSynthesis.speak(newUtt);
		} else {
			stop();
		}
	}
}