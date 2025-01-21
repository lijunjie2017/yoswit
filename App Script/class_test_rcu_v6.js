window.class_test_rcu = (inputString) => {
  const result = {};
  const length = inputString.length;
  let startIndex = 4;
  while (startIndex < length - 2) {
    const positionInfo = inputString.substring(startIndex, startIndex + 2);
    const lengthInfo = inputString.substring(startIndex + 2, startIndex + 4);
    let dataLength;

    // 根据长度信息确定数据长度
    if (lengthInfo === '00') {
      dataLength = 2;
    } else if (lengthInfo === '01') {
      dataLength = 10; // 特殊长度为10
    } else {
      dataLength = 6; // 默认长度为6
    }

    const dataStart = startIndex + 2;

    if (dataStart + dataLength > length) break; // 防止越界

    const value = inputString.substring(dataStart, dataStart + dataLength);
    result[positionInfo] = value;

    // 更新索引到下一个槽位
    startIndex += 2 + dataLength;
  }
  return result;
};
