// START SOROBAN SCRIPT //
//
function Abacus(target, nm, nc, abtype, iv, imagep) {
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
	this.upperBeadOnPic = this.imagepath + "on/upper-bead-on.png"
	this.lowerBeadOnPic = this.imagepath + "on/lower-bead-on"
	this.upperBeadOffPic = this.imagepath + "off/upper-bead-off.png"
	this.lowerBeadOffPic = this.imagepath + "off/lower-bead-off"
    this.v031 = this.imagepath + "no-bead.png";
    this.v040 = this.imagepath + "middle-rod.png";
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