window.iot_switch_profile = async (params) => {
  console.log(params);
  const TAG = 'ERP >>> window.iot_switch_profile';
  if (!isset(params.ref)) return;
  const withTimeout = (promise, ms) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise
        .then((v) => {
          clearTimeout(timer);
          resolve(v);
        })
        .catch((e) => {
          clearTimeout(timer);
          reject(e);
        });
    });
  };
  let stepDialog = null;
  const showStep = (text) => {
    try {
      if (!stepDialog) {
        stepDialog = app.dialog.preloader(text);
      } else {
        try {
          if (stepDialog.$el && stepDialog.$el.find) {
            stepDialog.$el.find('.dialog-title').text(text);
          } else {
            // fallback: recreate if cannot update
            stepDialog.close();
            stepDialog = app.dialog.preloader(text);
          }
        } catch (e) {
          stepDialog.close();
          stepDialog = app.dialog.preloader(text);
        }
      }
    } catch (e) {}
  };
  const closeStep = () => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    try {
      if (stepDialog) {
        stepDialog.close();
        stepDialog = null;
      }
    } catch (e) {}
  };

  //lastRoomRef = 0
  showStep(_("Starting profile switch..."));
  await sleep(200);
  //unsubscribe the gateway list
  try {
    showStep(_("Unsubscribing previous gateways..."));
    await sleep(200);
    const gatewayLists = Array.isArray(window.gateway_lists) ? window.gateway_lists : [];
    const unsubTopics1 = new Set();
    for (let i in gatewayLists) {
      const gw = gatewayLists[i];
      if (!gw) continue;
      unsubTopics1.add(`status/${md5(md5(gw))}`);
      unsubTopics1.add(`will/${md5(md5(gw))}`);
    }
    // local off immediately
    Array.from(unsubTopics1).forEach((t) => {
      try { emitter.off(t); } catch (e) {}
    });
    // fire-and-forget unsubscribe in background, ignore errors
    Promise.allSettled(Array.from(unsubTopics1).map((t) => withTimeout(core_mqtt_unsubscribe(t, false), 5000).catch(() => {})));
  } catch (error) {
    console.log('error', error);
  }
  //this new ha flow
  const selfgatewayhash = md5(md5(deviceInfo.getDeviceGateway().toLowerCase()));
  let profile_device = cloneDeep(erp.info.profile.profile_device);
  const unsubTopics2 = new Set();
  showStep(_("Unsubscribing device topics..."));
  await sleep(200);
  for (let i in profile_device) {
    if (!profile_device[i].gateway || profile_device[i].gateway.trim() == '') continue;
    const gatewayhash = md5(md5(profile_device[i].gateway.toLowerCase()));
    if (selfgatewayhash == gatewayhash) {
      const cmd_topic = `cmd/${gatewayhash}`;
      unsubTopics2.add(cmd_topic);
    } else {
      unsubTopics2.add(`will/${gatewayhash}`);
      unsubTopics2.add(`status/${gatewayhash}`);
    }
  }
  try {
    // local off immediately
    Array.from(unsubTopics2).forEach((t) => {
      try { emitter.off(t); } catch (e) {}
    });
    // fire-and-forget unsubscribe in background, ignore errors
    Promise.allSettled(Array.from(unsubTopics2).map((t) => withTimeout(core_mqtt_unsubscribe(t, false), 5000).catch(() => {})));
  } catch (error) {
    console.log('error', error);
  }
  let prev_profile_id = erp.info.profile.name;
  let prev_topic_id = `profile_subdevice_${erp.info.profile.name}`;
  try {
    showStep(_("Saving active profile..."));
    http
      .request('/api/resource/User%20Settings', {
        method: 'POST',
        serializer: 'json',
        timeout: 15,
        data: { 'data': { active_profile: params.ref, owner: users[users.current].usr, app_id: appInfo.id } },
      })
      .then(
        async (rs) => {},
        () => {
          return http.request('/api/resource/User%20Settings/' + encodeURIComponent(appInfo.id + '-' + users[users.current].usr), {
            method: 'PUT',
            serializer: 'json',
            timeout: 15,
            data: { 'data': { active_profile: params.ref } },
          });
        }
      )
      .then(async () => {
        //del the local_scanned_periperals
        window.peripheral = {};
        //del the local db (fire-and-forget to avoid blocking)
        try { db.set('peripheral', JSON.stringify({})).catch(() => {}); } catch (e) {}
        try {
          showStep(_("Refreshing profile data..."));
          let originalAppInfo = await Capacitor.Plugins.App.getInfo();
          originalAppInfo.id = originalAppInfo.id == 'hk.tgt.h1' ? 'hk.tgt.h1lifestyle' : originalAppInfo.id;
          erp.info = {
            ...erp.info,
            ...JSON.parse(
              (
                await http.request('/api/method/appv6.afterLogin', {
                  method: 'POST',
                  timeout: 15,
                  cacheStrategy: false,
                  data: {
                    appId: erp.appId,
                    deviceId: deviceInfo.deviceId,
                    user_setting_name: erp.appId + '-' + users[users.current].usr,
                    resident_status: erp.setting.default_account_registration_status || 'Approved',
                    oriAppId: originalAppInfo.id,
                    model: deviceInfo.model,
                    operatingSystem: deviceInfo.operatingSystem,
                    platform: deviceInfo.platform,
                    name: deviceInfo.manufacturer + ' ' + deviceInfo.name,
                    webViewVersion: deviceInfo.webViewVersion,
                    implicitLogin: implicitLogin ? 1 : 0,
                    device_info: JSON.stringify(deviceInfo),
                  },
                })
              ).data
            ),
          };
          try { withTimeout(db.set('afterLoginInfo@' + users.current, JSON.stringify(erp.info)), 5000).catch(() => {}); } catch (e) {}
          voip_push_init();
          return new Promise((resolve, reject) => {
            resolve(1);
          });
        } catch (error) {
          return new Promise((resolve, reject) => {
            reject(1);
          });
        }
      })
      .then(async () => {
        showStep(_("Refreshing UI..."));
        //await userReady();
        mainView.router.back();
        closeStep();
        // 			window.globalUpdate = true
        // 			$(".profile_title").html(tran(erp.info.profile.profile_name));
        setTimeout(() => {
          mainView.router.refreshPage();
        }, 500);
      })
      .catch((e) => {
        showStep(_("Profile switch failed."));
        closeStep();
      });
  } catch (error) {}
};
window.iot_switch_profile_for_save = (profile_name) => {
  const TAG = 'ERP >>>iot_switch_profile_for_save';
  console.log(TAG);
  showStep(_("Saving active profile..."));
  //let prev_profile_id = frappe.user.data.app_profile_id;
  let prev_profile_id = `profile_subdevice_${erp.info.profile.name}`;
  core_mqtt_unsubscribe(prev_profile_id, false)
    .then(() => {
      return core_mqtt_subscribe(profile_name, 0, false);
    })
    .then(() => {
      try { showStep(_("Saving active profile...")); } catch (e) {}
      return http.request('/api/resource/User%20Settings', {
        method: 'POST',
        serializer: 'json',
        data: { 'data': { active_profile: profile_name, owner: users[users.current].usr, app_id: users[users.current].app_id } },
      });
    })
    .then(
      (rs) => {},
      () => {
        return http.request(
          '/api/resource/User%20Settings/' + encodeURIComponent(users[users.current].app_id + '-' + users[users.current].usr),
          {
            method: 'PUT',
            serializer: 'json',
            data: { 'data': { active_profile: profile_name } },
          }
        );
      }
    )
    .then(async () => {
      try { showStep(_("Finalizing profile switch...")); } catch (e) {}
      await userReady();
      closeStep();
    })
    .catch((e) => {
      try { showStep(_("Profile save failed")); } catch (err) {}
      closeStep();

      //l(TAG, "EEE="+JSON.stringify(e));
    });
};
