define([],function(){return Backbone.Model.extend({initialize:function(a){this.app=a},refresh:function(){if(!this.app.section){return{}}this.dict={};this.xml=$("<div/>");this._iterate(this.app.section.$el,this.dict,this.xml)},_iterate:function(d,e,b){var a=this;var c=$(d).children();c.each(function(){var i=this;var h=$(i).attr("id");if($(i).hasClass("section-row")||$(i).hasClass("tab-pane")){e[h]={};var f=a.app.input_list[h];if(f){e[h]={input:f}}var g=$('<div id="'+h+'"/>');b.append(g);a._iterate(i,e[h],g)}else{a._iterate(i,e,b)}})},findReferences:function(c,e){var g=[];var b=this;function d(h,j){var i=$(j).children();var l=[];var k=false;i.each(function(){var o=this;var n=$(o).attr("id");if(n!==c){var m=b.app.input_list[n];if(m){if(m.name==h){k=true;return false}if(m.data_ref==h&&m.type==e){l.push(n)}}}});if(!k){g=g.concat(l);i.each(function(){d(h,this)})}}var f=this.xml.find("#"+c);if(f.length>0){var a=this.app.input_list[c];if(a){d(a.name,f.parent())}}return g}})});