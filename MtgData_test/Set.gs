// TestRunner
function SetTestRunner() { new SetTest().runTests(); }


// Tests for MtgData.Set
function SetTest() {
  TestCase.TestCase.call(this);
  this.stubs = new Stubs.StubsManager();
}
SetTest.prototype = Object.create(TestCase.TestCase.prototype);
SetTest.prototype.constructor = SetTest;

SetTest.prototype.name = 'SetTest';

SetTest.prototype.tearDown = function() {
  this.stubs.UnSetAll();
  TestCase.TestCase.prototype.tearDown.call(this);
}

SetTest.prototype.testConstructAndRegister = function() {
  // Setup
  var set_data = MockMtgJson.MtgJsonData['ISD'];
  var data_manager = new MockDataManager();
  data_manager.registered_set = null;
  this.stubs.Set(MockDataManager.prototype, 'RegisterSet', function(set) {this.registered_set = set});
  // Execute
  var set = new MtgData.Set(set_data, data_manager);
  // Verify
  this.assertInstanceOf(set, MtgData.Set);
  this.assertNotEquals(null, data_manager.registered_set);
  this.assertEquals(data_manager.registered_set, set);
}

SetTest.prototype.testGetRowData = function() {
  // Setup
  var set_data = MockMtgJson.MtgJsonData['ISD'];
  var data_manager = new MockDataManager();
  var set = new MtgData.Set(set_data, data_manager);
  set.BuildCards();
  // Execute
  var row = set.GetRowData();
  // Verify
  var expected = [
    '2011-09-30',
    'ISD',
    'Innistrad',
    'Innistrad',
    'expansion',
    3,
    '=COUNTIF(ISD!A:A,">0")',
    '=COUNTIF(ISD!A:A,">=4")',
    '=IFERROR(SUM(ISD!A:A),0)'
  ];
  this.assertEquals(expected, row);
}

SetTest.prototype.testBuildCards = function() {
  // Setup
  var set_data = MockMtgJson.MtgJsonData['ISD'];
  var data_manager = new MockDataManager();
  var set = new MtgData.Set(set_data, data_manager);
  // Execute
  set.BuildCards();
  // Verify
  this.assertEquals(3, set.cards.length);
  var card_name_to_row = {};
  for (var i=0; i<set.cards.length; i++) {
    var card = set.cards[i];
    this.assertInstanceOf(card, MtgData.Card);
    card_name_to_row[card.name] = card.row_number;
  }
  var expected = {'Delver of Secrets': 2, 'Insectile Aberration': 3, 'Abattoir Ghoul': 4};
  this.assertEquals(expected, card_name_to_row);
}

SetTest.prototype.testBuildCards_IgnorePlanesAndSchemes = function() {
  // Setup
  var set_data = MockMtgJson.MtgJsonData['PC2'];
  var data_manager = new MockDataManager();
  var set = new MtgData.Set(set_data, data_manager);
  // Execute
  set.BuildCards();
  // Verify
  this.assertEquals(2, set.cards.length);
  var card_name_to_row = {};
  for (var i=0; i<set.cards.length; i++) {
    var card = set.cards[i];
    this.assertInstanceOf(card, MtgData.Card);
    card_name_to_row[card.name] = card.row_number;
  }
  var expected = {'Armored Griffin': 2, 'Kor Spiritdancer': 3};
  this.assertEquals(expected, card_name_to_row);
}

SetTest.prototype.testGetCardRowValues = function() {
  // Setup
  var set_data = MockMtgJson.MtgJsonData['ISD'];
  var data_manager = new MockDataManager();
  var set = new MtgData.Set(set_data, data_manager);
  set.BuildCards();
  // Execute
  var values = set.GetCardRowValues();
  // Verify
  var expected = [
    ['Have', 'lID', 'mvID', 'Number', 'Name', 'Artist', 'Other Copies', 'Copies', 'Foils'],
    ['=SUM(H2,I2)', '51a', 226749, '51a', 'Delver of Secrets', 'Nils Hamm', null, null, null],
    ['=SUM(H3,I3)', '51b', 226755, '51b', 'Insectile Aberration', 'Nils Hamm', null, null, null],
    ['=SUM(H4,I4)', '85', 222911, '85', 'Abattoir Ghoul', 'Volkan Baga', null, null, null]
  ];
  this.assertEquals(expected, values);
}
