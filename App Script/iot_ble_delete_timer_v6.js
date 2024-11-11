window.iot_ble_delete_timer = function (params) {
  const guid = params.obj.attr('guid');
  const timer_id = params.obj.attr('timer-id');
  app.dialog.confirm(
    _('Delete Timer ') + timer_id,
    () => {
      app.preloader.show();
      iot_ble_check_enable(() => {
        return window.peripheral[guid].connect();
      })
        .then(() => {
          let mode_code = window.peripheral[guid] ? window.peripheral[guid].prop.hexModel : '';
          if (mode_code == '021B') {
            let delActionCommand = `8F1100${parseInt(timer_id).toString(16).pad('00')}`;
            let delTriggerCommand = `8F210000${parseInt(timer_id).toString(16).pad('00')}`;
            return window.peripheral[guid].write([
                {
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: delActionCommand,
                },
                {
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: delTriggerCommand,
                },
              ]);
          } else {
            return iot_ble_write(guid, 'ff80', 'ff81', '84' + '01' + '00' + parseInt(timer_id).toString(16).pad('00'), false);
          }
        })
        .then(() => {
          return new Promise((resove, reject) => {
            return http
              .request(
                '/api/resource/Device%20Local%20Timer?parent=Device&' +
                  encodeURI('fields=["name", "timer_id"]&filters=[["parent", "=", "' + guid + '"], ["timer_id", "=", "' + timer_id + '"]]'),
                {
                  method: 'GET',
                  responseType: 'json',
                }
              )
              .then((rs) => {
                const server_timers = rs.data.data;
                if (server_timers.length > 0) {
                  http
                    .request('/api/resource/Device%20Local%20Timer/' + server_timers[0].name, {
                      serializer: 'json',
                      method: 'DELETE',
                      data: {
                        parenttype: 'Device',
                        parentfield: 'device_timer',
                        parent: guid,
                      },
                    })
                    .then(resove)
                    .catch(reject);
                } else {
                  resove();
                }
              })
              .catch(reject);
          });
        })
        .then(() => {
          if ($('.device-timer ul li').length <= 0) {
            $('.device-timer-empty').show();
          }

          if (peripheral[guid] && peripheral[guid].timers) {
            const index = peripheral[guid].timers.findIndex((e) => e.timer_id === parseInt(timer_id));
            if (index !== -1) {
              peripheral[guid].timers.splice(index, 1);
            }
          }
          app.preloader.hide();
          app.ptr.refresh('.frappe-list-ptr-content');
        })
        .catch((error) => {
          app.preloader.hide();
          console.log('error', error);
          app.dialog.alert(_(erp.get_log_description(error)));
          //app.dialog.alert(_("Sorry, the device cannot be connected right now. Please come close to the device to continue the setup!"));
          // if ((e + "").startsWith("BLE Connection Error:")) {
          //     app.dialog.alert(_("Sorry, the device cannot be connected right now. Please come close to the device to continue the setup!"), runtime.appInfo.name, () => {
          //         mainView.router.back();
          //     });
          // } else {
          //     app.dialog.alert(e, runtime.appInfo.name, () => {});
          // }
        });
    },
    () => {}
  );
};
