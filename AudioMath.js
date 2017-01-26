function Engine(name) {
    this.name = name;
    this.timeouts = [];
    this.calculations = {
        type: "range",
        target: "calculations",
        text: "Calculations:",
        value: 20,
        min: 20,
        step: 20,
        MAX: 100
    };
    this.numbers = {
        type: "range",
        target: "numbers",
        text: "Numbers:",
        value: 5,
        min: 2,
        step: 1,
        MAX: 10
    };
    this.digits = {
        type: "range",
        target: "digits",
        text: "Digits:",
        value: 1,
        min: 1,
        step: 1,
        MAX: 2
    };
    this.animation = {
        type: "range",
        target: "animation",
        text: "Animation:",
        value: 1,
        min: 0,
        step: 1,
        MAX: 1,
        "change": function (x) {
            return (x === 1) ? "on" : "off";
        }
    };
	this.calculationText = {
        type: "range",
        target: "calculation-text",
        text: "Text:",
        value: 1,
        min: 0,
        step: 1,
        MAX: 1,
        "change": function (x) {
            return (x === 1) ? "on" : "off";
        }
    };
    this.rate = {
        type: "range",
        target: "speech-rate",
        text: "Speech Rate:",
        value: 1.0,
        min: 0.5,
        step: 0.1,
        MAX: 2,
        "char": "%",
        "change": function (x) {
            return Math.round(x * 100);
        }
    };
    this.delay = {
        type: "range",
        target: "speech-delay",
        text: "Speech Delay:",
        value: 100,
        min: 0,
        step: 100,
        MAX: 1000,
        "char": "s",
        "change": function (x) {
            return x/1000;
        }
    };
    this.voice = {
        type: "selector",
        target: "speech-language",
        text: "Voice Language:",
        value: 0,
        selection: []
    };
    this.operation = {
        type: "selector",
        target: "operation",
        text: "Operation:",
        value: "+/-",
        selection: {
            "+/-": null,
            "+": null
        }
    };
}
Engine.prototype.getLayoutHTML = function () {
    var s = "";
    s += "<ul id=\"navigation\"></ul>";
    s += "<input type=\"checkbox\" id=\"nav-trigger\"/>";
    s += "<label for=\"nav-trigger\"></label>";
    s += "<div id=\"site-wrap\"></div>";
    return s;
};
Engine.prototype.populateNavigation = function () {
    var s = "";
	s += "<li class=\"nav-item\">";
    s += "<p id=\"title\">Audio Math</p>";
    s += "</li>";
    $("#navigation").append(s);
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            if (this[key].type === "range" || this[key].type === "selector") {
                if (this[key].type === "range") {
                    var ch = (this[key].char) ? this[key].char : "";
                    var txt = (this[key].change) ? this[key].change(this[key].value) + ch : this[key].value + ch;
                    s += "<li class=\"nav-item\">";
                    s += "<span class=\"range-label\">" + this[key].text + " </span><span id=" + this[key].target + "-span class=\"range-label\">" + txt + "</span>";
                    s += "<input type=\"range\" class=\"slider\" id=" + this[key].target + " min=" + this[key].min + " max=" + this[key].MAX + " step=" + this[key].step + " value=" + this[key].value + ">";
                    s += "</li>";
                } else if (this[key].type === "selector") {
                    s += "<li class=\"nav-item\">";
                    s += "<label for=" + this[key].target + ">" + this[key].text + "</label>";
                    s += "<select class=\"option\" id=" + this[key].target + ">";
                    for (var subkey in this[key].selection) {
                        s += "<option>" + subkey + "</option>";
                    }
                    s += "</select>";
                    s += "</li>";
                }
                $("#navigation").append(s);
                this.onSettingChange(this, key);
            }
        }
        s = "";
    }
    s += "<li class=\"nav-item\">";
    s += "<p>Look and listen,</br>or do it yourself</br></br></p>";
    s += "</li>";
    $("#navigation").append(s);
};
Engine.prototype.onSettingChange = function (obj, key) {
    var that = this;
    var el = "#" + obj[key].target;
    if (obj[key].type === "range") {
        this.onChangeAttacher(el, function () {
            obj[key].value = Number($("#" + obj[key].target).val());
            $("#" + obj[key].target + "-span").text(obj[key].value);
        });
    } else if (obj[key].type === "selector") {
        this.onChangeAttacher(el, function () {
            obj[key].value = $("#" + obj[key].target).val();
        });
    }
    if (obj[key].change || obj[key].char) {
        this.onChangeAttacher(el, function () {
            var ch = (obj[key].char) ? obj[key].char : "";
            var txt = (obj[key].change) ? obj[key].change(obj[key].value) + ch : obj[key].value + ch;
            $("#" + obj[key].target + "-span").text(txt);
        });
    }
};
Engine.prototype.onChangeAttacher = function (el, foo) {
    $(el).on("change", foo);
};
Engine.prototype.populateSiteWrap = function () {
    var s = "";
    s += "<div id=\"status-bar\"><div id=\"text-of-calculation\"></div></div>";
    s += "<button id=\"engine-button\" class=\"btn-standard\"></button>";
    s += "<div id=\"soroban-div\"></div>";
    $("#site-wrap").append(s);
};
Engine.prototype.functionizer = function (e, f, t) {
    $(e).prop("onclick", null).attr("onclick", f);
    $(e).text(t);
};
Engine.prototype.randomNumber = function (enable, partial) {
    var lower = Math.pow(10, this.digits.value - 1);
    if (enable && (partial - lower) > lower) {
        return -Math.floor(Math.random() * this.clamp(partial - lower) + lower);
    } else {
        return Math.floor(Math.random() * 9 * Math.pow(10, this.digits.value - 1) + lower);
    }
};
Engine.prototype.clamp = function (number) {
    var min = Math.pow(10, this.digits.value - 1);
    var MAX = 10 * Math.pow(10, this.digits.value - 1);
    if (number >= MAX) {
        return ((MAX - 1) - min);
    } else if (number <= min) {
        return (min + 1);
    } else {
        return number;
    }
};
Engine.prototype.generateArray = function () {
    var series = [];
    var strings = [];
    var procedures;
    var numbers;
    var sub = (this.operation.value === "+/-") ? true : false;
    var signs;
    var first;
    var next;
    var string;
    var count;
    for (var i = 0; i < this.calculations.value; i++) {
        procedures = [];
        numbers = [];
        signs = [];
        first = this.randomNumber(0, 0);
        next = 0;
        string = "";
        count = first;
        string += String(first);
        numbers.push(first);
        procedures.push(first);
        for (var j = 1; j < this.numbers.value; j++) {
            next = this.randomNumber(sub, count);
            count += next;
            sign = (next < 0) ? " -" : " +  ";
            signs.push(sign);
            string += sign + Math.abs(next);
            numbers.push(Math.abs(next));
            (function breakDown(num) {
                if (num <= 0) {
                    return false;
                }
                num = num.toFixed(0);
                var divisor = Math.pow(10, num.length - 1);
                var quotient = Math.floor(num / divisor);
                procedures.push(signs[j - 1] + divisor * quotient);
                breakDown(num % divisor);
            })(numbers[j]);
        }
        procedures.push(" = ");
        procedures.push(count);
        series.push(procedures);
        strings.push(string);
    }
    return series;
};
Engine.prototype.markupInit = function () {
    $("body").append(this.getLayoutHTML());
    this.populateNavigation();
    this.populateSiteWrap();
    this.functionizer("#engine-button", this.name + ".start()", "Play");
};
Engine.prototype.eventsInit = function () {
    var that = this;
    speechSynthesis.cancel();
    this.soroban = new Abacus("soroban-div", this.name + ".soroban", 3, "Soroban", 0, "img/");
    this.soroban.htmldraw();
    this.mainReset();
    (function populateVoiceList() {
        var retry = setInterval(function () {
            if (!$("#" + that.voice.target).val()) {
                that.voice.selection = speechSynthesis.getVoices();
                $.each(that.voice.selection, function (index, value) {
                    $("#" + that.voice.target).append("<option data-index=" + index + ">" + value.name.replace(/Google/g, "") + "</option>");
                });
            }
            if (that.voice.selection.length != 0) {
                console.log("voice ready")
                clearInterval(retry);
            }
        }, 10);
    })();
};
Engine.prototype.mainReset = function () {
    var that = this;
    this.running = false;
    speechSynthesis.cancel();
    this.clearingInterval = setInterval(function () {
        if (Number(that.soroban.currentvaluestring) <= 0 || that.soroban.currentvaluestring === undefined) {
            clearInterval(that.clearingInterval);
            console.log("soroban cleared");
        } else {
            that.soroban.reset();
        }
    }, 10);
    for (var i = 0; i < this.timeouts.length; i++) {
        clearTimeout(this.timeouts[i]);
        console.log("cleared timeout #" + this.timeouts[i]);
    }
    $("#text-of-calculation").text("");
};
Engine.prototype.start = function () {
    var that = this;
    this.running = true;
    setTimeout(function () {
        that.run.call(that, that.generateArray.call(that));
    }, 100);
    this.functionizer("#engine-button", this.name + ".stop()", "Stop");
};
Engine.prototype.stop = function () {
    this.mainReset();
    this.functionizer("#engine-button", this.name + ".start()", "Play");
};
Engine.prototype.run = function (array, tmp) {
    var that = this;
    var count = tmp || 0;
    if (this.running) {
        if (array[0].length === 0) {
            array.shift();
            count = 0;
            this.soroban.reset();
        }
        if (array.length > 0) {
            if (this.animation.value === 1) {
                var num = String(array[0][0]).replace(/\s{1,}/g, "");
                if (!isNaN(num) && array[0].length > 1) {
                    count += Number(num);
                    this.soroban.reset();
                    this.soroban.assignstring(count);
                }
            }
            this.newUtt = new SpeechSynthesisUtterance();
            this.newUtt.voice = this.voice.selection[$("#" + this.voice.target).find(":selected").data("index")];
            this.newUtt.rate = this.rate.value;
            this.newUtt.text = array[0][0];
			if (this.calculationText.value === 1) {
				$("#text-of-calculation").text(array[0].join("").replace(/\s{2,}/g, ""));
			}
            array[0].shift();
            this.newUtt.onend = function () {
                that.timeouts.push(setTimeout(function () {
                    that.run(array, count);
                }, that.delay.value));
            };
            speechSynthesis.speak(this.newUtt);
            console.log(this.newUtt);
        } else {
            this.stop();
        }
    }
};