function BatchManager(spreadsheet, data_manager) {
  this.spreadsheet = spreadsheet;
  this.data_manager = data_manager;
  this.spreadsheet_manager = new SpreadsheetManager(this.spreadsheet, this.data_manager);
}
BatchManager.prototype = {};

BatchManager.prototype.STATUS_PAGE = '#BATCH_STATUS#';
BatchManager.prototype.PERFORM_BACKUP = '#BACKUP#';
BatchManager.prototype.MAKE_SETS = '#SETS#';
BatchManager.prototype.PAUSED = '#PAUSED#';

BatchManager.prototype.InitializeData = function() {
  this.data_manager.StripOnlineOnly();
  this.data_manager.BuildAllSets();
};

BatchManager.prototype.GetTodoList = function() {
  var sheets = this.spreadsheet.getSheets();
  var sheetnames = sheets.map(function(sheet) {return sheet.getName();});

  var do_backup = [];
  if (sheetnames.length > 1 || sheetnames[0] != 'Sheet1') {
    // If the sheet has anything other than a single 'Sheet1' tab, do a backup.
    do_backup = [this.PERFORM_BACKUP];
  }

  var set_codes = this.data_manager.GetSetCodes();
  var new_set_codes = [];
  for (var i=0; i<set_codes.length; i++) {
    // Add all new sets before doing a full reprocess.
    var set_code = set_codes[i];
    if (sheetnames.indexOf(set_code) < 0) new_set_codes.push(set_code);
  }

  var todo = do_backup.concat(new_set_codes).concat(set_codes).concat([this.MAKE_SETS]);
  return todo;
};

BatchManager.prototype.SetUpBatchJob = function() {
  var status_sheet = this.spreadsheet.getSheetByName(this.STATUS_PAGE);
  if (status_sheet !== null) return; // Don't set up batch if there's already a batch set up.

  todo_list = this.GetTodoList();
  var values = todo_list.map(function(elem) {return [elem];});  // [1,2,3] => [[1],[2],[3]]
  var rows = values.length;
  var columns = 1;

  status_sheet = this.spreadsheet.insertSheet(this.STATUS_PAGE, 0);
  SetSheetSize(status_sheet, rows, columns);
  var range = status_sheet.getRange(1, 1, rows, columns);
  range.setValues(values);
};

BatchManager.prototype.ProcessNextItem = function() {
  var status_sheet = this.spreadsheet.getSheetByName(this.STATUS_PAGE);
  if (status_sheet === null) throw new Error('No batch status sheet.');

  var item = status_sheet.getRange(1, 1).getValue();
  if (item === this.PERFORM_BACKUP) {
    this.spreadsheet_manager.Backup();
  } else if (item === this.MAKE_SETS) {
    this.spreadsheet_manager.CreateSetsSheet();
  } else if (item === this.PAUSED) {
    // pass
  } else {
    this.spreadsheet_manager.CreateOrUpdateSheetForSet(item);
  }

  if (status_sheet.getMaxRows() == 1) {
    this.spreadsheet.deleteSheet(status_sheet);
    return false;
  } else {
    status_sheet.deleteRow(1);
    return true;
  }
};

BatchManager.prototype.NotePause = function() {
  var status_sheet = this.spreadsheet.getSheetByName(this.STATUS_PAGE);
  if (status_sheet === null) return;

  status_sheet.insertRowBefore(1).getRange(1, 1).setValue(this.PAUSED);
};

BatchManager.prototype.ProcessWithContinuationCallback = function(callback) {
  var keep_going = callback();
  while (keep_going) {
    var more_to_do = this.ProcessNextItem();
    keep_going = more_to_do && callback();
  }
  this.NotePause();
};
