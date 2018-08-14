/**
 * Constants used throughout the application.
 */

// Bump version number if you change the format of the JSON settings
// such that old version are no longer compatible
const VERSION = 1;

// Precision (number of digits after decimal point)
const PRECISION_LO = 1;
const PRECISION_HI = 2;

// Used to convert from ounces to grams
// G = OZ * G_PER_OZ
// OZ = G / G_PER_OZ
const G_PER_OZ = 28.3495;

// Index of unit choice
const UNIT_G = 0;
const UNIT_OZ = 1;
const UNITS = [ "g", "oz" ];

// Conversion tables to convert to other unit for a given choice index
const TO_G = [ 1.0, G_PER_OZ ];
const TO_OZ = [ 1.0 / G_PER_OZ, 1.0 ];

// Factory defaults for a simple straight dough recipe
const defaults = {
  "title": "Straight Bread Dough",
  "version": VERSION,
  "units": 0,
  "totalMass": 1000,
  "formula": [
    { "name": "Flour", "pct": 100.0, "locked": false },
    { "name": "Salt", "pct": 2.0 },
    { "name": "Yeast", "pct": 0.65 },
    { "name": "Water", "pct": 68.0 },
  ]
}

const pate = {
  "title": "P\u00E2te Ferment\u00e9e Mix",
  "version": VERSION,
  "units": 0,
  "totalMass": 1000,
  "formula": [
    { "name": "Flour", "pct": 100.0, "locked": false },
    { "name": "Salt", "pct": 3.0 },
    { "name": "Yeast", "pct": 0.60 },
    { "name": "Water", "pct": 68.0 },
    { "name": "P\u00E2te Ferment\u00e9e", "pct": 100.0 }
  ]
}

const wheat = {
  "title": "Whole Grain",
  "version": VERSION,
  "units": 0,
  "totalMass": 1000,
  "formula": [
    { "name": "Bread Flour", "pct": 90.0, "locked": false },
    { "name": "Wheat/Rye/Etc", "pct": 10.0, "locked": false },
    { "name": "Salt", "pct": 2.0 },
    { "name": "Yeast", "pct": 0.70 },
    { "name": "Water", "pct": 72.0 }
  ]
}

// Table of preset recipes for quick select
const presets = [ defaults, wheat, pate ];

// Current user settings
let userVals = defaults;

// Used internally to keep track of the UI widgets
let ui = { };

// Spins through indredients list to sum up the percent column
//
// ingredients - Array of ingredients (each item must have "pct" attribute).
//
// return Sum of the percent column.
function getTotalPct(ingredients) {
  let totalPct = 0;
  for (var i in ingredients) {
    let ing = ingredients[i];
    totalPct = totalPct + parseFloat(ing["pct"]);
  }
  return totalPct;
}

// Returns the value of the total mass input in grams.
function getTotalMassG() {
  var totalMass = parseFloat(userVals["totalMass"]);
  var convFactor = TO_G[userVals["units"]];
  return totalMass * convFactor;
}

// Returns the value of the total mass input in ounces.
function getTotalMassOz() {
  var totalMass = parseFloat(userVals["totalMass"]);
  var convFactor = TO_OZ[userVals["units"]];
  return totalMass * convFactor;
}

// Updates the grams and ounces columns based on current mass setting.
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


// Creates an DOM widget.
//
// htmlType - Name of HTML entity (like "div").
// className - Optional setting for "class" attribute.
// textContent - Optional text to append to the widget.
//
// Return new DOM node to insert into the document.
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

// Checks a numeric input field to determine if value is valid.
//
// inFld - DOM input field to get user value from.
//
// Return numeric value of text field or NaN if invalid number.
function checkNumericField(inFld) {
  let val = parseFloat(inFld.value);
  if (isNaN(val)) {
    inFld.className = "numericBad";
  } else {
    inFld.className = "numeric";
  }
  return val;
}

// Input handler when user modifies the total mass field.
//
// inField - The total mass input field.
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

// Updates a numeric input field with a new value.
//
// widget - A DOM input field to set new text value on.
// val - Numeric value to format and then apply to the input field.
function updateNumericInput(widget, val) {
  if (widget === undefined) {
    return;
  }
  let sval = parseFloat(val).toFixed(widget.precision);
  widget.value = sval;
  checkNumericField(widget);
  return widget;
}

// Transfers all values from the internal settings back into
// the user interface.
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

  let title = userVals["title"];
  if (title !== undefined) {
    replaceText("title", title);
    replaceText(ui["title"], title);
  }

  // Update action link for new recipe
  ui["link"].href = window.location.pathname + "?settings="
    + encodeURIComponent(JSON.stringify(userVals));
}

// Replaces CDATA (text) of specific DOM node
//
// node - DOM node or String ID of DOM node.
// text - New text to insert
function replaceText(node, title) {
  if (typeof node === typeof "") {
    node = document.getElementById(node);
  }
  if (node !== undefined) {
    node.replaceChild(document.createTextNode(title), node.firstChild);
  }
}

// Creates an input field used to enter numeric values in.
//
// val - Initial value to put in input field.
// callback - Optional callback handler to invoke when user adjusts value.
// precision - Optional numeric precision (how many places after decimal point).
//
// Return a DOM input field initialized as specified.
function createNumericInput(val, callback, precision) {
  if (precision == undefined) {
    precision = PRECISION_LO;
  }
  let sval = parseFloat(val).toFixed(precision);
  let widget = createWidget("input", "numeric");
  widget.precision = precision;
  widget.value = sval;
  addChangeHandler(widget, callback);
  checkNumericField(widget);
  return widget;
}

// Creates a preset widget that user can click on to quickly load one
// of the pre-defined recipes
//
// idx - Index of factory preset in the "presets" array.
function createPreset(idx) {
  let widget = createWidget("a", "preset", "" + idx);
  widget.href = "#";
  let settings = presets[idx];
  widget.title = "Load formula for: " + settings["title"];
  widget.onclick = function(event) {
    // Set user settings to preset settings and re-create UI
    userVals = settings;
    createUi()
  };
  return widget;
}

// Creates an action widget that user can click on to cause something to happen.//
// letter - The text to display (what user will click on).
// title - Tooltip describing what action does.
// clickHandler - Function to handle click event.
function createAction(letter, title, clickHandler) {
  let widget = createWidget("a", "action", letter);
  widget.href = "#";
  widget.title = title;
  if (clickHandler !== undefined) {
    widget.onclick = clickHandler;
  }
  return widget;
}

// Adds a vertically labeled UI widget.
//
// widget - The DOM widget to add to.
// label - The text label to appear above the input widget (String).
// field - The input widget.
function addInput(widget, label, field) {
  widget.appendChild(createWidget("div", "label", label));
  widget.appendChild(field);
}

// Update values proportionally for a change in weight/mass of an
// ingredient.
//
// unit - The unit that the adjustment was made on (UNIT_G or UNIT_OZ).
//
// totalAdjRatio - How much of an adjustment was made (1.0 means no
// adjustment, 0.5 means half of what it was, 2.0 means double what it
// was).
function updateWeight(unit, totalAdjRatio) {
  if (isFinite(totalAdjRatio)) {
    let totalMass = userVals["totalMass"];
    userVals["totalMass"] = totalMass * totalAdjRatio;
    updateForTotalMass();
    updateUi();
    saveSettings();
  }
}

// Handles event when user changes a value in the grams column.
//
// widget - The cell in the grams column that was adjusted.
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

// Handles event when user changes a value in the ounces column.
//
// widget - The cell in the ounces column that was adjusted.
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

// Handles event when user changes a value in the percent column.
//
// widget - The cell in the percent column that was adjusted.
function pctChange(widget) {
  let row = widget.row;
  let ing = userVals["formula"][row];
  ing["pct"] = parseFloat(widget.value);
  updateForTotalMass();
  updateUi();
  saveSettings();
}

// Handles event when user changes an ingredient label.
//
// widget - The cell in the label column that was adjusted.
function labelChange(widget) {
  let label = widget.value;
  let row = widget.row;
  
  switch (label) {
  case "+":
    widget.removeAttribute("onblur");
    widget.blurPrevented = true;
    addRow(row);
    return;
  case "-":
    // Disable callback on focus change before removing row
    widget.removeAttribute("onblur");
    widget.blurPrevented = true;
    delRow(row);
    return;
  }
  
  let ing = userVals["formula"][row];
  ing["name"] = label;
  saveSettings();
}

// Looks for user changes on an input field (when to apply changes)
//
// Currently we look for the user moving into our out of a field (a blur event) or when the user presses the "Enter" key on an input field.
//
// widget - The DOM input field to monitor.
//
// callback - The method to call when a significant event occurs - we
// will pass 'widget' to the callback handler.
function addChangeHandler(widget, callback) {
  if (callback !== undefined) {
    widget.onblur = function(event) {
      if (event.defaultPrevented || this.blurPrevented) {
        return;
      }
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

// Creates a full DOM tr for a single ingredient entry in a recipe.
//
// ing - A single row from the array of "formulas" in the settings
// (must have a "name", "pct", "g" and "oz" attribute set).
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
    let valStr = isNaN(val) ? "" : val.toFixed(PRECISION_LO);
    let td = createWidget("td");
    widget.appendChild(td);
    let ui = createNumericInput(valStr, callbacks[j], (j >= 1) ? PRECISION_HI : PRECISION_LO);
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

// Adds/inserts row into table.
//
// idx - Numeric index in range of [0, list.length] where you want the
// new row to appear. Omitting, passing non-numeric value or value out
// of range results in adding to end of table (this method can be an
// onclick handler).
function addRow(idx) {
  let row = parseInt(idx);
  let list = userVals["formula"];
  let rowOk = (row >= 0) && (row < list.length);
  let newRow = { "name": "", "pct": 0 }; 
  if (!rowOk) {
    list.push(newRow);
  } else if (row == 0) {
    list.unshift(newRow);
  } else {
    list.splice(row, 0, newRow);
  }
  updateForTotalMass();
  createUi();
}

// Removes row from table.
//
// idx - Numeric index in range of [0, list.length - 1] of the row to
// remove.  Omitting, passing non-numeric value or value out of range
// results in removing last row table (this method can be an onclick
// handler).
function delRow(idx) {
  let row = parseInt(idx);
  let list = userVals["formula"];
  let rowOk = (row >= 0) && (row < list.length);
  if (!rowOk) {
    row = list.length - 1;
  }
  list.splice(row, 1);
  updateForTotalMass();
  createUi();
}

// Creates the table of ingredients based on the current user settings.
//
// A DOM widget that can be inserted into the document.
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

  // Add row at bottom of table with action links
  let actions = createWidget("tr", "actions");
  tbody.appendChild(actions);
  let presetsWidget = createWidget("td", "actions");
  presetsWidget.colSpan = 2;
  actions.appendChild(presetsWidget);

  // Add some preset formula action links
  for (var i = 0; i < presets.length; i++) {
    presetsWidget.appendChild(createPreset(i));
  }

  let actionsWidget = createWidget("td", "actionsRight");
  actionsWidget.colSpan = 2;
  actions.appendChild(actionsWidget);

  let link = createAction("l", "Open link with current recipe - use as bookmark or right click and copy link");
  ui["link"] = link;
  link.target = "_blank";
  actionsWidget.appendChild(link);
  
  let ins = createAction("+", "Add a new row to the end of the table", addRow);
  actionsWidget.appendChild(ins);
  let del = createAction("-", "Remove the last row in the table", delRow);
  actionsWidget.appendChild(del);
  
  return widget;
}

// Creates a DOM input field as a radio button with a specific callback.
//
// selected - Pass true if radio button should be selected, false if not.
// callback - Optional callback when user clicks on radio button.
function createRadioButton(selected, callback) {
  let widget = createWidget("input", "choice");
  widget.checked = selected;
  widget.type = "radio";
  if (callback !== undefined) {
    widget.onclick = callback;
  }
  return widget;
}

// Changes the default units between grams and ounces.
//
// units - The new units to display total mass in (UNIT_G or UNIT_OZ).
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

// Creates a full UI widget based on the current user settings (userVals).
//
// Returns the entire user interface as a single DOM widget to add to the table.
function createUiWidget() {
  ui = { "formula": [ ] };
  let widget = createWidget("div", "calculator");
  let title = createWidget("div", "title", "Dough Calculator");
  ui["title"] = title;
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

  let g = createWidget("input", "selector");
  g.checked = true;

  let formula = createFormulaWidget(userVals["formula"]);
  widget.appendChild(formula);
  updateForTotalMass();
  updateUi();
  
  widget.id = "ui";
  return widget;
}

// Creates a new user interface widget and replaces the old one in the document.
function createUi() {
  var old = document.getElementById("ui");
  var p = old.parentNode;
  p.replaceChild(createUiWidget(), old);
}

// Saves the current recipe so it will be the default the next time
// the page is loaded
function saveSettings() {
  let settings = JSON.stringify(userVals);
  localStorage.setItem("doughCalc", settings);
}

// Function to parse the search string from a URL (?KEY0=VAL&KEY1=VAL&...).
//
// From: https://stackoverflow.com/questions/523266/how-can-i-get-a-specific-parameter-from-location-search
//
// str - The query string to parse (typically window.location.search).
function parseQueryString(str) {
  if (str === undefined) {
    str = window.location.search;
  }
  var objURL = {};

  str.replace(
    new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
    function( $0, $1, $2, $3 ){
      objURL[ $1 ] = $3;
    }
  );
  return objURL;
}

// Loads initial values when document is first loaded.
function loadValues() {

  // If settings, passed in URL, prefer those
  try {
    let params = parseQueryString(window.location.search);
    userVals = JSON.parse(decodeURIComponent(params["settings"]));
    if (userVals.version == VERSION) {
      createUi();
      return;
    }
  } catch (ignore) {
  }
  
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

