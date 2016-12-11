function AudioMath(name, optionsTrg, trainerTrg) {

	this.name 			= name;
	this.optionsTrg 	= optionsTrg;
	this.trainerTrg		= trainerTrg;
	this.rowsTrg 		= "rows";
	this.n1minTrg 		= "first-min";
	this.n2minTrg 		= "second-min";
	this.n1MAXTrg 		= "first-MAX";
	this.n2MAXTrg 		= "second-MAX";
	this.rateTrg		= "rate";
	this.stepTrg 		= "step-by-step";
	this.timesSymbolTrg = "times-symbol";
	this.equalSymbolTrg	= "equal-symbol";
	this.operationTrg 	= "operation";
	this.voiceTrg		= "voice-list";
	this.running 		= false;
	this.rows			= 40;
	this.n1min 			= 10;
	this.n2min 			= 10;
	this.n1MAX	 		= 99;
	this.n2MAX	 		= 99;
	this.rate			= 1;
	this.step			= "Yes";
	this.timesSymbol	= "per";
	this.equalSymbol	= "=";
	this.operation		= "+";
	this.voice			= 0;
	this.series 		= [];
}

AudioMath.prototype.getOptionsHTML = function() {
	var s = "";
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.rowsTrg + '">Rows</label>';
	s += 	'<input type="text" class="option numpad" id="' + this.rowsTrg + '" value="40"/>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label class="block" for="' + this.n1Trg + '">Number 1 range:</label>';
	s += 	'<input type="text" class="option numpad range min" id="' + this.n1minTrg + '" value="' + this.n1min + '"/>';
	s += 	'<input type="text" class="option numpad range MAX" id="' + this.n1MAXTrg + '" value="' + this.n1MAX + '"/>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label class="block" for="' + this.n2Trg + '">Number 2 range:</label>';
	s += 	'<input type="text" class="option numpad range min" id="' + this.n2minTrg + '" value="' + this.n2min + '"/>';
	s += 	'<input type="text" class="option numpad range MAX" id="' + this.n2MAXTrg + '" value="' + this.n2MAX + '"/>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.rateTrg + '">Speech rate</label>';
	s +=	'<input type="range" class="slider" id="' + this.rateTrg + '" min="0.33" max="3.33" step="0.001" value="' + this.rate + '">';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.stepTrg + '">Step by step?</label>';
	s +=	'<select class="option" id="' + this.stepTrg + '">';
	s +=		'<option>Yes</option>';
	s +=		'<option>No</option>';
	s +=	'</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.timesSymbolTrg + '">Multiplication symbol</label>';
	s +=	'<select class="option" id="' + this.timesSymbolTrg + '">';
	s +=		'<option>per</option>';
	s +=		'<option>times</option>';
	s +=	'</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.equalSymbolTrg + '">Equal symbol</label>';
	s +=	'<select class="option" id="' + this.equalSymbolTrg + '">';
	s +=		'<option>=</option>';
	s +=		'<option>è</option>';
	s +=		'<option>es</option>';
	s +=		'<option>est</option>';
	s +=		'<option>ist</option>';
	s +=		'<option>is</option>';
	s +=	'</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.operationTrg + '">Operation</label>';
	s +=	'<select class="option" id="' + this.operationTrg + '">';
	s +=		'<option>+</option>';
	s +=		'<option>*</option>';
	s +=    '</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.voiceTrg + '">Voice</label>';
	s += 	'<select class="option" id="' + this.voiceTrg + '"></select>';
	s += '</li>';
	return s;
};

AudioMath.prototype.getTrainerHTML = function() {
    var s = "";
	s += '<div id="trainer"></div>';
	s += '<div id="dashboard">'
	s +=	'<input id="new" class="btn-standard" type="button" value="New" onclick="' + this.name + '.new();"/>'
	s +=	'<input class="btn-standard" type="button" value="Replay" onclick="' + this.name + '.replay();"/>'
	s +=	'<input class="btn-standard" type="button" value="Stop" onclick="' + this.name + '.stop();"/>'
	s += '</div>'
    return s;
}

AudioMath.prototype.randomNumber = function(min, MAX) {
	return Math.floor(Math.random() * (MAX - min + 1)) + min;
};

AudioMath.prototype.generateArray = function() {
	
	this.series = [];
	
	for(var i = 0; i < this.rows; i++) {
		var procedure = [];
		
		if(this.n1min > 9 &&  this.n2min > 9 && this.step == "Yes" && this.operation == "+") {
			
			var first 	= this.randomNumber(this.n1min, this.n1MAX),
				second 	= this.randomNumber(this.n2min, this.n2MAX);
			if(first % 10 == 0){
				var c = second;
				second = first;
				first = c;
			}
			
			var broken = [];
			(function breakDown(num){
				
				if(num<=0)return false;
				num = num.toFixed(0);

				var divisor = Math.pow(10, num.length-1),
					quotient = Math.floor(num/divisor);

				broken.push(divisor*quotient);
				breakDown(num % divisor);
			})(second);
			
			procedure.push(first + " + " + second);
			procedure.push(" " + this.equalSymbol + " ");
			var tmp = first;
			for(var j = 0; j < broken.length; j++) {
				
				tmp = tmp + broken[j];
				if(broken[j+1]) {
					procedure.push(tmp + " + " + broken[j+1]);
					procedure.push(this.equalSymbol);
				}
			}
			procedure.push(eval(first + second));
			this.series.push(procedure);

		} else {
			
			var first 	= this.randomNumber(this.n1min, this.n1MAX),
				second 	= this.randomNumber(this.n2min, this.n2MAX),
				readableSecond = (this.operation == "*") ? " " + this.timesSymbol + " " + second : " " + this.operation + " " + second;
				
			procedure.push(first + readableSecond);
			procedure.push(this.equalSymbol);
			procedure.push(eval(first + this.operation + second));
			this.series.push(procedure);
		}
	}
	
	return this.series;
};

AudioMath.prototype.init = function() {
	_this = this;
	
	speechSynthesis.cancel();
	
	$(this.trainerTrg).append(this.getTrainerHTML());
	$(this.optionsTrg).append(this.getOptionsHTML());
	
	$(".option").each(function() {
		$(this).change(function() { 

			_this.rows 			= Number($("#" + _this.rowsTrg).val());
			_this.n1min 		= Number($("#" + _this.n1minTrg).val());
			_this.n2min 		= Number($("#" + _this.n2minTrg).val());
			_this.n1MAX 		= Number($("#" + _this.n1MAXTrg).val());
			_this.n2MAX 		= Number($("#" + _this.n2MAXTrg).val());
			_this.step 			= $("#" + _this.stepTrg).val();
			_this.timesSymbol 	= $("#" + _this.timesSymbolTrg).val();
			_this.equalSymbol 	= $("#" + _this.equalSymbolTrg).val();
			_this.operation 	= $("#" + _this.operationTrg).val();
			_this.voice			= $("#" + _this.voiceTrg).find("option:selected").attr("data-index");
		});
	});
	
	$(document).on("input change", "#"+_this.rateTrg, function() {
		
		_this.rate = Number($(this).val());
	});
	
	function populateVoiceList() {

		if(!$("#" + _this.voiceTrg).val()) {
			
			_this.voiceList = speechSynthesis.getVoices();
			
			$.each(_this.voiceList, function(index, value) {
				$("#" + _this.voiceTrg).append("<option data-index=" + index + ">" + value.name.replace(/Google/g, "") + "</option>");
			});
		}
	}

	populateVoiceList();
	if(speechSynthesis.onvoiceschanged !== undefined) {
		speechSynthesis.onvoiceschanged = populateVoiceList;
	}
};

AudioMath.prototype.isRunning = function(func) {
	
	if(!this.running) {
		
		speechSynthesis.cancel();
		func.bind(this)();
	} else {
		alert("Running. Please wait or stop it!");
	}
};

AudioMath.prototype.new = function() {
	
	this.isRunning(
		function() {
			
			this.running = true;
			$("#new").prop("disabled", true);
			
			this.generateArray();
			this.run();
		}
	);
};

AudioMath.prototype.replay = function() {
	
	if(this.series.length > 0) {
		this.isRunning(
			function() {
				
				this.running = true;
				$("#new").prop("disabled", true);

				this.run();
			}
		);
	} else {
		alert("Nothing to repeat, click on New.");
	}
};

AudioMath.prototype.stop = function() {
	
	if(this.series.length > 0) {
		if(this.running) {

			speechSynthesis.cancel();
			
			this.running = false;
			$("#new").prop("disabled", false);	
		} else {
			alert("Already stopped.");
		}
	}
};

AudioMath.prototype.run = function(j, i) {
	
	this.j = (j == undefined) ? 0 : j;
	this.i = (i == undefined) ? 0 : i;
	
	if(this.i < this.series.length) {
		if(this.running) {
			if(this.j >= this.series[this.i].length) {
				this.j = 0;
				this.i++;
			}

			$("#trainer").text(this.series[this.i][this.j]);
			var newUtt = new SpeechSynthesisUtterance();
			newUtt.text = this.series[this.i][this.j]; 
			newUtt.voice = this.voiceList[this.voice]; 
			newUtt.rate = this.rate;
			newUtt.onend = this.run.bind(this, this.j+1, this.i);
			console.log(newUtt);
			speechSynthesis.speak(newUtt);
		}
	} else {
		
		this.running = false;
		$("#trainer").text("");
	}
};