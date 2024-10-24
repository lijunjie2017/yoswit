window.profile_template_load = function () {
  return new Promise((solve, reject) => {
    let ALLLIST = [];
    let THISURL = '/api/resource/Profile%20Template?fields=' + encodeURI('["*"]');
    http
      .request(THISURL, {
        method: 'GET',
        responseType: 'json',
        serializer: 'json',
        data: {},
      })
      .then(async (resData) => {
        console.log(resData);
        //change the picker value
        let dataList = [];
        let list = resData.data.data;
        list.forEach((item, index) => {
          dataList.push(_(item.profile_name));
        });
        profile_template_picker.setValue(dataList);
        let dataObjList = [
          {
            textAlign: 'center',
            values: dataList,
          },
        ];
        profile_template_picker.cols = dataObjList;

        //accept the data for the room by template name
        try{
            let tranRes = await http.request(encodeURI(`/api/method/appv6.getTranslationForRoom`), {
                method: 'GET',
                responseType: 'json',
              });
            console.log("tranRes",tranRes)
            let tranList = tranRes.data.msg.list;
            let roomTemList = tranRes.data.msg.room_list;
            let newRoomList = [];
            let roomList = [];
            roomTemList.forEach(item=>{
                roomList.push({
                    room_name : item,
                    show_list : []
                })
            })
            roomList.forEach(roomItem=>{
                tranList.forEach(tranItem=>{
                    if(roomItem.room_name == tranItem.source_text){
                        let thisDocs = `[${tranItem.language}]${tranItem.translation}[/${tranItem.language}]`;
                        //let thisLanguage = $('.profile-language').val();
                        let thatDocs = `[en]${roomItem.room_name}[/en]`;
                        if(roomItem.show_list.indexOf(thisDocs) == -1){
                            roomItem.show_list.push(thisDocs);
                        }
                        if(roomItem.show_list.indexOf(thatDocs) == -1){
                            roomItem.show_list.push(thatDocs);
                        }
                    }
                })
            });
            console.log("roomItem",roomList);
            //change the same room 
            let newList = [];
            roomList.forEach(item=>{
                newList.push(item.show_list.join(""));
            })
            solve(newList);
        }catch(error){
            solve([])
            //app.dialog.alert(error)
        }
        // let THISURL2 = '/api/resource/Profile%20Template/' + list[0].name + '?fields=' + encodeURI('["*"]');
        // http
        //   .request(THISURL2, {
        //     method: 'GET',
        //     responseType: 'json',
        //     serializer: 'json',
        //     data: {},
        //   })
        //   .then((roomData) => {
        //     let roomList = roomData.data.data.profile_room;
        //     let newRoomList = [];
        //     let thisLanguage = $('.profile-language').val();
        //     let htmls = '';
        //     roomList.forEach((datas) => {
        //       let thisDocs = `[${thisLanguage}]${datas.title}[/${thisLanguage}]`;
        //       //htmls+= `<input type="hidden" class="profile-room" name="profile_room[]" value="${thisDocs}">`
        //       newRoomList.push(thisDocs);
        //     });
        //     ALLLIST = newRoomList;
        //     solve(ALLLIST);
        //     //$('.hidden-box').append(htmls)
        //   })
        //   .catch((error) => {
        //     solve([]);
        //   });
      })
      .catch((err) => {
        solve([]);
        console.log(err);
      });
  });
};
