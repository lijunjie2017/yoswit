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
            let firmware = window.peripheral[guid].prop.firmwareNo;
            if(firmware < 6){
                let bleList = [];
                let service = 'fe00';
                let characteristic = 'fe02';
                bleList.push({
                    service: service,
                    characteristic: characteristic,
                    data: `${parseInt(timer_id).toString(16).pad("00")}`,
                });
                bleList.push({
                    service: service,
                    characteristic: 'fe03',
                    data: `${parseInt(timer_id).toString(16).pad("00")}0000000000000000000000`,
                })
                if(firmware < 3.8){
                    bleList.push({
                        service: service,
                        characteristic: 'fe04',
                        data: `00`,
                    })
                    bleList.push({
                        service: service,
                        characteristic: 'fe05',
                        data: `0000000000`,
                    })
                    bleList.push({
                        service: service,
                        characteristic: 'fe06',
                        data: `ff07`,
                    })
                }
                return window.peripheral[guid].write(bleList);
            }else{
                let bleList = [];
                bleList.push({
                    service: 'ff80',
                    characteristic: 'ff81',
                    data: '84' + '01' + '00' + parseInt(timer_id).toString(16).pad('00'),
                })
                return window.peripheral[guid].write(bleList);
            }
            //return iot_ble_write(guid, 'ff80', 'ff81', '84' + '01' + '00' + parseInt(timer_id).toString(16).pad('00'), false);
          }
        })
        .then(() => {
          return new Promise((resove, reject) => {
            return http
              .request(
                `/api/method/appv6.putDeviceTimer?guid=${guid}&timer_id=${timer_id}`,
                {
                  method: 'GET',
                  responseType: 'json',
                }
              )
              .then((rs) => {
                resove();
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
