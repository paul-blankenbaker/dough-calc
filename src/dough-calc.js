const VERSION = 1;
const PRECISION = 1;
const UNIT_G = 0;
const UNIT_OZ = 1;
const G_PER_OZ = 28.3495;
const UNITS = [ "g", "oz" ];
const TO_G = [ 1.0, G_PER_OZ ];
const TO_OZ = [ 1.0 / G_PER_OZ, 1.0 ];

const defaults = {
  "version": VERSION,
  "units": 0,
  "totalMass": 1000,
  "formula": [
    { "name": "Flour", "pct": 100.0, "locked": false },
    { "name": "Salt", "pct": 2.0 },
    { "name": "Yeast", "pct": 0.65 },
    { "name": "Water", "pct": 68.0 },
    { "name": "P\u00E2te Ferment\u00e9e", "pct": 0.0 },
    { "name": "More 2", "pct": 0.0 },
    { "name": "More 3", "pct": 0.0 },
    { "name": "More 4", "pct": 0.0 }
  ]
}

let userVals = defaults;
let ui = { };

function getTotalPct(ingredients) {
  let totalPct = 0;
  for (var i in ingredients) {
    let ing = ingredients[i];
    totalPct = totalPct + parseFloat(ing["pct"]);
  }
  return totalPct;
}

function getTotalMassG() {
  var totalMass = parseFloat(userVals["totalMass"]);
  var convFactor = TO_G[userVals["units"]];
  return totalMass * convFactor;
}

function getTotalMassOz() {
  var totalMass = parseFloat(userVals["totalMass"]);
  var convFactor = TO_OZ[userVals["units"]];
  return totalMass * convFactor;
}

function updateForTotalMass() {
  let totalMassG = getTotalMassG();
  let totalMassOz = getTotalMassOz();
  let ingredients = userVals["formula"]; 
  let totalPct = getTotalPct(ingredients);

  for (var i in ingredients) {
    let ing = ingredients[i];
    let ingPct = ing["pct"];
    ing["oz"] = totalMassOz * ingPct / totalPct;
    ing["g"] = totalMassG * ingPct / totalPct;
  }
}


function createWidget(htmlType, className, textContent) {
  let widget = document.createElement(htmlType);
  if (className !== undefined) {
    widget.className = className;
  }
  if (textContent !== undefined) {
    widget.appendChild(document.createTextNode(textContent));
  }
  return widget;
}

function checkNumericField(inFld) {
  let val = parseFloat(inFld.value);
  if (isNaN(val)) {
    inFld.className = "numericBad";
  } else {
    inFld.className = "numeric";
  }
  return val;
}

function totalMassChanged(inFld) {
  let val = checkNumericField(inFld);
  if (isNaN(val)) {
    return;
  }
  userVals["totalMass"] = val;
  updateForTotalMass();
  updateUi();
  saveSettings();
}

function updateNumericInput(widget, val) {
  if (widget === undefined) {
    return;
  }
  let sval = parseFloat(val).toFixed(widget.precision);
  widget.value = sval;
  checkNumericField(widget);
  return widget;
}

function updateUi() {
  updateNumericInput(ui["totalMass"], userVals["totalMass"]);
  let unitChoice = userVals["units"];
  ui["gButton"].checked = (unitChoice == UNIT_G);
  ui["ozButton"].checked = (unitChoice != UNIT_G);

  let iWidgets = ui["formula"];
  let ingredients = userVals["formula"];
  for (var i in ingredients) {
    let ing = ingredients[i];
    let widget = iWidgets[i];
    updateNumericInput(widget["g"], ing["g"]);
    updateNumericInput(widget["oz"], ing["oz"]);
    updateNumericInput(widget["pct"], ing["pct"]);
  }
}

function createNumericInput(val, callback, precision) {
  if (precision == undefined) {
    precision = PRECISION;
  }
  let sval = parseFloat(val).toFixed(precision);
  let widget = createWidget("input", "numeric");
  widget.precision = precision;
  widget.value = sval;
  addChangeHandler(widget, callback);
  checkNumericField(widget);
  return widget;
}

function addInput(widget, label, field) {
  widget.appendChild(createWidget("div", "label", label));
  widget.appendChild(field);
}

function updateWeight(unit, totalAdjRatio) {
  if (isFinite(totalAdjRatio)) {
    let totalMass = userVals["totalMass"];
    userVals["totalMass"] = totalMass * totalAdjRatio;
    updateForTotalMass();
    updateUi();
    saveSettings();
  }
  /*
  let key = UNITS[unit];
  let total = 0;
  let ingredients = userVals["formula"];
  for (var i in ingredients) {
    let ing = ingredients[i];
    total += ing[key];
  }
  if (userVals["units"] == UNIT_G) {
    userVals["totalMass"] = total * TO_G[unit];
  } else {
    userVals["totalMass"] = total * TO_OZ[unit];
  }
  updateForTotalMass();
  updateUi();
  saveSettings();
*/
}

// Change to values in grams on one of the ingredients
function gChange(widget) {
  let val = checkNumericField(widget);
  if (isNaN(val)) {
    return;
  }
  let row = widget.row;
  let ing = userVals["formula"][row];
  let totalAdjRatio = val / ing["g"];
  updateWeight(UNIT_G, totalAdjRatio);
}

// Change to values in ounces on one of the ingredients
function ozChange(widget) {
  let val = checkNumericField(widget);
  if (isNaN(val)) {
    return;
  }
  let row = widget.row;
  let ing = userVals["formula"][row];
  let totalAdjRatio = val / ing["oz"];
  updateWeight(UNIT_G, totalAdjRatio);
}

// Change to values in percent on one of the ingredients
function pctChange(widget) {
  let row = widget.row;
  let ing = userVals["formula"][row];
  ing["pct"] = parseFloat(widget.value);
  updateForTotalMass();
  updateUi();
  saveSettings();
}

function labelChange(widget) {
  let row = widget.row;
  let ing = userVals["formula"][row];
  ing["name"] = widget.value;
  saveSettings();
}

function addChangeHandler(widget, callback) {
  if (callback !== undefined) {
    widget.onblur = function(event) {
      callback(widget);
    };
    widget.addEventListener('keyup', function(event) {
      if (event.defaultPrevented) {
        return;
      }
      var key = event.key || event.keyCode;
      if (key == "Enter" || key == 13) {
        callback(widget);
      }
    });
  }
}

function createFormulaRow(ing) {
  var widget = createWidget("tr");
  var label = ing["name"];
  let row = ui["formula"].length;
  if (true || (label.indexOf("More") == 0)) {
    let th = createWidget("th", "formulaLabel");
    widget.appendChild(th);
    let labelWidget = createWidget("input", "formulaLabel");
    addChangeHandler(labelWidget, labelChange);
    labelWidget.value = label;
    labelWidget.row = row;
    th.appendChild(labelWidget);
  } else {
    widget.appendChild(createWidget("td", "formulaLabel", label));
  }
  let vals = [ "g", "oz", "pct" ];
  let flds = { };
  let callbacks = [ gChange, ozChange, pctChange ];
  for (var j in vals) {
    let idx = vals[j];
    let val = parseFloat(ing[idx]);
    let valStr = isNaN(val) ? "" : val.toFixed(PRECISION);
    let td = createWidget("td");
    widget.appendChild(td);
    let ui = createNumericInput(valStr, callbacks[j], (j >= 1) ? 2 : 1);
    ui.idx = idx;
    ui.row = row;
    flds[idx] = ui;
    if (ing["locked"] == true) {
      ui.disabled = true;
    }
    td.appendChild(ui);
  }

  ui["formula"].push(flds);

  return widget;
}

function createFormulaWidget(ingredients) {
  let widget = createWidget("table", "formula");
  let thead = createWidget("thead")
  widget.appendChild(thead);
  let tr = createWidget("tr");
  thead.appendChild(tr);
  let headings = [ "Ingredients", "Mass (g)", "Wt (oz)", "Percent" ];
  for (var i in headings) {
    tr.appendChild(createWidget("th", "formula", headings[i]));
  }
  
  let tbody = createWidget("tbody");
  widget.appendChild(tbody);

  
  for (var i in ingredients) {
    let ing = ingredients[i];
    tbody.appendChild(createFormulaRow(ing));
  }
  return widget;
}

function createRadioButton(selected, callback) {
  let widget = createWidget("input", "choice");
  widget.checked = selected;
  widget.type = "radio";
  if (callback !== undefined) {
    widget.onclick = callback;
  }
  return widget;
}

function changeUnits(units) {
  if (userVals["units"] !== units) {
    if (units == UNIT_G) {
      userVals["totalMass"] *= G_PER_OZ;
    } else {
      userVals["totalMass"] /= G_PER_OZ;
    }
    userVals["units"] = units;
  }
  updateForTotalMass();
  updateUi();
  saveSettings();
}
  
function createUiWidget() {
  ui = { "formula": [ ] };
  let widget = createWidget("div", "calculator");
  let title = createWidget("div", "title", "Dough Calculator");
  widget.appendChild(title);

  let key = "totalMass";
  let totalMass = userVals[key];
  let tmass = createNumericInput(totalMass, totalMassChanged);
  ui[key] = tmass;

  let massUi = createWidget("div", "massUi")
  massUi.appendChild(tmass);
  let unitChoice = userVals["units"];
  
  let gButton = createRadioButton(unitChoice == UNIT_G, function(event) {
    changeUnits(UNIT_G);
  });

  let ozButton = createRadioButton(unitChoice != UNIT_G, function(event) {
    changeUnits(UNIT_OZ);
  });
  ui["gButton"] = gButton;
  ui["ozButton"] = ozButton;
  
  massUi.appendChild(gButton);
  massUi.appendChild(createWidget("span", "massChoice", "g"));
  massUi.appendChild(ozButton);
  massUi.appendChild(createWidget("span", "massChoice", "oz"));

  
  addInput(widget, "Total Mass", massUi);

  widget
  let g = createWidget("input", "selector");
  g.checked = true;

  let formula = createFormulaWidget(userVals["formula"]);
  widget.appendChild(formula);
  updateForTotalMass();
  updateUi();
  
  widget.id = "ui";
  return widget;
}

function createUi() {
  var old = document.getElementById("ui");
  var p = old.parentNode;
  p.replaceChild(createUiWidget(), old);
}

function saveSettings() {
  let settings = JSON.stringify(userVals);
  localStorage.setItem("doughCalc", settings);
}

function loadValues() {
  try {
    userVals = JSON.parse(localStorage.getItem("doughCalc"));
    if (userVals.version != VERSION) {
      // Fallback to defaults if new version required
      userVals = defaults;
    }
    createUi();
  } catch (ignore) {
    userVals = defaults;
    createUi();
  }
}

