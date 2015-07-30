// TestRunners
function NumThenLetterSortTestRunner() { new NumThenLetterSortTest().runTests(); }


// Tests for MtgData.NumThenLetterSortTest
function NumThenLetterSortTest() {
  TestCase.TestCase.call(this);
}
NumThenLetterSortTest.prototype = Object.create(TestCase.TestCase.prototype);
NumThenLetterSortTest.prototype.constructor = NumThenLetterSortTest;

NumThenLetterSortTest.prototype.name = 'NumThenLetterSortTest';

NumThenLetterSortTest.prototype.TestGreaterHelper = function(a, b) {
  this.assertGreater(MtgData.NumThenLetterSort(a, b), 0);
};

NumThenLetterSortTest.prototype.TestLessHelper = function(a, b) {
  this.assertLess(MtgData.NumThenLetterSort(a, b), 0);
};

NumThenLetterSortTest.prototype.TestEqualsHelper = function(a, b) {
  this.assertEquals(MtgData.NumThenLetterSort(a, b), 0);
};

NumThenLetterSortTest.prototype.testNumbersOnly = function() {
  this.TestGreaterHelper(1, 0);
  this.TestLessHelper(0, 1);
  this.TestEqualsHelper(1, 1);
  this.TestGreaterHelper(123, 23);
  this.TestGreaterHelper('123', '23');
  this.TestGreaterHelper(1, '0');
  this.TestEqualsHelper('1', 1);
};

NumThenLetterSortTest.prototype.testLettersOnly = function() {
  this.TestGreaterHelper('b', 'a');
  this.TestLessHelper('a', 'b');
  this.TestGreaterHelper('bcd', 'abcd');
  this.TestEqualsHelper('a', 'a');
  this.TestGreaterHelper('abcd', 'abc');
};

NumThenLetterSortTest.prototype.testNumbersAndLetters = function() {
  this.TestGreaterHelper('1a', 1);
  this.TestGreaterHelper('1b', '1a');
  this.TestLessHelper('51a', '51b');
  this.TestLessHelper('51a', '213');
};

NumThenLetterSortTest.prototype.testSorting = function() {
  // Setup
  var testlist = [1, 2, 10, '2b', '2a', 123, '124a', '124b', '51c', '51a', 295, '51b'];
  // Execute
  testlist.sort(MtgData.NumThenLetterSort);
  // Verify
  var expected = [1, 2, '2a', '2b', 10, '51a', '51b', '51c', 123, '124a', '124b', 295];
  this.assertEquals(expected, testlist);
};
