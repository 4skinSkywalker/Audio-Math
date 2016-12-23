function AudioMath(name, optionsTrg, trainerTrg) {
	this.name 			= name;
	this.optionsTrg 	= optionsTrg;
	this.trainerTrg		= trainerTrg;
	this.rowsTrg 		= "rows";
	this.digitsTrg 		= "digits";
	this.operationTrg 	= "operation";
	this.rateTrg		= "rate";
	this.voiceTrg		= "voice";
	this.sorobanTrg		= "soroban";
	this.running 		= false;
	this.rows			= 40;
	this.digits			= 2;
	this.rate			= "1.0";
	this.operation		= "+";
	this.voice			= 0;
	this.series 		= [];
	this.soroban 		= new Abacus(this.sorobanTrg, this.name, 5, "Soroban", 0, "soroban/", "no-bead.png", "middle-rod.png");
}

AudioMath.prototype.getOptionsHTML = function() {
	var s = "";
	s += '<li class="nav-item">';
	s += 	'<span class="range-label">Rows: </span><span id="' + this.rowsTrg + '-span" class="range-label">' + this.rows + '</span>';
	s +=	'<input type="range" class="slider" id="' + this.rowsTrg + '" min="1" max="500" step="1" value="' + this.rows + '">';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<span class="range-label">Digits: </span><span id="' + this.digitsTrg + '-span" class="range-label">' + this.digits + '</span>';
	s +=	'<input type="range" class="slider" id="' + this.digitsTrg + '" min="2" max="4" step="1" value="' + this.digits + '">';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<span class="range-label">Speech rate: </span><span id="' + this.rateTrg + '-span" class="range-label">' + this.rate + '</span>';
	s +=	'<input type="range" class="slider" id="' + this.rateTrg + '" min="0.1" max="3" step="0.1" value="' + this.rate + '">';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.operationTrg + '">Operation</label>';
	s +=	'<select class="option" id="' + this.operationTrg + '">';
	s +=		'<option>+</option>';
	s +=		'<option>-</option>';
	s +=	'</select>';
	s += '</li>';
	s += '<li class="nav-item">';
	s += 	'<label for="' + this.voiceTrg + '">Voice</label>';
	s += 	'<select class="option" id="' + this.voiceTrg + '"></select>';
	s += '</li>';
	return s;
};

AudioMath.prototype.getTrainerHTML = function() {
    var s = "";
	s += '<div style="position: absolute; top: 50%; left: 50%; text-align: center; transform: translate(-50%, -50%);" id="' + this.sorobanTrg + '"></div>';
	s += '<div id="dashboard">'
	s +=	'<input id="new" class="btn-standard" type="button" value="New" onclick="' + this.name + '.new();"/>'
	s +=	'<input id="stop-continue" class="btn-standard" type="button" value="Stop"/>'
	s += '</div>'
    return s;
}

AudioMath.prototype.randomNumber = function(negative, partial) {

	if(this.operation == "-" && negative)
		return Math.floor(Math.random() * partial + 1);
	else
		return Math.floor(Math.random() * 9 * Math.pow(10, this.digits - 1) + Math.pow(10, this.digits - 1));
};

AudioMath.prototype.generateArray = function() {
	
	this.series = [];
	
	for(var i = 0; i < this.rows; i++) {
		var procedure = [],
			sign = (this.operation == "+")? "+ ": "-";
			
		var first 	= this.randomNumber(0, 0),
			second 	= this.randomNumber(1, first);
			
		if(this.operation == "+") {
			if(first % 10 == 0) {
				var c = second;
				second = first;
				first = c;
			}
		}
		
		var broken = [];
		(function breakDown(num) {
			if(num<=0) return false;
			num = num.toFixed(0);

			var divisor = Math.pow(10, num.length-1),
				quotient = Math.floor(num/divisor);

			broken.push(divisor*quotient);
			breakDown(num % divisor);
		})(second);
		
		procedure.push(first + " " + sign + second + " =");
		procedure.push(first);
		for(var j = 0; j < broken.length; j++) {
			
			if(broken[j]) {
				procedure.push(sign + broken[j]);
			}
		}
		procedure.push("=");	
		procedure.push(eval(first + this.operation + second));
		this.series.push(procedure);
	}
	return this.series;
};

AudioMath.prototype.init = function() {
	_this = this;
	
	speechSynthesis.cancel();
	
	$(this.trainerTrg).append(this.getTrainerHTML());
	$(this.optionsTrg).append(this.getOptionsHTML());
	
	$('#stop-continue').attr("onclick", this.name + ".stop()");
	
	$(".option").each(function() {
		$(this).change(function() { 
			_this.operation = $("#" + _this.operationTrg).val();
			_this.voice	= $("#" + _this.voiceTrg).find("option:selected").attr("data-index");
		});
	});
	$(document).on("input change", "#"+_this.rowsTrg, function() {
		_this.rows 	= Number($("#" + _this.rowsTrg).val());
		$("#" + _this.rowsTrg + "-span").text(_this.rows);
	});
	$(document).on("input change", "#"+_this.digitsTrg, function() {
		_this.digits = Number($("#" + _this.digitsTrg).val());
		$("#" + _this.digitsTrg + "-span").text(_this.digits);
	});	
	$(document).on("input change", "#"+_this.rateTrg, function() {
		_this.rate = Number($(this).val());
		$("#" + _this.rateTrg + "-span").text(_this.rate);
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
	
	var imgs = [
		"soroban/off/upper-bead-off.png",
		"soroban/off/lower-bead-off1.png",
		"soroban/off/lower-bead-off2.png",
		"soroban/off/lower-bead-off3.png",
		"soroban/off/lower-bead-off4.png",
		"soroban/on/upper-bead-on.png",
		"soroban/on/lower-bead-on1.png",
		"soroban/on/lower-bead-on2.png",
		"soroban/on/lower-bead-on3.png",
		"soroban/on/lower-bead-on4.png"
	];

	$.each(imgs, function(i, url) {
		(new Image()).src = url; 
		console.log("loaded image #" + i + ": " + url);
	});

	this.soroban.htmldraw();
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
			$('#stop-continue').prop("onclick", null).attr("onclick", this.name + ".stop()");
			$("#stop-continue").val("Stop");
			
			this.generateArray();
			this.run();
		}
	);
};

AudioMath.prototype.stop = function() {
	if(this.series.length > 0) {
		if(this.running) {
			speechSynthesis.cancel();
			this.running = false;
			
			$("#new").prop("disabled", false);
			$('#stop-continue').prop("onclick", null).attr("onclick", this.name + ".continue()");
			$("#stop-continue").val("Continue");
		}
	} else {
		alert("Nothing to stop, click on New.");
	}
};

AudioMath.prototype.continue = function() {
	if(this.series.length > 0) {
		if(!this.running) {
			this.running = true;
			
			$("#new").prop("disabled", true);
			$('#stop-continue').prop("onclick", null).attr("onclick", this.name + ".stop()");
			$("#stop-continue").val("Stop");
			
			this.run(this.j, this.i, this.count);
		}
	}
};

AudioMath.prototype.run = function(j, i, tmp) {
	
	this.j = (j == undefined) ? 0 : j;
	this.i = (i == undefined) ? 0 : i;
	this.count = tmp || 0;
	
	if(this.running) {
		if(this.j > this.series[this.i].length-1) {
			this.j = 0;
			this.i++;
			this.count = 0;
			this.soroban.reset();
		}
		if(this.i < this.series.length) {
			var num = String(this.series[this.i][this.j]).replace(" ", "");
			if(!isNaN(num) && this.j < this.series[this.i].length-1) {
				this.count += Number(num);
				this.soroban.reset();
				this.soroban.assignstring(this.count);
			}
			var newUtt = new SpeechSynthesisUtterance();
			newUtt.text = this.series[this.i][this.j]; 
			newUtt.voice = this.voiceList[this.voice]; 
			newUtt.rate = this.rate;
			newUtt.onend = this.run.bind(this, this.j+1, this.i, this.count);
			console.log(newUtt);
			speechSynthesis.speak(newUtt);
		} else {
			this.stop();
		}
	}
};

// START SOROBAN SCRIPT //
//
function Abacus(target, nm, nc, abtype, iv, imagep, noBeadPic, middleRod) {
    this.target = target;
	this.v029 = 0;
    this.abacusname = nm + ".soroban";
    this.v018 = nc;
    this.imagepath = imagep;
    if (abtype == "Soroban") {
        this.v026 = "S";
        this.v017 = 1;
        this.v027 = 4;
    } else {
        this.v026 = "C";
        this.v017 = 2;
        this.v027 = 5;
    }
    this.v022 = new Array();
    this.currentvalue = iv;
	this.upperBeadOnPic = this.imagepath + "on/upper-bead-on.png"
	this.lowerBeadOnPic = this.imagepath + "on/lower-bead-on"
	this.upperBeadOffPic = this.imagepath + "off/upper-bead-off.png"
	this.lowerBeadOffPic = this.imagepath + "off/lower-bead-off"
    this.v031 = this.imagepath + noBeadPic;
    this.v040 = this.imagepath + middleRod;
    this.assignstring = v045;
    this.htmldraw = v046;
    this.v039 = v042;
    this.v023 = v044;
    this.v024 = v043;
    this.isallowed = v041;
    this.reset = v047;
    for (i = 0; i < this.v018; i++) {
        this.v022[i] = new v048(this.v017, this.v027, 0, 0);
    }
    this.assignstring(Number(iv).toString(10));
    return;
}

function v041(v009) {
    v009 = (v009) ? v009 : event;
    var charCode = (v009.charCode) ? v009.charCode : ((v009.keyCode) ? v009.keyCode : ((v009.which) ? v009.which : 0));
    if ((charCode <= 31 || (charCode >= 48 && charCode <= 57)) || (this.v026 == 'C' && (charCode >= 65 && charCode <= 70))) {
        return true;
    }
    return false;
}

function v042(v011) {
    var v010 = v011;
    v012 = v010.substring(0, 1);
    v013 = v010.slice(1);
    v014 = v013.split('-');
    v015 = parseInt(v014[0]);
    v016 = parseInt(v014[1]);
    if (((v012 == "T") && (this.v017 - this.v022[v016].v020 + 1) != v015) || ((v012 == "B") && (v015 != this.v022[v016].v019 + 1))) {
        if (v012 == "T") {
            this.v022[v016].v020 = (this.v017 - v015 + 1);
        } else {
            this.v022[v016].v019 = (v015 - 1);
        }
    }
    this.v023();
    this.v024();
    return;
}

function v043() {
    var value = 0;
    var v025 = "";
    if (this.v026 == "C") {
        for (i = this.v018 - 1; i >= 0; i--) {
            v028 = (this.v022[i].v019 + (this.v022[i].v020 * this.v027));
            v025 += "0123456789ABCDEF".charAt(parseInt(v028));
        }
    }
    if (this.v026 == "S") {
        for (i = this.v018 - 1; i >= 0; i--) {
            v025 += (this.v022[i].v019 + (this.v022[i].v020 * (this.v027 + 1)));
        }
    }
    this.currentvaluestring = v025;
    this.currentvalue = parseInt(v025);
    return;
}

function v044() {
    if (this.v029 == 1) {
        for (v015 = 1; v015 < this.v017 + 2; v015++) {
            for (v016 = this.v018 - 1; v016 >= 0; --v016) {
                v030 = "T" + v015 + "-" + v016 + "-" + this.abacusname;
                if ((this.v017 - this.v022[v016].v020) > (v015 - 1)) {
                    document.images[v030].src = this.upperBeadOffPic;
                } else if ((this.v017 - this.v022[v016].v020) < (v015 - 1)) {
                    document.images[v030].src = this.upperBeadOnPic;
                } else {
                    document.images[v030].src = this.v031;
                }
            }
        }
        for (v015 = 1; v015 < this.v027 + 2; v015++) {
            for (v016 = this.v018 - 1; v016 >= 0; --v016) {
                v030 = "B" + v015 + "-" + v016 + "-" + this.abacusname;
                if (v015 > this.v022[v016].v019 + 1) {
                    document.images[v030].src = this.lowerBeadOffPic + (v015-1) + ".png";
                } else if (v015 < this.v022[v016].v019 + 1) {
                    document.images[v030].src = this.lowerBeadOnPic + v015 + ".png";
                } else {
                    document.images[v030].src = this.v031;
                }
            }
        }
    }
    return;
}

function v045(v033) {
    v034 = this.v018 - v033.length;
    v033 = "0000000000000000000000000000000000000000000000000000000000000000000000".substr(0, v034).concat(v033);
    if (this.v026 == "S") {
        for (i = v033.length; i != 0; --i) {
            v037 = v033.length - i;
            v035 = parseInt(v033.substring(i - 1, i));
            if (v035 > this.v027) {
                this.v022[v037].v020 = 1;
                this.v022[v037].v019 = v035 - this.v027 - 1;
            } else {
                this.v022[v037].v020 = 0;
                this.v022[v037].v019 = v035;
            }
        }
    } else if (this.v026 == "C") {
        for (i = v033.length; i != 0; --i) {
            if (!(this.currentvaluestring) || (v033.charAt(i - 1) != this.currentvaluestring.charAt(i - 1))) {
                v037 = v033.length - i;
                v035 = parseInt(v033.substring(i - 1, i), 16);
                if (v035 == this.v027 + (this.v017 * this.v027)) {
                    this.v022[v037].v020 = this.v017;
                    this.v022[v037].v019 = this.v027;
                } else if (v035 >= this.v027) {
                    this.v022[v037].v020 = Math.floor(v035 / this.v027);
                    this.v022[v037].v019 = v035 - this.v027 * this.v022[v037].v020;
                } else {
                    this.v022[v037].v020 = 0;
                    this.v022[v037].v019 = v035;
                }
            }
        }
    }
    this.v023();
    this.currentvaluestring = v033;
    return;
}

function v046(v022) {
    if (v022 !== undefined) this.v018 = v022;
    var v036 = this.v017;
    var v021 = this.v018;
	var code = "";
	code += '<table class="soroban-upper" cellpadding=0 cellspacing=0>';
    for (v015 = 1; v015 < v036 + 2; v015++) {
        code += "<tr>";
        for (v016 = v021 - 1; v016 >= 0; --v016) {
            code += "<td>";
            if ((this.v017 - this.v022[v016].v020) != (v015 - 1)) {
				code += "<img name='T" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.upperBeadOffPic + " onClick=" + this.abacusname + ".v039(this.name)>";
			} else {
				code += "<img name='T" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.v031 + " onClick=" + this.abacusname + ".v039(this.name)>";
			}
            code += "</td>";
        }
        code += "</tr>";
    }
    code += "</table>";
    v036 = this.v027;
    code += '<table class="soroban-lower" cellpadding=0 cellspacing=0>';
    for (v015 = 0; v015 < v036 + 2; v015++) {
        if (v015 == 0) 
			code += '<tr style="line-height:6px;">';
        else 
			code += "<tr>";
        for (v016 = v021 - 1; v016 >= 0; --v016) {
            code += "<td>";
            if (v015 == 0) {
                code += "<img src=" + this.v040 + ">";
            } else {
                if (v015 != this.v022[v016].v019 + 1) {
                    code += "<img name='B" + v015 + "-" + v016 + "-" + this.abacusname + "' src='" + this.lowerBeadOffPic + (v015-1) + ".png' onClick=" + this.abacusname + ".v039(this.name)>";
                } else {
                    code += "<img name='B" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.v031 + " onClick=" + this.abacusname + ".v039(this.name)>";
                }
            }
            code += "</td>";
        }
        code += "</tr>";
    }
    code += "</table>";
	$("#" + this.target).append(code);
    this.v029 = 1;
    return;
}

function v047() {
    this.assignstring("0");
}

function v048(tb, bb, bd, bu) {
    this.v017 = tb;
    this.v027 = bb;
    this.v020 = bd;
    this.v019 = bu;
    return;
}
//
// END SOROBAN SCRIPT //