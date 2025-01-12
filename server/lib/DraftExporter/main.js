'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


const FORMATS = require('./formats')
var DraftExporter = function () {
  function DraftExporter(rawData) {
    _classCallCheck(this, DraftExporter);

    this.rawData = rawData;
    this.offsets = [];
    this.formatter = FORMATS.HTML;
  }

  _createClass(DraftExporter, [{
    key: 'defineOffsets',
    value: function defineOffsets(inlineStyles) {
      var _this = this;

      inlineStyles.map(function (metadata) {
        var offset = {};
        offset.start = metadata.offset;
        offset.end = metadata.offset + metadata.length;
        offset.style = metadata.style;
        _this.offsets.push(offset);
      });
    }
  }, {
    key: 'checkStylesBefore',
    value: function checkStylesBefore(index) {
      var formatter = this.formatter['INLINE'];
      var text = "";
      this.offsets.map(function (offset) {
        if (index == offset.start && formatter[offset.style] != null) text += formatter[offset.style].open;
      });
      return text;
    }
  }, {
    key: 'checkStylesAfter',
    value: function checkStylesAfter(index) {
      var formatter = this.formatter['INLINE'];
      var text = "";
      this.offsets.map(function (offset) {
        if (index == offset.end && formatter[offset.style] != null) text += formatter[offset.style].close;
      });
      return text;
    }
  }, {
    key: 'export',
    value: function _export() {
      var _this2 = this;

      var blocks = this.rawData.blocks;
      var exportText = "";
      blocks.map(function (block) {
        block.text = (block.text || "").replace(/</g,'&lt;').replace(/>/g,'&gt;');

        _this2.offsets = []
        _this2.defineOffsets(block.inlineStyleRanges);
        var formatter = _this2.formatter['BLOCK'][block.type] || { open: "", close: "" }; // Fallback to unstyled
        exportText += formatter.open;
        for (var i = 0; i < block.text.length; i++) {
          exportText += _this2.checkStylesBefore(i);
          exportText += block.text.charAt(i);
          exportText += _this2.checkStylesAfter(i + 1);
        }
        exportText += formatter.close;
      });
      return exportText;
    }
  }]);

  return DraftExporter;
}();

module.exports = DraftExporter;
