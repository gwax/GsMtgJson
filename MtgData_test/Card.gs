// TestRunner
function CardTestRunner() { new CardTest().runTests(); }


// Tests for MtgData.Card
function CardTest() {
  TestCase.TestCase.call(this);
  this.stubs = new Stubs.StubsManager();
}
CardTest.prototype = Object.create(TestCase.TestCase.prototype);
CardTest.prototype.constructor = CardTest;

CardTest.prototype.name = 'CardTest';

CardTest.prototype.tearDown = function() {
  this.stubs.UnSetAll();
  TestCase.TestCase.prototype.tearDown.call(this);
};

CardTest.prototype.testLocalIdFromCardData = function() {
  var card_data = MockMtgJson.MtgJsonData.LEA.cards[0];
  var localid = MtgData.LocalIdFromCardData(card_data);

  this.assertEquals(94, localid);

  card_data = MockMtgJson.MtgJsonData.ISD.cards[1];
  localid = MtgData.LocalIdFromCardData(card_data);

  this.assertEquals('51a', localid);
};

CardTest.prototype.testIsPlaneOrScheme = function() {
  var card_data = MockMtgJson.MtgJsonData.ARC.cards[0];
  this.assertEquals('All in Good Time', card_data.name);
  this.assertTrue(MtgData.IsPlaneOrScheme(card_data));

  card_data = MockMtgJson.MtgJsonData.ARC.cards[1];
  this.assertEquals('Leonin Abunas', card_data.name);
  this.assertFalse(MtgData.IsPlaneOrScheme(card_data));

  card_data = MockMtgJson.MtgJsonData.HOP.cards[0];
  this.assertEquals('Academy at Tolaria West', card_data.name);
  this.assertTrue(MtgData.IsPlaneOrScheme(card_data));

  card_data = MockMtgJson.MtgJsonData.PC2.cards[0];
  this.assertEquals('Akoum', card_data.name);
  this.assertTrue(MtgData.IsPlaneOrScheme(card_data));

  card_data = MockMtgJson.MtgJsonData.PC2.cards[2];
  this.assertEquals('Chaotic \\u00c6ther', card_data.name);
  this.assertTrue(MtgData.IsPlaneOrScheme(card_data));
};

CardTest.prototype.testIsStrictlyBasicLand = function() {
  // Setup
  var card_datas = [
    MockMtgJson.MtgJsonData.ICE.cards[0],
    MockMtgJson.MtgJsonData.ICE.cards[3],
    MockMtgJson.MtgJsonData.LEA.cards[0]];
  // Execute
  var strictly_basics = card_datas.map(MtgData.IsStrictlyBasicLand);
  // Verify
  var expected = [true, false, false];
  this.assertEquals(expected, strictly_basics);
};

CardTest.prototype.testConstructAndRegister = function() {
  // Setup
  var set_code = 'ISD';
  var row_number = 5;
  var card_data = MockMtgJson.MtgJsonData[set_code].cards[0];
  var data_manager = new MockDataManager();
  data_manager.registered_card = null;
  this.stubs.Set(MockDataManager.prototype, 'RegisterCard', function(card) {this.registered_card = card;});
  // Execute
  var card = new MtgData.Card(card_data, set_code, row_number, data_manager);
  // Verify
  this.assertInstanceOf(card, MtgData.Card);
  this.assertNotEquals(null, data_manager.registered_card);
  this.assertEquals(data_manager.registered_card, card);
};

CardTest.prototype.testGetRowData = function() {
  // Setup
  var set_code = 'ISD';
  var row_number = 7;
  var card_data = MockMtgJson.MtgJsonData[set_code].cards[0];
  var data_manager = new MockDataManager();
  var card = new MtgData.Card(card_data, set_code, row_number, data_manager);
  this.stubs.Set(MtgData.Card.prototype, 'GetOtherCopiesEquation', function() {return 'OTHER COPIES';});
  // Execute
  var row = card.GetRowData();
  // Verify
  var expected = [
    '=SUM(H7,I7)',
    '85',
    222911,
    '85',
    'Abattoir Ghoul',
    'Volkan Baga',
    'OTHER COPIES',
    null,
    null
  ];
  this.assertEquals(expected, row);
};

CardTest.prototype.testGetRowData_WithCopyData = function() {
  // Setup
  var set_code = 'ISD';
  var row_number = 7;
  var card_data = MockMtgJson.MtgJsonData[set_code].cards[0];
  var data_manager = new MockDataManager();
  var card = new MtgData.Card(card_data, set_code, row_number, data_manager);
  this.stubs.Set(MtgData.Card.prototype, 'GetOtherCopiesEquation', function() {return 'OTHER COPIES';});
  // Execute
  card.copies = 4;
  card.foils = 12;
  var row = card.GetRowData();
  // Verify
  var expected = [
    '=SUM(H7,I7)',
    '85',
    222911,
    '85',
    'Abattoir Ghoul',
    'Volkan Baga',
    'OTHER COPIES',
    4,
    12
  ];
  this.assertEquals(expected, row);
};

CardTest.prototype.testGetHaveCellref = function() {
  // Setup
  var set_code = 'ISD';
  var row_number = 11;
  var card_data = MockMtgJson.MtgJsonData[set_code].cards[0];
  var data_manager = new MockDataManager();
  var card = new MtgData.Card(card_data, set_code, row_number, data_manager);
  this.stubs.Set(MtgData.Card.prototype, 'GetOtherCopiesEquation', function() {return 'OTHER COPIES';});
  // Execute
  var cellref = card.GetHaveCellref();
  // Verify
  this.assertEquals('ISD!A11', cellref);
};

CardTest.prototype.testGetCopiesInOtherSets = function() {
  // Setup
  var lea_air_elemental_data = MockMtgJson.MtgJsonData.LEA.cards[0];
  var leb_air_elemental_data1 = MockMtgJson.MtgJsonData.LEB.cards[0];
  var leb_air_elemental_data2 = MockMtgJson.MtgJsonData.LEB.cards[1];
  var data_manager = new MockDataManager();
  var lea_air_elemental = new MtgData.Card(lea_air_elemental_data, 'LEA', 1, data_manager);
  var leb_air_elemental1 = new MtgData.Card(leb_air_elemental_data1, 'LEB', 1, data_manager);
  var leb_air_elemental2 = new MtgData.Card(leb_air_elemental_data2, 'LEB', 2, data_manager);
  function OtherCardsStub(card_name) {
    if (card_name == 'Air Elemental') {
      return [lea_air_elemental, leb_air_elemental1, leb_air_elemental2];
    } else {
      return [];
    }
  }
  this.stubs.Set(MockDataManager.prototype, 'GetCardsByName', OtherCardsStub);
  // Execute
  var lea_other_copies = lea_air_elemental.GetCopiesInOtherSets();
  var leb_other_copies = leb_air_elemental1.GetCopiesInOtherSets();
  // Verify
  this.assertEquals({'LEB': [leb_air_elemental1, leb_air_elemental2]}, lea_other_copies);
  this.assertEquals({'LEA': [lea_air_elemental]}, leb_other_copies);
};

CardTest.prototype.testGetOtherSetCountFragments = function() {
  // Setup
  var lea_air_elemental_data = MockMtgJson.MtgJsonData.LEA.cards[0];
  var leb_air_elemental_data1 = MockMtgJson.MtgJsonData.LEB.cards[0];
  var leb_air_elemental_data2 = MockMtgJson.MtgJsonData.LEB.cards[1];
  var data_manager = new MockDataManager();
  var lea_air_elemental = new MtgData.Card(lea_air_elemental_data, 'LEA', 1, data_manager);
  var leb_air_elemental1 = new MtgData.Card(leb_air_elemental_data1, 'LEB', 2, data_manager);
  var leb_air_elemental2 = new MtgData.Card(leb_air_elemental_data2, 'LEB', 3, data_manager);
  function OtherCardsStub(card_name) {
    if (card_name == 'Air Elemental') {
      return [lea_air_elemental, leb_air_elemental1, leb_air_elemental2];
    } else {
      return [];
    }
  }
  this.stubs.Set(MockDataManager.prototype, 'GetCardsByName', OtherCardsStub);
  // Execute
  var lea_other_count_fragments = lea_air_elemental.GetOtherSetCountFragments();
  var leb_other_count_fragments = leb_air_elemental1.GetOtherSetCountFragments();
  // Verify
  this.assertEquals({'LEB': 'SUM(LEB!A2,LEB!A3)'}, lea_other_count_fragments);
  this.assertEquals({'LEA': 'LEA!A1'}, leb_other_count_fragments);
};

CardTest.prototype.testGetOtherCopiesEquation = function() {
  // Setup
  var lea_air_elemental_data = MockMtgJson.MtgJsonData.LEA.cards[0];
  var leb_air_elemental_data1 = MockMtgJson.MtgJsonData.LEB.cards[0];
  var leb_air_elemental_data2 = MockMtgJson.MtgJsonData.LEB.cards[1];
  var lea_plains_data = MockMtgJson.MtgJsonData.LEA.cards[2];
  var ice_plains_data = MockMtgJson.MtgJsonData.ICE.cards[0];
  var isd_abattoir_ghoul_data = MockMtgJson.MtgJsonData.ISD.cards[0];
  var data_manager = new MockDataManager();
  var lea_air_elemental = new MtgData.Card(lea_air_elemental_data, 'LEA', 1, data_manager);
  var leb_air_elemental1 = new MtgData.Card(leb_air_elemental_data1, 'LEB', 2, data_manager);
  var leb_air_elemental2 = new MtgData.Card(leb_air_elemental_data2, 'LEB', 3, data_manager);
  var lea_plains = new MtgData.Card(lea_plains_data, 'LEA', 2, data_manager);
  var ice_plains = new MtgData.Card(ice_plains_data, 'ICE', 1, data_manager);
  var isd_abattoir_ghoul = new MtgData.Card(isd_abattoir_ghoul_data, 'ISD', 1, data_manager);
  function OtherCardsStub(card_name) {
    if (card_name == 'Air Elemental') {
      return [lea_air_elemental, leb_air_elemental1, leb_air_elemental2];
    } else if (card_name == 'Plains') {
      return [lea_plains, ice_plains];
    } else if (card_name == 'Abattoir Ghoul') {
      return [isd_abattoir_ghoul];
    } else {
      throw new Error('Unexpected card name: ' + card_name);
    }
  }
  this.stubs.Set(MockDataManager.prototype, 'GetCardsByName', OtherCardsStub);
  // Execute
  var lea_air_other_copies_eqn = lea_air_elemental.GetOtherCopiesEquation();
  var leb_air_other_copies_eqn = leb_air_elemental1.GetOtherCopiesEquation();
  var lea_plains_other_copies_eqn = lea_plains.GetOtherCopiesEquation();
  var isd_abattoir_ghoul_other_copies_eqn = isd_abattoir_ghoul.GetOtherCopiesEquation();
  // Verify
  this.assertEquals(
    '=IFERROR(JOIN(", ", FILTER({"LEB:"&SUM(LEB!A2,LEB!A3)}, {SUM(LEB!A2,LEB!A3)>0})), "")',
    lea_air_other_copies_eqn);
  this.assertEquals(
    '=IFERROR(JOIN(", ", FILTER({"LEA:"&LEA!A1}, {LEA!A1>0})), "")',
    leb_air_other_copies_eqn);
  this.assertEquals(null, lea_plains_other_copies_eqn);
  this.assertEquals(null, isd_abattoir_ghoul_other_copies_eqn);
};
