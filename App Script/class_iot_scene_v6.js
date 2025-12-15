window.iotScene = (function () {
  /**
   * 场景工具类 - 辅助函数集合
   */
  class SceneUtils {
    constructor(instance) {
      this.instance = instance;
    }

    /**
     * 验证十六进制字符串
     */
    isValidHex(str) {
      if (!str || typeof str !== 'string') return false;
      return /^[0-9A-Fa-f]*$/.test(str) && str.length % 2 === 0;
    }

    /**
     * 十六进制字符串转字节长度
     */
    hexToBytes(hexStr) {
      return hexStr.length / 2;
    }

    /**
     * 字节转十六进制字符串（带填充）
     */
    bytesToHex(bytes, padLength = 2) {
      return bytes.toString(16).padStart(padLength, '0').toLowerCase();
    }

    /**
     * 解析十六进制长度字段
     */
    parseLength(hexStr, offset) {
      const lengthHex = hexStr.substring(offset, offset + 2);
      return parseInt(lengthHex, 16);
    }

    /**
     * 日志输出（带前缀）
     */
    log(message, data = null) {
      if (this.instance.config.debug) {
        console.log(`[iotScene] ${message}`, data || '');
      }
    }

    /**
     * 错误日志
     */
    error(message, error = null) {
      console.error(`[iotScene Error] ${message}`, error || '');
    }

    /**
     * 警告日志
     */
    warn(message, data = null) {
      console.warn(`[iotScene Warning] ${message}`, data || '');
    }
  }

  /**
   * 场景ID管理器 - 负责分配和跟踪场景ID
   */
  class SceneIdManager {
    constructor(baseSceneId, usedSceneIds = [], existingSplitIds = []) {
      this.currentId = parseInt(baseSceneId, 16);
      this.usedIds = new Set(usedSceneIds);
      this.allocatedIds = [];
      
      // 已有的拆分ID列表（用于编辑时复用）
      this.existingSplitIds = existingSplitIds.sort((a, b) => a - b);
      this.existingSplitIndex = 0;  // 复用进度追踪
      
      // 标记当前ID为已使用
      this.usedIds.add(this.currentId);
      
      console.log(`[SceneIdManager] Initialized with base ID: ${this.currentId}, used IDs: [${[...this.usedIds].sort((a,b)=>a-b).join(', ')}]`);
      if (this.existingSplitIds.length > 0) {
        console.log(`[SceneIdManager] Existing split IDs to reuse: [${this.existingSplitIds.join(', ')}]`);
      }
    }

    /**
     * 获取当前场景ID
     */
    getCurrentId() {
      return this.currentId;
    }

    /**
     * 移动到指定场景ID
     */
    moveTo(sceneId) {
      this.currentId = sceneId;
      this.usedIds.add(sceneId);
    }

    /**
     * 分配下一个可用的场景ID
     * 优先复用已有的拆分场景ID（编辑模式），用完后再分配新ID
     */
    allocateNextId() {
      // 优先从已有的拆分ID中复用
      if (this.existingSplitIndex < this.existingSplitIds.length) {
        const reusedId = this.existingSplitIds[this.existingSplitIndex];
        this.existingSplitIndex++;
        this.allocatedIds.push(reusedId);
        this.usedIds.add(reusedId);
        console.log(`  ✓ Reusing existing split ID: ${reusedId}`);
        return reusedId;
      }

      // 已有ID用完，分配新的未占用ID
      let candidate = this.currentId + 1;

      // 查找第一个未使用的ID
      while (this.usedIds.has(candidate)) {
        console.log(`  ${candidate} is used, trying next...`);
        candidate++;
        if (candidate > 255) {
          throw new Error('No available scene ID (max 255)');
        }
      }

      console.log(`  ✓ Allocated new scene ID: ${candidate}`);
      this.usedIds.add(candidate);
      this.allocatedIds.push(candidate);
      return candidate;
    }

    /**
     * 获取所有已分配的新ID
     */
    getAllocatedIds() {
      return [...this.allocatedIds];
    }
  }

  /**
   * 场景命令拆分器 - 主类
   */
  function iotScene() {
    // 配置项
    this.config = {
      maxSceneSize: 240,        // 单个场景最大字节数
      sceneHeaderSize: 4,       // 场景头大小 (8F1000xx)
      chainCommandSize: 5,      // 链式调用大小 (048f0200xx)
      debug: false,             // 是否启用调试日志
    };

    // 初始化工具类
    this.utils = new SceneUtils(this);
  }

  /**
   * 设置调试模式
   */
  iotScene.prototype.setDebug = function (enabled) {
    this.config.debug = enabled;
    return this;
  };

  /**
   * 主入口：拆分场景命令
   * 
   * @param {Object} options - 配置对象
   * @param {string} options.sceneId - 基础场景ID（十六进制字符串，如 "05"）
   * @param {string} options.actionCommand - postActionBle生成的动作指令
   * @param {string} options.deviceGuid - 设备GUID
   * @param {Array<number>} options.usedSceneIds - 已使用的场景ID列表
   * @returns {Array<Object>} 场景对象数组
   */
  iotScene.prototype.splitSceneCommand = function (options) {
    const { sceneId, actionCommand, deviceGuid, usedSceneIds = [], existingSplitIds = [] } = options;

    this.utils.log('splitSceneCommand called', { sceneId, deviceGuid, commandLength: actionCommand.length });
    this.utils.log(`Used Scene IDs: [${usedSceneIds.join(', ')}]`);
    if (existingSplitIds.length > 0) {
      this.utils.log(`Existing Split IDs: [${existingSplitIds.join(', ')}]`);
    }

    // 验证输入
    this._validateInput(sceneId, actionCommand);

    // 提取场景前缀
    const prefixInfo = this._extractScenePrefix(actionCommand);
    this.utils.log(`Prefix detected: ${prefixInfo.hasPrefix ? 'Yes' : 'No'}`);

    // 计算总大小
    const actionBytes = this.utils.hexToBytes(actionCommand);
    const totalSize = this.config.sceneHeaderSize + actionBytes;

    this.utils.log(`Total size: ${totalSize} bytes`);

    // 不需要拆分
    if (totalSize <= this.config.maxSceneSize) {
      this.utils.log('No split needed');
      return [
        {
          sceneId: sceneId,
          sceneIdDecimal: parseInt(sceneId, 16),
          command: this._buildSceneCommand(sceneId, actionCommand),
          actionCommand: actionCommand,
          isChained: false,
          isSplit: false,
          subCommandCount: this._countSubCommands(prefixInfo.subCommandsData),
          sizeBytes: totalSize,
        },
      ];
    }

    // 需要拆分
    this.utils.log(`Command too large (${totalSize} bytes), splitting...`);
    return this._splitBySubCommands(sceneId, actionCommand, usedSceneIds, prefixInfo, existingSplitIds);
  };

  /**
   * 提取场景前缀（02+MAC+13）
   */
  iotScene.prototype._extractScenePrefix = function (actionCommand) {
    // 检查是否以 02 开头（蓝牙发送标识）
    if (actionCommand.substring(0, 2).toLowerCase() === '02') {
      // 02(1字节) + MAC(6字节) + 13(1字节) = 8字节 = 16字符
      const prefix = actionCommand.substring(0, 16);
      const subCommandsData = actionCommand.substring(16);
      
      // 验证前缀格式
      const channel = actionCommand.substring(14, 16).toLowerCase();
      if (channel !== '13') {
        this.utils.warn(`Unexpected channel identifier: ${channel}, expected 13`);
      }
      
      return {
        hasPrefix: true,
        prefix: prefix,              // 02+MAC+13 (8字节)
        prefixBytes: 8,
        subCommandsData: subCommandsData,  // 纯子指令部分
      };
    }
    
    // 没有前缀，整个就是子指令序列
    return {
      hasPrefix: false,
      prefix: '',
      prefixBytes: 0,
      subCommandsData: actionCommand,
    };
  };
  
  /**
   * 解析纯子指令序列（不含场景前缀）
   * @param {string} subCommandsData - 纯子指令数据（不含02+MAC+13前缀）
   * @returns {Array} 子指令列表
   */
  iotScene.prototype._parseSubCommands = function (subCommandsData) {
    const subCommands = [];
    let offset = 0;

    this.utils.log('Parsing sub-commands...');

    // 解析子指令：[长度] + [数据]
    while (offset < subCommandsData.length) {
      const lengthHex = subCommandsData.substring(offset, offset + 2);
      const length = parseInt(lengthHex, 16);

      if (isNaN(length) || length === 0) {
        this.utils.warn(`Invalid length at offset ${offset}: ${lengthHex}, stopping parse`);
        break;
      }

      // 读取指定长度的数据
      const dataStart = offset + 2;
      const dataEnd = dataStart + length * 2;
      const data = subCommandsData.substring(dataStart, dataEnd);

      if (data.length < length * 2) {
        this.utils.warn(`Incomplete data at offset ${offset}: expected ${length} bytes, got ${data.length/2} bytes`);
        break;
      }

      const fullCommand = lengthHex + data;
      
      subCommands.push({
        type: 'normal',
        lengthByte: lengthHex,
        length: length,
        data: data,
        fullCommand: fullCommand,
        bytes: 1 + length,
      });
      
      // 验证：fullCommand的实际长度应该等于声明的长度
      const actualBytes = fullCommand.length / 2;
      const expectedBytes = 1 + length;
      if (actualBytes !== expectedBytes) {
        this.utils.error(`Sub-command length mismatch at offset ${offset}: declared ${expectedBytes} bytes, actual ${actualBytes} bytes`);
        this.utils.error(`  Length byte: ${lengthHex}, Data: ${data}, Full: ${fullCommand}`);
      }

      offset = dataEnd;
    }

    this.utils.log(`Parsed ${subCommands.length} sub-commands`);
    return subCommands;
  };

  /**
   * 按子指令边界拆分场景
   */
  iotScene.prototype._splitBySubCommands = function (baseSceneId, actionCommand, usedSceneIds, prefixInfo, existingSplitIds = []) {
    // 解析所有子指令（纯子指令部分，不含前缀）
    const subCommands = this._parseSubCommands(prefixInfo.subCommandsData);

    if (subCommands.length === 0) {
      throw new Error('No valid sub-commands found');
    }

    // 初始化场景ID管理器（传入已有拆分ID以便复用）
    const idManager = new SceneIdManager(baseSceneId, usedSceneIds, existingSplitIds);

    // 分组子指令
    const sceneGroups = [];
    let currentGroup = [];
    // 初始大小 = 场景头 + 前缀（如果有）
    let currentSize = this.config.sceneHeaderSize + prefixInfo.prefixBytes;

    for (let i = 0; i < subCommands.length; i++) {
      const subCmd = subCommands[i];
      const isLastSubCmd = i === subCommands.length - 1;

      // 计算加入当前子指令后的大小
      let potentialSize = currentSize + subCmd.bytes;

      // 如果不是最后一个子指令，需要预留链式调用空间
      if (!isLastSubCmd) {
        potentialSize += this.config.chainCommandSize;
      }

      // 检查是否需要新建场景
      if (potentialSize > this.config.maxSceneSize && currentGroup.length > 0) {
        this.utils.log(`Scene full at ${currentSize} bytes, starting new scene`);
        this.utils.log(`  Next sub-command ${i}: ${subCmd.fullCommand.substring(0, 20)}... (${subCmd.bytes} bytes)`);
        
        // 保存当前分组
        sceneGroups.push([...currentGroup]);
        currentGroup = [];
        // 新场景的初始大小 = 场景头 + 前缀（每个场景都要有前缀）
        currentSize = this.config.sceneHeaderSize + prefixInfo.prefixBytes;
        
        // 重新计算加入当前子指令后的大小
        potentialSize = currentSize + subCmd.bytes;
        if (!isLastSubCmd) {
          potentialSize += this.config.chainCommandSize;
        }
      }

      // 检查单个子指令是否过大
      const maxSubCommandSize = this.config.maxSceneSize - this.config.sceneHeaderSize - prefixInfo.prefixBytes;
      if (subCmd.bytes > maxSubCommandSize) {
        throw new Error(
          `Single sub-command too large: ${subCmd.bytes} bytes (max ${maxSubCommandSize})`
        );
      }

      // 最终检查：加入当前子指令后是否真的不超出
      if (potentialSize > this.config.maxSceneSize) {
        throw new Error(
          `Cannot fit sub-command: scene would be ${potentialSize} bytes (max ${this.config.maxSceneSize})`
        );
      }

      // 加入当前分组
      this.utils.log(`  Adding sub-command ${i}: ${subCmd.fullCommand.substring(0, 20)}... to scene`);
      currentGroup.push(subCmd);
      currentSize += subCmd.bytes;
    }

    // 保存最后一个分组
    if (currentGroup.length > 0) {
      sceneGroups.push(currentGroup);
    }

    this.utils.log(`Split into ${sceneGroups.length} scenes`);

    // 构建场景命令
    return this._buildSceneCommands(sceneGroups, idManager, prefixInfo);
  };

  /**
   * 构建场景命令列表
   */
  iotScene.prototype._buildSceneCommands = function (sceneGroups, idManager, prefixInfo) {
    const scenes = [];

    for (let i = 0; i < sceneGroups.length; i++) {
      const group = sceneGroups[i];
      const isLastGroup = i === sceneGroups.length - 1;

      // 获取当前场景ID
      const currentSceneId = idManager.getCurrentId();

      // 组装动作数据：前缀 + 子指令序列
      let actionData = '';
      
      this.utils.log(`Building scene ${i + 1}/${sceneGroups.length}:`);
      
      // 每个场景都要添加前缀（如果有）
      if (prefixInfo.hasPrefix) {
        actionData = prefixInfo.prefix;
        this.utils.log(`  Prefix: ${prefixInfo.prefix} (${prefixInfo.prefixBytes} bytes)`);
      }
      
      // 添加子指令
      this.utils.log(`  Sub-commands in this scene: ${group.length}`);
      const subCommandsStr = group.map((cmd, idx) => {
        this.utils.log(`    [${idx}] ${cmd.fullCommand.substring(0, 30)}... (${cmd.bytes} bytes, length byte: ${cmd.lengthByte})`);
        return cmd.fullCommand;
      }).join('');
      actionData += subCommandsStr;
      
      this.utils.log(`  Action data before chain: ${actionData.length / 2} bytes`);

      // 如果不是最后一组，添加链式调用
      let nextSceneId = null;
      if (!isLastGroup) {
        nextSceneId = idManager.allocateNextId();
        const chainCommand = `048f0200${this.utils.bytesToHex(nextSceneId, 2)}`;
        this.utils.log(`  Adding chain command: ${chainCommand} (next scene: ${nextSceneId})`);
        actionData += chainCommand;
      }
      
      this.utils.log(`  Final action data: ${actionData.length / 2} bytes`);
      
      // 验证最终大小
      const finalSize = this.config.sceneHeaderSize + (actionData.length / 2);
      if (finalSize > this.config.maxSceneSize) {
        this.utils.error(`  ERROR: Scene size ${finalSize} exceeds max ${this.config.maxSceneSize}!`);
      }

      // 构建完整场景命令
      const sceneIdHex = this.utils.bytesToHex(currentSceneId, 2);
      const fullCommand = this._buildSceneCommand(sceneIdHex, actionData);

      scenes.push({
        sceneId: sceneIdHex,
        sceneIdDecimal: currentSceneId,
        command: fullCommand,
        actionCommand: actionData,
        isChained: !isLastGroup,
        isSplit: true,
        nextSceneId: nextSceneId,
        subCommandCount: group.length,
        sizeBytes: this.config.sceneHeaderSize + this.utils.hexToBytes(actionData),
      });

      // 移动到下一个场景ID
      if (nextSceneId) {
        idManager.moveTo(nextSceneId);
      }
    }

    return scenes;
  };

  /**
   * 构建完整的场景命令
   */
  iotScene.prototype._buildSceneCommand = function (sceneId, actionData) {
    const dataLength = this.utils.bytesToHex(this.utils.hexToBytes(actionData), 2);
    return `8f1000${sceneId}${dataLength}${actionData}`;
  };

  /**
   * 统计子指令数量
   */
  iotScene.prototype._countSubCommands = function (subCommandsData) {
    try {
      return this._parseSubCommands(subCommandsData).length;
    } catch (e) {
      return 0;
    }
  };

  /**
   * 验证输入参数
   */
  iotScene.prototype._validateInput = function (sceneId, actionCommand) {
    if (!sceneId || typeof sceneId !== 'string') {
      throw new Error('Invalid sceneId: must be a non-empty string');
    }

    if (!this.utils.isValidHex(sceneId)) {
      throw new Error('Invalid sceneId: must be valid hex string');
    }

    if (!actionCommand || typeof actionCommand !== 'string') {
      throw new Error('Invalid actionCommand: must be a non-empty string');
    }

    if (!this.utils.isValidHex(actionCommand)) {
      throw new Error('Invalid actionCommand: must be valid hex string');
    }
  };

  /**
   * 获取指定设备的所有已使用场景ID
   * 
   * @param {string} deviceGuid - 设备GUID
   * @returns {Array<number>} 已使用的场景ID列表
   */
  iotScene.prototype.getAllUsedSceneIds = function (deviceGuid) {
    if (typeof erp === 'undefined' || !erp.info || !erp.info.scene) {
      this.utils.warn('erp.info.scene not available');
      return [];
    }

    const sceneObj = cloneDeep(erp.info.scene);
    const usedIds = [];

    for (let i in sceneObj) {
      if (sceneObj[i].scene_device_location) {
        sceneObj[i].scene_device_location.forEach((location) => {
          if (location.device === deviceGuid) {
            usedIds.push(parseInt(location.storage_id));
          }
        });
      }
    }

    // 去重并排序
    return [...new Set(usedIds)].sort((a, b) => a - b);
  };

  /**
   * 批量写入场景到蓝牙设备
   * 
   * @param {string} deviceGuid - 设备GUID
   * @param {Array<Object>} scenes - 场景列表
   * @returns {Promise<Array>} 写入结果
   */
  iotScene.prototype.writeScenesToBle = function (deviceGuid, scenes) {
    return new Promise(async (resolve, reject) => {
      if (!window.peripheral || !window.peripheral[deviceGuid]) {
        reject(new Error(`Device ${deviceGuid} not connected`));
        return;
      }

      const results = [];

      try {
        for (const scene of scenes) {
          this.utils.log(`Writing scene ${scene.sceneId} to device ${deviceGuid}`);

          await window.peripheral[deviceGuid].write([
            {
              service: 'ff80',
              characteristic: 'ff81',
              data: scene.command,
            },
          ]);

          results.push({
            success: true,
            sceneId: scene.sceneId,
            sceneIdDecimal: scene.sceneIdDecimal,
            command: scene.command,
          });

          this.utils.log(`✓ Scene ${scene.sceneId} written successfully${scene.isChained ? ' (chained)' : ''}`);
        }

        resolve(results);
      } catch (error) {
        this.utils.error('Failed to write scene', error);
        reject(error);
      }
    });
  };

  /**
   * 智能处理场景命令（自动判断是否需要拆分并写入）
   * 
   * @param {Object} options - 配置对象
   * @returns {Promise<Object>} 处理结果
   */
  iotScene.prototype.processAndWriteScene = function (options) {
    return new Promise(async (resolve, reject) => {
      const { sceneId, actionCommand, deviceGuid, usedSceneIds } = options;

      try {
        // 拆分场景
        const scenes = this.splitSceneCommand({
          sceneId,
          actionCommand,
          deviceGuid,
          usedSceneIds: usedSceneIds || this.getAllUsedSceneIds(deviceGuid),
        });

        // 写入蓝牙
        const writeResults = await this.writeScenesToBle(deviceGuid, scenes);

        resolve({
          success: true,
          isSplit: scenes.length > 1,
          sceneCount: scenes.length,
          scenes: scenes,
          writeResults: writeResults,
        });
      } catch (error) {
        this.utils.error('processAndWriteScene failed', error);
        reject(error);
      }
    });
  };

  /**
   * 场景指令构建器 - 负责生成 Action 和 Trigger 指令
   */
  class SceneCommandBuilder {
    /**
     * 计算 slot 值（RCU设备专用）
     * @param {number} num - 配置编号 (1-50)
     * @returns {string} - 两位十六进制 slot 值
     */
    static calculateSlot(num) {
      const intNum = parseInt(num);
      
      if (intNum < 1 || intNum > 50) return null;
      const group = Math.floor((intNum - 1) / 5);
      const pos = ((intNum - 1) % 5) + 1;
      const highMap = [0x0, 0x2, 0x4, 0x6, 0x8, 0xa, 0xb, 0xc, 0xd, 0xe];
      const high = highMap[group];
      return ((high << 4) | pos).toString(16).padStart(2, '0').toLowerCase();
    }

    /**
     * 生成 RCU 开关指令
     * @param {string} slot - slot值（两位十六进制）
     * @param {number} gang - 通道编号 (1-4)
     * @param {number} ref - 状态 (0=关, 1=开)
     * @returns {string} - 完整的开关指令
     */
    static buildRcuOnOffCommand(slot, gang, ref) {
      let command = '';
      let onoff_data = '1100';
      
      if (gang == 1) {
        onoff_data = ref == 1 ? '1100' : '1000';
      } else if (gang == 2) {
        onoff_data = ref == 1 ? '2200' : '2000';
      } else if (gang == 3) {
        onoff_data = ref == 1 ? '4400' : '4000';
      } else if (gang == 4) {
        onoff_data = ref == 1 ? '8800' : '8000';
      }
      
      command = `07971f${slot}8000${onoff_data}`;
      return command;
    }

    /**
     * 生成跨设备级联触发指令
     * @param {string} targetMac - 目标设备MAC（12位，无冒号）
     * @param {number} sceneId - 目标场景ID
     * @returns {string} - 级联触发指令
     */
    static buildCascadeCommand(targetMac, sceneId) {
      const sceneIdHex = parseInt(sceneId).toString(16).padStart(2, '0').toLowerCase();
      return `0b02${targetMac}8f0200${sceneIdHex}`;
    }

    /**
     * 查找可用的场景ID（最小未使用ID）
     * @param {Array<number>} usedIds - 已使用的ID列表
     * @returns {number} - 可用的ID
     */
    static findMissingNumber(usedIds) {
      const sortedIds = [...new Set(usedIds)].sort((a, b) => a - b);
      
      for (let i = 1; i <= 255; i++) {
        if (!sortedIds.includes(i)) {
          return i;
        }
      }
      
      throw new Error('No available scene ID (max 255)');
    }

    /**
     * 按设备GUID分组动作列表
     * @param {Array} list - 动作列表
     * @returns {Object} - 按设备分组的对象 { guid: { device_mode, list: [...] } }
     */
    static structureActionList(list) {
      if (!list || list.length === 0) {
        return {};
      }
      
      const macMap = {};
      
      // 初始化设备映射
      list.forEach((item) => {
        if (!macMap[item.device]) {
          macMap[item.device] = {
            device_mode: item.device_mode,
            list: []
          };
        }
      });
      
      // 分组
      list.forEach((item) => {
        if (macMap[item.device]) {
          macMap[item.device].list.push(item);
        }
      });
      
      return macMap;
    }
  }

  /**
   * 场景动作指令生成器 - 核心业务类
   * 负责根据设备动作列表生成蓝牙指令
   */
  class SceneActionGenerator {
    /**
     * @param {Object} context - 上下文配置
     * @param {string} context.templateName - 场景模板名称
     * @param {Function} context.getMacAddress - 获取MAC地址的函数 (guid, withoutColon) => string
     * @param {Object} context.options - 可选配置
     */
    constructor(context) {
      this.context = context;
      this.templateName = context.templateName;
      this.getMacAddress = context.getMacAddress;
      this.options = context.options || {};
    }

    /**
     * 生成动作指令（核心方法）
     * @param {Object} structuredActionList - 已结构化的动作列表（通过 structureActionList 处理）
     * @param {Object} options - 额外选项
     * @param {string} options.mainRcuGuid - 主RCU的GUID
     * @param {boolean} options.isWelcome - 是否为欢迎场景
     * @param {Object} options.radarStatus - 雷达状态 { exit: bool, enter: bool }
     * @param {number} options.statusIndex - 状态索引
     * @param {Function} options.checkIsRcu - 检查是否为RCU的函数
     * @param {Array} options.deviceStatusList - 设备状态列表
     * @param {number} options.mutiwayStatus - 多路状态
     * @returns {Object} - 按设备GUID索引的指令对象 { guid: actionCommand }
     */
    generateActionCommands(structuredActionList, options = {}) {
      const {
        mainRcuGuid,
        isWelcome = false,
        radarStatus = {},
        statusIndex,
        checkIsRcu = () => false,
        deviceStatusList = [],
        mutiwayStatus = 1
      } = options;

      let controlIndex = 0;
      const postList = JSON.parse(JSON.stringify(structuredActionList)); // deep clone
      
      // 遍历每个设备，生成指令
      for (let deviceGuid in postList) {
        const deviceData = postList[deviceGuid];
        const deviceList = deviceData.list;
        const deviceMac = this.getMacAddress(deviceGuid, true);
        
        let actionCommand = '';
        
        // 遍历设备的所有动作
        deviceList.forEach((item, index) => {
          const mode = item.mode || item.device_mode;
          const buttonGroup = item.button_group || item.device_button_group;
          const ref = item.ref;
          
          // === RCU 设备处理 ===
          if (this._isRcuMode(mode)) {
            actionCommand += this._buildRcuCommand(item, buttonGroup, ref, deviceGuid);
          }
          
          // === 调光设备处理 ===
          else if (this._isDimmingMode(mode)) {
            actionCommand += this._buildDimmingCommand(item, buttonGroup, ref, deviceGuid);
          }
          
          // === 窗帘设备处理 ===
          else if (this._isCurtainMode(mode)) {
            actionCommand += this._buildCurtainCommand(item, deviceMac, controlIndex);
          }
          
          // === 温控器设备处理 ===
          else if (mode === 'Thermostat') {
            actionCommand += this._buildThermostatCommand(item, deviceMac, controlIndex);
          }
          
          // === HDMI CEC 设备处理 ===
          else if (mode === 'Hdmicec') {
            actionCommand += this._buildHdmiCecCommand(item, deviceMac, controlIndex);
          }
          
          // === 网关设备处理 ===
          else if (mode.includes('Gateway')) {
            actionCommand += this._buildGatewayCommand(item);
          }
        });
        
        // 确保 RCU 场景动作指令带 02+MAC+13 前缀（与原页面逻辑一致）
        const isRcuDevice = this._isRcuMode(deviceData.device_mode) || checkIsRcu(deviceGuid);
        if (isRcuDevice) {
          const lower = actionCommand.toLowerCase();
          if (!lower.startsWith('02')) {
            actionCommand = `02${deviceMac}13${actionCommand}`;
          } else if (lower.startsWith('02') && lower.substr(14, 2) !== '13') {
            // 已有 02+MAC 但缺少 13，补上
            actionCommand = `${actionCommand.slice(0, 14)}13${actionCommand.slice(14)}`;
          }
        }
        
        // 处理特殊场景逻辑（Welcome Scene, Toggle等）
        actionCommand = this._applyTemplateSpecificLogic(
          actionCommand,
          deviceGuid,
          {
            isWelcome,
            radarStatus,
            statusIndex,
            checkIsRcu,
            deviceStatusList,
            mutiwayStatus,
            mainRcuGuid
          }
        );
        
        postList[deviceGuid].actionCommand = actionCommand;
        controlIndex++;
      }
      
      return postList;
    }

    /**
     * 生成 RCU Trigger 指令
     * @param {string} deviceGuid - 设备GUID
     * @param {Object} options - 配置项
     * @param {number} options.gang - 按键编号
     * @param {number} options.virtualButtonId - 虚拟按钮ID
     * @param {number} options.type - 类型 (0=关, 1=开)
     * @param {boolean} options.isMainRcu - 是否为主RCU
     * @returns {string} - Trigger指令
     */
    generateTriggerCommand(deviceGuid, options) {
      const {
        gang,
        virtualButtonId,
        type = 1,
        isMainRcu = false
      } = options;
      
      const mac = this.getMacAddress(deviceGuid, true);
      const typeIndex = '1f';
      const ref = parseInt(type).toString(16).padStart(2, '0');
      const opcode = '00';
      const gangHex = parseInt(gang).toString(16).padStart(2, '0');
      const virtualGangHex = parseInt(virtualButtonId).toString(16).padStart(2, '0');
      
      // 8F2000 + gang + gang + length + command
      const preCommand = `8F2000${gangHex}${gangHex}`;
      let thisCommand = `${opcode}${typeIndex}${mac}00${ref}13${virtualGangHex}`;
      thisCommand = `${(thisCommand.length / 2).toString(16).padStart(2, '0')}${thisCommand}`;
      
      return `${preCommand}${thisCommand}`;
    }

    // ========== 私有方法：设备类型判断 ==========
    
    _isRcuMode(mode) {
      return mode === 'On Off Switch' || 
             mode === 'Multiway Switch' || 
             mode === 'RCU Scene Button' ||
             mode === 'RCU Controller';
    }
    
    _isDimmingMode(mode) {
      return mode === 'Triac Dimming' || 
             mode === '0-10v Dimming' || 
             mode === '1-10v Dimming';
    }
    
    _isCurtainMode(mode) {
      return mode && mode.includes('Curtain');
    }

    // ========== 私有方法：指令构建 ==========
    
    _buildRcuCommand(item, buttonGroup, ref, deviceGuid) {
      if (!buttonGroup.startsWith('RCU')) {
        return '';
      }
      
      const buttonGroupGang = parseInt(buttonGroup.replace('RCU ONOFF GANG', ''));
      const gang = buttonGroupGang - 4 * (parseInt(item.config) - 1);
      const slot = SceneCommandBuilder.calculateSlot(item.config);
      
      // 生成开关数据
      const onoffDataMap = {
        1: ref == 1 ? '1100' : '1000',
        2: ref == 1 ? '2200' : '2000',
        3: ref == 1 ? '4400' : '4000',
        4: ref == 1 ? '8800' : '8000'
      };
      
      const onoffData = onoffDataMap[gang] || '1100';
      const command = `07971f${slot}8000${onoffData}`;
      
      // 原始逻辑中 07 为长度字节，命令本身已含长度，不再额外添加长度前缀
      return command;
    }
    
    _buildDimmingCommand(item, buttonGroup, ref, deviceGuid) {
      if (!buttonGroup.startsWith('RCU DIMMING')) {
        return '';
      }
      
      const slot = SceneCommandBuilder.calculateSlot(item.config);
      const gang = parseInt(buttonGroup.replace('RCU DIMMING', ''));
      const targetGang = gang % 2 === 0 ? 2 : 1;
      
      // 亮度值处理
      const brightness = item.brightness || 100;
      const brightnessHex = parseInt(brightness).toString(16).padStart(2, '0');
      
      let command = `971f${slot}8001${brightnessHex}00${parseInt(targetGang).toString(16).padStart(2, '0')}`;
      
      return `${(command.length / 2).toString(16).padStart(2, '00')}${command}`;
    }
    
    _buildCurtainCommand(item, deviceMac, controlIndex) {
      // 窗帘指令：position (0-100)
      const position = item.position || 0;
      const positionHex = parseInt(position).toString(16).padStart(2, '0');
      
      let command = `02${deviceMac}13039721${item.action_type || '01'}${positionHex}`;
      
      if (controlIndex === 0) {
        return `13${(command.length / 2).toString(16).padStart(2, '00')}${command}`;
      } else {
        return `${(command.length / 2).toString(16).padStart(2, '00')}${command}`;
      }
    }
    
    _buildThermostatCommand(item, deviceMac, controlIndex) {
      let command = '';
      
      // 温控器有多个子指令
      if (item.action_command) {
        command += `${(item.action_command.length / 2).toString(16).padStart(2, '00')}${item.action_command}`;
      }
      if (item.thermostat_fan) {
        command += `${(item.thermostat_fan.length / 2).toString(16).padStart(2, '00')}${item.thermostat_fan}`;
      }
      if (item.thermostat_mode) {
        command += `${(item.thermostat_mode.length / 2).toString(16).padStart(2, '00')}${item.thermostat_mode}`;
      }
      if (item.thermostat_temp) {
        command += `${(item.thermostat_temp.length / 2).toString(16).padStart(2, '00')}${item.thermostat_temp}`;
      }
      
      return command;
    }
    
    _buildHdmiCecCommand(item, deviceMac, controlIndex) {
      // HDMI CEC 指令
      const command = item.action_command || '028010';
      
      if (controlIndex === 0) {
        return `13${(command.length / 2).toString(16).padStart(2, '00')}${command}`;
      } else {
        return `${(command.length / 2).toString(16).padStart(2, '00')}${command}`;
      }
    }
    
    _buildGatewayCommand(item) {
      // 网关设备的原始指令
      return item.action_command || '';
    }

    // ========== 私有方法：模板特定逻辑 ==========
    
    _applyTemplateSpecificLogic(actionCommand, deviceGuid, options) {
      const {
        isWelcome,
        radarStatus,
        statusIndex,
        checkIsRcu,
        deviceStatusList,
        mutiwayStatus
      } = options;
      
      // Welcome Scene 特殊处理
      if (this.templateName === 'Welcome Scene' && checkIsRcu(deviceGuid) && !isWelcome) {
        if (radarStatus.exit) {
          const command = '048f170102';
          actionCommand = this._insertAfterPrefix(actionCommand, command);
        }
        if (radarStatus.enter) {
          let command = '048f170002';
          // 添加所有设备状态恢复指令
          deviceStatusList.forEach(item => {
            command += `048f1700${parseInt(item.virtualId).toString(16).padStart(2, '00')}`;
          });
          actionCommand = this._insertAfterPrefix(actionCommand, command);
        }
      }
      
      // RCU Scene Toggle - Save Status
      if (this.templateName === 'RCU Scene Toggle - Save Status' && checkIsRcu(deviceGuid)) {
        if (mutiwayStatus !== 2) {
          const virtualGang = options.virtualButtonId || 1;
          const setIndex = parseInt(virtualGang) + 2;
          const command = `048f1701${setIndex.toString(16).padStart(2, '00')}`;
          actionCommand = this._insertAfterPrefix(actionCommand, command);
        }
      }
      
      // RCU Scene Button 特殊处理
      if (this.templateName === 'RCU Scene Button' && checkIsRcu(deviceGuid)) {
        if (deviceStatusList.length > 0) {
          let command = '';
          deviceStatusList.forEach(item => {
            const setIndex = parseInt(item.virtualId) + 2;
            command += `048f1700${setIndex.toString(16).padStart(2, '00')}`;
          });
          actionCommand += command;
        }
      }
      
      return actionCommand;
    }
    
    /**
     * 在前缀（02+MAC+13）后插入指令
     */
    _insertAfterPrefix(actionCommand, insertCommand) {
      if (actionCommand.startsWith('02')) {
        // 前16个字符是前缀（02 + 6字节MAC + 13）
        const prefix = actionCommand.substring(0, 16);
        const rest = actionCommand.substring(16);
        return `${prefix}${insertCommand}${rest}`;
      }
      return `${insertCommand}${actionCommand}`;
    }
  }

  /**
   * 场景数据解析器 - 从场景数据生成所有BLE指令
   * 这是最高层次的抽象，输入ERP场景数据，输出所有BLE指令
   * 
   * 输出结构：
   * {
   *   success: true,
   *   rcuDevices: {
   *     'rcu-guid': {
   *       actions: [{ sceneId, command, isMain, isSplit }],
   *       triggers: { primary, secondary },
   *       settings: { settingCommand, defaultOnCommand, ... }
   *     }
   *   },
   *   externalDevices: [{
   *     guid: 'device-guid',
   *     actions: [{ sceneId, command, type }],
   *     triggers: { main, ledOn, ledOff },
   *     settings: { settingCommand }
   *   }]
   * }
   */
  class SceneDataParser {
    /**
     * @param {Object} context - 上下文配置
     * @param {Function} context.getMacAddress - 获取MAC地址函数
     * @param {Object} context.erpInfo - ERP信息对象（可选，用于收集已用场景ID）
     */
    constructor(context) {
      this.context = context;
      this.getMacAddress = context.getMacAddress;
      this.erpInfo = context.erpInfo || null;
      
      // 初始化指令生成器
      this.actionGenerator = new SceneActionGenerator({
        templateName: null,  // 将在解析时设置
        getMacAddress: this.getMacAddress,
        options: context.options || {}
      });
    }

    /**
     * 解析场景数据并生成所有指令
     * @param {Object} sceneData - 场景数据（来自ERP）
     * @param {string} sceneData.scene_template - 场景模板名称
     * @param {string} sceneData.action - Action数据（JSON字符串）
     * @param {string} sceneData.trigger - Trigger数据（JSON字符串）
     * @param {string} sceneData.ui_configuration - UI配置（JSON字符串）
     * @param {Array} sceneData.scene_device_location - 场景设备位置
     * @param {Array} sceneData.scene_virtual_button - 虚拟按钮配置
     * @returns {Object} - 生成的所有指令
     */
    parseSceneData(sceneData) {
      try {
        // 设置 templateName 用于指令生成
        if (this.actionGenerator && sceneData.scene_template) {
          this.actionGenerator.context.templateName = sceneData.scene_template;
          this.actionGenerator.templateName = sceneData.scene_template; // 确保内部引用的 templateName 有值
        }
        
        // 1. 解析JSON字段
        const parsedData = this._parseJsonFields(sceneData);
        
        // 2. 解析RCU设备指令（from action字段）
        const rcuDevices = this._parseRcuDevices(parsedData.action, sceneData);
        
        // 3. 解析外部设备指令（from trigger字段）- 重新生成指令
        // 注意：RCU Scene New Toggle 不需要重新生成外部设备的 action 指令
        const externalDevices = this._parseExternalDevices(parsedData.trigger, sceneData, parsedData.action);
        
        return {
          success: true,
          sceneTemplate: sceneData.scene_template,
          sceneTitle: sceneData.title || '',
          
          // RCU设备的所有指令
          rcuDevices: rcuDevices,
          
          // 外部设备的所有指令（已重新生成）
          externalDevices: externalDevices,
          
          // 元数据
          metadata: {
            sceneTemplate: sceneData.scene_template,
            sceneTitle: sceneData.title || '',
            rcuDeviceCount: Object.keys(rcuDevices).length,
            externalDeviceCount: externalDevices.length,
            uiConfiguration: parsedData.uiConfiguration
          }
        };
        
      } catch (error) {
        console.error('[SceneDataParser] Parse failed:', error);
        return {
          success: false,
          error: error.message,
          rcuDevices: {},
          externalDevices: [],
          metadata: {}
        };
      }
    }

    /**
     * 解析JSON字段
     */
    _parseJsonFields(sceneData) {
      const result = {
        action: null,
        trigger: null,
        condition: null,
        uiConfiguration: null
      };
      
      // 解析 action
      try {
        result.action = typeof sceneData.action === 'string' 
          ? JSON.parse(sceneData.action) 
          : sceneData.action;
      } catch (e) {
        console.warn('[SceneDataParser] Failed to parse action:', e);
        result.action = {};
      }
      
      // 解析 trigger
      try {
        result.trigger = typeof sceneData.trigger === 'string'
          ? JSON.parse(sceneData.trigger)
          : (sceneData.trigger || []);
      } catch (e) {
        console.warn('[SceneDataParser] Failed to parse trigger:', e);
        result.trigger = [];
      }
      
      // 解析 ui_configuration
      try {
        result.uiConfiguration = typeof sceneData.ui_configuration === 'string'
          ? JSON.parse(sceneData.ui_configuration)
          : (sceneData.ui_configuration || {});
      } catch (e) {
        console.warn('[SceneDataParser] Failed to parse ui_configuration:', e);
        result.uiConfiguration = {};
      }
      
      // 解析 condition
      try {
        result.condition = typeof sceneData.condition === 'string'
          ? JSON.parse(sceneData.condition)
          : (sceneData.condition || {});
      } catch (e) {
        result.condition = {};
      }
      
      return result;
    }

    /**
     * 根据 UI 数据重新生成 RCU 设备指令（from action字段）
     * @returns {Object} - { 'rcu-guid': { actions: [], triggers: {}, settings: {} } }
     */
    _parseRcuDevices(actionData, sceneData) {
      const rcuDevices = {};
      
      if (!actionData || typeof actionData !== 'object') {
        return rcuDevices;
      }
      
      // 提取 actionList 用于重新生成指令
      const actionList = actionData.actionList || [];
      const actionList_2 = actionData.actionList_2 || [];
      
        // 遍历action数据中的每个设备
      for (let deviceGuid in actionData) {
          // 跳过明显的非设备字段
          if (
            deviceGuid === 'actionList' ||
            deviceGuid === 'actionList_2' ||
            deviceGuid === 'actionMap'
          ) {
            continue;
          }
          
        // 设备数据可能是对象，也可能是字符串（需解析）
        let deviceData = actionData[deviceGuid];
        if (typeof deviceData === 'string') {
          // 如果是纯十六进制指令字符串，视为已有指令，包装成对象以走 legacy
          if (/^[0-9a-fA-F]+$/.test(deviceData)) {
            deviceData = { actionCommand: deviceData };
          } else {
            try {
              deviceData = JSON.parse(deviceData);
            } catch (e) {
              console.warn('[SceneDataParser] Failed to parse deviceData string for', deviceGuid, e);
              continue;
            }
          }
        }
          
          // 如果既没有 guid 字段且 key 看起来也不像设备 guid，则跳过
          if (
            !deviceData ||
            typeof deviceData !== 'object' ||
            (!deviceData.guid && !this._looksLikeGuid(deviceGuid))
          ) {
            continue;
          }
        
        // 初始化设备数据结构
        rcuDevices[deviceGuid] = {
          actions: [],
          triggers: {},
          settings: {}
        };
        
        // 1. 根据 UI 数据（actionList）重新生成 action 指令
        this._parseDeviceActions(rcuDevices[deviceGuid], deviceData, sceneData, {
          actionList: actionList,
          actionList_2: actionList_2,
          deviceGuid: deviceGuid
        });
        
        // 2. 解析trigger指令
        this._parseDeviceTriggers(rcuDevices[deviceGuid], deviceData);
        
        // 3. 解析settings指令
        this._parseDeviceSettings(rcuDevices[deviceGuid], deviceData);
      }
      
      return rcuDevices;
    }
    
    /**
     * 根据 UI 数据（actionList）重新生成设备的 action 指令（支持双路）
     */
    _parseDeviceActions(deviceResult, deviceData, sceneData, options = {}) {
      const { actionList = [], actionList_2 = [], deviceGuid } = options;
      
      console.log(`[SceneDataParser] Processing device actions for ${deviceGuid}`);
      console.log(`[SceneDataParser] Total actionList items: ${actionList.length}, actionList_2 items: ${actionList_2.length}`);
      console.log(`[SceneDataParser] Scene template: ${sceneData.scene_template}`);
      
      try {
        // 🔧 特殊处理：RCU Scene New Toggle
        if (sceneData.scene_template === 'RCU Scene New Toggle') {
          console.log('[SceneDataParser] ⚡ Using special handler for RCU Scene New Toggle');
          this._parseDeviceActionsForToggle(deviceResult, deviceData, sceneData, actionList, deviceGuid);
          return;
        }
        
        // 通用处理逻辑
        // 预取 scene_device_location 的备选 sceneId（排序后：最小的用于主路，第二个用于副路）
        const fallbackSceneIds = this._getSceneIdsFromDeviceLocation(deviceGuid, sceneData);
        const fallbackMode = (!deviceData.scene_id && !deviceData.sceneId && fallbackSceneIds.length > 0);
        if (fallbackMode) {
          console.log(`[SceneDataParser] Fallback sceneId from scene_device_location: ${fallbackSceneIds.join(', ')}`);
        }
        
        // 处理第一路（主路）
        let primaryResult = { success: true };
        if (actionList.length > 0) {
          console.log(`[SceneDataParser] Found ${actionList.length} actions in actionList, regenerating primary path`);
          primaryResult = this._parseDeviceActionPath(
            deviceResult,
            deviceData,
            '',
            'primary',
            actionList,
            sceneData,
            { fallbackSceneIds, fallbackMode }
          );
        } else {
          // 降级：如果没有 actionList，使用已有的指令
          console.log('[SceneDataParser] No actionList found, falling back to legacy mode for primary path');
          this._parseDeviceActionPathLegacy(deviceResult, deviceData, '', 'primary');
        }
        
        // 处理第二路
        let secondaryResult = { success: true };
        if (actionList_2.length > 0) {
          console.log(`[SceneDataParser] Found ${actionList_2.length} actions in actionList_2, regenerating secondary path`);
          secondaryResult = this._parseDeviceActionPath(
            deviceResult,
            deviceData,
            '_2',
            'secondary',
            actionList_2,
            sceneData,
            { fallbackSceneIds, fallbackMode, pathIndex: 1 }
          );
        } else {
          // 降级：如果没有 actionList_2，使用已有的指令
          console.log('[SceneDataParser] No actionList_2 found, falling back to legacy mode for secondary path');
          this._parseDeviceActionPathLegacy(deviceResult, deviceData, '_2', 'secondary');
        }
        
        // 如果使用了 fallback 场景ID，并且任一路需要拆分（或失败），则全部改用 legacy
        if (fallbackMode && (!primaryResult.success || !secondaryResult.success)) {
          console.warn('[SceneDataParser] Fallback sceneId used but split required or generation failed, reverting to legacy for both paths');
          deviceResult.actions = [];
          this._parseDeviceActionPathLegacy(deviceResult, deviceData, '', 'primary');
          this._parseDeviceActionPathLegacy(deviceResult, deviceData, '_2', 'secondary');
        }
        
      } catch (error) {
        console.error('[SceneDataParser] Failed to generate RCU actions:', error);
        // 完全降级：使用已有的指令
        this._parseDeviceActionPathLegacy(deviceResult, deviceData, '', 'primary');
        this._parseDeviceActionPathLegacy(deviceResult, deviceData, '_2', 'secondary');
      }
    }
    
    /**
     * 专门处理 RCU Scene New Toggle 的指令生成
     * 完整实现 saveActionForNewToggle 的业务逻辑
     */
    _parseDeviceActionsForToggle(deviceResult, deviceData, sceneData, actionList, deviceGuid) {
      console.log('[SceneDataParser] ==================== Toggle Scene Handler ====================');
      
      try {
        // 1. 获取 Virtual ID
        const virtualId = this._getVirtualIdForToggle(deviceData, sceneData, deviceGuid);
        if (!virtualId) {
          console.error('[SceneDataParser] ❌ No virtual ID found for toggle scene');
          throw new Error('No virtual ID for toggle scene');
        }
        console.log(`[SceneDataParser] Virtual ID: ${virtualId}`);
        
        // 2. 生成 Toggle 相关指令
        const toggleCommands = this._generateToggleCommands(actionList, virtualId, deviceGuid, sceneData);
        console.log('[SceneDataParser] Toggle commands generated:', {
          settingItem: toggleCommands.toggle_setting_item.substring(0, 50),
          defaultOn: toggleCommands.toggle_default_on_item.substring(0, 50),
          defaultOff: toggleCommands.toggle_default_off_item.substring(0, 50)
        });
        
        // 3. 获取 Scene ID
        const sceneId = this._getSceneIdForToggle(deviceData, deviceGuid, sceneData);
        if (!sceneId) {
          console.error('[SceneDataParser] ❌ No scene ID found for toggle scene');
          throw new Error('No scene ID for toggle scene');
        }
        console.log(`[SceneDataParser] Scene ID: ${sceneId}`);
        
        // 4. 生成 Action 指令
        const actionCommand = this._generateToggleActionCommand(
          sceneId, 
          virtualId, 
          deviceGuid, 
          sceneData, 
          actionList
        );
        console.log(`[SceneDataParser] Action command: ${actionCommand.substring(0, 80)}...`);
        
        // 5. 生成 Setting 指令 (972003 系列)
        const settingCommand = `972003${this._padHex(virtualId, 2)}02${toggleCommands.toggle_setting_item}`;
        const defaultOnCommand = `972003${this._padHex(virtualId, 2)}01${toggleCommands.toggle_default_on_item}`;
        const defaultOffCommand = `972003${this._padHex(virtualId, 2)}00${toggleCommands.toggle_default_off_item}`;
        const pannelCommand = toggleCommands.pannel_setting_item ? 
          `972003${this._padHex(virtualId, 2)}02${toggleCommands.pannel_setting_item}` : '';
        
        // 5. 存储到 deviceResult
        deviceResult.actions.push({
          sceneId: sceneId,
          command: actionCommand.toLowerCase(),
          isMain: true,
          isSplit: false,
          sizeBytes: actionCommand.length / 2,
          pathType: 'toggle',
          _regenerated: true
        });
        
        deviceResult.settings = {
          settingCommand: settingCommand.toLowerCase(),
          defaultOnCommand: defaultOnCommand.toLowerCase(),
          defaultOffCommand: defaultOffCommand.toLowerCase(),
          pannelCommand: pannelCommand ? pannelCommand.toLowerCase() : '',
          virtualId: virtualId
        };
        
        console.log('[SceneDataParser] ✅ Toggle scene commands generated successfully');
        
      } catch (error) {
        console.error('[SceneDataParser] ❌ Failed to generate toggle commands:', error);
        // 降级：使用已保存的指令
        this._parseDeviceActionPathLegacy(deviceResult, deviceData, '', 'toggle');
      }
    }
    
    /**
     * 获取 Toggle 场景的 Scene ID
     * 完全按照原始逻辑：getThisSceneId → getDeviceBleId
     */
    _getSceneIdForToggle(deviceData, deviceGuid, sceneData) {
      console.log('[SceneDataParser] Getting Scene ID for toggle device:', deviceGuid);
      
      // 1. 优先从当前场景的 scene_device_location 获取（编辑模式）
      try {
        if (sceneData.scene_device_location && Array.isArray(sceneData.scene_device_location)) {
          const locationItem = sceneData.scene_device_location.find(item => item.device === deviceGuid);
          if (locationItem && locationItem.storage_id) {
            const sceneId = parseInt(locationItem.storage_id);
            if (!isNaN(sceneId)) {
              console.log(`[SceneDataParser] ✅ Found existing scene ID from scene_device_location: ${sceneId}`);
              return sceneId;
            }
          }
        }
      } catch (e) {
        console.warn('[SceneDataParser] Error reading scene_device_location:', e);
      }
      
      // 2. 从 deviceData 读取（如果有）
      if (deviceData.scene_id) {
        const sceneId = parseInt(deviceData.scene_id);
        if (!isNaN(sceneId)) {
          console.log(`[SceneDataParser] ✅ Found scene ID from deviceData.scene_id: ${sceneId}`);
          return sceneId;
        }
      }
      
      if (deviceData.sceneId) {
        const sceneId = parseInt(deviceData.sceneId);
        if (!isNaN(sceneId)) {
          console.log(`[SceneDataParser] ✅ Found scene ID from deviceData.sceneId: ${sceneId}`);
          return sceneId;
        }
      }
      
      // 3. 如果都没有，分配新的 Scene ID（调用 getDeviceBleId 逻辑）
      const newSceneId = this._getDeviceBleId(deviceGuid);
      console.log(`[SceneDataParser] ✅ Allocated new scene ID: ${newSceneId}`);
      return newSceneId;
    }
    
    /**
     * 获取设备的 BLE Scene ID（未使用的第一个 ID）
     * 等同于原始的 getDeviceBleId(guid)
     */
    _getDeviceBleId(deviceGuid) {
      const usedIds = [];
      
      try {
        // 遍历所有场景的 scene_device_location
        if (this.erpInfo && this.erpInfo.scene) {
          for (let sceneName in this.erpInfo.scene) {
            const scene = this.erpInfo.scene[sceneName];
            if (scene.scene_device_location && Array.isArray(scene.scene_device_location)) {
              scene.scene_device_location.forEach(item => {
                if (item.device === deviceGuid && item.storage_id) {
                  const id = parseInt(item.storage_id);
                  if (!isNaN(id) && id > 0) {
                    usedIds.push(id);
                  }
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn('[SceneDataParser] Error collecting device BLE IDs:', e);
      }
      
      console.log(`[SceneDataParser] Used scene IDs for ${deviceGuid}:`, usedIds);
      return this._findMissingNumber(usedIds);
    }
    
    /**
     * 获取 Toggle 场景的 Virtual ID
     * 完全按照原始业务逻辑：checkIsAnyRcu → getSameVirtualId / getVirtualButtonId
     */
    _getVirtualIdForToggle(deviceData, sceneData, deviceGuidFromCaller) {
      // 兼容：优先使用调用方传入的 guid，其次 deviceData.guid
      const deviceGuid = deviceGuidFromCaller || deviceData.guid || '';
      const targetGuid = deviceGuid.toLowerCase();
      
      console.log('[SceneDataParser] Getting Virtual ID for device:', deviceGuid || 'undefined');
      
      // 1. 优先检查是否已经有 virtual ID（编辑模式）
      try {
        const virtualButtons = typeof sceneData.scene_virtual_button === 'string'
          ? JSON.parse(sceneData.scene_virtual_button)
          : sceneData.scene_virtual_button;
        
        if (virtualButtons && Array.isArray(virtualButtons) && virtualButtons.length > 0) {
          // 允许大小写不一致，且兼容字段名：virtual_button_id / virtualId / config
          for (const btn of virtualButtons) {
            const btnGuid = (btn.device || btn.guid || '').toLowerCase();
            const vidRaw = btn.virtual_button_id ?? btn.virtualId ?? btn.config;
            const vid = parseInt(vidRaw);
            console.log('[SceneDataParser] Checking virtual button:', { btnGuid, vidRaw });
            if (btnGuid && targetGuid && btnGuid === targetGuid && !isNaN(vid)) {
              console.log(`[SceneDataParser] ✅ Found existing virtual ID: ${vid} (guid match: ${btnGuid})`);
              return vid;
            }
          }
        }
      } catch (e) {
        console.warn('[SceneDataParser] Failed to parse scene_virtual_button:', e);
      }
      
      // 2. 检查是否有多个 RCU（Multiple RCU 场景）
      const hasMultipleRcu = this._checkIsAnyRcu(sceneData);
      console.log(`[SceneDataParser] Has multiple RCU: ${hasMultipleRcu}`);
      
      // 3. 根据 RCU 数量决定使用哪种方式获取 Virtual ID
      if (hasMultipleRcu) {
        // 有多个 RCU → 使用 getSameVirtualId（找到共同未使用的 ID）
        const virtualId = this._getSameVirtualId(sceneData);
        console.log(`[SceneDataParser] ✅ Generated same virtual ID for multiple RCU: ${virtualId}`);
        return virtualId;
      } else {
        // 只有一个 RCU → 使用 getVirtualButtonId（找到该设备未使用的 ID）
        const virtualId = this._getVirtualButtonId(deviceGuid);
        console.log(`[SceneDataParser] ✅ Generated virtual ID for single RCU: ${virtualId}`);
        return virtualId;
      }
    }
    
    /**
     * 检查是否有多个 RCU 设备（YO780）
     */
    _checkIsAnyRcu(sceneData) {
      try {
        const actionData = typeof sceneData.action === 'string' 
          ? JSON.parse(sceneData.action) 
          : sceneData.action;
        
        if (!actionData) return false;
        
        let rcuCount = 0;
        for (let guid in actionData) {
          if (guid === 'actionList' || guid === 'actionList_2') continue;
          
          // 检查设备是否为 RCU (YO780)
          if (this.erpInfo && this.erpInfo.device && this.erpInfo.device[guid]) {
            const device = this.erpInfo.device[guid];
            if (device.device_model === 'YO780') {
              rcuCount++;
            }
          }
        }
        
        return rcuCount >= 2;
      } catch (e) {
        console.warn('[SceneDataParser] Error checking RCU count:', e);
        return false;
      }
    }
    
    /**
     * 获取单个 RCU 的 Virtual Button ID
     * 找到该设备在所有场景中未使用的第一个 ID
     */
    _getVirtualButtonId(deviceGuid) {
      if (!deviceGuid) {
        console.warn('[SceneDataParser] No deviceGuid provided when allocating virtual button ID');
        return null;
      }
      
      const usedIds = [];
      
      try {
        // 遍历所有场景的 scene_virtual_button
        if (this.erpInfo && this.erpInfo.scene) {
          for (let sceneName in this.erpInfo.scene) {
            const scene = this.erpInfo.scene[sceneName];
            if (scene.scene_virtual_button) {
              const virtualButtons = typeof scene.scene_virtual_button === 'string'
                ? JSON.parse(scene.scene_virtual_button)
                : scene.scene_virtual_button;
              
              if (Array.isArray(virtualButtons)) {
                virtualButtons.forEach(button => {
                  if (button.device === deviceGuid && button.virtual_button_id) {
                    usedIds.push(parseInt(button.virtual_button_id));
                  }
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('[SceneDataParser] Error collecting virtual button IDs:', e);
      }
      
      console.log(`[SceneDataParser] Used virtual IDs for ${deviceGuid}:`, usedIds);
      return this._findMissingNumber(usedIds);
    }
    
    /**
     * 获取多个 RCU 共同的 Virtual Button ID
     * 找到所有 RCU 都未使用的第一个 ID (1-32)
     */
    _getSameVirtualId(sceneData) {
      try {
        const actionData = typeof sceneData.action === 'string' 
          ? JSON.parse(sceneData.action) 
          : sceneData.action;
        
        // 收集所有 RCU 的 guid
        const rcuGuids = [];
        for (let guid in actionData) {
          if (guid === 'actionList' || guid === 'actionList_2') continue;
          
          if (this.erpInfo && this.erpInfo.device && this.erpInfo.device[guid]) {
            const device = this.erpInfo.device[guid];
            if (device.device_model === 'YO780') {
              rcuGuids.push(guid);
            }
          }
        }
        
        if (rcuGuids.length < 2) {
          console.warn('[SceneDataParser] Not enough RCU devices for getSameVirtualId');
          return this._getVirtualButtonId(rcuGuids[0] || '');
        }
        
        console.log(`[SceneDataParser] Found ${rcuGuids.length} RCU devices:`, rcuGuids);
        
        // 收集所有 RCU 已使用的 virtual button ID
        const allUsedIds = new Set();
        
        if (this.erpInfo && this.erpInfo.scene) {
          for (let sceneName in this.erpInfo.scene) {
            const scene = this.erpInfo.scene[sceneName];
            if (scene.scene_virtual_button) {
              const virtualButtons = typeof scene.scene_virtual_button === 'string'
                ? JSON.parse(scene.scene_virtual_button)
                : scene.scene_virtual_button;
              
              if (Array.isArray(virtualButtons)) {
                virtualButtons.forEach(button => {
                  if (rcuGuids.includes(button.device) && button.virtual_button_id) {
                    allUsedIds.add(parseInt(button.virtual_button_id));
                  }
                });
              }
            }
          }
        }
        
        console.log(`[SceneDataParser] All used virtual IDs by RCU devices:`, Array.from(allUsedIds));
        
        // 找到第一个未使用的 ID (1-32)
        for (let id = 1; id <= 32; id++) {
          if (!allUsedIds.has(id)) {
            return id;
          }
        }
        
        // 如果 1-32 都用完了，返回 33
        return 33;
        
      } catch (e) {
        console.error('[SceneDataParser] Error in getSameVirtualId:', e);
        return 1;
      }
    }
    
    /**
     * 找到数组中第一个缺失的数字
     */
    _findMissingNumber(arr) {
      if (!arr || arr.length === 0) {
        return 1;
      }
      
      // 排序
      arr.sort((a, b) => a - b);
      
      // 找到第一个间隙
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i + 1] - arr[i] > 1) {
          return arr[i] + 1;
        }
      }
      
      // 没有间隙，返回 max + 1
      return arr[arr.length - 1] + 1;
    }

    /**
     * 判断 guid 对应的设备是否为 RCU
     * 基于 erpInfo.device 的 device_model 或设备 mode 关键词
     */
    _isRcuDevice(guid, sceneData) {
      try {
        if (this.erpInfo && this.erpInfo.device && this.erpInfo.device[guid]) {
          const model = this.erpInfo.device[guid].device_model;
          if (model === 'YO780') return true;
        }
        // 兜底：从 sceneData.action 中的 device_mode 判断
        const actionData = typeof sceneData.action === 'string'
          ? JSON.parse(sceneData.action)
          : sceneData.action;
        if (actionData && actionData[guid] && actionData[guid].device_mode) {
          const mode = actionData[guid].device_mode;
          return mode === 'RCU Controller' || mode === 'RCU Scene Button';
        }
      } catch (e) {
        console.warn('[SceneDataParser] _isRcuDevice error:', e);
      }
      return false;
    }

    /**
     * 从 scene_device_location 中获取某设备的候选 sceneId，排序后返回
     * 最小的用于主路，第二个用于副路
     */
    _getSceneIdsFromDeviceLocation(deviceGuid, sceneData) {
      if (!deviceGuid) return [];
      try {
        const locs = sceneData.scene_device_location;
        if (!Array.isArray(locs)) return [];
        const ids = locs
          .filter(item => item.device === deviceGuid && item.storage_id)
          .map(item => parseInt(item.storage_id))
          .filter(id => !isNaN(id));
        return [...new Set(ids)].sort((a, b) => a - b);
      } catch (e) {
        console.warn('[SceneDataParser] Failed to read scene_device_location:', e);
        return [];
      }
    }

    /**
     * 粗略判断字符串是否像设备 GUID（避免把 actionMap 等字段当成设备）
     */
    _looksLikeGuid(value) {
      if (!value || typeof value !== 'string') return false;
      // 设备 GUID 通常是较长的十六进制字符串，这里用简单规则过滤
      return /^[0-9a-fA-F]{8,}$/.test(value);
    }
    
    /**
     * 生成 Toggle 场景的所有控制指令
     */
    _generateToggleCommands(actionList, virtualId, deviceGuid, sceneData) {
      let toggle_setting_item = '';
      let toggle_default_on_item = '';
      let toggle_default_off_item = '';
      let pannel_setting_item = '';
      const settingVirtualList = [];
      
      // 遍历 actionList，生成不同设备类型的指令
      actionList.forEach(action => {
        const button_group = action.device_button_group || action.button_group;
        
        // RCU ONOFF GANG
        if (button_group && button_group.startsWith('RCU ONOFF GANG')) {
          const slot = this._getSlotFromConfig(action.config);
          let gang = parseInt(button_group.replace('RCU ONOFF GANG', ''));
          let target_gang = gang % 4;
          if (target_gang === 0) target_gang = 4;
          
          toggle_setting_item += `04971f${slot}${this._padHex(target_gang, 2)}`;
          
          const on_command = this._getRcuOnOffCommand(slot, target_gang, 1);
          const off_command = this._getRcuOnOffCommand(slot, target_gang, 0);
          toggle_default_on_item += on_command;
          toggle_default_off_item += off_command;
        }
        
        // RCU DIMMING
        else if (button_group && button_group.startsWith('RCU DIMMING')) {
          const slot = this._getSlotFromConfig(action.config);
          let gang = parseInt(button_group.replace('RCU DIMMING', ''));
          let target_gang = gang % 2;
          if (target_gang === 0) target_gang = 2;
          
          toggle_setting_item += `04971f${slot}${this._padHex(target_gang, 2)}`;
          toggle_default_on_item += `06971f${slot}892${target_gang == 1 ? 0 : 1}ff`;
          toggle_default_off_item += `06971f${slot}892${target_gang == 1 ? 0 : 1}00`;
        }
        
        // RCU OUTPUT
        else if (button_group && button_group.startsWith('RCU OUTPUT')) {
          const target_gang = parseInt(button_group.replace('RCU OUTPUT', ''));
          toggle_setting_item += `04972101${this._padHex(target_gang, 2)}`;
          toggle_default_on_item += `05972101${this._padHex(target_gang, 2)}01`;
          toggle_default_off_item += `05972101${this._padHex(target_gang, 2)}00`;
        }
        
        // 虚拟按钮（ONOFF GANG1）
        else if (button_group && button_group.startsWith('ONOFF GANG1') && action.virtualId) {
          settingVirtualList.push({
            virtualId: action.virtualId,
            ref: action.ref || 0
          });
          
          if (action.ref == 1) {
            toggle_setting_item += `04972103${this._padHex(action.virtualId, 2)}`;
          }
          pannel_setting_item += `04972103${this._padHex(action.virtualId, 2)}`;
        }
      });
      
      // 虚拟按钮的额外处理
      if (settingVirtualList.length > 0) {
        const firstOne = settingVirtualList[0].virtualId;
        toggle_default_on_item += `05972103${this._padHex(firstOne, 2)}01`;
        
        // Master 场景特殊处理
        const isMasterScene = sceneData.title && sceneData.title.toLowerCase().includes('master');
        if (isMasterScene) {
          toggle_default_on_item = '';
        }
        
        settingVirtualList.forEach(item => {
          toggle_default_off_item += `05972103${this._padHex(item.virtualId, 2)}00`;
          if (item.ref == 1) {
            toggle_default_on_item += `05972103${this._padHex(item.virtualId, 2)}01`;
          }
        });
        
        if (isMasterScene && toggle_default_on_item) {
          // Master 场景的特殊组合
          toggle_default_on_item = settingVirtualList
            .map(item => `05972103${this._padHex(item.virtualId, 2)}01`)
            .join('');
        }
      }
      
      return {
        toggle_setting_item,
        toggle_default_on_item,
        toggle_default_off_item,
        pannel_setting_item,
        settingVirtualList
      };
    }
    
    /**
     * 生成 Toggle 场景的 Action 指令
     */
    _generateToggleActionCommand(sceneId, virtualId, deviceGuid, sceneData, actionList) {
      const mac = this.getMacAddress(deviceGuid, true);
      
      // 基础 action 指令：触发虚拟按钮，状态 02 表示 toggle
      let actionCommandItem = `0e02${mac}1305972103${this._padHex(virtualId, 2)}02`;
      
      // 检查是否需要触发其他 RCU（Multiple RCU 场景）
      const otherRcuGuid = this._findOtherRcuGuid(deviceGuid, sceneData);
      if (otherRcuGuid) {
        console.log(`[SceneDataParser] Found other RCU: ${otherRcuGuid}, adding trigger command`);
        const otherRcuMac = this.getMacAddress(otherRcuGuid, true);
        actionCommandItem += `0e02${otherRcuMac}1305972103${this._padHex(virtualId, 2)}02`;
      }
      
      // 构建完整的 action 指令
      return `8f1000${this._padHex(sceneId, 2)}${actionCommandItem}`;
    }
    
    /**
     * 查找其他 RCU 设备（用于 Multiple RCU 场景）
     */
    _findOtherRcuGuid(currentGuid, sceneData) {
      try {
        const actionData = typeof sceneData.action === 'string' 
          ? JSON.parse(sceneData.action) 
          : sceneData.action;
        
        if (!actionData) return null;
        
        // 查找其他 RCU 设备
        for (let guid in actionData) {
          if (guid === 'actionList' || guid === 'actionList_2' || guid === currentGuid) {
            continue;
          }
          
          const deviceData = actionData[guid];
          // 简单判断：有 scene_id 的通常是 RCU 设备
          if (deviceData && (deviceData.scene_id || deviceData.sceneId)) {
            return guid;
          }
        }
      } catch (e) {
        console.warn('[SceneDataParser] Failed to find other RCU:', e);
      }
      
      return null;
    }
    
    /**
     * 从 config 提取 slot
     */
    _getSlotFromConfig(config) {
      if (!config) return '00';
      // config 格式可能是 "01", "1", 或者其他格式
      const slot = parseInt(config);
      return isNaN(slot) ? '00' : this._padHex(slot, 2);
    }
    
    /**
     * 生成 RCU ONOFF 指令
     */
    _getRcuOnOffCommand(slot, gang, onoff) {
      const onoff_data = onoff === 1 ? '11' : '22';
      return `07971f${slot}8000${onoff_data}000807971f${slot}8000${onoff_data}00`;
    }
    
    /**
     * 根据 UI 数据（actionList）重新生成单路 action 指令
     * @param {Object} deviceResult - 设备结果对象
     * @param {Object} deviceData - 设备数据
     * @param {string} suffix - 字段后缀（''或'_2'）
     * @param {string} pathType - 路径类型（'primary'或'secondary'）
     * @param {Array} deviceActions - 该设备的动作列表（从 actionList 筛选）
     * @param {Object} sceneData - 场景数据
     */
    _parseDeviceActionPath(deviceResult, deviceData, suffix, pathType, deviceActions, sceneData, extraOptions = {}) {
      const sceneIdField = `scene_id${suffix}`;
      const splitScenesField = `splitScenes${suffix}`;
      const { fallbackSceneIds = [], fallbackMode = false, pathIndex = 0 } = extraOptions;
      
      let mainSceneId = deviceData[sceneIdField] || (suffix === '' ? deviceData.sceneId : null);
      let fallbackUsed = false;
      
      // 如果没有 sceneId，尝试从 scene_device_location 的备选列表中取
      if (!mainSceneId && fallbackMode && fallbackSceneIds.length > pathIndex) {
        mainSceneId = fallbackSceneIds[pathIndex];
        fallbackUsed = true;
        console.log(`[SceneDataParser] Using fallback sceneId from scene_device_location: ${mainSceneId} (path: ${pathType})`);
      }
      let existingSplitIds = deviceData[splitScenesField] || [];
      
      if (!mainSceneId || deviceActions.length === 0) {
        return { success: false, reason: 'no_scene_id_or_actions' };
      }
      
      // 🔧 修复：从 existingSplitIds 中移除主场景 ID
      // splitScenes 数组通常包含 [主场景ID, 拆分ID1, 拆分ID2, ...]
      // 但 SceneIdManager 只需要拆分ID（第2、3、4...个场景的ID）
      const mainSceneIdNum = parseInt(mainSceneId);
      existingSplitIds = existingSplitIds
        .filter(id => parseInt(id) !== mainSceneIdNum)
        .map(id => parseInt(id));
      
      try {
        console.log(`[SceneDataParser] ========================================`);
        console.log(`[SceneDataParser] Regenerating actions for scene ${mainSceneId}`);
        console.log(`[SceneDataParser] Device: ${deviceData.guid || 'unknown'}`);
        console.log(`[SceneDataParser] Path: ${pathType} (suffix: '${suffix}')`);
        console.log(`[SceneDataParser] Input actions count: ${deviceActions.length}`);
        console.log(`[SceneDataParser] Existing split IDs (excluding main): [${existingSplitIds.join(', ')}]`);
        console.log(`[SceneDataParser] ========================================`);
        
        // 1. 结构化动作列表（按设备分组）
        const structuredActions = this._structureActionListForDevice(deviceActions);
        console.log(`[SceneDataParser] Structured actions for ${Object.keys(structuredActions).length} devices`);
        console.log(`[SceneDataParser] Device GUIDs:`, Object.keys(structuredActions));
        
        // 2. 使用 ActionGenerator 生成指令
        const actionCommandHex = this._generateActionCommand(structuredActions, sceneData);
        console.log(`[SceneDataParser] Generated command hex (${actionCommandHex ? actionCommandHex.length : 0} chars):`, actionCommandHex ? actionCommandHex.substring(0, 100) : 'NULL');
        
        // 严格检查：必须是非空字符串且至少有 2 个字符（1 个字节）
        if (!actionCommandHex || typeof actionCommandHex !== 'string' || actionCommandHex.trim().length < 2) {
          console.warn('[SceneDataParser] ❌ Failed to generate action command (invalid or empty), falling back to legacy');
          return { success: false, reason: 'invalid_command' };
        }
        
        // 使用 iotScene 的配置来判断长度/拆分
        const tempSceneHandler = new iotScene();
        const headerSize = tempSceneHandler.config.sceneHeaderSize;
        const maxSize = tempSceneHandler.config.maxSceneSize;
        
        // 如果使用了 fallback 的 sceneId，且指令会导致拆分，则放弃（改走 legacy）
        const totalBytes = headerSize + (actionCommandHex.length / 2);
        if (fallbackUsed && totalBytes > maxSize) {
          console.warn('[SceneDataParser] ❌ Command too large and would split while using fallback sceneId, revert to legacy');
          return { success: false, reason: 'need_split_with_fallback' };
        }
        
        console.log(`[SceneDataParser] ✅ Successfully generated action command`);
        
        
        // 3. 使用 iotScene 进行智能拆分
        const sceneHandler = tempSceneHandler; // 复用上面的 handler，避免重复创建
        const sceneIdHex = parseInt(mainSceneId).toString(16).padStart(2, '0');
        
        // 收集已使用的 sceneId（用于拆分时避免冲突）
        const usedSceneIds = this._collectUsedSceneIds(sceneData);
        
        const scenes = sceneHandler.splitSceneCommand({
          sceneId: sceneIdHex,
          actionCommand: actionCommandHex,
          deviceGuid: deviceData.guid || Object.keys(structuredActions)[0],
          usedSceneIds: usedSceneIds,
          existingSplitIds: existingSplitIds  // 优先复用已有的拆分 ID
        });
        
        // 如果使用了 fallback 的 sceneId，但仍然需要拆分，放弃（改走 legacy）
        if (fallbackUsed && scenes.length > 1) {
          console.warn('[SceneDataParser] ❌ Split required while using fallback sceneId, revert to legacy');
          return { success: false, reason: 'need_split_with_fallback' };
        }
        
        // 4. 将拆分后的场景添加到结果中
        scenes.forEach((scene, index) => {
          const cleanCommand = this._cleanHexCommand(scene.command);
          if (cleanCommand) {
            deviceResult.actions.push({
              sceneId: scene.sceneIdDecimal || parseInt(scene.sceneId, 16),
              command: cleanCommand,
              isMain: index === 0,
              isSplit: scenes.length > 1,
              sizeBytes: scene.sizeBytes || (cleanCommand.length / 2),
              isChained: scene.isChained || false,
              nextSceneId: scene.nextSceneId || null,
              pathType: pathType,
              _regenerated: true  // 标记为重新生成
            });
          }
        });
        
        console.log(`[SceneDataParser] Generated ${scenes.length} scene(s) for ${pathType} path`);
        return { success: true, fallbackUsed, split: scenes.length > 1 };
        
      } catch (error) {
        console.error('[SceneDataParser] Failed to regenerate action path:', error);
        console.warn('[SceneDataParser] Falling back to legacy method');
        return { success: false, reason: 'exception', error };
      }
    }
    
    /**
     * 结构化动作列表（为单个设备准备）
     */
    _structureActionListForDevice(deviceActions) {
      const structured = {};
      
      deviceActions.forEach(action => {
        const deviceGuid = action.device || action.guid;
        
        if (!deviceGuid) {
          return;
        }
        
        if (!structured[deviceGuid]) {
          structured[deviceGuid] = {
            device_mode: action.device_mode,
            list: []
          };
        }
        
        structured[deviceGuid].list.push(action);
      });
      
      return structured;
    }
    
    /**
     * 使用 ActionGenerator 生成指令
     */
    _generateActionCommand(structuredActions, sceneData) {
      try {
        // 检查输入
        if (!structuredActions || Object.keys(structuredActions).length === 0) {
          console.warn('[SceneDataParser] No structured actions provided');
          return null;
        }
        
        // 设置 ActionGenerator 的模板名称
        if (sceneData.scene_template) {
          this.actionGenerator.context.templateName = sceneData.scene_template;
        }
        
        // 生成指令
        const commandResult = this.actionGenerator.generateActionCommands(structuredActions, {
          mainRcuGuid: null,  // RCU 场景中会有
          isWelcome: sceneData.scene_template === 'Welcome Scene',
          radarStatus: {
            exit: false,
            enter: false
          },
          // 改为真实的 RCU 检测：根据 guid 和 erp 设备信息判断
          checkIsRcu: (guid) => this._isRcuDevice(guid, sceneData),
          deviceStatusList: [],
          mutiwayStatus: 1
        });
        
        // commandResult 是一个对象 { 'device-guid': result }
        // 取第一个设备的指令
        const firstDeviceGuid = Object.keys(commandResult)[0];
        if (firstDeviceGuid && commandResult[firstDeviceGuid]) {
          let command = commandResult[firstDeviceGuid];
          
          // 检查是否为对象格式（包含 actionCommand 字段）
          if (typeof command === 'object' && command.actionCommand) {
            console.log('[SceneDataParser] Extracting actionCommand from result object');
            command = command.actionCommand;
          }
          
          // 验证是否为有效的十六进制字符串
          if (typeof command === 'string' && command.trim().length >= 2 && /^[0-9a-fA-F]+$/.test(command.trim())) {
            console.log(`[SceneDataParser] ✅ Valid hex command extracted: ${command.trim().substring(0, 100)}...`);
            return command.trim();
          } else {
            console.warn('[SceneDataParser] Generated command is not valid hex:', command);
            return null;
          }
        }
        
        console.warn('[SceneDataParser] No valid command generated from ActionGenerator');
        return null;
        
      } catch (error) {
        console.error('[SceneDataParser] Action generation failed:', error);
        return null;
      }
    }
    
    /**
     * 收集已使用的场景 ID
     */
    _collectUsedSceneIds(sceneData) {
      const usedIds = [];
      
      // 从 scene_device_location 收集
      if (sceneData.scene_device_location && Array.isArray(sceneData.scene_device_location)) {
        sceneData.scene_device_location.forEach(loc => {
          const id = parseInt(loc.storage_id);
          if (!isNaN(id) && id > 0) {
            usedIds.push(id);
          }
        });
      }
      
      // 从 ERP 信息收集（如果有）
      if (this.erpInfo && this.erpInfo.scene) {
        for (let key in this.erpInfo.scene) {
          const scene = this.erpInfo.scene[key];
          if (scene.scene_device_location && Array.isArray(scene.scene_device_location)) {
            scene.scene_device_location.forEach(loc => {
              const id = parseInt(loc.storage_id);
              if (!isNaN(id) && id > 0) {
                usedIds.push(id);
              }
            });
          }
        }
      }
      
      // 去重并排序
      return [...new Set(usedIds)].sort((a, b) => a - b);
    }
    
    /**
     * 解析单路action指令（降级方法 - 使用已有指令）
     * @param {Object} deviceResult - 设备结果对象
     * @param {Object} deviceData - 设备数据
     * @param {string} suffix - 字段后缀（''或'_2'）
     * @param {string} pathType - 路径类型（'primary'或'secondary'）
     */
    _parseDeviceActionPathLegacy(deviceResult, deviceData, suffix, pathType) {
      const sceneIdField = `scene_id${suffix}`;
      const commandField = `actionCommand${suffix}`;
      const splitScenesField = `splitScenes${suffix}`;
      const splitScenesDetailField = `splitScenesDetail${suffix}`;
      
      const mainSceneId = deviceData[sceneIdField] || (suffix === '' ? deviceData.sceneId : null);
      const actionCommand = deviceData[commandField];
      
      if (!actionCommand) {
        return;
      }
      
      // 检查是否有拆分场景
      const splitScenes = deviceData[splitScenesField] || [];
      const splitScenesDetail = deviceData[splitScenesDetailField] || [];
      
      if (splitScenesDetail.length > 0) {
        // 有拆分详情，使用详细信息
        splitScenesDetail.forEach((scene, index) => {
          const cleanCommand = this._cleanHexCommand(scene.command);
          if (cleanCommand) {
            deviceResult.actions.push({
              sceneId: scene.sceneIdDecimal || scene.sceneId,
              command: cleanCommand,
              isMain: index === 0,
              isSplit: splitScenesDetail.length > 1,
              sizeBytes: scene.sizeBytes || (cleanCommand.length / 2),
              isChained: scene.isChained || false,
              nextSceneId: scene.nextSceneId || null,
              pathType: pathType
            });
          }
        });
      } else if (splitScenes.length > 1) {
        // 只有splitScenes列表，没有详细信息
        const cleanCommand = this._cleanHexCommand(actionCommand);
        if (cleanCommand) {
          deviceResult.actions.push({
            sceneId: mainSceneId,
            command: cleanCommand,
            isMain: true,
            isSplit: true,
            sizeBytes: cleanCommand.length / 2,
            pathType: pathType
          });
        }
        
        // 其他拆分场景（没有完整指令，需要标记）
        splitScenes.slice(1).forEach(sceneId => {
          deviceResult.actions.push({
            sceneId: sceneId,
            command: null,
            isMain: false,
            isSplit: true,
            note: 'Split scene ID allocated but command not available',
            pathType: pathType
          });
        });
      } else {
        // 没有拆分，单个场景
        const cleanCommand = this._cleanHexCommand(actionCommand);
        if (cleanCommand) {
          deviceResult.actions.push({
            sceneId: mainSceneId,
            command: cleanCommand,
            isMain: true,
            isSplit: false,
            sizeBytes: cleanCommand.length / 2,
            pathType: pathType
          });
        }
      }
    }
    
    /**
     * 解析设备的 trigger 指令（使用已保存的指令并清理）
     */
    _parseDeviceTriggers(deviceResult, deviceData) {
      if (deviceData.trigger) {
        const cleaned = this._cleanHexCommand(deviceData.trigger);
        if (cleaned) {
          deviceResult.triggers.primary = cleaned;
        }
      }
      
      if (deviceData.trigger_2) {
        const cleaned = this._cleanHexCommand(deviceData.trigger_2);
        if (cleaned) {
          deviceResult.triggers.secondary = cleaned;
        }
      }
      
      // 如果有triggerCommand字段（RCU Master场景）
      if (deviceData.triggerCommand) {
        const cleaned = this._cleanHexCommand(deviceData.triggerCommand);
        if (cleaned) {
          deviceResult.triggers.master = cleaned;
        }
      }
    }
    
    /**
     * 解析设备的 settings 指令（使用已保存的指令并清理）
     */
    _parseDeviceSettings(deviceResult, deviceData) {
      const settingFields = [
        'settingCommand',
        'defaultOnCommand',
        'defaultOffCommand',
        'pannelCommand'
      ];
      
      settingFields.forEach(field => {
        if (deviceData[field]) {
          const cleaned = this._cleanHexCommand(deviceData[field]);
          if (cleaned) {
            deviceResult.settings[field] = cleaned;
          }
        }
      });
    }

    /**
     * 解析外部设备指令（from trigger字段）- 根据 UI 数据重新生成指令
     * @param {Array} triggerData - trigger 数据数组
     * @param {Object} sceneData - 场景数据
     * @param {Object} actionData - action 数据（包含 actionList 和 actionList_2）
     * @returns {Array} - [{ guid, actions: [], triggers: {}, settings: {} }]
     */
    _parseExternalDevices(triggerData, sceneData, actionData) {
      const externalDevices = [];
      
      if (!Array.isArray(triggerData) || triggerData.length === 0) {
        return externalDevices;
      }
      
      // 提取 actionList 用于重新生成指令
      const actionList = actionData?.actionList || [];
      const actionList_2 = actionData?.actionList_2 || [];
      
      // 遍历trigger数组中的每个设备
      triggerData.forEach(triggerItem => {
        const deviceGuid = triggerItem.guid || triggerItem.device;
        
        if (!deviceGuid) {
          return;
        }
        
        const deviceResult = {
          guid: deviceGuid,
          actions: [],
          triggers: {},
          settings: {}
        };
        
        // 1. 根据 UI 数据重新生成 action 指令
        this._parseExternalDeviceActions(deviceResult, triggerItem, sceneData, {
          actionList: actionList,
          actionList_2: actionList_2
        });
        
        // 2. 解析trigger指令
        this._parseExternalDeviceTriggers(deviceResult, triggerItem);
        
        // 3. 解析settings指令
        this._parseExternalDeviceSettings(deviceResult, triggerItem);
        
        // 4. 保存原始数据（可选）
        deviceResult.raw = {
          button_group: triggerItem.button_group || triggerItem.device_button_group,
          model: triggerItem.model,
          name: triggerItem.name,
          ref: triggerItem.ref
        };
        
        externalDevices.push(deviceResult);
      });
      
      return externalDevices;
    }
    
    /**
     * 根据 UI 数据重新生成外部设备的 action 指令
     * @param {Object} deviceResult - 设备结果对象
     * @param {Object} triggerItem - trigger 项数据
     * @param {Object} sceneData - 场景数据
     * @param {Object} options - 选项（actionList, actionList_2）
     */
    _parseExternalDeviceActions(deviceResult, triggerItem, sceneData, options = {}) {
      const { actionList = [], actionList_2 = [] } = options;
      
      // ⚠️ RCU Scene New Toggle 不需要重新生成外部设备的 action 指令
      // 原因：Toggle 场景只调用 saveActionForNewToggle，不调用 saveTriggerOnble
      if (sceneData.scene_template === 'RCU Scene New Toggle') {
        console.log('[SceneDataParser] Toggle scene: skipping external device action regeneration');
        this._parseExternalDeviceActionsLegacy(deviceResult, triggerItem);
        return;
      }
      
      // 如果有 actionList，优先根据 UI 重新生成指令
      if (actionList.length > 0 || actionList_2.length > 0) {
        try {
          this._regenerateExternalDeviceActions(deviceResult, triggerItem, sceneData, actionList, actionList_2);
          console.log(`[SceneDataParser] Regenerated external device actions for ${deviceResult.guid}`);
          return;
        } catch (error) {
          console.warn('[SceneDataParser] Failed to regenerate external device actions, falling back to legacy:', error);
          // 降级：使用已保存的指令
        }
      }
      
      // 降级：使用已保存的指令
      this._parseExternalDeviceActionsLegacy(deviceResult, triggerItem);
    }
    
    /**
     * 根据 UI 数据（actionList）重新生成外部设备的 action 指令
     */
    _regenerateExternalDeviceActions(deviceResult, triggerItem, sceneData, actionList, actionList_2) {
      const mac = this.getMacAddress(deviceResult.guid, true);
      const sceneId = triggerItem.triggerId;
      const sceneId_2 = triggerItem.triggerId_2;
      const sceneId_3 = triggerItem.triggerId_3;
      
      if (!sceneId) {
        throw new Error('triggerId is missing for external device');
      }
      
      // 1. 从 actionList 中提取 LED 控制指令（第一路 - LED On）
      let ledActionCommand_1 = '';
      let changeLedStatus_1 = false;
      
      actionList.forEach((actionItem) => {
        if (actionItem.device_mode === 'RCU Controller' && 
            actionItem.device_button_group === 'ONOFF GANG1' && 
            !actionItem.isCheckout) {
          changeLedStatus_1 = true;
          const virtualId = actionItem.virtualId;
          const virtualIdType = actionItem.virtualIdType;
          const refValue = actionItem.ref == 1 ? '01' : '00';
          
          ledActionCommand_1 += `05972103${this._padHex(virtualId, 2)}${refValue}`;
        }
      });
      
      // 2. 从 actionList_2 中提取 LED 控制指令（第二路 - LED Off）
      let ledActionCommand_2 = '';
      let changeLedStatus_2 = false;
      
      actionList_2.forEach((actionItem) => {
        if (actionItem.device_mode === 'RCU Controller' && 
            actionItem.device_button_group === 'ONOFF GANG1') {
          changeLedStatus_2 = true;
          const virtualId = actionItem.virtualId;
          const refValue = actionItem.ref == 1 ? '01' : '00';
          
          ledActionCommand_2 += `05972103${this._padHex(virtualId, 2)}${refValue}`;
        }
      });
      
      // 3. 获取 RCU 的 action 指令部分（触发主场景）
      let actionItemCommand = this._getExternalDeviceActionItemCommand(sceneData, actionList, triggerItem);
      
      console.log(`[SceneDataParser] External device action generation:`);
      console.log(`  - actionItemCommand: ${actionItemCommand ? 'Found' : 'Not found'}`);
      console.log(`  - LED command 1: ${changeLedStatus_1 ? 'Found' : 'Not found'}`);
      console.log(`  - LED command 2: ${changeLedStatus_2 ? 'Found' : 'Not found'}`);
      
      // 4. 生成主 action 指令
      if (actionItemCommand) {
        // 使用新生成的 actionItemCommand
        const mainCommand = `8f1000${this._padHex(sceneId, 2)}${actionItemCommand}`;
        console.log(`[SceneDataParser] ✅ Generated new main action command`);
        deviceResult.actions.push({
          sceneId: sceneId,
          command: mainCommand.toLowerCase(),
          type: 'main',
          sizeBytes: mainCommand.length / 2
        });
      } else if (triggerItem.actionCommand) {
        // 降级：如果没有生成新的指令，但有旧的指令，使用旧的
        const cleanCommand = this._cleanHexCommand(triggerItem.actionCommand);
        if (cleanCommand) {
          console.log(`[SceneDataParser] ⚠️ Using existing main action command (no new command generated)`);
          deviceResult.actions.push({
            sceneId: sceneId,
            command: cleanCommand,
            type: 'main',
            sizeBytes: cleanCommand.length / 2
          });
        }
      } else {
        console.warn(`[SceneDataParser] ⚠️ No main action command available (neither new nor existing)`);
      }
      
      // 5. 生成 LED On action 指令（sceneId_2）
      if (changeLedStatus_1 && sceneId_2 && ledActionCommand_1) {
        const ledCommand_1 = `02${mac}13${ledActionCommand_1}`;
        const ledActionOn = `8f1000${this._padHex(sceneId_2, 2)}${this._padHex(ledCommand_1.length / 2, 2)}${ledCommand_1}`;
        
        deviceResult.actions.push({
          sceneId: sceneId_2,
          command: ledActionOn.toLowerCase(),
          type: 'ledOn',
          sizeBytes: ledActionOn.length / 2
        });
      }
      
      // 6. 生成 LED Off action 指令（sceneId_3）
      if (changeLedStatus_2 && sceneId_3 && ledActionCommand_2) {
        const ledCommand_2 = `02${mac}13${ledActionCommand_2}`;
        const ledActionOff = `8f1000${this._padHex(sceneId_3, 2)}${this._padHex(ledCommand_2.length / 2, 2)}${ledCommand_2}`;
        
        deviceResult.actions.push({
          sceneId: sceneId_3,
          command: ledActionOff.toLowerCase(),
          type: 'ledOff',
          sizeBytes: ledActionOff.length / 2
        });
      }
    }
    
    /**
     * 获取外部设备的 actionItemCommand（触发 RCU 主场景的指令部分）
     */
    _getExternalDeviceActionItemCommand(sceneData, actionList, triggerItem) {
      try {
        console.log('[SceneDataParser] Getting actionItemCommand for external device...');
        
        // 从场景数据中获取 RCU 设备信息
        const actionData = typeof sceneData.action === 'string' ? JSON.parse(sceneData.action) : sceneData.action;
        
        if (!actionData || typeof actionData !== 'object') {
          console.log('[SceneDataParser] ❌ No actionData found');
          return '';
        }
        
        console.log('[SceneDataParser] Action data keys:', Object.keys(actionData).filter(k => k !== 'actionList' && k !== 'actionList_2'));
        
        // 找到主 RCU 设备
        let mainRcuGuid = null;
        let mainRcuSceneId = null;
        
        for (let deviceGuid in actionData) {
          if (deviceGuid === 'actionList' || deviceGuid === 'actionList_2') {
            continue;
          }
          
          const deviceData = actionData[deviceGuid];
          console.log(`[SceneDataParser] Checking device ${deviceGuid}:`, {
            hasData: !!deviceData,
            scene_id: deviceData?.scene_id,
            sceneId: deviceData?.sceneId
          });
          
          if (deviceData && (deviceData.scene_id || deviceData.sceneId)) {
            mainRcuGuid = deviceGuid;
            mainRcuSceneId = deviceData.scene_id || deviceData.sceneId;
            console.log(`[SceneDataParser] ✅ Found main RCU: ${mainRcuGuid}, scene ID: ${mainRcuSceneId}`);
            break;
          }
        }
        
        if (!mainRcuGuid || !mainRcuSceneId) {
          console.log('[SceneDataParser] ❌ No main RCU device or scene ID found');
          return '';
        }
        
        // 生成触发 RCU 场景的指令
        const rcuMac = this.getMacAddress(mainRcuGuid, true);
        const actionItemCommand = `0d02${rcuMac}13048f0200${this._padHex(mainRcuSceneId, 2)}`;
        
        console.log(`[SceneDataParser] ✅ Generated actionItemCommand: ${actionItemCommand}`);
        return actionItemCommand;
        
      } catch (error) {
        console.error('[SceneDataParser] ❌ Error generating actionItemCommand:', error);
        return '';
      }
    }
    
    /**
     * 降级方法：使用已保存的指令
     */
    _parseExternalDeviceActionsLegacy(deviceResult, triggerItem) {
      // 主action指令
      if (triggerItem.actionCommand) {
        const cleanCommand = this._cleanHexCommand(triggerItem.actionCommand);
        if (cleanCommand) {
          deviceResult.actions.push({
            sceneId: triggerItem.triggerId,
            command: cleanCommand,
            type: 'main',
            sizeBytes: cleanCommand.length / 2
          });
        }
      }
      
      // LED On action指令
      if (triggerItem.ledActionOn) {
        const cleanCommand = this._cleanHexCommand(triggerItem.ledActionOn);
        if (cleanCommand) {
          deviceResult.actions.push({
            sceneId: triggerItem.triggerId_2,
            command: cleanCommand,
            type: 'ledOn',
            sizeBytes: cleanCommand.length / 2
          });
        }
      }
      
      // LED Off action指令
      if (triggerItem.ledActionOff) {
        const cleanCommand = this._cleanHexCommand(triggerItem.ledActionOff);
        if (cleanCommand) {
          deviceResult.actions.push({
            sceneId: triggerItem.triggerId_3,
            command: cleanCommand,
            type: 'ledOff',
            sizeBytes: cleanCommand.length / 2
          });
        }
      }
    }
    
    /**
     * 十六进制数字补零工具方法
     */
    _padHex(value, length) {
      const hex = parseInt(value).toString(16);
      return hex.padStart(length, '0');
    }
    
    /**
     * 清理和验证十六进制指令
     * @param {string} command - 原始指令
     * @returns {string|null} - 清理后的指令，如果无效返回null
     */
    _cleanHexCommand(command) {
      if (!command || typeof command !== 'string') {
        return null;
      }
      
      // 移除可能的空格、换行等
      let cleaned = command.trim().replace(/\s+/g, '');
      
      // 转换为小写
      cleaned = cleaned.toLowerCase();
      
      // 验证是否为纯十六进制字符串
      if (!/^[0-9a-f]*$/.test(cleaned)) {
        console.warn('[SceneDataParser] Invalid hex command detected:', command);
        // 尝试提取十六进制部分
        cleaned = cleaned.replace(/[^0-9a-f]/g, '');
        if (cleaned.length === 0) {
          return null;
        }
      }
      
      // 确保长度为偶数（每个字节2个字符）
      if (cleaned.length % 2 !== 0) {
        console.warn('[SceneDataParser] Hex command has odd length, padding with 0');
        cleaned = '0' + cleaned;
      }
      
      return cleaned;
    }
    
    /**
     * 解析外部设备的 trigger 指令（使用已保存的指令并清理）
     */
    _parseExternalDeviceTriggers(deviceResult, triggerItem) {
      // 主trigger指令
      if (triggerItem.triggercommand) {
        const cleaned = this._cleanHexCommand(triggerItem.triggercommand);
        if (cleaned) {
          deviceResult.triggers.main = cleaned;
        }
      }
      
      // LED On trigger指令
      if (triggerItem.ledTriggerOn) {
        const cleaned = this._cleanHexCommand(triggerItem.ledTriggerOn);
        if (cleaned) {
          deviceResult.triggers.ledOn = cleaned;
        }
      }
      
      // LED Off trigger指令
      if (triggerItem.ledTriggerOff) {
        const cleaned = this._cleanHexCommand(triggerItem.ledTriggerOff);
        if (cleaned) {
          deviceResult.triggers.ledOff = cleaned;
        }
      }
    }
    
    /**
     * 解析外部设备的 settings 指令（使用已保存的指令并清理）
     */
    _parseExternalDeviceSettings(deviceResult, triggerItem) {
      // 处理 settingCommandList 数组
      if (triggerItem.settingCommandList && Array.isArray(triggerItem.settingCommandList)) {
        deviceResult.settings.settingCommandList = triggerItem.settingCommandList
          .map(cmd => this._cleanHexCommand(cmd))
          .filter(cmd => cmd);
        
        if (deviceResult.settings.settingCommandList.length > 0) {
          deviceResult.settings.settingCommand = deviceResult.settings.settingCommandList[0];
        }
      } else if (triggerItem.settingCommand) {
        // 处理单个 settingCommand
        const cleaned = this._cleanHexCommand(triggerItem.settingCommand);
        if (cleaned) {
          deviceResult.settings.settingCommand = cleaned;
        }
      }
      
      // 处理其他 setting 相关字段
      const otherSettingFields = [
        'ledRawSettingCommand',
        'defaultOnCommand',
        'defaultOffCommand'
      ];
      
      otherSettingFields.forEach(field => {
        if (triggerItem[field]) {
          const cleaned = this._cleanHexCommand(triggerItem[field]);
          if (cleaned) {
            deviceResult.settings[field] = cleaned;
          }
        }
      });
    }


    /**
     * 静态工具方法：直接从场景数据生成指令（快捷方式）
     * @param {Object} sceneData - 场景数据
     * @param {Function} getMacAddress - 获取MAC地址的函数
     * @returns {Object} - 生成的指令
     */
    static parse(sceneData, getMacAddress) {
      const parser = new SceneDataParser({ getMacAddress });
      return parser.parseSceneData(sceneData);
    }

    /**
     * 静态工具方法：通过场景ID直接生成指令（从 erp.info.scene 读取）
     * @param {string} sceneId - 场景ID/name
     * @param {Function} getMacAddress - 获取MAC地址的函数
     * @param {Object} options - 可选配置
     * @param {Object} options.erpInfo - ERP信息对象（默认使用全局 erp.info）
     * @returns {Object} - 生成的指令
     */
    static parseById(sceneId, getMacAddress, options = {}) {
      // 获取 ERP 信息
      const erpInfo = options.erpInfo || (typeof erp !== 'undefined' ? erp.info : null);
      
      if (!erpInfo || !erpInfo.scene) {
        return {
          success: false,
          error: 'erp.info.scene not available',
          actionCommands: {},
          triggerCommands: {},
          metadata: {}
        };
      }
      
      // 从 erp.info.scene 获取场景数据
      const sceneData = erpInfo.scene[sceneId];
      
      if (!sceneData) {
        return {
          success: false,
          error: `Scene not found: ${sceneId}`,
          actionCommands: {},
          triggerCommands: {},
          metadata: {}
        };
      }
      
      // 调用 parse 方法
      const parser = new SceneDataParser({ 
        getMacAddress,
        erpInfo 
      });
      
      const result = parser.parseSceneData(sceneData);
      
      // 添加场景ID到元数据
      if (result.success) {
        result.metadata.sceneId = sceneId;
        result.metadata.sceneTitle = sceneData.title;
      }
      
      return result;
    }

    /**
     * 静态工具方法：批量处理多个场景ID
     * @param {Array<string>} sceneIds - 场景ID列表
     * @param {Function} getMacAddress - 获取MAC地址的函数
     * @param {Object} options - 可选配置
     * @returns {Object} - 批量生成的指令 { sceneId: result }
     */
    static parseBatch(sceneIds, getMacAddress, options = {}) {
      const results = {};
      
      for (const sceneId of sceneIds) {
        results[sceneId] = SceneDataParser.parseById(sceneId, getMacAddress, options);
      }
      
      return results;
    }

    /**
     * 静态工具方法：获取所有场景并生成指令（筛选条件可选）
     * @param {Function} getMacAddress - 获取MAC地址的函数
     * @param {Object} options - 可选配置
     * @param {Function} options.filter - 筛选函数 (sceneData) => boolean
     * @param {Object} options.erpInfo - ERP信息对象（默认使用全局 erp.info）
     * @returns {Object} - 所有场景的指令 { sceneId: result }
     */
    static parseAll(getMacAddress, options = {}) {
      const erpInfo = options.erpInfo || (typeof erp !== 'undefined' ? erp.info : null);
      
      if (!erpInfo || !erpInfo.scene) {
        return {};
      }
      
      const scenes = erpInfo.scene;
      const results = {};
      const filter = options.filter || (() => true);
      
      for (const sceneId in scenes) {
        const sceneData = scenes[sceneId];
        
        // 应用筛选条件
        if (!filter(sceneData)) {
          continue;
        }
        
        results[sceneId] = SceneDataParser.parseById(sceneId, getMacAddress, options);
      }
      
      return results;
    }
  }

  // 导出所有类
  iotScene.SceneCommandBuilder = SceneCommandBuilder;
  iotScene.SceneActionGenerator = SceneActionGenerator;
  iotScene.SceneDataParser = SceneDataParser;

  // 返回构造函数
  return iotScene;
})();
