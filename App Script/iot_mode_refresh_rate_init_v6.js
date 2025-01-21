window.iot_mode_refresh_rate_picker = {};
window.iot_mode_refresh_rate_init = function (params) {
  const TAG = '>>>> iot_mode_refresh_rate_picker';

  const guid = params.ref;
  const button_group = params.obj.attr('button-group');
  const setting_type = params.obj.attr('setting-type');
  const slot_index = params.obj.attr('slot-index') ? params.obj.attr('slot-index') : 0;
  const inputEl = params.obj.find('input[name=refresh_rate]');

  iot_mode_refresh_rate_picker = app.picker.create({
    inputEl: inputEl,
    cols: [
      {
        textAlign: 'center',
        values: [1, 5, 10, 20, 30, 40, 50, 60],
        displayValues: ['1min', '5min', '10min', '20min', '30min', '40min', '50min', '60min'],
      },
    ],
    formatValue: function (values) {
      return values[0];
    },
    renderToolbar: () => {
      return `
            <div class="toolbar">
                <div class="toolbar-inner">
                    <div class="left"></div>
                    <div class="right">
                        <a href="#" class="link toolbar-save-link">${_('Save')}</a>
                    </div>
                </div>
            </div>
            `;
    },
    on: {
      open: (picker) => {
        iot_mode_refresh_rate_picker.setValue([params.obj.attr('setting-value')]);
        $(picker.$el.find('.toolbar-save-link')).on('click', async () => {
          iot_mode_refresh_rate_picker.close();

          const selected = parseInt(inputEl.val());
          app.dialog.preloader();
          //iot write
          try {
            //check gateway is online
            try {
              let gateway_connected = window.peripheral[guid] ? window.peripheral[guid].prop.rssilv : 0;
              if (!gateway_connected) {
                app.dialog.close();
                app.dialog.alert(
                  _('This setting requires a connection through the Gateway, and please ensure that the Gateway is online.')
                );
                return;
              }
            } catch (err) {
              app.dialog.close();
              app.dialog.alert(_(erp.get_log_description(err)));
              return;
            }
            try {
              let data = `9355000004${iot_utils_to_little_endian_hex(parseInt(selected) * 60, 4)}`;
              await window.peripheral[guid].write([
                {
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: data,
                },
              ]);
              await iot_device_setting_sync_server(guid, setting_type, selected);
              params.obj.attr('setting-value', selected);
              params.obj.find('.setting-value').html(_(selected) + 'min');
              await ha_profile_ready();
              app.dialog.close();
              app.dialog.alert(_('Save Successfully'));
            } catch (err) {
              app.dialog.close();
              app.dialog.alert(_(erp.get_log_description(err)));
              return;
            }
          } catch (error) {
            app.dialog.close();
            app.dialog.alert(_(erp.get_log_description(error)));
          }
        });
      },
    },
  });

  params.obj.find('#action').on('click', () => {
    iot_mode_refresh_rate_picker.open();
  });
};
