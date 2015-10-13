//  @@@ web_tree_date_search custom JS @@@
// #############################################################################
//
//    Copyright (c) 2015 Noviat nv/sa (www.noviat.com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// #############################################################################


openerp.web_tree_date_search = function(instance) {
    var _t = instance.web._t,
       _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    // Replace the path
    instance.web.ListView.include({
        init: function(parent, dataset, view_id, options) {
            this._super.apply(this, arguments);
            if ("dates_filter" in dataset.context){
                this.dates_filter = dataset.context["dates_filter"]
                this.current_date_from  = [];
                this.current_date_to  = [];
            }
            this.tree_date_search_loaded = false;
        },
        do_load_state: function(state, warm) {
            if (this.dates_filter && this.dates_filter.length > 0){
                var $ui_toolbar_loc = $('.ui-toolbar:last').show();
            }
            else{
                $('.ui-toolbar:last').hide();
            }
            return this._super.apply(this, arguments);
        },
        load_list: function(data) {
            var self = this;
            var tmp = this._super.apply(this, arguments);
            if (!this.tree_date_search_loaded){
                this.date_field_string = [];
                for (i in this.dates_filter){
                    var date_field = this.dates_filter[i];
                    for (col in this.columns){
                        if (this.columns[col].name == date_field){
                            this.date_field_string[date_field] = this.columns[col].string;
                            break;
                        }
                    }
                }
                if (this.dates_filter && this.dates_filter.length > 0){
                    this.$el.parent().prepend(QWeb.render('TreeDateSearch', {widget: this}));
                    var $ui_toolbar_loc = $('.ui-toolbar:last').show();
                    for (i in this.dates_filter){
                        var date_field = this.dates_filter[i];

                        var date_div =  QWeb.render('TreeDateSearchField', {'field_name': this.date_field_string[date_field]});
                        $ui_toolbar_loc.append(date_div);
                        $('div.oe_form_dropdown_section:last span:eq(0)').addClass('oe_gantt_filter_from_' + date_field);
                        $('div.oe_form_dropdown_section:last span:eq(1)').addClass('oe_gantt_filter_to_' + date_field);

                        this.value = new (instance.web.search.custom_filters.get_object('date'))
                            (this, {"selectable":true,
                                "name":"oe_gantt_filter_from_" + date_field, 
                                "type": "date",
                                "string":this.date_field_string[date_field]});
                        var $value_loc = $('.oe_gantt_filter_from_' + date_field + ':last').show().empty();
                        this.value.appendTo($value_loc);

                        this.value = new (instance.web.search.custom_filters.get_object('date'))
                            (this, {"selectable":true,
                                "name":"oe_gantt_filter_to_" + date_field, 
                                "type": "date",
                                "string":this.date_field_string[date_field]});
                        var $value_loc = $('.oe_gantt_filter_to_' + date_field + ':last').show().empty();
                        this.value.appendTo($value_loc);

                        var $oe_gantt_filter_from = $('.oe_gantt_filter_from_' + date_field);
                        var $oe_gantt_filter_to = $('.oe_gantt_filter_to_' + date_field);

                        $('.oe_gantt_filter_from_' + date_field + ':last .oe_datepicker_master').attr(
                            "placeholder", _t("From"));
                        $('.oe_gantt_filter_to_' + date_field + ':last .oe_datepicker_master').attr(
                            "placeholder", _t("To"));

                        // on_change
                        this.$el.parent().find(
                            '.oe_gantt_filter_from_' + date_field + ':last .oe_datepicker_master').change(function() {
                            var elem = this.parentElement.parentElement.parentElement.className;
                            var res = elem.split("oe_gantt_filter_from_");
                            self.current_date_from[res[1]] = this.value === '' ? null : this.value;
                            if (self.current_date_from[res[1]]){
                                self.current_date_from[res[1]] = instance.web.parse_value(
                                    self.current_date_from[res[1]], {
                                    "widget": "date"
                                });
                            }
                            self.do_search(self.last_domain, self.last_context, self.last_group_by);
                        });
                        this.$el.parent().find(
                            '.oe_gantt_filter_to_' + date_field + ':last .oe_datepicker_master').change(function() {
                            var elem = this.parentElement.parentElement.parentElement.className;
                            var res = elem.split("oe_gantt_filter_to_");
                            self.current_date_to[res[1]] = this.value === '' ? null : this.value;
                            if (self.current_date_to[res[1]]){
                                self.current_date_to[res[1]] = instance.web.parse_value(
                                    self.current_date_to[res[1]], {
                                    "widget": "date"
                                });
                            }
                            self.do_search(self.last_domain, self.last_context, self.last_group_by);
                        });
                        this.on('edit:after', this, function () {
                            self.$el.parent().find('.oe_gantt_filter_from_' + date_field + ':last').attr('disabled', 'disabled');
                            self.$el.parent().find('.oe_gantt_filter_to_' + date_field + ':last').attr('disabled', 'disabled');
                        });
                        this.on('save:after cancel:after', this, function () {
                            self.$el.parent().find('.oe_gantt_filter_from_' + date_field + ':last').removeAttr('disabled');
                            self.$el.parent().find('.oe_gantt_filter_to_' + date_field + ':last').removeAttr('disabled');
                        });
                    }
                }
                else{
                    // Only hide current if it's empty
                    // Work from tree view to tree view with or withouth date_filters
                    // Work from tree view to wizard with or withouth date_filters
                    if ($('.ui-toolbar:last').children().length == 0)
                        $('.ui-toolbar:last').hide();
                }
                this.tree_date_search_loaded = true;
            }
            return tmp;
        },
        do_search: function(domain, context, group_by) {
            this.last_domain = domain;
            this.last_context = context;
            this.last_group_by = group_by;
            domain = this.search_by_selection(domain);
            return this._super(domain, context, group_by);
        },
        search_by_selection: function(last_domain) {
            var domain = [];
            for (from in this.current_date_from){
                if (this.current_date_from[from])
                    domain.push([from, '>=', this.current_date_from[from]]);
            }
            for (to in this.current_date_to){
                if (this.current_date_to[to])
                    domain.push([to, '<=', this.current_date_to[to]]);
            }
            return new instance.web.CompoundDomain(last_domain, domain);
        },
    });

};
