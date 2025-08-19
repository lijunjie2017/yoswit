window.ir_upload_test = async()=>{
  let zipUrl = 'https://my.yoswit.com/files/IR-v1.0.zip';
    let filePath = 'IR-v1.0.zip';
    let fileName = 'IR-v1.0.zip';
    let mkdirFilePath = `databases/`;
    if (deviceInfo.operatingSystem === 'ios') {
      mkdirFilePath = `Library/LocalDatabase/`;
    }
    try {
      // 检查文件是否存在
      await http2.inspectFileStat(cordova.file.applicationStorageDirectory, `${mkdirFilePath}${fileName}`).then(async(entry)=>{
        console.log("entry",entry);
        //if exit,then init database
        if(entry){
          let db = await initIrDataBase('irext_db_sqlite.db');
          let sql = 'SELECT * FROM brand WHERE name = "长虹";';
          let result = await irSqliteExecuteSql(db,sql);
          console.log('result',result);
        }
        //entry.remove();
      });
    } catch (error) {
      console.log('error', error);
      app.dialog.confirm(
        `${_('The automatic matching feature requires downloading some files. Would you like to proceed with the download?')}`,
        async () => {
          try {
            app.dialog.preloader(_('Downloading, please wait...'));
            this.irTimer = setTimeout(() => {
              app.dialog.close();
              app.dialog.alert(_('Download Timed Out'));
            }, 1000 * 60);
            const resData = await http2.request({
              url: zipUrl,
              method: 'DOWNLOAD',
              timeout: 60,
              debug: true,
              file: {
                path: cordova.file.applicationStorageDirectory + mkdirFilePath + fileName,
                name: `${fileName}`,
              },
            });
            app.dialog.close();
            app.dialog.preloader(_('Unzipping, please wait...'));
            //unzip file
            console.log("unzip file",cordova.file.applicationStorageDirectory + mkdirFilePath + fileName);
            console.log("to file",cordova.file.applicationStorageDirectory + mkdirFilePath);
            Zeep.unzip({
              from : cordova.file.applicationStorageDirectory + mkdirFilePath + fileName,
              to : cordova.file.applicationStorageDirectory + mkdirFilePath
            },async function(data){
              console.log("data",data);
              let db = await initIrDataBase('irext_db_sqlite.db');
              let sql = 'SELECT * FROM brand WHERE name = "长虹";';
              let result = await irSqliteExecuteSql(db,sql);
              console.log('result',result);
            },function(error){
              console.log("error",error);
            });
            // app.dialog.close();
            // let db = await initIrDataBase('irext_db_sqlite.db');
            // let sql = 'SELECT * FROM brand WHERE name = "长虹";';
            // let result = await irSqliteExecuteSql(db,sql);
            // console.log('result',result);
          } catch (errorss) {
            console.log("errorss",errorss)
            http2.inspectFileStat(cordova.file.applicationStorageDirectory, `${mkdirFilePath}${fileName}`).then(entry=>{
              console.log("entry error",entry);
              entry.remove();
            });
            app.dialog.close();
            app.dialog.alert('Download Faild!');
          }
        },
        () => {}
      );
    }
}

// window.unzipFile = (PathToFileInString,PathToResultZip)=>{
//   return new Promise((resolve, reject)=>{
//     JJzip.unzip(PathToFileInString,{target:PathToResultZip},function(data){
//       resolve(data);
//     },function(error){
//       reject(error);
//     })
//   })
// }

window.initIrDataBase = (fileName)=>{
  return new Promise((resolve, reject)=>{
    let db = window.sqlitePlugin.openDatabase({ name: fileName, location: 'default' });
    console.log('this.dbMap', db);
    resolve(db);
  })
}

window.irSqliteExecuteSql = (db,sql,params=[])=>{
  return new Promise((resolve, reject)=>{
    db.executeSql(sql, params, (resultSet) => {
      let list = [];
      for (let i = 0; i < resultSet.rows.length; i++) {
        list.push(resultSet.rows.item(i));
      }
      resolve(list);
    }, (error) => {
      reject(error);
    });
  })
}
