// TestRunners
function CleanUpSheetTestRunner() { new CleanUpSheetTest().runTests(); }
function SetSheetSizeTestRunner() { new SetSheetSizeTest().runTests(); }


// Tests for Util.CleanUpSheet
function CleanUpSheetTest() {
  SpreadsheetTestCase.SpreadsheetTestCase.call(this, 10, 10);
}
CleanUpSheetTest.prototype = Object.create(SpreadsheetTestCase.SpreadsheetTestCase.prototype);
CleanUpSheetTest.prototype.constructor = CleanUpSheetTest;

CleanUpSheetTest.prototype.name = 'CleanUpSheetTest';

CleanUpSheetTest.prototype.testResizeColumns = function() {
  // Setup
  var range = this.sheet.getRange(1, 1, 2, 5);
  var values = [['abc', 'abc', 'abc', 'abc', 'abc'], [1, 2, 3, 4, 5]];
  range.setValues(values);
  this.sheet.setColumnWidth(2, 10);
  this.sheet.setColumnWidth(3, 30);
  this.sheet.setColumnWidth(4, 100);
  this.sheet.setColumnWidth(5, 500);
  
  // Execute
  MtgData.CleanUpSheet(this.sheet, 2, 5, [], []);
  
  // Verify
  var column_width = this.sheet.getColumnWidth(1);
  this.assertEquals(column_width, this.sheet.getColumnWidth(2));
  this.assertEquals(column_width, this.sheet.getColumnWidth(3));
  this.assertEquals(column_width, this.sheet.getColumnWidth(4));
  this.assertEquals(column_width, this.sheet.getColumnWidth(5));
}

CleanUpSheetTest.prototype.testStringColumns = function() {
  // Setup
  var range = this.sheet.getRange(1, 1, 2, 5);
  var values = [['abc', 'abc', 'abc', 'abc', 'abc'], [1, 2, 3, 4, 5]];
  range.setValues(values);
  
  // Execute
  MtgData.CleanUpSheet(this.sheet, 2, 5, [2, 3], []);
  
  // Verify
  var values = this.sheet.getRange(1, 1, 2, 5).getValues();
  var expected = [['abc', 'abc', 'abc', 'abc', 'abc'], [1, '2', '3', 4, 5]];
  this.assertEquals(expected, values);
}

CleanUpSheetTest.prototype.testHideColumns = function() {
  // TODO(waksman): figure out how to implement
}

CleanUpSheetTest.prototype.testFrozenRows = function() {
  // Setup
  var range = this.sheet.getRange(1, 1, 2, 5);
  var values = [['abc', 'abc', 'abc', 'abc', 'abc'], [1, 2, 3, 4, 5]];
  range.setValues(values);
  
  // Execute
  MtgData.CleanUpSheet(this.sheet, 2, 5, [], []);
  
  // Verify
  this.assertEquals(1, this.sheet.getFrozenRows());
}


// Tests for Util.SetSheetSize
function SetSheetSizeTest() {
  SpreadsheetTestCase.SpreadsheetTestCase.call(this, 5, 4);
}
SetSheetSizeTest.prototype = Object.create(SpreadsheetTestCase.SpreadsheetTestCase.prototype);
SetSheetSizeTest.prototype.constructor = SetSheetSizeTest;

SetSheetSizeTest.prototype.name = 'SetSheetSize';

SetSheetSizeTest.prototype.testExpandSheet = function() {
  // Execute
  MtgData.SetSheetSize(this.sheet, 7, 6);
  
  // Verify
  this.assertEquals(7, this.sheet.getMaxRows());
  this.assertEquals(6, this.sheet.getMaxColumns());
}

SetSheetSizeTest.prototype.testShrinkSheet = function() {
  // Execute
  MtgData.SetSheetSize(this.sheet, 2, 3);
  
  // Verify
  this.assertEquals(2, this.sheet.getMaxRows());
  this.assertEquals(3, this.sheet.getMaxColumns());
}

SetSheetSizeTest.prototype.testExpandOneShrinkOther = function() {
  // Execute
  MtgData.SetSheetSize(this.sheet, 6, 3)
  
  // Verify
  this.assertEquals(6, this.sheet.getMaxRows());
  this.assertEquals(3, this.sheet.getMaxColumns());
}