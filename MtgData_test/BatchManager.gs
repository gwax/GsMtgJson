// TestRunner
function BatchManagerTestRunner() { new BatchManagerTest().runTests(); }


// Tests for MtgData.SpreadsheetManager
function BatchManagerTest() {
  SpreadsheetTestCase.SpreadsheetTestCase.call(this);
  this.stubs = new Stubs.StubsManager();
}
BatchManagerTest.prototype = Object.create(SpreadsheetTestCase.SpreadsheetTestCase.prototype);
BatchManagerTest.prototype.constructor = BatchManagerTest;

BatchManagerTest.prototype.name = 'BatchManagerTest';

BatchManagerTest.prototype.tearDown = function() {
  this.stubs.UnSetAll();
  SpreadsheetTestCase.SpreadsheetTestCase.prototype.tearDown.call(this);
}

BatchManagerTest.prototype.testInitializeData = function() {
  // Setup
  var data_manager = new MockDataManager();
  var called = [];
  this.stubs.Set(MockDataManager.prototype, 'StripOnlineOnly', function() {called.push('StripOnlineOnly')});
  this.stubs.Set(MockDataManager.prototype, 'BuildAllSets', function() {called.push('BuildAllSets')});
  var batch_manager = new MtgData.BatchManager(null, data_manager);
  // Execute
  batch_manager.InitializeData();
  // Verify
  this.assertEquals(['StripOnlineOnly', 'BuildAllSets'], called);
}

BatchManagerTest.prototype.testGetTodoList_FreshSpreadsheet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  // Execute
  var todo = batch_manager.GetTodoList();
  // Verify
  var expected = ['LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2',
                  'LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2',
                  '#SETS#'];
  this.assertEquals(expected, todo);
}

BatchManagerTest.prototype.testGetTodoList_CompleteSpreadsheet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  var mocked_pages = ['LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2', 'Sets'];
  for (var i=0; i<mocked_pages.length; i++) {
    this.spreadsheet.insertSheet(mocked_pages[i]);
  }
  batch_manager.InitializeData();
  // Execute
  var todo = batch_manager.GetTodoList();
  // Verify
  var expected = ['#BACKUP#',
                  'LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2',
                  '#SETS#'];
  this.assertEquals(expected, todo);
}

BatchManagerTest.prototype.testGetTodoList_PartialSpreadsheet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  this.spreadsheet.insertSheet('LEA');
  this.spreadsheet.insertSheet('Sets');
  batch_manager.InitializeData();
  // Execute
  var todo = batch_manager.GetTodoList();
  // Verify
  var expected = ['#BACKUP#',
                  'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2',
                  'LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2',
                  '#SETS#'];
  this.assertEquals(expected, todo);
}

BatchManagerTest.prototype.testSetUpBatchJob = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  // Execute
  batch_manager.SetUpBatchJob();
  // Verify
  var sheet = this.spreadsheet.getSheetByName('#BATCH_STATUS#');
  var values = sheet.getDataRange().getValues();
  var expected = [['LEA'],['LEB'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['LEA'],['LEB'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],['#SETS#']];
  this.assertEquals(expected, values);
}

BatchManagerTest.prototype.testProcessNextItem_NoBatchStatus = function() {
  // Setup
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, null);
  // Execute
  this.assertRaises(function() {
    batch_manager.ProcessNextItem();
  }, Error('No batch status sheet.'));
}

BatchManagerTest.prototype.testProcessNextItem_Backup = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  var sheet = this.spreadsheet.insertSheet('#BATCH_STATUS#', 0);
  this.SetSheetSize(sheet, 2, 1);
  sheet.getRange(1, 1, 2, 1).setValues([['#BACKUP#'], ['#SETS#']]);
  var backup_called = false;
  this.stubs.Set(MtgData.SpreadsheetManager.prototype, 'Backup', function() {backup_called = true;});
  // Execute
  batch_manager.ProcessNextItem();
  // Verify
  this.assertEquals(true, backup_called);
  var status_sheet = this.spreadsheet.getSheetByName('#BATCH_STATUS#');
  this.assertNotEquals(null, status_sheet);
}

BatchManagerTest.prototype.testProcessNextItem_SetsPage = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  var sheet = this.spreadsheet.insertSheet('#BATCH_STATUS#', 0);
  this.SetSheetSize(sheet, 1, 1);
  sheet.getRange(1, 1).setValue('#SETS#');
  // Execute
  batch_manager.ProcessNextItem();
  // Verify
  var sets_sheet = this.spreadsheet.getSheetByName('Sets');
  this.assertNotEquals(null, sets_sheet);
  var status_sheet = this.spreadsheet.getSheetByName('#BATCH_STATUS#');
  this.assertEquals(null, status_sheet);
}

BatchManagerTest.prototype.testProcessNextItem_Paused = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  var sheet = this.spreadsheet.insertSheet('#BATCH_STATUS#', 0);
  this.SetSheetSize(sheet, 2, 1);
  sheet.getRange(1, 1, 2, 1).setValues([['#PAUSED#'], ['#SETS#']]);
  // Execute
  batch_manager.ProcessNextItem();
  // Verify
  var paused_sheet = this.spreadsheet.getSheetByName('#PAUSED#');
  this.assertEquals(null, paused_sheet);
  var sets_sheet = this.spreadsheet.getSheetByName('Sets');
  this.assertEquals(null, sets_sheet);
  var status_sheet = this.spreadsheet.getSheetByName('#BATCH_STATUS#');
  var remaining = status_sheet.getDataRange().getValues();
  this.assertEquals([['#SETS#']], remaining);
}

BatchManagerTest.prototype.testProcessNextItem_SetSheet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  var sheet = this.spreadsheet.insertSheet('#BATCH_STATUS#', 0);
  this.SetSheetSize(sheet, 2, 1);
  sheet.getRange(1, 1, 2, 1).setValues([['ISD'], ['#SETS#']]);
  // Execute
  batch_manager.ProcessNextItem();
  // Verify
  var isd_sheet = this.spreadsheet.getSheetByName('ISD');
  this.assertNotEquals(null, isd_sheet);
  var sets_sheet = this.spreadsheet.getSheetByName('Sets');
  this.assertEquals(null, sets_sheet);
  var status_sheet = this.spreadsheet.getSheetByName('#BATCH_STATUS#');
  var remaining = status_sheet.getDataRange().getValues();
  this.assertEquals([['#SETS#']], remaining);
}

BatchManagerTest.prototype.testNotePause = function() {
  // Setup
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, null);
  var sheet = this.spreadsheet.insertSheet('#BATCH_STATUS#', 0);
  this.SetSheetSize(sheet, 1, 1);
  sheet.getRange(1, 1).setValue('#SETS#');
  // Execute
  batch_manager.NotePause();
  // Verify
  var status_sheet = this.spreadsheet.getSheetByName('#BATCH_STATUS#');
  var remaining = status_sheet.getDataRange().getValues();
  this.assertEquals([['#PAUSED#'], ['#SETS#']], remaining);
}

BatchManagerTest.prototype.testProcessWithContinuationCallback_NonStop = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  batch_manager.SetUpBatchJob();
  function callback() {return true};
  // Execute
  batch_manager.ProcessWithContinuationCallback(callback);
  // Verify
  var sheets = this.spreadsheet.getSheets();
  var sheetnames = sheets.map(function(sheet) {return sheet.getName()});
  var expected = ['Sets', 'Sheet1', 'LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2'];
  this.assertEquals(expected, sheetnames);
}

BatchManagerTest.prototype.testProcessWithContinuationCallback_FalseCallback = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  batch_manager.SetUpBatchJob();
  function callback() {return false};
  // Execute
  batch_manager.ProcessWithContinuationCallback(callback);
  // Verify
  var sheets = this.spreadsheet.getSheets();
  var sheetnames = sheets.map(function(sheet) {return sheet.getName()});
  var expected = ['#BATCH_STATUS#', 'Sheet1'];
  this.assertEquals(expected, sheetnames);
  var remaining = this.spreadsheet.getSheetByName('#BATCH_STATUS#').getDataRange().getValues();
  var expected = [['#PAUSED#'],
                  ['LEA'],['LEB'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['LEA'],['LEB'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['#SETS#']];
  this.assertEquals(expected, remaining);
}

BatchManagerTest.prototype.testProcessWithContinuationCallback_SmallBatches = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var batch_manager = new MtgData.BatchManager(this.spreadsheet, data_manager);
  batch_manager.InitializeData();
  batch_manager.SetUpBatchJob();
  function MakeCountCallback(count) {
    var i = 0;
    var max = count;
    return function() {
      if (i < max) {
        i++;
        return true;
      } else {
        return false;
      }
    }
  }
  // Execute next 2
  batch_manager.ProcessWithContinuationCallback(MakeCountCallback(2));
  // Verify
  var remaining = this.spreadsheet.getSheetByName('#BATCH_STATUS#').getDataRange().getValues();
  var expected = [['#PAUSED#'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['LEA'],['LEB'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['#SETS#']];
  this.assertEquals(expected, remaining);
  var sheetnames = this.spreadsheet.getSheets().map(function(sheet) {return sheet.getName()});
  var expected = ['#BATCH_STATUS#', 'Sheet1', 'LEA', 'LEB'];
  this.assertEquals(expected, sheetnames);
  // Execute next 4
  batch_manager.ProcessWithContinuationCallback(MakeCountCallback(4));
  // Verify
  var remaining = this.spreadsheet.getSheetByName('#BATCH_STATUS#').getDataRange().getValues();
  var expected = [['#PAUSED#'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['LEA'],['LEB'],['ICE'],['HML'],['pMGD'],['HOP'],['ARC'],['ISD'],['PC2'],
                  ['#SETS#']]
  this.assertEquals(expected, remaining);
  var sheetnames = this.spreadsheet.getSheets().map(function(sheet) {return sheet.getName()});
  var expected = ['#BATCH_STATUS#', 'Sheet1', 'LEA', 'LEB', 'ICE', 'HML', 'pMGD'];
  this.assertEquals(expected, sheetnames);
  // Execute remainder
  batch_manager.ProcessWithContinuationCallback(function() {return true});
  // Verify
  var sheetnames = this.spreadsheet.getSheets().map(function(sheet) {return sheet.getName()});
  var expected = ['Sets', 'Sheet1', 'LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2'];
  this.assertEquals(expected, sheetnames);
}