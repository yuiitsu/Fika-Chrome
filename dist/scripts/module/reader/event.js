"use strict";App.event.extend("content",function(){var n=this;this.event={close_reader_mode:function(){$(document).keydown(function(e){27===e.which&&n.module.reader.close_reader_mode()})}}});