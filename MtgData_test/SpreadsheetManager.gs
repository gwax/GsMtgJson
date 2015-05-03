// TestRunner
function SpreadsheetManagerTestRunner() { new SpreadsheetManagerTest().runTests(); }


// Tests for MtgData.SpreadsheetManager
function SpreadsheetManagerTest() {
  SpreadsheetTestCase.SpreadsheetTestCase.call(this);
}
SpreadsheetManagerTest.prototype = Object.create(SpreadsheetTestCase.SpreadsheetTestCase.prototype);
SpreadsheetManagerTest.prototype.constructor = SpreadsheetManagerTest;

SpreadsheetManagerTest.prototype.name = 'SpreadsheetManagerTest';

SpreadsheetManagerTest.prototype.testBackup = function() {
  // Setup
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, null);
  var sheet = this.spreadsheet.getSheetByName('Sheet1');
  var range = sheet.getRange(1, 1, 2, 2);
  range.setValues([[1, 2], [3, 4]]);
  // Execute
  var spreadsheet_copy = sheet_manager.Backup();
  this.AddFile(DriveApp.getFileById(spreadsheet_copy.getId()));  // Cleanup
  var range = sheet.getRange(1, 1, 2, 2);
  range.setValues([[5, 6], [7, 8]]);
  // Verify
  // Old changed
  var sheet = this.spreadsheet.getSheetByName('Sheet1');
  var values = sheet.getRange(1, 1, 2, 2).getValues();
  this.assertEquals([[5, 6], [7, 8]], values);
  // Backup unchanged
  var sheet_copy = spreadsheet_copy.getSheetByName('Sheet1');
  var values_copy = sheet_copy.getRange(1, 1, 2, 2).getValues();
  this.assertEquals([[1, 2], [3, 4]], values_copy);
  // File names worked
  var old_name = this.spreadsheet.getName();
  var new_name = spreadsheet_copy.getName();
  this.assertEquals(old_name, new_name.slice(0, old_name.length));
  var datestart = old_name.length + ' (backup: '.length;
  var dateend = new_name.length - 1;
  var datestr = new_name.slice(datestart, dateend);
  var time = Date.parse(datestr);
  this.assertGreater(time, 0);
}

SpreadsheetManagerTest.prototype.testCreateSetsSheet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  // Execute
  sheet_manager.CreateSetsSheet();
  // Verify
  var sets_sheet = this.spreadsheet.getSheetByName('Sets');
  var data_range =  sets_sheet.getDataRange();
  var data_values = data_range.getValues();
  var data_formulas = data_range.getFormulas();
  var expected_values = [
    ["Release","Code","Name","Block","Type","Cards","Unique","Playsets","Count"],
    [new Date(1993,08,05),"LEA","Limited Edition Alpha","","core",4,0,0,0],
    [new Date(1993,10,01),"LEB","Limited Edition Beta","","core",3,0,0,0],
    [new Date(1995,06,01),"ICE","Ice Age","Ice Age","expansion",4,0,0,0],
    [new Date(1995,10,01),"HML","Homelands","","expansion",2,0,0,0],
    [new Date(2007,07,14),"pMGD","Magic Game Day","","promo",1,0,0,0],
    [new Date(2009,09,04), 'HOP', 'Planechase', "", 'planechase', 1,0,0,0],
    [new Date(2010,06,18), 'ARC', 'Archenemy', "", 'archenemy', 1,0,0,0],
    [new Date(2011,09,30),"ISD","Innistrad","Innistrad","expansion",3,0,0,0],
    [new Date(2012,06,01), 'PC2', 'Planechase 2012 Edition', "", 'planechase', 2,0,0,0]
  ];
  //this.assertEquals(expected_values, data_values);
  var expected_formulas = [
    ["","","","","","","","",""],
    ["","","","","","", '=COUNTIF(LEA!A:A,">0")', '=COUNTIF(LEA!A:A,">=4")', '=IFERROR(SUM(LEA!A:A),0)'],
    ["","","","","","", '=COUNTIF(LEB!A:A,">0")', '=COUNTIF(LEB!A:A,">=4")', '=IFERROR(SUM(LEB!A:A),0)'],
    ["","","","","","", '=COUNTIF(ICE!A:A,">0")', '=COUNTIF(ICE!A:A,">=4")', '=IFERROR(SUM(ICE!A:A),0)'],
    ["","","","","","", '=COUNTIF(HML!A:A,">0")', '=COUNTIF(HML!A:A,">=4")', '=IFERROR(SUM(HML!A:A),0)'],
    ["","","","","","", '=COUNTIF(pMGD!A:A,">0")', '=COUNTIF(pMGD!A:A,">=4")', '=IFERROR(SUM(pMGD!A:A),0)'],
    ["","","","","","", '=COUNTIF(HOP!A:A,">0")', '=COUNTIF(HOP!A:A,">=4")', '=IFERROR(SUM(HOP!A:A),0)'],
    ["","","","","","", '=COUNTIF(ARC!A:A,">0")', '=COUNTIF(ARC!A:A,">=4")', '=IFERROR(SUM(ARC!A:A),0)'],
    ["","","","","","", '=COUNTIF(ISD!A:A,">0")', '=COUNTIF(ISD!A:A,">=4")', '=IFERROR(SUM(ISD!A:A),0)'],
    ["","","","","","", '=COUNTIF(PC2!A:A,">0")', '=COUNTIF(PC2!A:A,">=4")', '=IFERROR(SUM(PC2!A:A),0)']
  ];
  this.assertEquals(expected_formulas, data_formulas);
}

SpreadsheetManagerTest.prototype.testCreateSheetForSet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  // Execute
  sheet_manager._CreateSheetForSet('ISD');
  // Verify
  var isd_sheet = this.spreadsheet.getSheetByName('ISD');
  var data_range =  isd_sheet.getDataRange();
  var data_values = data_range.getValues();
  var data_formulas = data_range.getFormulas();
  var expected_values = [
    ['Have', 'lID', 'mvID', 'Number', 'Name', 'Artist', 'Other Copies', 'Copies', 'Foils'],
    [0, '51a', 226749, '51a', 'Delver of Secrets', 'Nils Hamm', '', '', ''],
    [0, '51b', 226755, '51b', 'Insectile Aberration', 'Nils Hamm', '', '', ''],
    [0, '85', 222911, '85', 'Abattoir Ghoul', 'Volkan Baga', '', '', '']
  ];
  this.assertEquals(expected_values, data_values);
  var expected_formulas = [
    ['', '', '', '', '', '', '', '', ''],
    ['=SUM(H2,I2)', '', '', '', '', '', '', '', ''],
    ['=SUM(H3,I3)', '', '', '', '', '', '', '', ''],
    ['=SUM(H4,I4)', '', '', '', '', '', '', '', '']
  ];
  this.assertEquals(expected_formulas, data_formulas);
}

SpreadsheetManagerTest.prototype.testReadCardCounts = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  sheet_manager._CreateSheetForSet('ISD');
  var sheet = this.spreadsheet.getSheetByName('ISD');
  var range = sheet.getRange('H2:I4');
  range.setValues([
    ['', 2],
    [4, ''],
    [7, 8]
  ]);
  // Execute
  var card_counts = sheet_manager.ReadCardCounts('ISD');
  // Verify
  var expected = {
    'ISD': {
      '51a': {'foils': 2},
      '51b': {'copies': 4},
      '85': {'copies': 7, 'foils': 8}
    }
  }
  this.assertEquals(expected, card_counts, 'AssertEquals(' + JSON.stringify(expected) + ', ' + JSON.stringify(card_counts) + ')');
}

SpreadsheetManagerTest.prototype.testCreateOrUpdateSheetForSet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  sheet_manager._CreateSheetForSet('ISD');
  var sheet = this.spreadsheet.getSheetByName('ISD');
  var range = sheet.getRange('H2:I4');
  range.setValues([
    ['', 2],
    [4, ''],
    [7, 8]
  ]);
  // Create new data manager and sheet manager so we know that we're not using old data
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  // Execute
  sheet_manager.CreateOrUpdateSheetForSet('ISD');
  // Verify
  var sheet = this.spreadsheet.getSheetByName('ISD');
  var range = sheet.getRange('H2:I4');
  var values = range.getValues();
  var expected = [
    ['', 2],
    [4, ''],
    [7, 8]
  ]
  this.assertEquals(expected, values);
}

SpreadsheetManagerTest.prototype.testCreateEverything = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  // Execute
  sheet_manager.CreateEverything();
  // Verify
  var sheets = this.spreadsheet.getSheets();
  var sheetnames = [];
  for (var i=0; i<sheets.length; i++) {
    sheetnames.push(sheets[i].getName());
  }
  var expected = ['Sets', 'Sheet1', 'LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2'];
  this.assertEquals(expected, sheetnames);
}

SpreadsheetManagerTest.prototype.testCheckEquations = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var sheet_manager = new MtgData.SpreadsheetManager(this.spreadsheet, data_manager);
  sheet_manager.DoublePassCreateEverything();
  var sheet = this.spreadsheet.getSheetByName('ISD');
  sheet.getRange('H2:I4').setValues([[1, ''], [5, ''], [1, 1]]);
  var sheet = this.spreadsheet.getSheetByName('LEB');
  sheet.getRange('H2:I4').setValues([[4, ''], ['', 8], [8, 10]]);
  var sheet = this.spreadsheet.getSheetByName('ICE');
  sheet.getRange('H2:I3').setValues([[4, null], [4, null]]);
  // Execute
  SpreadsheetApp.flush();
  // Verify
  var sheet = this.spreadsheet.getSheetByName('Sets')
  var values = sheet.getDataRange().getValues();
  var expected = [
    ["Release","Code","Name","Block","Type","Cards","Unique","Playsets","Count"],
    [new Date(1993,08,05),"LEA","Limited Edition Alpha","","core",4,0,0,0],
    [new Date(1993,10,01),"LEB","Limited Edition Beta","","core",3,3,3,30],
    [new Date(1995,06,01),"ICE","Ice Age","Ice Age","expansion",4,2,2,8],
    [new Date(1995,10,01),"HML","Homelands","","expansion",2,0,0,0],
    [new Date(2007,07,14),"pMGD","Magic Game Day","","promo",1,0,0,0],
    [new Date(2009,09,04), 'HOP', 'Planechase', "", 'planechase', 1,0,0,0],
    [new Date(2010,06,18), 'ARC', 'Archenemy', "", 'archenemy', 1,0,0,0],
    [new Date(2011,09,30),"ISD","Innistrad","Innistrad","expansion",3,3,1,8],
    [new Date(2012,06,01), 'PC2', 'Planechase 2012 Edition', "", 'planechase', 2,0,0,0]
  ];
  this.assertEquals(expected, values);
  var sheet = this.spreadsheet.getSheetByName('ISD')
  var values = sheet.getDataRange().getValues();
  var expected = [
    ['Have', 'lID', 'mvID', 'Number', 'Name', 'Artist', 'Other Copies', 'Copies', 'Foils'],
    [1, '51a', 226749, '51a', 'Delver of Secrets', 'Nils Hamm', '', 1, ''],
    [5, '51b', 226755, '51b', 'Insectile Aberration', 'Nils Hamm', '', 5, ''],
    [2, '85', 222911, '85', 'Abattoir Ghoul', 'Volkan Baga', '', 1, 1]
  ];
  this.assertEquals(expected, values);
  var sheet = this.spreadsheet.getSheetByName('LEA')
  var values = sheet.getDataRange().getValues();
  var expected = [
    ['Have', 'lID', 'mvID', 'Number', 'Name', 'Artist', 'Other Copies', 'Copies', 'Foils'],
    [0, '94', 94, 'undefined', 'Air Elemental', 'Richard Thomas', 'LEB:12', '', ''],
    [0, '95', 95, 'undefined', 'Ancestral Recall', 'Mark Poole', 'LEB:18', '', ''],
    [0, '294', 294, 'undefined', 'Plains', 'Jesper Myrfors', '', '', ''],
    [0, '295', 295, 'undefined', 'Plains', 'Jesper Myrfors', '', '', '']
  ];
  this.assertEquals(expected, values);
}
