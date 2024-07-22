window.app_profile_del_room = async()=>{
  try {
    let list = await http2.request(encodeURI('/api/method/appv6.profileRoomList'), {
      method: 'GET',
      responseType: 'json',
      dataType: 'json',
      responseType: 'json',
      serializer: 'json',
      timeout: 60,
      data: {
        
      },
    });
    console.log('list',list);
    if(list.status == 200 ){
      let postList = list.data.list;
      let postCount = 0;

      for(let i in postList){
        try{
          let postStatus = await http2.request(encodeURI('/api/method/appv6.delProfileRoom'), {
            method: 'POST',
            responseType: 'json',
            dataType: 'json',
            responseType: 'json',
            serializer: 'json',
            timeout: 60,
            data: {
              name: postList[i].name,
            },
          });
          console.log("postStatus",postStatus)
          postCount++;
        }catch(error){
          console.log(error)
        }
        
      }
      console.log('postCount',postCount)
    }
  }catch(error){

  }
}