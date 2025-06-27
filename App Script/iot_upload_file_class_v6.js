window.createBLEUploadManager = () => {
  // 私有状态
  let currentDeviceId = null;
  let isConnected = false;
  const platform = Capacitor.getPlatform();
  const dependencies = { sparkMD5: false };

  // 平台配置
  const config = {
    android: {
      mtu: 512,
      chunkSize: 504,
      retryCount: 3,
      delay: 50
    },
    ios: {
      mtu: 158,
      chunkSize: 158,
      retryCount: 5,
      delay: 20
    }
  };

  // 工具函数
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const getPlatformConfig = () => config[platform] || config.android;

  // 核心实现
  const loadDependencies = async () => {
    if (window.SparkMD5) return true;
    
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://dev.mob-mob.com/files/spark-md5.min.js';
      script.onload = () => (dependencies.sparkMD5 = true, resolve());
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const validateJSON = json => {
    const required = ['file_name', 'file_type', 'data', 'md5'];
    if (!required.every(k => k in json)) throw new Error('Invalid JSON structure');
  };

  const processData = json => {
    const buffer = base64ToArrayBuffer(json.data);
    const spark = new window.SparkMD5.ArrayBuffer();
    spark.append(buffer);
    if (spark.end() !== json.md5.toLowerCase()) throw new Error('MD5 mismatch');
    return buffer;
  };

  const base64ToArrayBuffer = base64 => {
    const binaryStr = atob(base64);
    return Uint8Array.from(binaryStr, c => c.charCodeAt(0)).buffer;
  };

  const splitChunks = (buffer, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < buffer.byteLength; i += chunkSize) {
      chunks.push(buffer.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // 公共API
  return {
    connect: async (deviceId, callbacks = {}) => {
      try {
        await this.disconnect();
        
        await new Promise((resolve, reject) => {
          ble.connect(deviceId, 
            async peripheral => {
              if (platform === 'android') {
                await ble.requestMtu(deviceId, getPlatformConfig().mtu);
              }
              currentDeviceId = deviceId;
              isConnected = true;
              if (callbacks && typeof callbacks.onConnect === 'function') {
                  callbacks.onConnect();
                }
              resolve();
            },
            error => reject(`Connection failed: ${error}`)
          );
        });
      } catch (error) {
        // callbacks.onError?.(error);
        throw error;
      }
    },

    disconnect: async () => {
      if (!currentDeviceId) return;
      await ble.disconnect(currentDeviceId);
      currentDeviceId = null;
      isConnected = false;
    },

    send: async (jsonData, options = {}) => {
      try {
        validateJSON(jsonData);
        await loadDependencies();
        
        const buffer = processData(jsonData);
        const chunks = splitChunks(buffer, getPlatformConfig().chunkSize);
        const total = chunks.length;

        for (const [index, chunk] of chunks.entries()) {
          await this.sendChunk(chunk, index);
        //   options.onProgress?.(index + 1, total);
          await delay(getPlatformConfig().delay);
        }
        
        return true;
      } catch (error) {
        // options.onError?.(error);
        throw error;
      }
    },

    sendChunk: async (chunk, index) => {
      const hex = Array.from(new Uint8Array(chunk))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const command = `933400${(hex.length / 2).toString(16).padStart(4, '0')}${hex}`;
      const bytes = new Uint8Array(command.match(/.{1,2}/g).map(b => parseInt(b, 16)));

      await ble.writeWithoutResponse(
        currentDeviceId,
        'ff80',
        'ff85',
        bytes.buffer
      );
    }
  };
};

// 使用示例
const main = async () => {
  const bleManager = createBLEUploadManager();
  
  try {
    await bleManager.connect('94:B5:55:97:53:0E', {
      onConnect: () => console.log('Connected!')
    });

    await bleManager.send({
      file_name: "v12.116E.bin",
      file_type: 1,
      data: "SGVsbG8gV29ybGQh", // Hello World!
      md5: "ed076287532e86365e841e92bfc50d8c"
    }, {
      onProgress: (current, total) => 
        console.log(`Progress: ${Math.round((current / total) * 100)}%`)
    });

    console.log('Transfer completed!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await bleManager.disconnect();
  }
};
