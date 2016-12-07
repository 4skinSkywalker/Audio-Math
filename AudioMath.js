function AudioMath(name, optionsTrg, trainerTrg) {

	this.name 			= name;
	this.optionsTrg 	= optionsTrg;
	this.trainerTrg		= trainerTrg;
	this.rowsTrg 		= "rows";
	this.digitsTrg 		= "digits";
	this.rateTrg		= "rate";
	this.stepTrg 		= "step-by-step";
	this.powTrg 		= "enable-power";
	this.equalCharTrg	= "equal-char";
	this.operationTrg 	= "operation";
	this.voiceTrg		= "voice-list";
	this.running 		= false;
	this.rows			= 40;
	this.digits 		= 1;
	this.rate			= 1;
	this.step			= "Yes";
	this.powerOfTen		= "No";
	this.equalChar		= "=";
	this.operation		= "+";
	this.voice			= 0;
	this.series 		= [];
}

AudioMath.prototype.speechUtteranceChunker = function (utt, settings, callback) {
	_this = this;
	
    settings = settings || {};
    var chunkLength = settings && settings.chunkLength || 130;
    var pattRegex = new RegExp("^.{" + Math.floor(chunkLength / 2) + "," + chunkLength + "}[\.\!\?\,]{1}|^.{1," + chunkLength + "}$|^.{1," + chunkLength + "} ");
    var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);
    var chunkArr = txt.match(pattRegex);

    if(chunkArr !== null) {
		if(chunkArr[0].length > 2) {
		
			var chunk = chunkArr[0].trim();
			var newUtt = new SpeechSynthesisUtterance(chunk);
			
			for(x in settings)
				if(settings.hasOwnProperty(x) && x != "text")
				   newUtt[x] = settings[x];

			newUtt.onend = function() {
				settings.offset = settings.offset || 0;
				settings.offset += chunk.length + 1;
				_this.speechUtteranceChunker(utt, settings, callback);
			}
			
			console.log(newUtt);
			
			if(this.running)
				setTimeout(function() {
					speechSynthesis.speak(newUtt);
				}, 0);
		}
    } else {
        if(callback !== undefined)
            callback();
    }
};

AudioMath.prototype.getOptionsHTML = function() {
	var s = "";
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.rowsTrg + '">Rows</label>';
	s += 	'<input type="text" class="option numpad" id="' + this.rowsTrg + '" value="40"/>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.digitsTrg + '">Digits</label>';
	s += 	'<input type="text" class="option numpad" id="' + this.digitsTrg + '" value="1"/>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.powTrg + '">Power of ten?</label>';
	s +=	'<select class="option" id="' + this.powTrg + '">';
	s +=		'<option>No</option>';
	s +=		'<option>Yes</option>';
	s +=	'</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.rateTrg + '">Speech rate</label>';
	s +=	'<input type="range" class="slider" id="' + this.rateTrg + '" min="0.33" max="6.66" step="0.01" value="' + this.rate + '">';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.stepTrg + '">Step by step?</label>';
	s +=	'<select class="option" id="' + this.stepTrg + '">';
	s +=		'<option>Yes</option>';
	s +=		'<option>No</option>';
	s +=	'</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.equalCharTrg + '">Equal character</label>';
	s +=	'<select class="option" id="' + this.equalCharTrg + '">';
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
	s += '<div id="abacus"></div>'
	s += '<div id="dashboard">'
	s +=	'<input id="new" class="btn-standard" type="button" value="New" onclick="' + this.name + '.new();"/>'
	s +=	'<input class="btn-standard" type="button" value="Replay" onclick="' + this.name + '.replay();"/>'
	s +=	'<input class="btn-standard" type="button" value="Stop" onclick="' + this.name + '.stop();"/>'
	s += '</div>'
    return s;
}

AudioMath.prototype.randomNumber = function() {
	if(this.powerOfTen == "Yes")
		return Math.floor((Math.random() * 9) + 1) * Math.pow(10, this.digits - 1) ;
	else
		return Math.floor(Math.random() * 9 * Math.pow(10, this.digits - 1) + Math.pow(10, this.digits - 1));
};

AudioMath.prototype.generateArray = function() {
	
	this.series = [];
	
	for(var i = 0; i < this.rows; i++) {
		if(this.digits > 1 && this.operation != "*" && this.step == "Yes" && this.powOfTen != "Yes") {
			
			var first 	= this.randomNumber(this.digits),
				second 	= this.randomNumber(this.digits);
			
			var number = parseInt(second),
				broken = [];
			(function breakDown(num){
				
				if(num<=0)return false;
				num = num.toFixed(0);

				var divisor = Math.pow(10, num.length-1),
					quotient = Math.floor(num/divisor);

				broken.push(divisor*quotient);
				breakDown(num % divisor);
			})(number);
			
			this.series.push(first);
			this.series.push(" + ");
			this.series.push(second);
			this.series.push(" " + this.equalChar + " ");
			var tmp = first;
			for(var j = 0; j < broken.length; j++) {
				
				tmp = tmp + broken[j];
				this.series.push(tmp);
				if(broken[j+1]) {
					this.series.push(" + " + broken[j+1]);
					this.series.push(" " + this.equalChar + " ");
				}
			}

			if(i < this.rows - 1)
				this.series.push(", ");
		} else {
			
			var first 	= this.randomNumber(this.digits),
				second 	= this.randomNumber(this.digits);
				
			this.series.push(first);
			this.series.push((this.operation == "*") ? " per " : " " + this.operation + " ");
			this.series.push(second);
			this.series.push(" " + this.equalChar + " ");
			this.series.push(eval(first + this.operation + second));
			if(i < this.rows - 1)
				this.series.push(", ");
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
			_this.digits 		= Number($("#" + _this.digitsTrg).val());
			_this.step 			= $("#" + _this.stepTrg).val();
			_this.powerOfTen 	= $("#" + _this.powTrg).val();
			_this.equalChar 	= $("#" + _this.equalCharTrg).val();
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
			this.talk();
		}
	);
};

AudioMath.prototype.replay = function() {
	
	if(this.series.length > 0) {
		this.isRunning(
			function() {
				
				this.running = true;
				$("#new").prop("disabled", true);

				this.talk();
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

AudioMath.prototype.talk = function() {
	
	var utterance = new SpeechSynthesisUtterance(this.series.join(""));
	
	this.speechUtteranceChunker(utterance, {chunkLength: 58, voice: this.voiceList[this.voice], rate: this.rate}, this.stop.bind(this));
};