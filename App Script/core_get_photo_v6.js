window.core_get_photo = async (params) => {
  if (!isset(params.ref)) {
    params.ref = params.obj.attr('ele');
  }
  console.log('core_get_photo=' + params.ref);
  var data = {};

  var doctype = params.obj.attr('doctype');
  var docname = params.obj.attr('docname');
  var folder = params.obj.attr('folder');
  var fieldname = params.obj.attr('fieldname');
  var fid = params.obj.attr('fid');
  var hasImage = params.obj.attr('has-image');

  const image_url = params.obj.find('input[name="banner"]').val();
  if (fieldname) {
    data.fieldname = fieldname;
  }
  if (fid) {
    data.fid = fid;
  }
  if (docname) {
    data.docname = docname;
  }
  if (doctype) {
    data.doctype = doctype;
  }
  if (!folder) {
    folder = 'Home/Mobile';
  }

  // quality
  const image_quality = 30;

  const buttons = [
    [
      {
        text: _('Take Photo'),
        onClick: async function () {
          //check the permission
          const permissionState = await Capacitor.Plugins.Camera.requestPermissions({
            permissions: ['camera'],
          });
          if (permissionState.camera !== 'granted') {
            app.dialog.alert(_('Please grant the permission manually in the app settings'), () => {
              Capacitor.Plugins.BarcodeScanner.openSettings();
            });
            return;
          }
          Capacitor.Plugins.Camera.requestPermissions({
            permissions: ['camera'],
          })
            .then((rs) => {
              if (rs.camera === 'granted') {
                return Promise.resolve();
              } else {
                return Promise.reject();
              }
            })
            .then(() => {
              return Capacitor.Plugins.Camera.getPhoto({
                quality: image_quality,
                allowEditing: true,
                resultType: 'base64',
                source: 'CAMERA',
                saveToGallery: false,
              });
            })
            .then((rs) => {
              const fileData = {};
              fileData.data = 'data:image/jpeg;base64,' + rs.base64String;
              fileData.name = md5(rs.base64String) + '.jpeg';

              app.preloader.show();
              http
                .uploadFileToServer(fileData, folder, 0, data)
                .then((rs) => {
                  let json = JSON.parse(rs.data);
                  let imglink = erp.setting.app_api_url + json.message.file_url;
                  $('.' + params.ref).css({ 'background-image': "url('" + imglink + "')" });
                  params.obj.find('input').val(json.message.file_url);
                  params.obj.attr('has-image', '1');
                  if (params.obj.find('i')) {
                    params.obj.find('i').hide();
                  }
                  if (params.obj.find('.bg-input-image')) {
                    params.obj
                      .find('.bg-input-image')
                      .css('background-image', 'url(' + erp.setting.app_api_url + json['message']['file_url'] + ')');
                  }
                  if (params.obj.find('img')) {
                    params.obj
                      .find('img')
                      .attr('src', erp.setting.app_api_url + json['message']['file_url'])
                      .show();
                  }

                  app.preloader.hide();
                })
                .catch((error) => {
                  app.preloader.hide();

                  core_server_exception_message(error.error);

                  console.log('error=' + JSON.stringify(error));
                });
            })
            .catch((err) => {
              console.log(err);
            });
        },
      },
      {
        text: _('From Album'),
        onClick: async function () {
          //  try{
          //      const permissionState = await Capacitor.Plugins.Camera.requestPermissions({
          //     permissions: ['photos'],
          //   });
          //   if (permissionState.photos !== 'granted') {
          //     app.dialog.alert(_('Please grant the permission manually in the app settings'), () => {
          //       Capacitor.Plugins.BarcodeScanner.openSettings();
          //     });
          //     return;
          //   }
          //  }catch(error){
          //      console.log(error)
          //     app.dialog.alert(error);
          //  }
          try {
            let permissions = cordova.plugins.permissions;
            if (window.device.platform.toLowerCase() == 'android') {
              //check the version
              let sdkVersion = window.device.sdkVersion;
              let list = [];
              if (sdkVersion < 32) {
                list = [permissions.READ_EXTERNAL_STORAGE];
                permissions.checkPermission(
                  permissions.READ_EXTERNAL_STORAGE,
                  (status) => {
                    console.log('status', status);
                    if (!status.hasPermission) {
                      // permissions.requestPermissions(list,(statuss)=>{
                      //   console.log("statuss",statuss);
                      // },(error)=>{
                      //   console.log("error",error)
                      // })
                      app.dialog.alert(_('Please grant the permission manually in the app settings'), () => {
                        Capacitor.Plugins.BarcodeScanner.openSettings();
                      });
                    } else {
                      Capacitor.Plugins.Camera.getPhoto({
                        quality: image_quality,
                        allowEditing: true,
                        resultType: 'base64',
                        source: 'PHOTOS',
                        saveToGallery: false,
                      })
                        .then((rs) => {
                          const fileData = {};
                          fileData.data = 'data:image/jpeg;base64,' + rs.base64String;
                          fileData.name = md5(rs.base64String) + '.jpeg';

                          app.preloader.show();
                          http
                            .uploadFileToServer(fileData, folder, 0, data)
                            .then((rs) => {
                              let json = JSON.parse(rs.data);
                              let imglink = erp.setting.app_api_url + json.message.file_url;
                              $('.' + params.ref).css({ 'background-image': "url('" + imglink + "')" });
                              params.obj.find('input').val(json.message.file_url);
                              params.obj.attr('has-image', '1');
                              if (params.obj.find('i')) {
                                params.obj.find('i').hide();
                              }
                              if (params.obj.find('.bg-input-image')) {
                                params.obj
                                  .find('.bg-input-image')
                                  .css('background-image', 'url(' + erp.setting.app_api_url + json['message']['file_url'] + ')');
                              }
                              if (params.obj.find('img')) {
                                params.obj
                                  .find('img')
                                  .attr('src', erp.setting.app_api_url + json['message']['file_url'])
                                  .show();
                              }

                              app.preloader.hide();
                            })
                            .catch((error) => {
                              app.preloader.hide();

                              core_server_exception_message(error.error);

                              console.log('error=' + JSON.stringify(error));
                            });
                        })
                        .catch((error) => {});
                    }
                  },
                  (error) => {
                    console.log('error', error);
                  }
                );
              } else {
                list = [permissions.READ_MEDIA_IMAGES];
                //if input the list ,will be have bug
                permissions.checkPermission(
                  permissions.READ_MEDIA_IMAGES,
                  (status) => {
                    console.log('status', status);
                    if (!status.hasPermission) {
                      // permissions.requestPermissions(list,(statuss)=>{
                      //   console.log("statuss",statuss);
                      // },(error)=>{
                      //   console.log("error",error)
                      // })

                      Capacitor.Plugins.Camera.getPhoto({
                        quality: image_quality,
                        allowEditing: true,
                        resultType: 'base64',
                        source: 'PHOTOS',
                        saveToGallery: false,
                      })
                        .then((rs) => {})
                        .catch((error) => {
                          console.log('error', error.toString());
                          console.log(error.toString().includes('User denied access to photos'));
                          let deniedStatus = error.toString().includes('User denied access to photos');
                          if (deniedStatus) {
                            app.dialog.alert(_('Please grant the permission manually in the app settings'), () => {
                              Capacitor.Plugins.BarcodeScanner.openSettings();
                            });
                          }
                        });
                    } else {
                      Capacitor.Plugins.Camera.getPhoto({
                        quality: image_quality,
                        allowEditing: true,
                        resultType: 'base64',
                        source: 'PHOTOS',
                        saveToGallery: false,
                      })
                        .then((rs) => {
                          const fileData = {};
                          fileData.data = 'data:image/jpeg;base64,' + rs.base64String;
                          fileData.name = md5(rs.base64String) + '.jpeg';

                          app.preloader.show();
                          http
                            .uploadFileToServer(fileData, folder, 0, data)
                            .then((rs) => {
                              let json = JSON.parse(rs.data);
                              let imglink = erp.setting.app_api_url + json.message.file_url;
                              $('.' + params.ref).css({ 'background-image': "url('" + imglink + "')" });
                              params.obj.find('input').val(json.message.file_url);
                              params.obj.attr('has-image', '1');
                              if (params.obj.find('i')) {
                                params.obj.find('i').hide();
                              }
                              if (params.obj.find('.bg-input-image')) {
                                params.obj
                                  .find('.bg-input-image')
                                  .css('background-image', 'url(' + erp.setting.app_api_url + json['message']['file_url'] + ')');
                              }
                              if (params.obj.find('img')) {
                                params.obj
                                  .find('img')
                                  .attr('src', erp.setting.app_api_url + json['message']['file_url'])
                                  .show();
                              }

                              app.preloader.hide();
                            })
                            .catch((error) => {
                              app.preloader.hide();

                              core_server_exception_message(error.error);

                              console.log('error=' + JSON.stringify(error));
                            });
                        })
                        .catch((error) => {});
                    }
                  },
                  (error) => {
                    console.log('error', error);
                  }
                );
              }
            } else {
              Capacitor.Plugins.Camera.requestPermissions({
                permissions: ['photos'],
              })
                .then((rs) => {
                  if (rs.photos === 'granted' || rs.photos === 'limited') {
                    return Promise.resolve(rs.photos);
                  } else {
                    return Promise.reject();
                  }
                })
                .then(() => {
                  return Capacitor.Plugins.Camera.getPhoto({
                    quality: image_quality,
                    allowEditing: true,
                    resultType: 'base64',
                    source: 'PHOTOS',
                    saveToGallery: false,
                  });
                })
                .then((rs) => {
                  const fileData = {};
                  fileData.data = 'data:image/jpeg;base64,' + rs.base64String;
                  fileData.name = md5(rs.base64String) + '.jpeg';

                  app.preloader.show();
                  http
                    .uploadFileToServer(fileData, folder, 0, data)
                    .then((rs) => {
                      let json = JSON.parse(rs.data);
                      let imglink = erp.setting.app_api_url + json.message.file_url;
                      $('.' + params.ref).css({ 'background-image': "url('" + imglink + "')" });
                      params.obj.find('input').val(json.message.file_url);
                      params.obj.attr('has-image', '1');
                      if (params.obj.find('i')) {
                        params.obj.find('i').hide();
                      }
                      if (params.obj.find('.bg-input-image')) {
                        params.obj
                          .find('.bg-input-image')
                          .css('background-image', 'url(' + erp.setting.app_api_url + json['message']['file_url'] + ')');
                      }
                      if (params.obj.find('img')) {
                        params.obj
                          .find('img')
                          .attr('src', erp.setting.app_api_url + json['message']['file_url'])
                          .show();
                      }

                      app.preloader.hide();
                    })
                    .catch((error) => {
                      app.preloader.hide();

                      core_server_exception_message(error.error);

                      console.log('error=' + JSON.stringify(error));
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          } catch (error) {
            console.log('error', error);
          }
        },
      },
      /*{
			text: _('From Library'),
			onClick: function() {
				mainView.router.navigate('/photo/', {
					history: true
				});
			}
		},*/
    ],
    [
      {
        text: _('Cancel'),
        bold: false,
        color: 'red',
      },
    ],
  ];

  if (docname && hasImage > 0) {
    buttons[0].push({
      text: _('Delete'),
      bold: true,
      color: 'red',
      onClick: function () {
        app.dialog.confirm(
          _('Are you sure you want to delete the attachment?'),
          async () => {
            app.preloader.show();
            if (fid && fid != '') {
              let deleteUrl = '/api/method/frappe.desk.form.utils.remove_attach';
              let deleteData = {
                fid,
                dn: doctype,
                dt: docname,
              };
              await http.request(deleteUrl, {
                method: 'POST',
                serializer: 'json',
                reponseType: 'json',
                data: deleteData,
              });
            }

            params.obj.find('input').val('');
            if ($('.' + params.ref)) {
              $('.' + params.ref).css({ 'background-image': 'none' });
            }
            params.obj.attr('has-image', '0');
            if (params.obj.find('i')) {
              params.obj.find('i').show();
            }
            if (params.obj.find('.bg-input-image')) {
              params.obj.find('.bg-input-image').css('background-image', 'none');
            }
            if (params.obj.find('img')) {
              params.obj.find('img').attr('src', '').hide();
            }
            app.preloader.hide();
          },
          () => {}
        );
      },
    });
  }
  //clear the images
  if (image_url) {
    buttons[0].push({
      text: _('Clear'),
      bold: true,
      color: 'red',
      onClick: function () {
        app.dialog.confirm(
          _('Are you sure you want to clear the image?'),
          async () => {
            app.preloader.show();
            params.obj.find('input').val('');
            if ($('.' + params.ref)) {
              $('.' + params.ref).css({ 'background-image': 'none' });
            }
            params.obj.attr('has-image', '0');
            if (params.obj.find('i')) {
              params.obj.find('i').show();
            }
            if (params.obj.find('.bg-input-image')) {
              params.obj.find('.bg-input-image').css('background-image', 'none');
            }
            if (params.obj.find('img')) {
              params.obj.find('img').attr('src', '').hide();
            }

            params.obj.find('.material-icons').show();
            app.preloader.hide();
          },
          () => {}
        );
      },
    });
  }

  app.actions.create({ buttons: buttons }).open();
};
