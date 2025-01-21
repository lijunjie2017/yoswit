window.iot_mode_setup_battery_threshold_picker = {};
window.iot_mode_setup_battery_threshold_init = function (params) {
  const TAG = '>>>> iot_mode_setup_battery_threshold_init';

  const guid = params.ref;
  const button_group = params.obj.attr('button-group');
  const setting_type = params.obj.attr('setting-type');
  const slot_index = params.obj.attr('slot-index') ? params.obj.attr('slot-index') : 0;
  const inputEl = params.obj.find('input[name=setup_battery_threshold]');

  iot_mode_setup_battery_threshold_picker = app.picker.create({
    inputEl: inputEl,
    cols: [
      {
        textAlign: 'center',
        values: [1, 2, 3, 4, 5, 6],
        displayValues: [1, 2, 3, 4, 5, 6],
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
        iot_mode_setup_battery_threshold_picker.setValue([params.obj.attr('setting-value')]);
        $(picker.$el.find('.toolbar-save-link')).on('click', async () => {
          iot_mode_setup_battery_threshold_picker.close();

          const selected = parseInt(inputEl.val());
          app.dialog.preloader();
          //iot write
          try {
            //get the gateway id
            let profile_device = cloneDeep(erp.info.profile.profile_device);
            let devices = cloneDeep(erp.info.device);
            let gateway_str = profile_device.find((item) => item.device == guid).gateway;

            if (gateway_str) {
              let sceneIdMap = await get_battery_threshold_scene_id('Geomagnetic Scene', guid);
              let sceneId = sceneIdMap.id;
              let sceneName = sceneIdMap.scene_name;
              if (!sceneId) {
                sceneId = '1';
              }
              let gateway_mac = gateway_str.split('-')[0];
              let gateway_guid = '';
              for (let i in devices) {
                if (devices[i].mac_address.toLowerCase() == gateway_mac.trim().toLowerCase()) {
                  gateway_guid = i;
                  break;
                }
              }
              let typeIndex = '23';
              let opcode = '00';
              let gatewayId = await get_device_id_by_guid(gateway_guid);

              if (!gatewayId || gatewayId == 'null') {
                gatewayId = 1;
              }
              debugger;
              if (!sceneName) {
                gatewayId = parseInt(gatewayId) + 1;
              } else {
                //get the save id
                let scenes = cloneDeep(erp.info.scene);
                for (let i in scenes) {
                  if (i == sceneName) {
                    let scene_device_location = scenes[i].scene_device_location;
                    for (let j in scene_device_location) {
                      if (scene_device_location[j].device == gateway_guid) {
                        gatewayId = scene_device_location[j].storage_id;
                        break;
                      }
                    }
                    break;
                  }
                }
              }
              let $trigger_command = `${opcode}${typeIndex}${core_utils_get_mac_address_from_guid(guid, true)}01${parseInt(selected).toString(16).pad('00')}000000`;
              let trigger = `8F2000${parseInt(sceneId).toString(16).pad('00')}${parseInt(sceneId).toString(16).pad('00')}${parseInt(
                $trigger_command.length / 2
              )
                .toString(16)
                .pad('00')}${$trigger_command}`;
              let $action_command = `02${core_utils_get_mac_address_from_guid(gateway_guid, true)}8f0200${parseInt(gatewayId).toString(16).pad('00')}`;
              let button_action = `8F1000${parseInt(sceneId).toString(16).pad('00')}${parseInt($action_command.length / 2)
                .toString(16)
                .pad('00')}${$action_command}`;
              let gateway_action = '';
              let $command = `02${core_utils_get_mac_address_from_guid(gateway_guid, true)}18${core_utils_get_mac_address_from_guid(guid, true)}${guid}${parseInt(selected).toString(16).pad('00')}`;
              gateway_action = `8F1000${parseInt(gatewayId).toString(16).pad('00')}${parseInt($command.length / 2)
                .toString(16)
                .pad('00')}${$command}`;
              debugger;
              //post ble
              let trigger_ble_list = [];
              trigger_ble_list.push({
                service: 'ff80',
                characteristic: 'ff81',
                data: trigger,
              });
              trigger_ble_list.push({
                service: 'ff80',
                characteristic: 'ff81',
                data: button_action,
              });
              let gateway_action_ble_list = [];
              gateway_action_ble_list.push({
                service: 'ff80',
                characteristic: 'ff81',
                data: gateway_action,
              });
              //check gateway is online
              try {
                let gateway_connected = window.peripheral[gateway_guid] ? window.peripheral[gateway_guid].prop.rssilv : 0;
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
                await window.peripheral[guid].write(trigger_ble_list);
                await window.peripheral[gateway_guid].write(gateway_action_ble_list);
                await iot_device_setting_sync_server(guid, setting_type, selected);
                if (!sceneName) {
                  await iot_device_setting_sync_server(guid, `Battery Notification`, 'On');
                }
                //update the scene data
                let scene_device_location = [
                  {
                    device: guid,
                    storage_id: sceneId,
                  },
                  {
                    device: gateway_guid,
                    storage_id: gatewayId,
                  },
                ];
                await post_scene_data(sceneName, scene_device_location, 'Geomagnetic Scene');
                params.obj.attr('setting-value', selected);
                params.obj.find('.setting-value').html(_('Less Than: ') + _(selected));
                await ha_profile_ready();
                app.dialog.close();
                app.dialog.alert(_('Save Successfully'));
              } catch (err) {
                app.dialog.close();
                app.dialog.alert(_(erp.get_log_description(err)));
                return;
              }
            } else {
              app.dialog.close();
              app.dialog.alert(_('This setting requires a connection through the Gateway, and please ensure that the Gateway is online.'));
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
    iot_mode_setup_battery_threshold_picker.open();
  });
};

window.get_battery_threshold_scene_id = async (template_name, guid) => {
  return new Promise(async (resolve, reject) => {
    //this case only have one scene
    try {
      let url = `/api/method/appv6.getSceneList?scene_template=${template_name}&guid=${guid}`;
      let res = await http2.request(encodeURI(url), {
        method: 'GET',
        serializer: 'json',
        responseType: 'json',
        debug: true,
      });
      let sceneList = res.data.data;
      let maxId = -Infinity;
      let scene_name = '';
      debugger;
      for (let i in sceneList) {
        scene_name = sceneList[i].name;
        sceneList[i].scene_device_location.forEach((item) => {
          if (item.device == guid) {
            maxId = Math.max(maxId, item.storage_id);
          }
        });
      }
      resolve({
        id: maxId,
        scene_name: scene_name,
      });
    } catch (error) {
      reject(error);
    }
  });
};

window.get_device_id_by_guid = (guid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `/api/method/appv6.getSceneId?guid=${guid}`;
      let res = await http2.request(encodeURI(url), {
        method: 'GET',
        serializer: 'json',
        responseType: 'json',
        debug: true,
      });
      debugger;
      resolve(res.data.data ? res.data.data.storage_id : null);
    } catch (error) {
      reject(error);
    }
  });
};

window.post_scene_data = (scene_name, scene_device_location, scene_template, title) => {
  return new Promise(async (resolve, reject) => {
    try {
      let method = scene_name ? 'PUT' : 'POST';
      let url = `/api/resource/Scene`;
      if (scene_name) {
        url = `/api/resource/Scene/${scene_name}`;
      }
      let post_data = {
        profile: erp.info.profile.name,
        title: title ? title : 'Battery Threshold',
        scene_template: scene_template ? scene_template : 'Geomagnetic Scene',
        scene_device_location: scene_device_location,
        trigger: JSON.stringify({}),
        action: JSON.stringify({}),
        ui_configuration: JSON.stringify({}),
        condition: JSON.stringify({}),
        image: '',
      };
      if (scene_name) {
        delete post_data.ui_configuration;
      }
      let res = await http2.request(encodeURI(url), {
        method: method,
        serializer: 'json',
        responseType: 'json',
        debug: true,
        data: post_data,
      });
      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
};
