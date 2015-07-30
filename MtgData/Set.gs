function Set(set_data, data_manager) {
  this.data_manager = data_manager;

  this.set_code = set_data.code;
  this.release_date = set_data.releaseDate;
  this.name = set_data.name;
  this.block = set_data.block;
  this.set_type = set_data.type;
  this.card_data = set_data.cards;

  this.cards = [];

  this.data_manager.RegisterSet(this);
}
Set.prototype = {};

Set.prototype.HEADER = [
  'Release',  // A
  'Code',  // B
  'Name',  // C
  'Block',  // D
  'Type',  // E
  'Cards',  // F
  'Unique', // G
  'Playsets', // H
  'Count' // I
];

Set.prototype.GetRowData = function() {
  var have_range = this.set_code + '!A:A';
  var unique_eqn = '=COUNTIF(' + have_range + ',">0")';
  var playsets_eqn = '=COUNTIF(' + have_range + ',">=4")';
  var count_eqn = '=IFERROR(SUM(' + have_range + '),0)';
  return [
    this.release_date,
    this.set_code,
    this.name,
    this.block || null,
    this.set_type,
    this.cards.length,
    unique_eqn,
    playsets_eqn,
    count_eqn
  ];
};

Set.prototype.BuildCards = function() {
  var sort_id_to_card_data = {};
  for (var i=0; i<this.card_data.length; i++) {
    var card_data = this.card_data[i];
    var vps = IsPlaneOrScheme(card_data);
    if (vps) continue; // There is a bug in mtg json where planes/schemes overlap with regular card numbers.
    var sort_id = LocalIdFromCardData(card_data);
    sort_id_to_card_data[sort_id] = card_data;
  }
  var sort_ids = Object.keys(sort_id_to_card_data);
  sort_ids.sort(NumThenLetterSort);

  this.cards = [];
  for (var i=0; i<sort_ids.length; i++) {
    var card_data = sort_id_to_card_data[sort_ids[i]];
    var row_number = i + 2;  // +1 for header, +1 for zero-vs-one index == +2
    var card = new Card(card_data, this.set_code, row_number, this.data_manager);
    this.cards.push(card);
  }
};

Set.prototype.GetCardRowValues = function() {
  var values = [];
  values.push(Card.prototype.HEADER);
  for (var i=0; i<this.cards.length; i++) {
    values.push(this.cards[i].GetRowData());
  }
  return values;
};
