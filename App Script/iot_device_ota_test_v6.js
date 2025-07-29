// window.iot_device_ota_test = async (params) => {
//   const guid = params.ref;
//   const profile_device_name = params.obj.attr('profile-device-name');
//   const profile_subdevice_name = params.obj.attr('profile-subdevice-name');
//   try {
//     const otaInstance = new window.iotWifiOta({
//       guid: guid,
//       gateway: '3c:84:27:ee:11:4e-jack.li@yoswit.com',
//       ssid: '2201',
//       password: '13129217470',
//       showUI: true, // 启用UI提示显示
//     });

//     // 设置回调函数
//     otaInstance.setCallbacks({
//       onProgress: (progress) => {
//         console.log(`进度: ${progress}%`);
//         // 下载进度的Framework7 progress dialog会在工具类中自动处理
//       },
//       onError: (error) => {
//         console.error(`错误: ${error}`);

//         // progress dialog和preloader的清理已在工具类中处理

//         // 显示错误信息
//         if (typeof app !== 'undefined' && app.dialog) {
//           app.dialog.alert(error, '操作失败');
//         } else {
//           alert(`操作失败: ${error}`);
//         }
//       },
//       onSuccess: (message) => {
//         console.log(`成功: ${message}`);

//         // 显示成功信息
//         if (typeof app !== 'undefined' && app.dialog) {
//           app.dialog.alert(message, '操作成功');
//         } else {
//           alert(`操作成功: ${message}`);
//         }
//       },
//       onStatusChange: (status) => {
//         console.log(`状态变更: ${status}`);

//         // 可以在这里更新状态显示，比如在页面上显示当前状态
//         // 如果有状态显示元素的话
//         try {
//           const statusElement = document.querySelector('.ota-status');
//           if (statusElement) {
//             statusElement.textContent = status;
//           }
//         } catch (e) {
//           console.log('状态显示元素未找到');
//         }
//       },
//     });
//     await otaInstance.init();
//     const status = otaInstance.getStatus();
//     console.log('WiFi状态:', status.wifiStatus);
//     console.log('需要连接WiFi:', status.needsWifiConnection);
//     console.log('需要固件升级:', status.needsFirmwareUpgrade);
//     if (status.needsWifiConnection) {
//       console.log('开始连接WiFi...');
//       await otaInstance.wifiConnect();
//       console.log('WiFi连接成功');
//       if (!status.needsFirmwareUpgrade) {
//         console.log('开始固件升级...');
//         await otaInstance.fullUpgrade();
//         console.log('固件升级成功');
//       } else {
//         console.log('固件升级成功');
//       }
//     } else {
//       console.log('WiFi连接成功');
//       if (!status.needsFirmwareUpgrade) {
//         console.log('开始固件升级...');
//         await otaInstance.fullUpgrade();
//         console.log('固件升级成功');
//       } else {
//         console.log('固件升级成功');
//       }
//     }
//   } catch (error) {
//     console.error('WiFi连接失败:', error);
//   }
// };


window.iot_device_ota_test = async (params) => {
    const guid = params.ref;
    const profile_device_name = params.obj.attr('profile-device-name');
    const profile_subdevice_name = params.obj.attr('profile-subdevice-name');
    app.dialog.preloader('Please wait...');
    try{
        await window.peripheral[guid].connect();
        await window.peripheral[guid].write([
            {
                service: 'ff80',
                characteristic: 'ff81',
                data: '935b00000104',
            },
            {
                service: 'ff80',
                characteristic: 'ff81',
                data: '810e',
            }
        ]);
        app.dialog.alert('Write Success');
    }catch(error){
        app.dialog.alert(erp.get_log_description(error));
    }
    app.dialog.close();
}
