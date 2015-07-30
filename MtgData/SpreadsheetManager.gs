function SpreadsheetManager(spreadsheet, data_manager) {
  this.spreadsheet = spreadsheet;
  this.data_manager = data_manager;
}
SpreadsheetManager.prototype = {};

SpreadsheetManager.prototype.VERBOSE_LOGGING = false;

SpreadsheetManager.prototype.Backup = function() {
  if (this.VERBOSE_LOGGING) Logger.log('BEGIN Backup');
  var new_name = this.spreadsheet.getName() + ' (backup: ' + new Date().toLocaleString() + ')';
  var backup = this.spreadsheet.copy(new_name);
  if (this.VERBOSE_LOGGING) Logger.log('END Backup');
  return backup;
};

SpreadsheetManager.prototype.ReadCardCounts = function(set_code) {
  if (this.VERBOSE_LOGGING) Logger.log('BEGIN ReadCardCounts(%s)', set_code);
  var sheet = this.spreadsheet.getSheetByName(set_code);
  if (sheet === null) return {};

  var localid_to_card_counts = {};
  var row_values = sheet.getDataRange().getValues();
  var header = row_values.shift();
  var localid_idx = header.indexOf('lID');
  var copies_idx = header.indexOf('Copies');
  var foils_idx = header.indexOf('Foils');
  for (var i=0; i<row_values.length; i++) {
    var row = row_values[i];
    var localid = row[localid_idx];
    var copies = row[copies_idx];
    var foils = row[foils_idx];
    counts = {};
    if (copies) counts.copies = copies;
    if (foils) counts.foils = foils;
    localid_to_card_counts[localid] = counts;
  }

  var set_to_localid_to_card_counts = {};
  set_to_localid_to_card_counts[set_code] = localid_to_card_counts;
  if (this.VERBOSE_LOGGING) Logger.log('END ReadCardCounts(%s)', set_code);
  return set_to_localid_to_card_counts;
};

SpreadsheetManager.prototype._CreateSheetForSet = function(set_code) {
  if (this.VERBOSE_LOGGING) Logger.log('BEGIN _CreateSheetForSet(%s)', set_code);
  var set = this.data_manager.GetSetByCode(set_code);
  var row_values = set.GetCardRowValues();

  var sheet = this.spreadsheet.getSheetByName(set_code);
  if (sheet === null) sheet = this.spreadsheet.insertSheet(set_code);

  var rows = row_values.length;
  var columns = row_values[0].length;
  SetSheetSize(sheet, rows, columns);

  var range = sheet.getRange(1, 1, rows, columns);
  range.setValues(row_values);

  var hidden_columns = ['lID', 'mvID', 'Number'];
  var hidden_col_nums = [];
  for (var i=0; i<hidden_columns.length; i++) {
    var col_num = Card.prototype.HEADER.indexOf(hidden_columns[i]) + 1;
    hidden_col_nums.push(col_num);
  }

  var forced_string_columns = ['lID', 'Number'];
  var string_col_nums = [];
  for (var i=0; i<forced_string_columns.length; i++) {
    var col_num = Card.prototype.HEADER.indexOf(forced_string_columns[i]) + 1;
    string_col_nums.push(col_num);
  }

  CleanUpSheet(sheet, rows, columns, string_col_nums, hidden_col_nums);
  this.spreadsheet.setActiveSheet(sheet);
  this.spreadsheet.moveActiveSheet(this.spreadsheet.getNumSheets());
  if (this.VERBOSE_LOGGING) Logger.log('END _CreateSheetForSet(%s)', set_code);
};

SpreadsheetManager.prototype.CreateOrUpdateSheetForSet = function(set_code) {
  var card_counts = this.ReadCardCounts(set_code);
  this.data_manager.ApplyCardCounts(card_counts);
  this._CreateSheetForSet(set_code);
};

SpreadsheetManager.prototype.CreateSetsSheet = function() {
  var row_values = this.data_manager.GetSetRowValues();

  var sheet = this.spreadsheet.getSheetByName('Sets');
  if (sheet === null) sheet = this.spreadsheet.insertSheet('Sets', 0);

  var rows = row_values.length;
  var columns = row_values[0].length;
  SetSheetSize(sheet, rows, columns);

  var range = sheet.getRange(1, 1, rows, columns);
  range.setValues(row_values);

  var hidden_columns = ['Release', 'Block', 'Type'];
  var hidden_col_nums = [];
  for (var i=0; i<hidden_columns.length; i++) {
    var col_num = Set.prototype.HEADER.indexOf(hidden_columns[i]) + 1;
    hidden_col_nums.push(col_num);
  }

  var string_col_nums = [];

  CleanUpSheet(sheet, rows, columns, string_col_nums, hidden_col_nums);
  this.spreadsheet.setActiveSheet(sheet);
  this.spreadsheet.moveActiveSheet(1);
};

SpreadsheetManager.prototype.CreateEverything = function() {
  var set_codes = this.data_manager.GetSetCodes();
  for (var i=0; i<set_codes.length; i++) {
    this.CreateOrUpdateSheetForSet(set_codes[i]);
  }
  this.CreateSetsSheet();
};

SpreadsheetManager.prototype.DoublePassCreateEverything = function() {
  // TODO(waksman): fix this ugly hack: We call CreateEverything twice so that invalid cell references from the first pass can be resolved after the second pass.
  this.CreateEverything();
  SpreadsheetApp.flush();
  this.CreateEverything();
};
