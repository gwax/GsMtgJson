function LocalIdFromCardData(card_data) {
  return card_data.number || card_data.multiverseid || card_data.name;
}

function IsPlaneOrScheme(card_data) {
  return (typeof card_data.layout !== undefined && (
          card_data.layout == 'plane' ||
          card_data.layout == 'phenomenon' ||
          card_data.layout == 'scheme'));
}

function IsStrictlyBasicLand(card_data) {
  return (typeof card_data.supertypes != 'undefined' &&
          card_data.supertypes.length == 1 &&
          card_data.supertypes[0] == 'Basic');
}

function Card(card_data, set_code, row_number, data_manager) {
  this.set_code = set_code;
  this.row_number = row_number;
  this.data_manager = data_manager;

  this.name = card_data.name;
  this.multiverse_id = card_data.multiverseid;
  this.number = card_data.number;
  this.artist = card_data.artist;
  this.local_id = LocalIdFromCardData(card_data);
  this.strictly_basic = IsStrictlyBasicLand(card_data);

  // public variables
  this.copies = 0;
  this.foils = 0;

  this.data_manager.RegisterCard(this);
}
Card.prototype = {};

Card.prototype.HEADER = [
  'Have',  // A
  'lID',  // B
  'mvID',  // C
  'Number',  // D
  'Name',  // E
  'Artist',  // F
  'Other Copies',  // G
  'Copies',  // H
  'Foils'  // I
];

Card.prototype.COPY_COLUMNS = ['H', 'I'];

Card.prototype.GetRowData = function() {
  var row_num = this.row_number;
  function ColToCell(col) {return col + row_num;}
  var have_eqn = '=SUM(' + this.COPY_COLUMNS.map(ColToCell).join(',') + ')';
  return [
    have_eqn,
    this.local_id,
    this.multiverse_id,
    this.number,
    this.name,
    this.artist,
    this.GetOtherCopiesEquation(),
    this.copies || null,
    this.foils || null
  ];
};

Card.prototype.GetHaveCellref = function() {
  return this.set_code + '!A' + this.row_number;
};

Card.prototype.GetOtherCopiesEquation = function() {
  if (this.strictly_basic) return null;  // Tracking reprints of basics is a bit overwhelming for Google sheets.
  var set_count_fragments = this.GetOtherSetCountFragments();
  var print_counts = [];
  var print_filters = [];
  for (var set_code in set_count_fragments) {
    var fragment = set_count_fragments[set_code];
    print_counts.push('"' + set_code+':"&' + fragment);
    print_filters.push(fragment + '>0');
  }
  if (print_counts.length > 0) {
    return '=IFERROR(JOIN(", ", FILTER({'+print_counts.join(';')+'}, {'+print_filters.join(';')+'})), "")';
  } else {
    return null;
  }
};

Card.prototype.GetOtherSetCountFragments = function() {
  var set_to_other_copies = this.GetCopiesInOtherSets();
  var set_count_fragments = {};
  for (var set_code in set_to_other_copies) {
    var other_copies = set_to_other_copies[set_code];
    var have_refs = [];
    for (var i=0; i<other_copies.length; i++) {
      have_refs.push(other_copies[i].GetHaveCellref());
    }
    if (have_refs.length == 1) {
      set_count_fragments[set_code] = have_refs[0];
    } else if (have_refs.length > 1) {
      set_count_fragments[set_code] = 'SUM(' + have_refs.join(',') + ')';
    }
  }
  return set_count_fragments;
};

Card.prototype.GetCopiesInOtherSets = function() {
  var same_named_cards = this.data_manager.GetCardsByName(this.name);
  var set_to_other_copies = {};
  for (var i=0; i<same_named_cards.length; i++) {
    var other = same_named_cards[i];
    if (other.set_code == this.set_code) continue;
    var others = set_to_other_copies[other.set_code] || [];
    others.push(other);
    set_to_other_copies[other.set_code] = others;
  }
  return set_to_other_copies;
};
