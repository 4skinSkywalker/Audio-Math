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
	this.stepsTrg 		= "steps";
	this.voiceTrg		= "voice-list";
	this.sorobanTrg		= "calculator";
	this.running 		= false;
	this.rows			= 40;
	this.n1min 			= 10;
	this.n2min 			= 10;
	this.n1MAX	 		= 99;
	this.n2MAX	 		= 99;
	this.rate			= 1;
	this.steps			= "Beginner";
	this.voice			= 0;
	this.series 		= [];
	this.soroban 		= new Abacus(this.sorobanTrg, this.name + ".soroban", 7, "Soroban", 0, "soroban/", "Soroban_image_bead.png", "Soroban_image_nobead.png", "Soroban_image_bottomborder.png", "Soroban_image_middlesep.png", "Soroban_image_top.png");
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
	s += 	'<label for="' + this.stepsTrg + '">Visualization</label>';
	s +=	'<select class="option" id="' + this.stepsTrg + '">';
	s +=		'<option>Beginner</option>';
	s += 		'<option>Advanced</option>';
	s +=		'<option>Master</option>';
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
	s += '<div id="' + this.sorobanTrg + '"></div>';
	s += '<div id="dashboard">'
	s +=	'<input id="new" class="btn-standard" type="button" value="New" onclick="' + this.name + '.new();"/>'
	s +=	'<input class="btn-standard" type="button" value="Replay" onclick="' + this.name + '.replay();"/>'
	s +=	'<input id="stop-continue" class="btn-standard" type="button" value="Stop"/>'
	//s +=	'<input class="btn-standard" type="button" value="Reset" onclick="' + this.name + '.soroban.reset();"/>'
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
		if(this.n1MAX - this.n1min > 9 && this.n2MAX - this.n2min > 9) {
			
			var first 	= this.randomNumber(this.n1min, this.n1MAX),
				second 	= this.randomNumber(this.n2min, this.n2MAX);
			
			if(first % 10 == 0){
				var c = second;
				second = first;
				first = c;
			}
			
			var broken = [];
			(function breakDown(num){
				
				if(num<=0) return false;
				num = num.toFixed(0);

				var divisor = Math.pow(10, num.length-1),
					quotient = Math.floor(num/divisor);

				broken.push(divisor*quotient);
				breakDown(num % divisor);
			})(second);
			
			procedure.push(first + " + " + second);
			procedure.push("=");
				
			if(this.steps == "Beginner") {

				procedure.push(first);
				for(var j = 0; j < broken.length; j++) {
					
					if(broken[j]) {
						procedure.push("+");
						procedure.push(broken[j]);
					}
				}
				procedure.push("=");
				
			} else if(this.steps == "Advanced") {
				
				var tmp = first;
				for(var j = 0; j < broken.length; j++) {
					tmp = tmp + broken[j];
					if(broken[j+1]) {
						procedure.push(tmp);
						procedure.push("+");
						procedure.push(broken[j+1]);
						procedure.push("=");
					}
				}
			} else {
				procedure.push("=");
			}
			procedure.push(first + second);
			this.series.push(procedure);
		} else {
			
			var first 	= this.randomNumber(this.n1min, this.n1MAX),
				second 	= this.randomNumber(this.n2min, this.n2MAX);
				
			procedure.push(first);
			procedure.push("+");
			procedure.push(second);
			procedure.push("=");
			procedure.push(first + second);
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
	
	$('#stop-continue').attr("onclick", this.name + ".stop()");
	
	$(".option").each(function() {
		$(this).change(function() { 

			_this.rows 			= Number($("#" + _this.rowsTrg).val());
			_this.n1min 		= Number($("#" + _this.n1minTrg).val());
			_this.n2min 		= Number($("#" + _this.n2minTrg).val());
			_this.n1MAX 		= Number($("#" + _this.n1MAXTrg).val());
			_this.n2MAX 		= Number($("#" + _this.n2MAXTrg).val());
			_this.steps 		= $("#" + _this.stepsTrg).val();
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

AudioMath.prototype.replay = function() {
	
	if(this.series.length > 0) {
		this.isRunning(
			function() {
				
				this.running = true;
				$("#new").prop("disabled", true);
				$('#stop-continue').prop("onclick", null).attr("onclick", this.name + ".stop()");
				$("#stop-continue").val("Stop");
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
			$('#stop-continue').prop("onclick", null).attr("onclick", this.name + ".continue()");
			$("#stop-continue").val("Continue");
		} else {
			alert("Already stopped.");
		}
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
		if(this.j >= this.series[this.i].length) {
			
			this.j = 0;
			this.i++;
			this.count = 0;
			this.soroban.reset();
		}
		
		if(this.i < this.series.length) {
			if(!isNaN(this.series[this.i][this.j])) {
				
				if((this.n1MAX - this.n1min > 9 && this.n2MAX - this.n2min > 9 && this.j > 0 && this.j < this.series[this.i].length-1) || ((this.n1MAX - this.n1min < 9 || this.n2MAX - this.n2min < 9) && this.j < this.series[this.i].length-2)) {
					
					this.count += this.series[this.i][this.j];
					this.soroban.assignstring(this.count);
				}
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
function Abacus(target, nm, nc, abtype, iv, imagep, beadpic, nobeadpic, basepic, middlepic, toppic) {
    this.target = target;
	this.v029 = 0;
    this.abacusname = nm;
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
    this.v032 = this.imagepath + beadpic;
    this.v031 = this.imagepath + nobeadpic;
    //this.basepath = this.imagepath + basepic;
    this.v040 = this.imagepath + middlepic;
    //this.v038 = this.imagepath + toppic;
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
                if ((this.v017 - this.v022[v016].v020) != (v015 - 1)) {
                    document.images[v030].src = this.v032;
                } else {
                    document.images[v030].src = this.v031;
                }
            }
        }
        for (v015 = 1; v015 < this.v027 + 2; v015++) {
            for (v016 = this.v018 - 1; v016 >= 0; --v016) {
                v030 = "B" + v015 + "-" + v016 + "-" + this.abacusname;
                if (v015 != this.v022[v016].v019 + 1) {
                    document.images[v030].src = this.v032;
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
    code += "<tr><td><table cellpadding=0 cellspacing=0>";
    for (v015 = 0; v015 < v036 + 2; v015++) {
        code += "<tr>";
        for (v016 = v021 - 1; v016 >= 0; --v016) {
            code += "<td>";
            if (v015 == 0) {
                //code += "<img src=" + this.v038 + ">";
            } else {
                if ((this.v017 - this.v022[v016].v020) != (v015 - 1)) {
                    code += "<img name='T" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.v032 + " onClick=" + this.abacusname + ".v039(this.name)>";
                } else {
                    code += "<img name='T" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.v031 + " onClick=" + this.abacusname + ".v039(this.name)>";
                }
            }
            code += "</td>";
        }
        code += "</tr>";
    }
    code += "</table>";
    v036 = this.v027;
    code += "<table cellpadding=0 cellspacing=0>";
    for (v015 = 0; v015 < v036 + 3; v015++) {
        if (v015 == 0) 
			code += '<tr style="line-height:6px;">';
        else 
			code += "<tr>";
        for (v016 = v021 - 1; v016 >= 0; --v016) {
            code += "<td>";
            if (v015 == 0) {
                code += "<img src=" + this.v040 + ">";
            } else if (v015 == v036 + 2) {
                //code += "<img src=" + this.basepath + ">";
            } else {
                if (v015 != this.v022[v016].v019 + 1) {
                    code += "<img name='B" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.v032 + " onClick=" + this.abacusname + ".v039(this.name)>";
                } else {
                    code += "<img name='B" + v015 + "-" + v016 + "-" + this.abacusname + "' src=" + this.v031 + " onClick=" + this.abacusname + ".v039(this.name)>";
                }
            }
            code += "</td>";
        }
        code += "</tr>";
    }
    code += "</table>";
	code += "</td></tr></table>";
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