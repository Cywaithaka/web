openerp.web_dialog_size= function (instance) {

    instance.web.Dialog.include({
        init_dialog: function () {
            var self = this;
            this._super();
            self.$dialog_box.find('.dialog_button_restore').addClass('dialog_button_hide');
            if (this.dialog_options.size !== 'large'){
                self.$dialog_box.find('.dialog_button_extend').addClass('dialog_button_hide');
            }
            else{
                self.$dialog_box.find('.dialog_button_extend').on('click', self._extending);
                self.$dialog_box.find('.dialog_button_restore').on('click', self._restore);
            }
        },
        _extending: function() {
            var self = this;
            $(this).parents('.modal-dialog').addClass('dialog_full_screen');
            $(this).addClass('dialog_button_hide');

            $(this).parents('.modal-dialog').find('.dialog_button_restore').removeClass('dialog_button_hide')
        },
        _restore: function() {
            var self = this;
            $(this).parents('.modal-dialog').removeClass('dialog_full_screen');
            $(this).addClass('dialog_button_hide');

            $(this).parents('.modal-dialog').find('.dialog_button_extend').removeClass('dialog_button_hide')
        },
    });

    instance.web.FormView.include({
        view_loading: function(r) {
            var extend_view = false;
            // On a O2M/M2M field context on a form view
            if (this.ViewManager.context)
                var context = this.ViewManager.context.eval();
                if (context && context['web_dialog_extend'])
                    extend_view = true;

            // On an action context
            if (this.ViewManager.ActionManager != undefined && this.ViewManager.ActionManager.dialog && this.ViewManager.action.context.web_dialog_extend)
                extend_view = true;
            
            if (extend_view){
                var b = $('.dialog_button_extend:last');
                b.parents('.modal-dialog').addClass('dialog_full_screen');
                b.addClass('dialog_button_hide');
                b.parents('.modal-dialog').find('.dialog_button_restore').removeClass('dialog_button_hide')
            }
            var self = this;
            return this._super(r);
        },
    });

};

