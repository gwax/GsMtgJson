// TestRunners
function GetLatestFileByNameTestRunner() { new GetLatestFileByNameTest().runTests(); }
function ReadJsonFromFileTestRunner() { new ReadJsonFromFileTest().runTests(); }


// Tests for Util.GetLatestFileByName
function GetLatestFileByNameTest() {
  FilesTestCase.FilesTestCase.call(this);
}
GetLatestFileByNameTest.prototype = Object.create(FilesTestCase.FilesTestCase.prototype);
GetLatestFileByNameTest.prototype.constructor = GetLatestFileByNameTest;

GetLatestFileByNameTest.prototype.name = 'GetLatestFileByNameTest';

GetLatestFileByNameTest.prototype.testFileNotFound = function() {
  // Setup
  var filename = this.GetTestFilename();

  // Execute
  this.assertRaises(function() {
    MtgData.GetLatestFileByName(filename);
  }, Error('File not found.'));
};

GetLatestFileByNameTest.prototype.testFoundOneFile = function() {
  // Setup
  var filename = this.GetTestFilename();
  var file = this.CreateFile(filename, 'test file content');

  // Execute
  var found_file = MtgData.GetLatestFileByName(filename);

  // Verify and Clean up
  this.assertEquals(file.getId(), found_file.getId());
};

GetLatestFileByNameTest.prototype.testFoundTwoFiles = function() {
  // Setup
  var filename = this.GetTestFilename();
  var old_file = this.CreateFile(filename, 'test file content');
  var new_file = this.CreateFile(filename, 'test file content');

  // Execute
  var found_file = MtgData.GetLatestFileByName(filename);

  // Verify
  this.assertEquals(new_file.getId(), found_file.getId());
};


// Tests for Util.ReadJsonFromFile
function ReadJsonFromFileTest() {
  FilesTestCase.FilesTestCase.call(this);
}
ReadJsonFromFileTest.prototype = Object.create(FilesTestCase.FilesTestCase.prototype);
ReadJsonFromFileTest.prototype.constructor = GetLatestFileByNameTest;

ReadJsonFromFileTest.prototype.name = 'ReadJsonFromFileTest';

ReadJsonFromFileTest.prototype.testFileNotJson = function() {
  // Setup
  var filename = this.GetTestFilename('json');
  var sheet = SpreadsheetApp.create(filename);
  var jsonfile = DriveApp.getFileById(sheet.getId());
  this.AddFile(jsonfile);

  // Execute
  this.assertRaises(function() {
    MtgData.ReadJsonFromFile(jsonfile);
  }, Error('Invalid mime type.'));
};
ReadJsonFromFileTest.prototype.testFileNotJson.expect_error = 'Error';
ReadJsonFromFileTest.prototype.testFileNotJson.expect_error_message = 'Invalid mime type.';

ReadJsonFromFileTest.prototype.testBadJson = function() {
  // Setup
  var filename = this.GetTestFilename('json');
  var jsonfile = this.CreateFile(filename, '{"a":"b","c":[{', 'application/json');

  // Execute
  this.assertRaises(function() {
    MtgData.ReadJsonFromFile(jsonfile);
  }, SyntaxError());
};

ReadJsonFromFileTest.prototype.testSuccess = function() {
  // Setup
  var filename = this.GetTestFilename('json');
  var jsonfile = this.CreateFile(filename, '{"a":"b","c":[1,2,{"d":3}]}', 'application/json');

  // Execute
  var json = MtgData.ReadJsonFromFile(jsonfile);

  // Verify
  var expected = {'a': 'b', 'c': [1, 2, {'d': 3}]};
  this.assertEquals(expected, json);
};
