window.iot_mesh_test = async () => {
  //iot mesh testing
  let uuid = 'DC:DA:0C:4B:7F:12';
  let cmd = [{ 'action': 'connect' }];
  try {
    //await ha_process_periperal_cmd(uuid, cmd, true);
    // console.log(scanned_periperals[uuid]);
    ble.connect(uuid,function(){
      console.log('connected')
      ble.requestMtu(
        uuid,
        515,
        () => {
          alert('requestMtu su')
          ble.startNotification(
            uuid,
            '1827',
            '2adc',
            (raw) => {
              console.log('[MESH NOTIFY]', raw);
  
              if (!isIdentify) {
                isIdentify = true;
              }
            },
            (error) => {
              alert("startNotification error")
              alert(error);
            }
          );
          
          setTimeout(() => {
            ble.identifyNode(
              uuid,
              () => {
                  alert("D")
                // setTimeout(() => {
                //   ble.addKeys(uuid,0,'8F18B57B50F64F856B23C61E0EC2CBD9',0,'6821E865F4DFEB9AEA12BDF86F4453EF',()=>{
                //     alert('su');
                //     ble.startProvisioning(
                //       uuid,
                //       () => {
                //         alert(1);
                //       },
                //       (e) => {
                //         console.log("startProvisioning",e);
                //         alert(e);
                //       }
                //     );
                //   },(error)=>{
                //     console.log("error3",error)
                //     alert(error)
                //   })
                  
                // }, 3000);
              },
              (e) => {
                alert(e);
              }
            );
          }, 3000);
        },
        (err) => {
          alert('requestMtu error')
          alert(err);
        }
      );
    },function(error){app.dialog.alert(error)})
    let isIdentify = false;
  } catch (err) {
    alert(err);
  }

  // setTimeout(()=>{
  //   ble.addNodeToMesh(uuid);
  // },5000)
  //ble.createMeshNetwork();
  // ble.createNetwork();
  // ble.addDeviceToNetwork(uuid);
};
