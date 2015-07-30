// TestRunner
function DataManagerTestRunner() { new DataManagerTest().runTests(); }


// Tests for MtgData.DataManager
function DataManagerTest() {
  TestCase.TestCase.call(this);
}
DataManagerTest.prototype = Object.create(TestCase.TestCase.prototype);
DataManagerTest.prototype.constructor = DataManagerTest;

DataManagerTest.prototype.name = 'DataManagerTest';

DataManagerTest.prototype.testConstructor = function() {
  // Execute
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  // Verify
  var expected = ['LEA', 'LEB', 'ICE', 'VMA', 'pMGD', 'HML', 'ISD', 'ARC', 'HOP', 'PC2'];
  this.assertEquals(expected, Object.keys(data_manager.mtg_data));
};

DataManagerTest.prototype.testStripOnlineOnly = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  // Execute
  data_manager.StripOnlineOnly();
  // Verify
  var expected = ['LEA', 'LEB', 'ICE', 'pMGD', 'HML', 'ISD', 'ARC', 'HOP', 'PC2'];
  this.assertEquals(expected, Object.keys(data_manager.mtg_data));
};

DataManagerTest.prototype.testRegisterSet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  // Execute
  var set = new MtgData.Set(MockMtgJson.MtgJsonData['ISD'], data_manager);
  // Verify
  var expected = {'ISD': set};
  this.assertEquals(expected, data_manager.code_to_set);
  expected = {'2011-09-30_ISD': set};
  this.assertEquals(expected, data_manager.release_and_code_to_set);
};

DataManagerTest.prototype.testRegisterCard = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  // Execute
  var card = new MtgData.Card(MockMtgJson.MtgJsonData['ISD'].cards[0], 'ISD', 2, data_manager);
  // Verify
  var expected = {'ISD': {'85': card}};
  this.assertEquals(expected, data_manager.setcode_to_localid_to_card);
  expected = {'Abattoir Ghoul': [card]};
  this.assertEquals(expected, data_manager.name_to_cards);
};

DataManagerTest.prototype.testGetCardsByName = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  var cards = [
    new MtgData.Card(MockMtgJson.MtgJsonData['LEA'].cards[0], 'LEA', 2, data_manager),
    new MtgData.Card(MockMtgJson.MtgJsonData['LEB'].cards[0], 'LEB', 2, data_manager),
    new MtgData.Card(MockMtgJson.MtgJsonData['LEB'].cards[1], 'LEB', 3, data_manager)
  ];
  new MtgData.Card(MockMtgJson.MtgJsonData['LEA'].cards[1], 'LEA', 3, data_manager);
  // Execute
  var found = data_manager.GetCardsByName('Air Elemental');
  // Verify
  this.assertEquals(cards, found);
};

DataManagerTest.prototype.testGetCardBySetAndLocalId = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  new MtgData.Card(MockMtgJson.MtgJsonData['LEA'].cards[0], 'LEA', 2, data_manager);
  new MtgData.Card(MockMtgJson.MtgJsonData['LEA'].cards[1], 'LEA', 3, data_manager);
  var air_elemental_b1 = new MtgData.Card(MockMtgJson.MtgJsonData['LEB'].cards[0], 'LEB', 2, data_manager);
  new MtgData.Card(MockMtgJson.MtgJsonData['LEB'].cards[1], 'LEB', 3, data_manager);
  // Execute
  var found = data_manager.GetCardBySetAndLocalId('LEB', '389');
  // Verify
  this.assertEquals(air_elemental_b1, found);
};

DataManagerTest.prototype.testBuildSet = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  // Execute
  data_manager.BuildSet('ISD');
  // Verify
  this.assertEquals(['ISD'], Object.keys(data_manager.code_to_set));
  this.assertEquals('Innistrad', data_manager.code_to_set['ISD'].name);
  this.assertEquals(3, Object.keys(data_manager.setcode_to_localid_to_card['ISD']).length);
  this.assertEquals('Delver of Secrets', data_manager.setcode_to_localid_to_card['ISD']['51a'].name);
  this.assertEquals('Insectile Aberration', data_manager.setcode_to_localid_to_card['ISD']['51b'].name);
  this.assertEquals('Abattoir Ghoul', data_manager.setcode_to_localid_to_card['ISD']['85'].name);
};

DataManagerTest.prototype.testBuildAllSets = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  // Execute
  data_manager.BuildAllSets();
  // Verify
  var expected = ['LEA', 'LEB', 'ICE', 'VMA', 'pMGD', 'HML', 'ISD', 'ARC', 'HOP', 'PC2'];
  this.assertEquals(expected, Object.keys(data_manager.code_to_set));
};

DataManagerTest.prototype.testGetSets = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  // Execute
  var sets = data_manager.GetSets();
  // Verify
  var expected = [
    data_manager.code_to_set['LEA'],
    data_manager.code_to_set['LEB'],
    data_manager.code_to_set['ICE'],
    data_manager.code_to_set['HML'],
    data_manager.code_to_set['pMGD'],
    data_manager.code_to_set['HOP'],
    data_manager.code_to_set['ARC'],
    data_manager.code_to_set['ISD'],
    data_manager.code_to_set['PC2']
  ];
  this.assertEquals(expected, sets);
};

DataManagerTest.prototype.testGetSetCodes = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  // Execute
  var set_codes = data_manager.GetSetCodes();
  // Verify
  var expected = ['LEA', 'LEB', 'ICE', 'HML', 'pMGD', 'HOP', 'ARC', 'ISD', 'PC2'];
  this.assertEquals(expected, set_codes);
};

DataManagerTest.prototype.testGetSetByCode = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  // Execute
  var isd = data_manager.GetSetByCode('ISD');
  // Verify
  this.assertEquals(data_manager.code_to_set['ISD'], isd);
  this.assertEquals('ISD', isd.set_code);
};

DataManagerTest.prototype.testGetSetRowValues = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  // Execute
  var rows = data_manager.GetSetRowValues();
  // Verify
  var expected = [
    ['Release', 'Code', 'Name', 'Block', 'Type', 'Cards', 'Unique', 'Playsets', 'Count'],
    ['1993-08-05', 'LEA', 'Limited Edition Alpha', null, 'core', 4, '=COUNTIF(LEA!A:A,">0")', '=COUNTIF(LEA!A:A,">=4")', '=IFERROR(SUM(LEA!A:A),0)'],
    ['1993-10-01', 'LEB', 'Limited Edition Beta', null, 'core', 3, '=COUNTIF(LEB!A:A,">0")', '=COUNTIF(LEB!A:A,">=4")', '=IFERROR(SUM(LEB!A:A),0)'],
    ['1995-06-01', 'ICE', 'Ice Age', 'Ice Age', 'expansion', 4, '=COUNTIF(ICE!A:A,">0")', '=COUNTIF(ICE!A:A,">=4")', '=IFERROR(SUM(ICE!A:A),0)'],
    ['1995-10-01', 'HML', 'Homelands', null, 'expansion', 2, '=COUNTIF(HML!A:A,">0")', '=COUNTIF(HML!A:A,">=4")', '=IFERROR(SUM(HML!A:A),0)'],
    ['2007-07-14', 'pMGD', 'Magic Game Day', null, 'promo', 1, '=COUNTIF(pMGD!A:A,">0")', '=COUNTIF(pMGD!A:A,">=4")', '=IFERROR(SUM(pMGD!A:A),0)'],
    ['2009-09-04', 'HOP', 'Planechase', null, 'planechase', 1, '=COUNTIF(HOP!A:A,">0")', '=COUNTIF(HOP!A:A,">=4")', '=IFERROR(SUM(HOP!A:A),0)'],
    ['2010-06-18', 'ARC', 'Archenemy', null, 'archenemy', 1, '=COUNTIF(ARC!A:A,">0")', '=COUNTIF(ARC!A:A,">=4")', '=IFERROR(SUM(ARC!A:A),0)'],
    ['2011-09-30', 'ISD', 'Innistrad', 'Innistrad', 'expansion', 3, '=COUNTIF(ISD!A:A,">0")', '=COUNTIF(ISD!A:A,">=4")', '=IFERROR(SUM(ISD!A:A),0)'],
    ['2012-06-01', 'PC2', 'Planechase 2012 Edition', null, 'planechase', 2, '=COUNTIF(PC2!A:A,">0")', '=COUNTIF(PC2!A:A,">=4")', '=IFERROR(SUM(PC2!A:A),0)']
  ];
  this.assertEquals(expected, rows);
};

DataManagerTest.prototype.testApplyCardCounts = function() {
  // Setup
  var data_manager = new MtgData.DataManager(MockMtgJson.MtgJsonData);
  data_manager.StripOnlineOnly();
  data_manager.BuildAllSets();
  var counts = {'ISD': {
    '51a': {'copies': 3, 'foils': 2},
    '51b': {'copies': 4},
    '85': {'foils': 5}
  }};
  // Execute
  data_manager.ApplyCardCounts(counts);
  // Verify
  var isd_values = data_manager.GetSetByCode('ISD').GetCardRowValues();
  var expected = [
    ['Have', 'lID', 'mvID', 'Number', 'Name', 'Artist', 'Other Copies', 'Copies', 'Foils'],
    ['=SUM(H2,I2)', '51a', 226749, '51a', 'Delver of Secrets', 'Nils Hamm', null, 3, 2],
    ['=SUM(H3,I3)', '51b', 226755, '51b', 'Insectile Aberration', 'Nils Hamm', null, 4, null],
    ['=SUM(H4,I4)', '85', 222911, '85', 'Abattoir Ghoul', 'Volkan Baga', null, null, 5]
  ];
  this.assertEquals(expected, isd_values);
};
