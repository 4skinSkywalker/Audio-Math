var optionsTrg 		= "navigation",
	trainerTrg		= "site-wrap",
	sorobanTrg		= "soroban",
	resultsTrg		= "results",
	playStopTrg		= "engine-button",
	playChar		= "Play",
	stopChar		= "Stop",
	running			= false,
	series 			= [],
	engine 			= {};

engine.calculations = { "type":"range", "target":"calculations", "text":"Calculations:", "value":50, "min":10, "step":10, "MAX":500};
engine.numbers 		= { "type":"range", "target":"numbers", "text":"Numbers:", "value":5, "min":2, "step":1, "MAX":10};
engine.digits 		= { "type":"range", "target":"digits", "text":"Digits:", "value":1, "min":1, "step":1, "MAX":2};
engine.rate 		= { "type":"range", "target":"speech-rate", "text":"Speech Rate:", "value":1.0, "min":0.1, "step":0.1, "MAX":5};
engine.voice		= { "type":"selector", "target":"voices", "text":"Speech Voice:", "value":0, "selection": []};
engine.operation	= { "type":"selector", "target":"operation", "text":"Operation:", "value":"+",
						"selection": [
							"+",
							"-"
						]};
						
function getLayoutHTML() {
	var s = "";
	s += '<ul class="' + optionsTrg + '"></ul>';
	s += '<input type="checkbox" id="nav-trigger" class="nav-trigger"/>';
	s += '<label for="nav-trigger"></label>';
	s += '<div class="' + trainerTrg + '"></div>';
	return s;
}

function populateOptionsHTML() {
	var s = "",
		obj = engine;
	for(var key in obj) {
		if(obj.hasOwnProperty(key)) {
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
			$("." + optionsTrg).append(s);
			onSettingChange(obj, key);
		}
		s = "";
	}
	$("." + optionsTrg).append(s);
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
	s += '<button id="' + playStopTrg + '" class="btn-standard"></button>';
	s += '<div id="' + sorobanTrg + '"></div>';
    $("." + trainerTrg).append(s);
}

function functionizer(e, f, t) {
	$(e).prop("onclick", null).attr("onclick", f);
	$(e).text(t);
}

function randomNumber(both, sign, partial) {
	
	var lower = Math.pow(10, engine.digits["value"] - 1); 
	
	if(both && sign && (partial - lower) > lower)
		return Math.floor(Math.random() * clamp(partial - lower) + lower);
	else
		return Math.floor(Math.random() * 9 * Math.pow(10, engine.digits["value"] - 1) + lower);
}

function clamp(number) {
	
	var min = Math.pow(10, engine.digits["value"] - 1), MAX = 10 * Math.pow(10, engine.digits["value"] - 1);
	
	if(number >= MAX) {
		return ((MAX - 1) - min);
	} else if(number <= min) {
		return min;
	} else {
		return number;
	}
}

function generateArray() {
	
	series = [];
	
	for(var i = 0; i < engine.calculations["value"]; i++) {
		var procedure = [],
			calculation = "";
			numbers = [],
			signs = ["+"],
			enable = (engine.operation["value"] == "-")? true : false;
		
		var first = randomNumber(enable, 0, 0),
			next = 0;
		
		numbers.push(first);
		calculation += first;
		for(var j = 1; j < engine.numbers["value"]; j++) {
			rndBool = Math.round(Math.random()) & 1;
			sign = (enable && rndBool == 1)? "-": "+",
			signs.push(sign);
			next = randomNumber(enable, sign, numbers[j-1]);
			numbers.push(next);
			calculation += " " + signs[j] + next;
		}
		
		var result = eval(calculation),
			broken = [];
		
		procedure.push(calculation);
		procedure.push(" = ");
		procedure.push(first);
		for(var k = 1; k < numbers.length; k++) {
			(function breakDown(num) {
				if(num<=0) return false;
				num = num.toFixed(0);

				var divisor = Math.pow(10, num.length-1),
					quotient = Math.floor(num/divisor);

				procedure.push(signs[k] + divisor*quotient);
				breakDown(num % divisor);
			})(numbers[k]);
		}	
		procedure.push(" = ");	
		procedure.push(result);
		series.push(procedure);
	}
	return series;
}

function markupInitializer() {
	
	$("body").append(getLayoutHTML());
	populateTrainerHTML();
	populateOptionsHTML();

	functionizer("#" + playStopTrg, "start()", playChar);
	
	soroban = new Abacus(sorobanTrg, "soroban", 5, "Soroban", 0, "img/");
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
	
	running = true;

	functionizer("#" + playStopTrg, "stop()", stopChar);

	generateArray();
	run();
}

function stop() {

	speechSynthesis.cancel();
	soroban.reset();
	running = false;
	
	functionizer("#" + playStopTrg, "start()", playChar);
}

function run(j, i, tmp) {
	
	j = (j == undefined) ? 0 : j;
	i = (i == undefined) ? 0 : i;
	count = tmp || 0;	
	
	if(running) {
		if(j > series[i].length-1) {
			j = 0;
			i++;
			count = 0;
			soroban.reset();
		}
		if(i < series.length) {
			if(j == 0)
				$("#text-of-calculation").text(series[i][0]);
			
			var num = String(series[i][j]).replace(" ", "");
			if(!isNaN(num) && j < series[i].length-1) {
				count += Number(num);
				soroban.reset();
				soroban.assignstring(count);
			}

			var newUtt = new SpeechSynthesisUtterance(),
				sel = engine.voice["value"];
			newUtt.text = series[i][j]; 
			newUtt.voice = engine.voice["selection"][sel]; 
			newUtt.rate = engine.rate["value"];
			newUtt.onend = function() {run(j+1, i, count)};
			console.log(newUtt);
			speechSynthesis.speak(newUtt);
		} else {
			stop();
		}
	}
}