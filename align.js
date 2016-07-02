var box1 = document.getElementById("s1");
var box2 = document.getElementById("s2");

var s1a = document.getElementById("s1a");
var pmap = document.getElementById("pmap");
var s2a = document.getElementById("s2a");

var sc = document.getElementById("sc");

var dropdown = document.getElementById("algorithm");

var fieldnames = ["s1", "s2", "AA", "AT", "AC", "AG", "TA", "TT", "TC", "TG", "CA", "CT", "CC", "CG", "GA", "GT", "GC", "GG", "gap"];

var scnames = ["AA", "AT", "AC", "AG", "TT", "TC", "TG", "CC", "CG", "GG", "gap"];

var errmap = {"AA":"A-A match reward", "AT":"A-T/T-A mismatch penalty", "AC":"A-C/C-A mismatch penalty", "AG":"A-G/G-A mismatch penalty", "TT":"T-T match reward", "TC":"T-C/C-A mismatch penalty", "TG":"T-G/G-T mismatch penalty", "CC":"C-C match reward", "CG":"C-G/G-C mismatch penalty", "GG":"G-G match reward", "gap":"Gap penalty"}

var errdata = {noseqs:false};

var descrs = {
"global": "Global Alignment: <br>Global alignment is one of the two fundamental alignment algorithms. \
In global alignment, the initial rows and columns of the dynamic programming table are initialized \
with increasing multiples of the gap penalty. The score in an table cell is the maximum of the scores \
of all the possibilities for the cell (insertion, deletion, and match/mismatch) as defined by the scoring matrix. \
The traceback begins at the cell corresponding to the end of both sequences.", 

"local": "Local Alignment: <br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a mi vitae est dapibus convallis. \
Aenean aliquam turpis a urna vulputate placerat. Nullam feugiat libero eu tempus vulputate. \
Suspendisse vehicula vestibulum dui. Nullam in sodales erat. Aliquam auctor ligula et sagittis viverra. \
Vestibulum efficitur ex vitae facilisis porta.",

"fitting": "Fitting Alignment: <br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a mi vitae est dapibus convallis. \
Aenean aliquam turpis a urna vulputate placerat. Nullam feugiat libero eu tempus vulputate. \
Suspendisse vehicula vestibulum dui. Nullam in sodales erat. Aliquam auctor ligula et sagittis viverra. \
Vestibulum efficitur ex vitae facilisis porta.",

"overlap": "Overlap Alignment: <br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a mi vitae est dapibus convallis. \
Aenean aliquam turpis a urna vulputate placerat. Nullam feugiat libero eu tempus vulputate. \
Suspendisse vehicula vestibulum dui. Nullam in sodales erat. Aliquam auctor ligula et sagittis viverra. \
Vestibulum efficitur ex vitae facilisis porta."};

var algorithms = {"global": globalAlign, "local": localAlign, "fitting": fittingAlign, "overlap": overlapAlign};

var alignFunc = globalAlign;

var inputValid = true;

function init()
{
	validData = validateInput();
	inputValid = validData.valid;
	updateErrors(validData.errors, validData.notices);
	var option = dropdown.value;
	var descr = document.getElementById("descr");
	descr.innerHTML = descrs[option];
}

function getLargest(scmat)
{
	var i = 0;
	var j = 0;
	var maxval = 0;
	for(var _i = 0; _i<scmat.length; _i++)
	{
		for(var _j = 0; _j<scmat[_i].length; _j++)
		{
			if(scmat[_i][_j] >= maxval)
			{
				i = _i;
				j = _j;
				maxval = scmat[_i][_j];
			}
		}	
	}
	return [i, j, maxval];
}

function getLargestFitting(scmat)
{
	var i = scmat.length-1;
	var j = 0;
	var maxval = -Infinity;
	//console.log(scmat[i]);
	for(var _j = 0; _j<scmat[i].length; _j++)
	{
		console.log(scmat[i][_j], maxval);
		if(scmat[i][_j] >= maxval)
		{
			j = _j;
			maxval = scmat[i][_j];
		}
	}	
	return [i, j>-Infinity?j:0, maxval];
}

var mat = {
	bases: {"A": 0, "T": 1, "C": 2, "G": 3},
	basesr: {0: "A", 1: "T", 2: "C", 3: "G"},
	table: [[2, -2, -2, -2], [-2, 2, -2, -2], [-2, -2, 2, -2], [-2, -2, -2, 2]],
	gap: -4,
	getValue: function(a, b){return this.table[this.bases[a.toUpperCase()]][this.bases[b.toUpperCase()]]}
};

var keypresshandler = function(event){
	console.log("KEYPRESS: "+event.target.id);
	var strbases = "ATCG";
	if(event.target.id == "s1" || event.target.id == "s2")
	{
		if((!strbases.includes(event.key)) && (!strbases.toLowerCase().includes(event.key)) && (event.key.length == 1) && !(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey))
		{
			event.preventDefault();
			console.log("INVALID:", event.key, event.key.length);
		}
	}

}

fieldnames.forEach(function(val){
	document.getElementById(val).addEventListener("keydown", keypresshandler);
	});

function validateInput()
{
	var dataobj = {valid:true, errors:[], notices:[]};
	scnames.forEach(function (field) {
		var val = Number(document.getElementById(field).value);
		if(isNaN(val) || document.getElementById(field).value == "")
		{
			this.valid = false;
			console.log("SCORE ERROR "+field+" "+val);
			console.log("ERRORS: "+this.errors);
			this.errors.push(errmap[field]+" value is invalid.");
		}
	}, dataobj);
	var val1 = box1.value.toUpperCase();
	var val2 = box2.value.toUpperCase();
	var strbases = "ATCG";
	if(val1 == "" && val2 == "")
	{
		dataobj.valid = false;
		//errdata.noseqs = true;
		dataobj.notices.push("Please enter 2 DNA sequences.");
	}
	else
	{
		if(val1 == "")
		{
			dataobj.valid = false;
			console.log("SEQ 1 MISSING "+val1);
			console.log("ERRORS: "+dataobj.errors);
			dataobj.errors.push("Sequence 1 is empty.");
		}
		if(val2 == "")
		{
			dataobj.valid = false;
			console.log("SEQ 2 MISSING "+val2);
			console.log("ERRORS: "+dataobj.errors);
			dataobj.errors.push("Sequence 2 is empty.");
		}
	}
	for(i = 0; i<val1.length; i++)
	{
		if(!strbases.includes(val1[i]))
		{
			dataobj.valid = false;
			console.log("SEQ 1 ERROR "+val1);
			dataobj.errors.push("Sequence 1 is invalid.");
			break;
		}
	}
	for(i = 0; i<val2.length; i++)
	{
		if(!strbases.includes(val2[i]))
		{
			dataobj.valid = false;
			console.log("SEQ 2 ERROR "+val2);
			dataobj.errors.push("Sequence 2 is invalid.");
			break;
		}
	}
	console.log("VALIDATION: "+dataobj.valid);
	return dataobj;

}

function updateErrors(errors, notices)
{
	console.log("ERRORS: ", errors);
	errlist = document.getElementById("errors")
	errlist.innerHTML = "";
	errlist.id = "errors";
	errlist.className = "outerr";
	if(errors.length > 0)
	{
		errors.forEach(function (error) {
			var err = document.createElement("li");
			err.innerHTML = error;
			err.className = "error";
			errlist.appendChild(err);
		});
	}

	if(notices.length > 0)
	{
		notices.forEach(function (notice) {
			var err = document.createElement("li");
			err.innerHTML = notice;
			err.className = "notice";
			errlist.appendChild(err);
		});
	}

	if(errors.length == 0 && notices.length == 0)
	{
		errlist = document.getElementById("errors")
		errlist.innerHTML = "";
		errlist.id = "errors";
		errlist.className = "outh";
	}
}

var dropdownhandler = function(event){
	var option = event.target.value;
	var descr = document.getElementById("descr");
	descr.innerHTML = descrs[option];
	descr.id = "descr";
	alignFunc = algorithms[option];
	console.log(option);
	validData = validateInput();
	inputValid = validData.valid;
	console.log("INPUT VALID: "+inputValid)
	if(inputValid)
	{
		var val1 = box1.value.toUpperCase();
		var val2 = box2.value.toUpperCase();
		document.getElementById("output").className = "output";
		document.getElementById("sctab").className = "sctab";
	}
	else
	{
		var val1 = "";
		var val2 = "";
		document.getElementById("output").className = "outh";
		document.getElementById("sctab").className = "outh";
	}
	updateErrors(validData.errors, validData.notices);
	var data = alignFunc(val1, val2);
	console.log(data);
	s1a.innerHTML = data[0];
	s1a.id = "s1a";
	s1a.className = "data";
	pmap.innerHTML = data[2];
	pmap.id = "pmap";
	pmap.className = "data";
	s2a.innerHTML = data[1];
	s2a.id = "s2a";
	s2a.className = "data";
	sc.innerHTML = data[3];
	sc.id = "sc";
}

dropdown.addEventListener("change", dropdownhandler);

var scorehandler = function(event){
	inputValid = true;
	var val1 = box1.value.toUpperCase();
	var val2 = box2.value.toUpperCase();
	var id = event.target.id
	if(id == "gap")
	{
		var val = Number(document.getElementById("gap").value);
		if(!isNaN(val) && document.getElementById("gap").value != "")
		{
			mat.gap = val;
		}
	}
	else
	{
		document.getElementById(id[1]+id[0]).value = document.getElementById(id).value;
		var val = Number(document.getElementById(id).value);
		if(!isNaN(val) && document.getElementById(id).value != "")
		{
			mat.table[mat.bases[id[0]]][mat.bases[id[1]]] = val;
			mat.table[mat.bases[id[1]]][mat.bases[id[0]]] = val;
		}
	}
	validData = validateInput();
	inputValid = validData.valid;
	console.log("INPUT VALID: "+inputValid)
	if(inputValid)
	{
		document.getElementById("output").className = "output";
		document.getElementById("sctab").className = "sctab";
	}
	else
	{
		document.getElementById("output").className = "outh";
		document.getElementById("sctab").className = "outh";
	}
	updateErrors(validData.errors, validData.notices);
	console.log(mat.table);
	console.log(mat.gap);
	var data = alignFunc(val1, val2);
	console.log(data);
	s1a.innerHTML = data[0];
	s1a.id = "s1a";
	s1a.className = "data";
	pmap.innerHTML = data[2];
	pmap.id = "pmap";
	pmap.className = "data";
	s2a.innerHTML = data[1];
	s2a.id = "s2a";
	s2a.className = "data";
	sc.innerHTML = data[3];
	sc.id = "sc";
};

function setupScoreTable()
{
	for(var _i = 0; _i<4;_i++)
	{
		for(var _j = 0; _j<4;_j++)
		{
			document.getElementById(mat.basesr[_i]+mat.basesr[_j]).addEventListener("input", scorehandler);
		}	
	}
	document.getElementById("gap").addEventListener("input", scorehandler);
	updateScoreTable();
}

function updateScoreTable()
{
	for(var _i = 0; _i<4;_i++)
	{
		for(var _j = _i; _j<4;_j++)
		{
			console.log(mat);
			//console.log(mat.basesr[_i]+mat.basesr[_j]+"m");
			document.getElementById(mat.basesr[_i]+mat.basesr[_j]).value = mat.getValue(mat.basesr[_i], mat.basesr[_j]);
			document.getElementById(mat.basesr[_j]+mat.basesr[_i]).value = mat.getValue(mat.basesr[_j], mat.basesr[_i]);
			//document.getElementById(mat.basesr[_i]+mat.basesr[_j]+"m").value = mat.getValue(mat.basesr[_i], mat.basesr[_j]);
		}	
	}
	document.getElementById("gap").value = mat.gap;
	//document.getElementById("gapm").value = mat.gap;
}

setupScoreTable();

function updateTable(s1, s2, data, followed)
{
	console.log(followed);
	var table = document.getElementById("sctab");
	var rows = [];
	table.innerHTML = "";
	var row = table.insertRow();
	var label = document.createElement("th");
	var cell = document.createElement("div");
	cell.className = "tabhead";
	cell.innerHTML = "";
	label.appendChild(cell);
	row.appendChild(label);

	label = document.createElement("th");
	cell = document.createElement("div");
	cell.className = "tabhead";
	cell.innerHTML = "";
	label.appendChild(cell);
	row.appendChild(label);
	for(var j = 0; j<s2.length; j++)
	{
		label = document.createElement("th");
		cell = document.createElement("div");
		cell.className = "tabhead";
		cell.innerHTML = s2[j];//+"&nbsp;";
		label.appendChild(cell);
		row.appendChild(label);
	}
	row = table.insertRow();
	rows.push(row);
	var label = document.createElement("th");
	cell = document.createElement("div");
	cell.className = "tabhead";
	cell.innerHTML = "";
	label.appendChild(cell);
	row.appendChild(label);
	for(i = 0; i<s1.length; i++)
	{	
		row = table.insertRow();
		rows.push(row);
		var label = document.createElement("th");
		cell = document.createElement("div");
		cell.className = "tabhead";
		cell.innerHTML = s1[i];//+"&nbsp;";
		label.appendChild(cell);
		row.appendChild(label);
	}
	for(i = 0; i<=s1.length; i++)
	{	
		for(j = 0; j<=s2.length; j++)
		{
			var td = document.createElement("td");
			td.className = "sccell";
			var cell = document.createElement("div");
			td.appendChild(cell);
			cell.innerHTML = data[0][i][j];
			cell.className = data[1][i][j];
			//console.log("TESTING:"+[i, j])
			if(followed[i][j] == "*")
			{
				cell.className = cell.className+" path tabcell";
			}
			else
			{
				cell.className = cell.className+" other tabcell";
			}
			rows[i].appendChild(td);
		}
	}
}

var seqhandler = function(event){
	//inputValid = true;
	var val1 = box1.value.toUpperCase();
	var val2 = box2.value.toUpperCase();
	var strbases = "ATCG";
	/*else
	{
		throw "Unknown seq field: "+event.target.id;
	}*/
	validData = validateInput();
	inputValid = validData.valid;
	console.log("INPUT VALID: "+inputValid)
	if(inputValid)
	{
		document.getElementById("output").className = "output";
		document.getElementById("sctab").className = "sctab";
	}
	else
	{
		document.getElementById("output").className = "outh";
		document.getElementById("sctab").className = "outh";
	}
	updateErrors(validData.errors, validData.notices);
	if(inputValid && val1 != "" && val2 != "")
	{
		var data = alignFunc(val1, val2);
		console.log(data);
		s1a.innerHTML = data[0];
		s1a.id = "s1a";
		s1a.className = "data";
		pmap.innerHTML = data[2];
		console.log(data[2]);
		pmap.id = "pmap";
		pmap.className = "data";
		s2a.innerHTML = data[1];
		s2a.id = "s2a";
		s2a.className = "data";
		sc.innerHTML = data[3];
		sc.id = "sc";
	}
	else
	{
		document.getElementById("output").className = "outh";
		document.getElementById("sctab").className = "outh";
	}

};

box1.addEventListener("input", seqhandler);
box2.addEventListener("input", seqhandler);

function globalAlign(s1, s2)
{
	console.log("mat:"+mat.table+" "+mat.gap);
	var outarr = globalMatrix(s1, s2, mat);
	table = outarr[0];
	backtrack = outarr[1];
	var outarr2 = globalTraceback(s1, s2, table, backtrack);
	var aligned = outarr2[0];
	var followed = outarr2[1];
	updateTable(s1, s2, outarr, followed);
	//console.log(aligned[2]);
	return aligned;
}

function globalMatrix(s1, s2, mat)
{
	var table = [];
	var backtrack = [];
	for(var i = 0; i<=s1.length;i++)
	{
		table.push([]);
		backtrack.push([]);
		for(var j = 0; j<=s2.length;j++)
		{
			table[i].push(0);
			backtrack[i].push("");
		}
	}
	for(i = 0; i<=s1.length;i++)
	{
		table[i][0] = mat.gap*i;
	}
	for(j = 0; j<=s2.length;j++)
	{
		table[0][j] = mat.gap*j;
	}
	for(i = 1; i<=s1.length; i++)
	{
		for(j = 1; j<=s2.length; j++)
		{
			table[i][j] = Math.max(table[i-1][j]+mat.gap, table[i][j-1]+mat.gap, table[i-1][j-1]+mat.getValue(s1[i-1], s2[j-1]));
			if(table[i][j] == table[i-1][j]+mat.gap)
			{
				backtrack[i][j] = "del";
			}
			else if(table[i][j] == table[i][j-1]+mat.gap)
			{
				backtrack[i][j] = "ins";
			}
			else
			{
				backtrack[i][j] = s1[i-1] == s2[j-1] ? "mat" : "mis";
			}
		}
	}
	return [table, backtrack];

}

function globalTraceback(s1, s2, sctab, btab)
{
	var i = s1.length;
	var j = s2.length;
	var score = sctab[i][j];
	var s1a = "";
	var s2a = "";
	var pmap = "";
	var done = false;
	var followed = [];

	for(var _i = 0; _i<=s1.length;_i++)
	{
		followed.push([]);
		for(var _j = 0; _j<=s2.length;_j++)
		{
			followed[_i].push("X");
		}
	}

	while(!done)
	{
		pmapn = "-";
		followed[i][j] = "*";
		if(i == 0 && j == 0)
		{
			done = true;
			break;
		}
		else if(i == 0 && j > 0)
		{
			s1a = "-".repeat(j)+s1a;
			pmap = "-".repeat(j)+pmap;
			s2a = s2.slice(0, j)+s2a;
			done = true;
			for(var j_ = 0; j_<j; j_++)
			{
				followed[i][j_] = "*"
			}
			break;
		}
		else if(i > 0 && j == 0)
		{
			s1a = s1.slice(0, i)+s1a;
			pmap = " ".repeat(i)+pmap;
			s2a = "-".repeat(i)+s2a;
			done = true;
			for(var i_ = 0; i_<i; i_++)
			{
				followed[i_][j] = "*"
			}
			break;
		}
		else
		{
			if(btab[i][j] == "del")
			{
				s1a = s1[i-1]+s1a;
				s2a = "-"+s2a;
				i = i-1;
			}
			else if(btab[i][j] == "ins")
			{
				s1a = "-"+s1a;
				s2a = s2[j-1]+s2a;
				j = j-1;
			}
			else if(btab[i][j] == "mis" || btab[i][j] == "mat")
			{
				if(btab[i][j] == "mat")
				{
					pmapn = "|";
				}
				s1a = s1[i-1]+s1a;
				s2a = s2[j-1]+s2a;
				i = i-1;
				j = j-1;
			}
			else
			{
				throw "Invalid backtrack code: "+btab[i][j];
			}
		}
		pmap = pmapn+pmap;
	}
	return[[s1a, s2a, pmap.replace(new RegExp("-", 'g'), "&nbsp;"), score], followed];
}

function localAlign(s1, s2)
{
	console.log("mat:"+mat.table+" "+mat.gap);
	var outarr = localMatrix(s1, s2, mat);
	table = outarr[0];
	backtrack = outarr[1];
	var outarr2 = localTraceback(s1, s2, table, backtrack);
	var aligned = outarr2[0];
	var followed = outarr2[1];
	updateTable(s1, s2, outarr, followed);
	return aligned;
}

function localMatrix(s1, s2, mat)
{
	var table = [];
	var backtrack = [];
	for(var i = 0; i<=s1.length;i++)
	{
		table.push([]);
		backtrack.push([]);
		for(var j = 0; j<=s2.length;j++)
		{
			table[i].push(0);
			backtrack[i].push("");
		}
	}
	for(i = 1; i<=s1.length; i++)
	{
		for(j = 1; j<=s2.length; j++)
		{
			table[i][j] = Math.max(table[i-1][j]+mat.gap, table[i][j-1]+mat.gap, table[i-1][j-1]+mat.getValue(s1[i-1], s2[j-1]), 0);
			if(table[i][j] == table[i-1][j]+mat.gap)
			{
				backtrack[i][j] = "del";
			}
			else if(table[i][j] == table[i][j-1]+mat.gap)
			{
				backtrack[i][j] = "ins";
			}
			else
			{
				backtrack[i][j] = s1[i-1] == s2[j-1] ? "mat" : "mis";
			}
		}
	}
	return [table, backtrack];

}

function localTraceback(s1, s2, sctab, btab)
{
	var pos = getLargest(sctab);
	var i = pos[0];
	var j = pos[1];
	var score = sctab[i][j];
	var s1a = "";
	var s2a = "";
	var pmap = "";
	var done = false;
	var followed = [];

	for(var _i = 0; _i<=s1.length;_i++)
	{
		followed.push([]);
		for(var _j = 0; _j<=s2.length;_j++)
		{
			followed[_i].push("X");
		}
	}

	while(!done)
	{
		pmapn = "-";
		followed[i][j] = "*";
		if(sctab[i][j] == 0)
		{
			done = true;
			break;
		}
		else
		{
			if(btab[i][j] == "del")
			{
				s1a = s1[i-1]+s1a;
				s2a = "-"+s2a;
				i = i-1;
			}
			else if(btab[i][j] == "ins")
			{
				s1a = "-"+s1a;
				s2a = s2[j-1]+s2a;
				j = j-1;
			}
			else if(btab[i][j] == "mis" || btab[i][j] == "mat")
			{
				if(btab[i][j] == "mat")
				{
					pmapn = "|";
				}
				s1a = s1[i-1]+s1a;
				s2a = s2[j-1]+s2a;
				i = i-1;
				j = j-1;
			}
			else
			{
				throw "Invalid backtrack code: "+btab[i][j];
			}
		}
		pmap = pmapn+pmap;
	}
	return[[s1a, s2a, pmap.replace(new RegExp("-", 'g'), "&nbsp;"), score], followed];
}


function fittingAlign(s1, s2)
{
	console.log("mat:"+mat.table+" "+mat.gap);
	var outarr = fittingMatrix(s1, s2, mat);
	table = outarr[0];
	backtrack = outarr[1];
	var outarr2 = fittingTraceback(s1, s2, table, backtrack);
	var aligned = outarr2[0];
	var followed = outarr2[1];
	updateTable(s1, s2, outarr, followed);
	return aligned;
}

function fittingMatrix(s1, s2, mat)
{
	var table = [];
	var backtrack = [];
	for(var i = 0; i<=s1.length;i++)
	{
		table.push([]);
		backtrack.push([]);
		for(var j = 0; j<=s2.length;j++)
		{
			table[i].push(0);
			backtrack[i].push("");
		}
	}
	for(i = 0; i<=s1.length;i++)
	{
		table[i][0] = mat.gap*i;
	}
	for(i = 1; i<=s1.length; i++)
	{
		for(j = 1; j<=s2.length; j++)
		{
			table[i][j] = Math.max(table[i-1][j]+mat.gap, table[i][j-1]+mat.gap, table[i-1][j-1]+mat.getValue(s1[i-1], s2[j-1]));
			if(table[i][j] == table[i-1][j]+mat.gap)
			{
				backtrack[i][j] = "del";
			}
			else if(table[i][j] == table[i][j-1]+mat.gap)
			{
				backtrack[i][j] = "ins";
			}
			else
			{
				backtrack[i][j] = s1[i-1] == s2[j-1] ? "mat" : "mis";
			}
		}
	}
	return [table, backtrack];

}

function fittingTraceback(s1, s2, sctab, btab)
{
	var pos = getLargestFitting(sctab);
	console.log("MAXVAL:", pos[2]);
	var i = pos[0];
	var j = pos[1];
	var score = sctab[i][j];
	var s1a = "";
	var s2a = "";
	var pmap = "";
	var done = false;
	var followed = [];

	for(var _i = 0; _i<=s1.length;_i++)
	{
		followed.push([]);
		for(var _j = 0; _j<=s2.length;_j++)
		{
			followed[_i].push("X");
		}
	}

	while(!done)
	{
		pmapn = "-";
		followed[i][j] = "*";
		if(i == 0)
		{
			done = true;
			break;
		}
		else if(i > 0 && j == 0)
		{
			s1a = s1.slice(0, i)+s1a;
			pmap = "-".repeat(i)+pmap;
			s2a = "-".repeat(i)+s2a;
			done = true;
			for(var i_ = 0; i_<i; i_++)
			{
				followed[i_][j] = "*"
			}
			break;
		}
		else
		{
			if(btab[i][j] == "del")
			{
				s1a = s1[i-1]+s1a;
				s2a = "-"+s2a;
				i = i-1;
			}
			else if(btab[i][j] == "ins")
			{
				s1a = "-"+s1a;
				s2a = s2[j-1]+s2a;
				j = j-1;
			}
			else if(btab[i][j] == "mis" || btab[i][j] == "mat")
			{
				if(btab[i][j] == "mat")
				{
					pmapn = "|";
				}
				s1a = s1[i-1]+s1a;
				s2a = s2[j-1]+s2a;
				i = i-1;
				j = j-1;
			}
			else
			{
				throw "Invalid backtrack code: \""+btab[i][j]+"\" "+i+" "+j;
			}
		}
		pmap = pmapn+pmap;
	}
	return[[s1a, s2a, pmap.replace(new RegExp("-", 'g'), "&nbsp;"), score], followed];
}


function overlapAlign(s1, s2)
{
	console.log("mat:"+mat.table+" "+mat.gap);
	var outarr = overlapMatrix(s1, s2, mat);
	table = outarr[0];
	backtrack = outarr[1];
	var outarr2 = overlapTraceback(s1, s2, table, backtrack);
	var aligned = outarr2[0];
	var followed = outarr2[1];
	updateTable(s1, s2, outarr, followed);
	return aligned;
}

function overlapMatrix(s1, s2, mat)
{
	var table = [];
	var backtrack = [];
	for(var i = 0; i<=s1.length;i++)
	{
		table.push([]);
		backtrack.push([]);
		for(var j = 0; j<=s2.length;j++)
		{
			table[i].push(0);
			backtrack[i].push("");
		}
	}
	for(j = 0; j<=s2.length;j++)
	{
		table[0][j] = mat.gap*j;
	}
	for(i = 1; i<=s1.length; i++)
	{
		for(j = 1; j<=s2.length; j++)
		{
			table[i][j] = Math.max(table[i-1][j]+mat.gap, table[i][j-1]+mat.gap, table[i-1][j-1]+mat.getValue(s1[i-1], s2[j-1]), 0);
			if(table[i][j] == table[i-1][j]+mat.gap)
			{
				backtrack[i][j] = "del";
			}
			else if(table[i][j] == table[i][j-1]+mat.gap)
			{
				backtrack[i][j] = "ins";
			}
			else
			{
				backtrack[i][j] = s1[i-1] == s2[j-1] ? "mat" : "mis";
			}
		}
	}
	return [table, backtrack];

}

function overlapTraceback(s1, s2, sctab, btab)
{
	var pos = getLargestFitting(sctab);
	console.log("MAXVAL:", pos[2]);
	var i = pos[0];
	var j = pos[1];
	var score = sctab[i][j];
	var s1a = "";
	var s2a = "";
	var pmap = "";
	var done = false;
	var followed = [];

	for(var _i = 0; _i<=s1.length;_i++)
	{
		followed.push([]);
		for(var _j = 0; _j<=s2.length;_j++)
		{
			followed[_i].push("X");
		}
	}

	while(!done)
	{
		pmapn = "-";
		followed[i][j] = "*";
		if(j == 0)
		{
			done = true;
			break;
		}
		else if(sctab[i][j] == 0)
		{
			done = true;
			break;
		}
		else if(i == 0 && j > 0)
		{
			s1a = "-".repeat(j)+s1a;
			pmap = "-".repeat(j)+pmap;
			s2a = s2.slice(0, j)+s2a;
			done = true;
			for(var j_ = 0; j_<j; j_++)
			{
				followed[i][j_] = "*"
			}
			break;
		}
		else
		{
			if(btab[i][j] == "del")
			{
				s1a = s1[i-1]+s1a;
				s2a = "-"+s2a;
				i = i-1;
			}
			else if(btab[i][j] == "ins")
			{
				s1a = "-"+s1a;
				s2a = s2[j-1]+s2a;
				j = j-1;
			}
			else if(btab[i][j] == "mis" || btab[i][j] == "mat")
			{
				if(btab[i][j] == "mat")
				{
					pmapn = "|";
				}
				s1a = s1[i-1]+s1a;
				s2a = s2[j-1]+s2a;
				i = i-1;
				j = j-1;
			}
			else
			{
				throw "Invalid backtrack code: \""+btab[i][j]+"\" "+i+" "+j;
			}
		}
		pmap = pmapn+pmap;
	}
	return[[s1a, s2a, pmap.replace(new RegExp("-", 'g'), "&nbsp;"), score], followed];;
}