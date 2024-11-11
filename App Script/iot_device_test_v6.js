window.iot_device_test = async (parms) => {
  //input the time and test the iot
  window.testDeviceList = [];
  app.dialog.prompt(_('Input your times'), async (time) => {
    if (time) {
      let guid = parms.ref;
      let device_button_group = parms.obj.attr('button-group');
      const timeout = 10000; // 设置超时时间为10秒
      const connectDelay = 3000;
      for (let i = 0; i < time; i++) {
        app.dialog.preloader(_('Connecting With ') + (i + 1));
        try {
          let rssi = window.peripheral[guid].prop.rssi;

          // 创建一个新的 Promise，带有超时逻辑
          const timeoutPromise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Timeout after 20 seconds')), timeout);

            // 执行 onoff 操作并处理结果
            window.peripheral[guid]
              .onoff([
                {
                  gang: bleHelper.getGangId(device_button_group),
                  on: 1,
                },
              ])
              .then(() => {
                clearTimeout(timer); // 清除定时器
                return window.peripheral[guid].disconnect(); // 断开连接
              })
              .then(() => {
                resolve(); // 成功后 resolve
              })
              .catch((error) => {
                clearTimeout(timer); // 清除定时器
                reject(error); // reject 处理
              });
          });

          await timeoutPromise; // 等待 Promise，若超时则进入 catch
          await new Promise(resolve => setTimeout(resolve, connectDelay));
          // 这里是如果操作成功所执行的逻辑
          window.testDeviceList.push({
            guid: guid,
            status: 'Ok',
            rssi: rssi,
            index: i,
          });

          app.dialog.close();
        } catch (error) {
          // 错误处理逻辑
          let rssi = window.peripheral[guid].prop.rssi;
          console.log(error);
          window.testDeviceList.push({
            guid: guid,
            status: 'ERROR',
            rssi: rssi ? rssi : 0,
            error: error,
            index: i,
          });
          app.dialog.close();
          continue; // 继续下一次循环
        }
      }
      app.dialog.close();
      app.dialog.alert(_('Testing is ok.')); // 测试完成提示
    }
  });
};
