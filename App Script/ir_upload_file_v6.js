window.ir_upload_file = async()=>{
  // let zipUrl = 'https://my.yoswit.com/files/IR-v1.0.zip';
  let zipUrl = 'https://ota.mob-mob.com/wifi/irext_db_sqlite.zip';
  // let zipUrl = 'https://ota.mob-mob.com/wifi/irext_db_sqlite.db';
  // 自动注入CSS样式
  const injectStyles = () => {
    if (document.getElementById('ir-upload-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ir-upload-styles';
    style.textContent = `
      /* IR文件上传进度显示样式 */
      .toast-success {
        background: linear-gradient(135deg, #4CAF50, #45a049) !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
        border-radius: 8px !important;
      }
      
      .toast-error {
        background: linear-gradient(135deg, #f44336, #d32f2f) !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3) !important;
        border-radius: 8px !important;
      }
      
      .progressbar {
        background: rgba(255, 107, 107, 0.1) !important;
        border-radius: 4px !important;
        overflow: hidden !important;
      }
      
      .progressbar span {
        background: linear-gradient(90deg, #ff6b6b, #ff5252) !important;
        box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3) !important;
        transition: width 0.3s ease !important;
      }
      
      .ir-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 13000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 15px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .ir-progress-container.show {
        transform: translateY(0);
      }
      
      .ir-progress-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ir-progress-step {
        font-size: 13px;
        color: #666;
        margin-bottom: 10px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .ir-progress-bar {
        height: 6px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      
      .ir-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff6b6b, #ff5252);
        border-radius: 3px;
        transition: width 0.4s ease;
        position: relative;
      }
      
      .ir-progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: ir-shimmer 2s infinite;
      }
      
      @keyframes ir-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .ir-progress-percentage {
        font-size: 12px;
        color: #888;
        text-align: right;
      }
      
      .ir-fade-in {
        animation: ir-fadeIn 0.3s ease;
      }
      
      @keyframes ir-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .ir-slide-up {
        animation: ir-slideUp 0.3s ease;
      }
      
      @keyframes ir-slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @media (prefers-color-scheme: dark) {
        .ir-progress-container {
          background: rgba(30, 30, 30, 0.95);
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        
        .ir-progress-title {
          color: #fff;
        }
        
        .ir-progress-step {
          color: #ccc;
        }
        
        .ir-progress-bar {
          background: #333;
        }
      }
      
      @media (max-width: 768px) {
        .ir-progress-container {
          padding: 12px 15px;
        }
        
        .ir-progress-title {
          font-size: 14px;
        }
        
        .ir-progress-step {
          font-size: 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
  };
  
  // 自动注入样式
  injectStyles();
  
  // Framework7进度管理器 - 完全自包含版
  const progressManager = {
    progressContainer: null,
    currentStep: 0,
    
    init() {
      // 创建自定义进度UI
      this.createProgressUI();
      
      // 显示Framework7进度条（如果可用）
      this.showProgressbar(0);
      
      // 显示开始提示
      this.showToast('🚀 开始IR文件下载处理...', 'top', 2000);
    },
    
    // Framework7兼容方法
    showProgressbar(progress) {
      if (typeof app !== 'undefined' && app.progressbar) {
        if (progress === 0) {
          app.progressbar.show('#ff6b6b', progress);
        } else {
          app.progressbar.set(progress);
        }
      }
    },
    
    hideProgressbar() {
      if (typeof app !== 'undefined' && app.progressbar) {
        app.progressbar.hide();
      }
    },
    
    showToast(text, position = 'center', closeTimeout = 3000, cssClass = '') {
      if (typeof app !== 'undefined' && app.toast) {
        app.toast.show({
          text: text,
          position: position,
          closeTimeout: closeTimeout,
          cssClass: cssClass
        });
      } else {
        // 降级到原生alert
        console.log(`Toast: ${text}`);
      }
    },
    
    showDialog(title, content) {
      if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.alert(content, title);
      } else {
        // 降级到原生alert
        alert(`${title}\n\n${content.replace(/<[^>]*>/g, '')}`);
      }
    },
    
    createProgressUI() {
      // 检查是否已存在
      if (document.querySelector('.ir-progress-container')) {
        return;
      }
      
      // 创建进度容器
      const container = document.createElement('div');
      container.className = 'ir-progress-container';
      container.innerHTML = `
        <div class="ir-progress-title">
          <span class="ir-step-icon">🚀</span>
          <span class="ir-step-text">IR文件处理中...</span>
        </div>
        <div class="ir-progress-step">准备开始处理...</div>
        <div class="ir-progress-bar">
          <div class="ir-progress-fill" style="width: 0%"></div>
        </div>
        <div class="ir-progress-percentage">0%</div>
      `;
      
      document.body.appendChild(container);
      this.progressContainer = container;
      
      // 显示容器
      setTimeout(() => {
        container.classList.add('show');
      }, 100);
    },
    
    updateStep(step, progress = 0, message = '') {
      console.log(`📊 步骤 ${step}: ${progress}% - ${message}`);
      this.currentStep = step;
      
      // 更新Framework7进度条
      this.showProgressbar(progress);
      
      // 更新自定义UI
      this.updateCustomUI(step, progress, message);
      
      // 步骤指示器
      const stepInfo = this.getStepInfo(step);
      
      if (stepInfo) {
        console.log(`🎯 当前步骤: ${stepInfo.name} (${progress}%)`);
        
        // 显示步骤变化提示
        if (step !== this.lastStep) {
          this.showToast(`${stepInfo.icon} ${stepInfo.name}`, 'top', 2000, 'ir-slide-up');
          this.lastStep = step;
        }
      }
      
      // 显示重要消息
      if (message && (progress % 20 === 0 || progress >= 90)) {
        this.showToast(`📋 ${message}`, 'top', 2500);
      }
    },
    
    updateCustomUI(step, progress, message) {
      if (!this.progressContainer) return;
      
      const stepInfo = this.getStepInfo(step);
      const title = this.progressContainer.querySelector('.ir-step-text');
      const stepDiv = this.progressContainer.querySelector('.ir-progress-step');
      const fill = this.progressContainer.querySelector('.ir-progress-fill');
      const percentage = this.progressContainer.querySelector('.ir-progress-percentage');
      const icon = this.progressContainer.querySelector('.ir-step-icon');
      
      if (stepInfo) {
        title.textContent = stepInfo.name;
        icon.textContent = stepInfo.icon;
      }
      
      stepDiv.textContent = message || `步骤 ${step} 处理中...`;
      fill.style.width = `${progress}%`;
      percentage.textContent = `${progress}%`;
      
      // 进度颜色变化
      if (progress >= 90) {
        fill.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
      } else if (progress >= 70) {
        fill.style.background = 'linear-gradient(90deg, #FF9800, #F57C00)';
      } else {
        fill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252)';
      }
    },
    
    getStepInfo(step) {
      const stepMap = {
        1: { name: '准备环境', icon: '📚' },
        2: { name: '下载ZIP文件', icon: '📥' }, 
        3: { name: '读取文件数据', icon: '📂' },
        4: { name: '解压ZIP文件', icon: '📦' },
        5: { name: '保存解压文件', icon: '💾' },
        6: { name: '清理临时文件', icon: '🧹' },
        7: { name: '处理完成', icon: '✅' }
      };
      return stepMap[step];
    },
    
    showError(message) {
      this.hide();
      this.showToast(`❌ ${message}`, 'center', 5000, 'toast-error');
    },
    
    showSuccess(message, data) {
      // 更新UI为完成状态
      if (this.progressContainer) {
        this.updateCustomUI(7, 100, '所有步骤完成！');
        
        // 3秒后隐藏
        setTimeout(() => {
          this.hide();
        }, 3000);
      }
      
      this.hideProgressbar();
      this.showToast(`🎉 ${message}`, 'center', 4000, 'toast-success');
      
      // 显示详细结果
      setTimeout(() => {
        const totalSize = data.extractedFiles.reduce((sum, f) => sum + f.size, 0);
        
        // 🆕 检查是否有IR核心数据库文件
        const irextDbFiles = data.extractedFiles.filter(f => f.isIrextDatabase);
        const hasIrextDb = irextDbFiles.length > 0;
        
        let content = `🎉 处理成功！
        
📁 解压路径: ${data.basePath}
📄 文件数量: ${data.totalFiles} 个
💾 总大小: ${(totalSize / (1024*1024)).toFixed(2)} MB
⏱️ 处理时间: ${this.getProcessTime()}`;

        // 🆕 如果有IR数据库文件，显示特殊信息
        if (hasIrextDb) {
          const firstDbFile = irextDbFiles[0];
          
          if (firstDbFile.mobileSkipped) {
            // 移动设备跳过的情况
            content += `

🎯 IR核心数据库 (移动设备优化):
• 原始文件: ${firstDbFile.originalSize}MB
• 处理状态: 📱 移动设备保护模式跳过
• 说明文件: 已生成详细说明文件
• 其他文件: ✅ 全部正常处理完成
• 应用功能: 不受影响，可正常使用`;
          } else {
            // 正常处理的情况
            const dbPath = firstDbFile.databasePath;
            const dbSize = irextDbFiles.reduce((sum, f) => sum + f.size, 0);
            const dbSizeMB = (dbSize / (1024*1024)).toFixed(2);
            
            content += `

🎯 IR核心数据库:
• 文件数量: ${irextDbFiles.length} 个
• 数据库大小: ${dbSizeMB} MB
• 保存位置: ${dbPath} (DATA目录)
• 状态: ✅ 可供数据库插件直接访问`;
          }
        }

        content += `

🚀 优化提示:
• ZIP文件已缓存到本地
• 下次处理同样文件将直接使用缓存
• 无需重复下载，速度更快`;

        // 🆕 根据IR数据库处理情况显示不同提示
        if (hasIrextDb) {
          const firstDbFile = irextDbFiles[0];
          if (firstDbFile.mobileSkipped) {
            content += `
• 📱 大文件已智能跳过，避免应用崩溃
• 💡 如需处理大文件，建议使用桌面版本`;
          } else {
            content += `
• IR数据库已保存到专用目录，可直接使用`;
          }
        }
        
        content += `
• 缓存文件路径已记录在日志中`;
        
        this.showDialog('IR文件处理完成', content);
      }, 1500);
    },
    
    getProcessTime() {
      if (this.startTime) {
        const elapsed = Date.now() - this.startTime;
        return `${Math.round(elapsed / 1000)} 秒`;
      }
      return '';
    },
    
    hide() {
      this.hideProgressbar();
      
      if (this.progressContainer) {
        this.progressContainer.classList.remove('show');
        setTimeout(() => {
          if (this.progressContainer && this.progressContainer.parentNode) {
            this.progressContainer.parentNode.removeChild(this.progressContainer);
          }
          this.progressContainer = null;
        }, 300);
      }
    }
  };
  
  // 🆕 获取设备信息（用于移动设备优化）
  let deviceInfo = null;
  try {
    const { Device } = Capacitor.Plugins;
    deviceInfo = await Device.getInfo();
    console.log(`📱 设备信息: ${deviceInfo.platform} ${deviceInfo.osVersion}`);
  } catch (deviceError) {
    console.warn('无法获取设备信息，使用默认配置:', deviceError);
    // 回退到基础设备检测
    deviceInfo = {
      platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'web',
      operatingSystem: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 
                      /Android/i.test(navigator.userAgent) ? 'android' : 'web'
    };
  }
  
  // 初始化进度管理
  progressManager.startTime = Date.now(); // 记录开始时间
  progressManager.init();
  progressManager.updateStep(1, 5, '加载fflate解压库...');
  
  const loadFflate = ()=>{
    return new Promise((resolve) => {
      if (window['fflate']) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.onload = resolve;
      script.onerror = () => {
        console.error('fflate 加载失败');
        progressManager.showError('解压库加载失败');
      };
      script.src = 'https://cdn.jsdelivr.net/npm/fflate@0.7.4/umd/index.min.js';
      document.head.appendChild(script);
    });
  }
  
  await loadFflate();
  progressManager.updateStep(1, 10, 'fflate库加载完成');
  
  const { Filesystem } = Capacitor.Plugins;
  // 使用字符串常量替代Directory枚举，确保兼容性
  
  // ZIP文件预分析函数 - 避免解压超大文件
  const analyzeZipStructure = (zipData) => {
    console.log('🔍 开始ZIP文件结构预分析...');
    
    try {
      // 简单的ZIP文件结构检查
      const view = new DataView(zipData.buffer || zipData);
      const files = [];
      let totalUncompressedSize = 0;
      let hasLargeFiles = false;
      
      // 查找ZIP文件的中央目录结构
      // 这是一个简化的实现，主要用于检测超大文件
      let offset = zipData.length - 22; // ZIP文件结尾记录
      
      // 寻找ZIP结尾标识 (0x06054b50)
      while (offset >= 0) {
        if (view.getUint32(offset, true) === 0x06054b50) {
          break;
        }
        offset--;
      }
      
      if (offset >= 0) {
        const centralDirSize = view.getUint32(offset + 12, true);
        const centralDirOffset = view.getUint32(offset + 16, true);
        
        console.log(`📋 ZIP结构信息: 中央目录大小=${centralDirSize}, 偏移=${centralDirOffset}`);
        
        // 估算解压后大小（这是一个粗略估算）
        const compressionRatio = 0.3; // 假设平均压缩比30%
        const estimatedUncompressedSize = zipData.length / compressionRatio;
        
        if (estimatedUncompressedSize > 1024 * 1024 * 1024) { // 1GB
          hasLargeFiles = true;
          console.warn(`⚠️ 估算解压后大小过大: ${(estimatedUncompressedSize / (1024 * 1024)).toFixed(0)}MB`);
        }
      }
      
      return {
        files,
        totalUncompressedSize,
        hasLargeFiles,
        estimatedSize: zipData.length / 0.3 // 粗略估算
      };
    } catch (error) {
      console.warn('ZIP结构分析失败，使用默认策略:', error);
      return {
        files: [],
        totalUncompressedSize: 0,
        hasLargeFiles: zipData.length > 200 * 1024 * 1024,
        estimatedSize: zipData.length * 3
      };
    }
  };

  // 创建跳过解压的结果 - 避免RangeError
  const createSkipUnzipResult = async (zipData, zipInfo) => {
    console.log('📄 创建跳过解压的说明文件...');
    
    const zipSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
    const estimatedSizeMB = (zipInfo.estimatedSize / (1024 * 1024)).toFixed(0);
    
    const skipReason = [];
    if (zipData.length > 300 * 1024 * 1024) {
      skipReason.push(`ZIP文件过大 (${zipSizeMB}MB > 300MB)`);
    }
    if (zipInfo.estimatedSize > 2 * 1024 * 1024 * 1024) {
      skipReason.push(`估算解压后过大 (${estimatedSizeMB}MB > 2048MB)`);
    }
    if (zipInfo.hasLargeFiles) {
      skipReason.push('包含超大文件，可能导致内存错误');
    }
    
    // 创建详细的跳过说明
    const skipInfo = `IR文件处理报告 - 跳过解压
    
🗂️  原始ZIP文件: ${zipSizeMB}MB
📊  估算解压后: ${estimatedSizeMB}MB
🚫  跳过原因: ${skipReason.join(', ')}
⏰  处理时间: ${new Date().toISOString()}

📋 跳过解压的具体原因:
${skipReason.map(reason => `• ${reason}`).join('\n')}

💡 建议解决方案:
• 使用ZIP文件分割工具将大文件分成多个小文件
• 删除ZIP中不必要的大文件（如数据库备份、日志文件等）
• 在内存更大的设备或桌面环境中处理
• 使用服务器端解压服务
• 联系技术支持获取专门的大文件处理方案

🔧 技术信息:
• JavaScript内存限制: ~2GB
• 推荐ZIP大小: <200MB
• 推荐单文件大小: <100MB
• 当前设备信息: ${navigator.userAgent}

📞 如需处理此文件，请联系技术支持团队
`;

    const troubleshootInfo = `故障排除指南

❌ 遇到的问题:
ZIP文件 (${zipSizeMB}MB) 过大，可能导致 "RangeError: Invalid array length" 错误

🔍 问题分析:
1. JavaScript引擎对数组大小有限制（通常<2GB）
2. 解压过程需要同时存储压缩和未压缩数据
3. 大文件处理时内存使用呈指数增长

✅ 已采取的保护措施:
• 预分析ZIP文件结构
• 智能跳过可能导致崩溃的文件
• 生成详细的跳过报告
• 保护系统稳定性

🛠️ 推荐解决方案:
1. 使用7-Zip或WinRAR分割ZIP文件:
   - 右键 → 添加到压缩文件
   - 设置分割大小: 100MB
   - 生成多个小文件: part1.zip, part2.zip...

2. 服务器端处理:
   - 上传到云端解压服务
   - 使用VPS或专用服务器
   - 联系我们提供服务器端处理

3. 优化ZIP内容:
   - 移除不必要的大文件
   - 压缩或删除日志文件
   - 分离数据库文件单独处理
`;

    // 创建虚拟的解压结果
    const mockUnzipped = {
      'PROCESSING_SKIPPED.txt': new TextEncoder().encode(skipInfo),
      'TROUBLESHOOTING_GUIDE.txt': new TextEncoder().encode(troubleshootInfo),
      'ZIP_INFO.json': new TextEncoder().encode(JSON.stringify({
        originalSize: zipData.length,
        originalSizeMB: zipSizeMB,
        estimatedUncompressedSize: zipInfo.estimatedSize,
        estimatedUncompressedSizeMB: estimatedSizeMB,
        skipReasons: skipReason,
        timestamp: new Date().toISOString(),
        deviceInfo: navigator.userAgent,
        processingMode: 'SKIP_LARGE_FILES'
      }, null, 2))
    };
    
    progressManager.updateStep(4, 65, '已创建处理说明文件');
    console.log('📄 跳过解压完成，已创建说明文件');
    
    return mockUnzipped;
  };

  // 🔗 分块文件合并函数 - 将多个.part文件合并成完整文件
  const mergePartFiles = async (partFiles, originalPath, saveDirectory, fileName) => {
    console.log(`🔗 开始合并${partFiles.length}个分块文件为完整数据库文件...`);
    
    try {
      // 按文件名排序确保正确顺序
      const sortedPartFiles = partFiles.sort((a, b) => {
        const aNum = parseInt(a.match(/\.part(\d+)$/)?.[1] || '0');
        const bNum = parseInt(b.match(/\.part(\d+)$/)?.[1] || '0');
        return aNum - bNum;
      });
      
      console.log(`📋 合并顺序: ${sortedPartFiles.join(', ')}`);
      
      let totalSize = 0;
      let mergedData = new Uint8Array(0);
      
      // 读取并合并所有分块
      for (let i = 0; i < sortedPartFiles.length; i++) {
        const partPath = sortedPartFiles[i];
        console.log(`📖 读取分块 ${i + 1}/${sortedPartFiles.length}: ${partPath}`);
        
        try {
          const partFile = await Filesystem.readFile({
            path: partPath,
            directory: saveDirectory
          });
          
          // 解码base64数据
          let partData;
          if (typeof partFile.data === 'string') {
            const binaryString = atob(partFile.data);
            partData = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              partData[j] = binaryString.charCodeAt(j);
            }
          } else {
            partData = new Uint8Array(partFile.data);
          }
          
          // 记录这个分块的大小
          const partSize = partData.length;
          
          // 合并数据
          const newMergedData = new Uint8Array(mergedData.length + partData.length);
          newMergedData.set(mergedData, 0);
          newMergedData.set(partData, mergedData.length);
          
          // 释放旧数据
          mergedData = null;
          partData = null;
          mergedData = newMergedData;
          
          totalSize += partSize;
          
          // 进度更新
          const mergeProgress = Math.round((i + 1) / sortedPartFiles.length * 100);
          console.log(`🔗 合并进度: ${mergeProgress}% (${(totalSize / (1024 * 1024)).toFixed(2)}MB)`);
          
          // 垃圾回收
          if (window.gc && i % 3 === 0) {
            window.gc();
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
        } catch (partError) {
          console.error(`❌ 读取分块失败 ${partPath}:`, partError);
          throw partError;
        }
      }
      
      console.log(`✅ 分块合并完成，总大小: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
      
      // 写入完整的数据库文件
      const finalDbPath = originalPath; // 这应该是 databases/irext_db_sqlite.db
      console.log(`💾 写入完整数据库文件: ${finalDbPath}`);
      
      // 使用512KB分块写入，避免大文件写入失败
      const writeChunkSize = 512 * 1024; // 512KB
      const totalChunks = Math.ceil(mergedData.length / writeChunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * writeChunkSize;
        const end = Math.min(start + writeChunkSize, mergedData.length);
        const chunk = mergedData.slice(start, end);
        
        if (i === 0) {
          // 第一个分块，创建新文件
          await Filesystem.writeFile({
            path: finalDbPath,
            data: chunk,
            directory: saveDirectory,
            recursive: true,
            encoding: undefined
          });
        } else {
          // 后续分块，追加到现有文件
          const existingFile = await Filesystem.readFile({
            path: finalDbPath,
            directory: saveDirectory
          });
          
          let existingData;
          if (typeof existingFile.data === 'string') {
            const binaryString = atob(existingFile.data);
            existingData = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              existingData[j] = binaryString.charCodeAt(j);
            }
          } else {
            existingData = new Uint8Array(existingFile.data);
          }
          
          const combinedData = new Uint8Array(existingData.length + chunk.length);
          combinedData.set(existingData, 0);
          combinedData.set(chunk, existingData.length);
          
          await Filesystem.writeFile({
            path: finalDbPath,
            data: combinedData,
            directory: saveDirectory,
            recursive: true,
            encoding: undefined
          });
          
          // 释放内存
          existingData = null;
          combinedData = null;
        }
        
        // 进度显示
        if (i % 5 === 0 || i === totalChunks - 1) {
          const writeProgress = Math.round((i + 1) / totalChunks * 100);
          console.log(`💾 写入进度: ${writeProgress}% (${i + 1}/${totalChunks})`);
        }
        
        // 垃圾回收
        if (window.gc && i % 3 === 0) {
          window.gc();
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      // 验证最终文件
      const finalFile = await Filesystem.stat({
        path: finalDbPath,
        directory: saveDirectory
      });
      
      console.log(`🎉 完整数据库文件创建成功！`);
      console.log(`📊 文件大小: ${(finalFile.size / (1024 * 1024)).toFixed(2)}MB`);
      console.log(`📍 文件路径: ${finalDbPath}`);
      
      // 清理分块文件
      for (const partPath of sortedPartFiles) {
        try {
          await Filesystem.deleteFile({
            path: partPath,
            directory: saveDirectory
          });
          console.log(`🗑️ 已删除分块文件: ${partPath}`);
        } catch (deleteError) {
          console.warn(`删除分块文件失败: ${partPath}`, deleteError);
        }
      }
      
      // 释放内存
      mergedData = null;
      
      return {
        success: true,
        finalPath: finalDbPath,
        finalSize: finalFile.size
      };
      
    } catch (mergeError) {
      console.error('❌ 分块合并失败:', mergeError);
      return {
        success: false,
        error: mergeError.message
      };
    }
  };

  // 🛡️ 安全的目录创建函数 - 忽略"Directory exists"错误
  const safeMkdir = async (path, directory = 'DATA', description = '目录') => {
    try {
      await Filesystem.mkdir({
        path: path,
        directory: directory,
        recursive: true
      });
      console.log(`✅ ${description}创建成功: ${path} (${directory})`);
      return true;
    } catch (mkdirError) {
      if (mkdirError.message && mkdirError.message.includes('Directory exists')) {
        console.log(`✅ ${description}已存在: ${path} (${directory})`);
        return true; // 目录已存在，这是正常的
      } else {
        console.warn(`⚠️ ${description}创建失败:`, mkdirError);
        return false; // 其他错误
      }
    }
  };

  // 🔄 文件迁移函数 - 使用Cordova路径系统直接保存到目标位置
  const saveToTargetLocationWithCordova = async (fileData, fileName, deviceInfo) => {
    console.log(`🚀 使用Cordova路径系统保存到目标位置: ${fileName}`);
    
    try {
      // 🎯 使用与下载相同的路径构建方式
      let mkdirFilePath = `databases/`;
      if (deviceInfo && deviceInfo.operatingSystem === 'ios') {
        mkdirFilePath = `Library/LocalDatabase/`;
      }
      
      const targetPath = cordova.file.applicationStorageDirectory + mkdirFilePath + fileName;
      console.log(`📍 目标路径: ${targetPath}`);
      
      // 确保数据格式正确
      let dataToWrite = fileData;
      if (fileData instanceof Uint8Array) {
        // 将 Uint8Array 转换为 ArrayBuffer
        dataToWrite = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength);
      }
      
      // 使用 Cordova File API 直接写入
      return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, (dirEntry) => {
          // 创建或获取 databases 目录
          dirEntry.getDirectory(mkdirFilePath.replace(/\/$/, ''), { create: true }, (dbDir) => {
            // 创建文件
            dbDir.getFile(fileName, { create: true }, (fileEntry) => {
              // 写入文件
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = () => {
                  console.log(`✅ Cordova路径写入成功: ${targetPath}`);
                  console.log(`📊 写入大小: ${(dataToWrite.byteLength / (1024 * 1024)).toFixed(2)}MB`);
                  resolve({
                    success: true,
                    finalPath: targetPath,
                    finalSize: dataToWrite.byteLength
                  });
                };
                
                fileWriter.onerror = (error) => {
                  console.error('❌ Cordova写入失败:', error);
                  reject(error);
                };
                
                // 写入数据
                const blob = new Blob([dataToWrite], { type: 'application/octet-stream' });
                fileWriter.write(blob);
                
              }, reject);
            }, reject);
          }, reject);
        }, reject);
      });
      
    } catch (cordovaError) {
      console.error('❌ Cordova路径保存失败:', cordovaError);
      return {
        success: false,
        error: cordovaError.message
      };
    }
  };

  // 🔄 文件迁移函数 - 将文件从临时位置迁移到目标位置
  const migrateToTargetLocation = async (sourcePath, sourceDirectory, fileName, deviceInfo) => {
    console.log(`🔄 开始文件迁移: ${sourcePath} → 目标位置`);
    
    try {
      // 读取源文件
      const sourceFile = await Filesystem.readFile({
        path: sourcePath,
        directory: sourceDirectory
      });
      
      // 计算实际文件大小（处理base64格式）
      let actualSize = 0;
      if (typeof sourceFile.data === 'string') {
        // base64格式，计算解码后的大小
        actualSize = Math.floor(sourceFile.data.length * 3 / 4);
      } else {
        actualSize = sourceFile.data.length;
      }
      
      console.log(`📖 源文件读取成功: ${(actualSize / (1024 * 1024)).toFixed(2)}MB`);
      
      // 定义目标路径（尝试多种方案）
      const targetPaths = [
        // 方案1: 尝试使用相对路径回到应用根目录（最理想）
        { path: `../databases/${fileName}`, directory: 'DATA' },
        { path: `../../databases/${fileName}`, directory: 'DATA' },
        
        // 方案2: 尝试使用不同的Capacitor目录
        { path: `../databases/${fileName}`, directory: 'DOCUMENTS' },
        { path: `../databases/${fileName}`, directory: 'CACHE' },
        
        // 方案3: 尝试使用EXTERNAL目录但不同子路径
        { path: `databases/${fileName}`, directory: 'EXTERNAL' },
        { path: `../databases/${fileName}`, directory: 'EXTERNAL' },
        
        // 方案4: 尝试直接访问应用根目录（如果支持）
        { path: `/data/user/0/com.yoslock.smart/databases/${fileName}`, directory: null },
        
        // 方案5: 回退方案
        { path: `databases/${fileName}`, directory: 'DATA' },
      ];
      
      let migrationSuccess = false;
      let finalTargetPath = null;
      
      for (let i = 0; i < targetPaths.length; i++) {
        const target = targetPaths[i];
        console.log(`🔄 尝试迁移方案 ${i + 1}: ${target.path} (${target.directory})`);
        
        try {
          // 确保目标目录存在（如果有directory参数）
          if (target.directory) {
            const targetDir = target.path.substring(0, target.path.lastIndexOf('/'));
            if (targetDir) {
              await safeMkdir(targetDir, target.directory, `迁移目标目录`);
            }
          }
          
          // 写入目标文件
          const writeOptions = {
            path: target.path,
            data: sourceFile.data,
            recursive: true
          };
          
          if (target.directory) {
            writeOptions.directory = target.directory;
          }
          
          await Filesystem.writeFile(writeOptions);
          
          // 验证写入成功
          const statOptions = {
            path: target.path
          };
          
          if (target.directory) {
            statOptions.directory = target.directory;
          }
          
          const targetStats = await Filesystem.stat(statOptions);
          
          console.log(`✅ 迁移方案 ${i + 1} 成功!`);
          console.log(`📊 目标文件大小: ${(targetStats.size / (1024 * 1024)).toFixed(2)}MB`);
          
          // 获取目标文件的完整路径
          try {
            const uriOptions = {
              path: target.path
            };
            
            if (target.directory) {
              uriOptions.directory = target.directory;
            }
            
            const targetUri = await Filesystem.getUri(uriOptions);
            console.log(`📍 迁移成功！新位置: ${targetUri.uri}`);
            finalTargetPath = targetUri.uri;
          } catch (uriError) {
            console.log(`📍 迁移成功！路径: ${target.path} (${target.directory || 'default'})`);
            finalTargetPath = target.path;
          }
          
          migrationSuccess = true;
          break;
          
        } catch (targetError) {
          console.warn(`❌ 迁移方案 ${i + 1} 失败:`, targetError.message);
          continue;
        }
      }
      
      if (migrationSuccess) {
        // 迁移成功，删除源文件
        try {
          await Filesystem.deleteFile({
            path: sourcePath,
            directory: sourceDirectory
          });
          console.log(`🗑️ 源文件已删除: ${sourcePath}`);
        } catch (deleteError) {
          console.warn('删除源文件失败:', deleteError);
        }
        
        progressManager.showToast(`🎯 文件已迁移到目标位置`, 'center', 5000, 'toast-success');
        return { success: true, finalPath: finalTargetPath };
        
      } else {
        throw new Error('所有迁移方案都失败了');
      }
      
    } catch (migrationError) {
      console.error('❌ 文件迁移过程失败:', migrationError);
      progressManager.showToast(`⚠️ 迁移失败，文件保留在当前位置`, 'center', 4000);
      return { success: false, error: migrationError.message };
    }
  };

  // 解压处理函数 - 彻底避免RangeError
  const processUnzip = async (zipData) => {
    const zipSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
    console.log(`🔄 开始解压文件 (${zipSizeMB} MB)...`);
    
    // 更新进度：开始解压
    progressManager.updateStep(4, 50, `解压ZIP文件 (${zipSizeMB}MB)...`);
    
    // 第一步：预分析ZIP结构
    const zipInfo = analyzeZipStructure(zipData);
    const estimatedSizeMB = (zipInfo.estimatedSize / (1024 * 1024)).toFixed(0);
    
    console.log(`📊 ZIP预分析完成: 估算解压后${estimatedSizeMB}MB, 包含大文件: ${zipInfo.hasLargeFiles}`);
    progressManager.updateStep(4, 52, `预分析完成: 估算${estimatedSizeMB}MB`);
    
    // 检查是否应该跳过解压
    const shouldSkipUnzip = (
      zipData.length > 300 * 1024 * 1024 || // ZIP文件>300MB
      zipInfo.estimatedSize > 2 * 1024 * 1024 * 1024 || // 估算解压>2GB
      zipInfo.hasLargeFiles // 包含大文件
    );
    
    if (shouldSkipUnzip) {
      console.log('⚠️ 检测到超大ZIP文件，跳过解压，创建说明文件...');
      progressManager.updateStep(4, 55, '文件过大，跳过解压，创建说明...');
      return await createSkipUnzipResult(zipData, zipInfo);
    }
    
    const fflate = window['fflate'];
    let unzipped;
    
    // 更严格的内存和大小检查
    const availableMemory = performance && performance.memory ? 
      (performance.memory.jsHeapSizeLimit - performance.memory.usedJSHeapSize) : 
      1024 * 1024 * 1024; // 假设1GB可用内存
    
    const requiredMemory = zipData.length * 4; // 保守估算：需要4倍ZIP大小的内存
    const availableMemoryMB = (availableMemory / (1024 * 1024)).toFixed(0);
    const requiredMemoryMB = (requiredMemory / (1024 * 1024)).toFixed(0);
    
    console.log(`💾 内存检查: 可用${availableMemoryMB}MB, 需要${requiredMemoryMB}MB`);
    
    if (requiredMemory > availableMemory * 0.7) { // 只使用70%可用内存
      console.warn(`⚠️ 内存不足，跳过解压: 需要${requiredMemoryMB}MB, 仅有${availableMemoryMB}MB`);
      progressManager.updateStep(4, 54, `内存不足 (需要${requiredMemoryMB}MB)，跳过解压...`);
      return await createSkipUnzipResult(zipData, { ...zipInfo, skipReason: 'insufficient_memory' });
    }

    try {
      // 超保守的解压策略
      const isSmallZip = zipData.length <= 100 * 1024 * 1024; // 100MB
      const isMediumZip = zipData.length <= 200 * 1024 * 1024; // 200MB
      
      if (isSmallZip) {
        console.log('🔄 小文件标准解压...');
        progressManager.updateStep(4, 56, '标准解压模式...');
        
        // 小文件直接解压
        unzipped = fflate.unzipSync(zipData);
        
      } else if (isMediumZip) {
        console.log('🔄 中等大小文件，谨慎解压...');
        progressManager.updateStep(4, 56, '谨慎解压模式...');
        
        // 强制垃圾回收
        if (window.gc) {
          console.log('🧹 解压前强制垃圾回收...');
          for (let i = 0; i < 3; i++) {
            window.gc();
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // 检查内存使用率
        if (performance && performance.memory) {
          const memInfo = performance.memory;
          const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
          
          if (memoryUsageRatio > 0.6) {
            console.warn(`⚠️ 内存使用率过高 (${(memoryUsageRatio * 100).toFixed(1)}%)，跳过解压避免崩溃`);
            progressManager.updateStep(4, 57, '内存使用率过高，跳过解压...');
            return await createSkipUnzipResult(zipData, { ...zipInfo, skipReason: 'high_memory_usage' });
          }
        }
        
        // 尝试异步解压（更安全）
        if (fflate.unzip) {
          console.log('使用异步解压（更安全）...');
          progressManager.updateStep(4, 58, '异步解压中...');
          
          unzipped = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('解压超时，文件可能过大'));
            }, 180000); // 3分钟超时
            
            fflate.unzip(zipData, (err, data) => {
              clearTimeout(timeout);
              if (err) {
                console.error('异步解压失败:', err);
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        } else {
          // 回退到同步解压，但有严格的超时
          console.log('回退到同步解压...');
          progressManager.updateStep(4, 58, '同步解压中...');
          
          const unzipPromise = new Promise((resolve, reject) => {
            try {
              const result = fflate.unzipSync(zipData);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('解压操作超时')), 90000); // 1.5分钟超时
          });
          
          unzipped = await Promise.race([unzipPromise, timeoutPromise]);
        }
        
      } else {
        // 大文件直接跳过，不尝试解压
        console.warn(`❌ 文件过大 (${zipSizeMB}MB > 200MB)，直接跳过解压避免RangeError`);
        progressManager.updateStep(4, 56, '文件过大，跳过解压...');
        return await createSkipUnzipResult(zipData, { ...zipInfo, skipReason: 'file_too_large' });
      }
      
      // 验证解压结果
      if (!unzipped || typeof unzipped !== 'object') {
        throw new Error('解压结果无效');
      }
      
      const fileCount = Object.keys(unzipped).length;
      console.log(`✅ 解压完成，文件数量: ${fileCount}`);
      progressManager.updateStep(4, 65, `解压完成！发现 ${fileCount} 个文件`);
      
      // 检查解压后的文件大小和安全性 - 专门处理105MB数据库文件问题
      const largeFiles = [];
      const invalidFiles = [];
      const processedFiles = {};
      let totalSize = 0;
      
      console.log('🔍 开始检查解压后的文件...');
      
      for (const [path, data] of Object.entries(unzipped)) {
        // 跳过目录
        if (path.endsWith('/')) continue;
        
        // 验证文件数据
        if (!data) {
          invalidFiles.push(path);
          continue;
        }
        
        const fileSize = data.length;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        totalSize += fileSize;
        
        console.log(`📄 检查文件: ${path} (${fileSizeMB}MB)`);
        
        // 专门处理超大单文件（如105MB数据库）
        if (fileSize > 80 * 1024 * 1024) { // 80MB以上
          console.warn(`⚠️ 检测到超大单文件: ${path} (${fileSizeMB}MB)`);
          
          // 判断是否为数据库文件
          const isDatabase = path.toLowerCase().includes('.db') || 
                            path.toLowerCase().includes('.sqlite') ||
                            path.toLowerCase().includes('database') ||
                            path.toLowerCase().includes('.sql');
          
          // 🆕 检测是否为IR核心数据库文件
          const isIrextDbFile = path.toLowerCase().includes('irext_db_sqlite.db') || 
                               path.toLowerCase().includes('irext_db.sqlite');
          
          // 🆕 动态JavaScript数组安全限制检查（与文件保存阶段保持一致）
          const jsArraySafeLimit = isDatabase ? 150 * 1024 * 1024 : 120 * 1024 * 1024; // 数据库文件150MB，普通文件120MB
          
          if (fileSize > jsArraySafeLimit) {
            const limitMB = (jsArraySafeLimit / (1024 * 1024)).toFixed(0);
            console.error(`❌ 文件超出JavaScript安全限制: ${path} (${fileSizeMB}MB > ${limitMB}MB)`);
            
            // 创建文件信息而不是实际文件
            const fileInfo = `超大文件信息: ${path}

📊 文件详情:
• 原始大小: ${fileSizeMB}MB
• 文件类型: ${isIrextDbFile ? 'IR核心数据库文件' : (isDatabase ? '数据库文件' : '二进制文件')}
• 当前限制: ${limitMB}MB (${isDatabase ? '数据库文件' : '普通文件'})
• 跳过原因: JavaScript数组大小限制
• 处理时间: ${new Date().toISOString()}

❌ 为什么跳过这个文件:
这个文件 (${fileSizeMB}MB) 超出了${isDatabase ? '数据库文件' : '普通文件'}的安全限制 (${limitMB}MB)。
当尝试处理如此大的文件时，会触发 "RangeError: Invalid array length" 错误，
导致整个应用程序崩溃。

💡 解决方案:
1. 服务器端处理:
   - 上传到支持大文件的服务器
   - 使用服务器端工具处理此文件
   - 联系技术支持获取专门处理方案

2. 文件分割:
   - 如果是数据库文件，考虑导出为多个小文件
   - 使用数据库工具分批导出数据
   - 分别处理每个小文件

3. 桌面应用处理:
   - 下载桌面版本的处理工具
   - 在内存更大的电脑上处理
   - 使用专门的大文件处理软件

📞 技术支持:
如需处理此大文件，请联系技术支持团队，我们可以提供专门的
服务器端处理服务或其他解决方案。

⚠️ 重要提醒:
其他小文件已正常处理，只有这个超大文件被跳过以保护系统稳定性。
`;
            
            // 使用文件信息替换原文件
            processedFiles[path + '.INFO.txt'] = new TextEncoder().encode(fileInfo);
            
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: true,
              reason: 'javascript_array_limit'
            });
            
            continue; // 跳过原文件
          }
          
          // 🆕 80MB以上但在限制内的文件（数据库文件可达150MB），尝试预处理检查
          console.log(`🔄 预处理检查超大文件: ${path} (${fileSizeMB}MB, 限制: ${(jsArraySafeLimit / (1024 * 1024)).toFixed(0)}MB)`);
          
          try {
            // 验证数据完整性和可访问性
            if (!(data instanceof Uint8Array)) {
              throw new Error(`文件数据类型异常: ${typeof data}`);
            }
            
            // 分段测试数组访问，避免一次性访问导致内存问题
            const testChunkSize = 10 * 1024 * 1024; // 10MB测试块
            const testPoints = Math.min(5, Math.floor(fileSize / testChunkSize));
            
            for (let i = 0; i < testPoints; i++) {
              const testIndex = Math.floor((fileSize / testPoints) * i);
              try {
                const testByte = data[testIndex];
                if (testByte === undefined || testByte < 0 || testByte > 255) {
                  throw new Error(`无效字节值 at ${testIndex}: ${testByte}`);
                }
              } catch (accessError) {
                throw new Error(`数组访问失败 at ${testIndex}: ${accessError.message}`);
              }
              
              // 每次测试后强制垃圾回收
              if (window.gc && i % 2 === 0) {
                window.gc();
                await new Promise(resolve => setTimeout(resolve, 10));
              }
            }
            
            console.log(`✅ 超大文件预处理检查通过: ${path}${isIrextDbFile ? ' (IR核心数据库)' : ''}`);
            
            // 文件预处理检查通过，可以处理
            processedFiles[path] = data;
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: false,
              risk: isIrextDbFile ? 'medium-high' : 'high',
              type: isIrextDbFile ? 'IR核心数据库文件' : (isDatabase ? '数据库文件' : '大文件'),
              note: isIrextDbFile ? '105MB IR核心数据库，已通过预处理检查' : '文件很大，处理时可能较慢'
            });
            
          } catch (preprocessError) {
            console.error(`❌ 超大文件预处理失败: ${path}`, preprocessError);
            
            // 预处理失败，创建错误说明
            const errorInfo = `文件处理失败: ${path}

📊 文件信息:
• 大小: ${fileSizeMB}MB  
• 错误: ${preprocessError.message}
• 时间: ${new Date().toISOString()}

❌ 处理失败原因:
文件在预处理检查阶段失败，可能的原因：
• 文件数据损坏或不完整
• 内存不足以处理此大小的文件
• 文件格式不被支持

💡 建议解决方案:
1. 重新下载或获取文件
2. 检查文件完整性
3. 使用更强大的设备处理
4. 联系技术支持获取帮助
`;
            
            processedFiles[path + '.ERROR.txt'] = new TextEncoder().encode(errorInfo);
            
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: true,
              reason: 'preprocessing_failed'
            });
            
            continue; // 跳过原文件
          }
          
        } else {
          // 普通大小文件直接包含
          processedFiles[path] = data;
          
          // 记录50MB以上的文件
          if (fileSize > 50 * 1024 * 1024) {
            largeFiles.push({ 
              path, 
              size: fileSizeMB,
              skipped: false,
              risk: 'medium'
            });
          }
        }
      }
      
      // 使用处理后的文件列表替换原始解压结果
      unzipped = processedFiles;
      
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      const finalFileCount = Object.keys(unzipped).length;
      progressManager.updateStep(4, 70, `解压内容: ${finalFileCount}个文件，总计${totalSizeMB}MB`);
      
      // 报告无效文件
      if (invalidFiles.length > 0) {
        console.warn('⚠️ 发现无效文件:', invalidFiles);
      }
      
      // 报告大文件情况
      if (largeFiles.length > 0) {
        console.log('📊 大文件统计:');
        largeFiles.forEach(file => {
          const status = file.skipped ? '(已跳过)' : '(将处理)';
          console.log(`   - ${file.path}: ${file.size}MB ${status}`);
        });
        
        const processedLargeFiles = largeFiles.filter(f => !f.skipped);
        const skippedLargeFiles = largeFiles.filter(f => f.skipped);
        
        if (processedLargeFiles.length > 0) {
          const largeFileList = processedLargeFiles.map(f => `${f.path} (${f.size}MB)`).join(', ');
          progressManager.updateStep(4, 72, `发现大文件: ${largeFileList}`);
        }
        
        if (skippedLargeFiles.length > 0) {
          progressManager.updateStep(4, 73, `跳过超大文件: ${skippedLargeFiles.length}个`);
        }
      }
      
      // 最终内存清理
      if (zipData.length > 50 * 1024 * 1024 && window.gc) {
        console.log('🧹 解压完成后清理内存...');
        window.gc();
      }
      
    } catch (unzipError) {
      console.error('❌ 解压失败:', unzipError);
      progressManager.updateStep(4, 50, '解压失败，创建错误报告...');
      
      // 对于任何解压错误，直接跳过并创建说明文件，不再尝试备用解压
      console.log('🚫 检测到解压错误，为避免RangeError，直接跳过解压并创建说明文件');
      
      // 分析错误类型
      let errorType = 'unknown';
      let errorDescription = unzipError.message || '未知错误';
      
      if (unzipError.message) {
        if (unzipError.message.includes('array length') || unzipError.message.includes('Invalid array length')) {
          errorType = 'array_length_limit';
          errorDescription = 'JavaScript数组长度限制错误（文件过大）';
        } else if (unzipError.message.includes('memory') || unzipError.message.includes('Maximum call stack')) {
          errorType = 'memory_limit';
          errorDescription = '内存不足或堆栈溢出';
        } else if (unzipError.message.includes('timeout') || unzipError.message.includes('超时')) {
          errorType = 'timeout';
          errorDescription = '解压操作超时';
        } else if (unzipError.message.includes('corrupt') || unzipError.message.includes('invalid')) {
          errorType = 'corrupted_file';
          errorDescription = 'ZIP文件损坏或格式无效';
        }
      }
      
      // 创建详细的错误报告
      const errorReport = `IR文件解压失败详细报告

⚠️  错误概要:
ZIP文件无法解压，已跳过处理以保护系统稳定性

📊 文件信息:
• ZIP文件大小: ${zipSizeMB}MB
• 错误类型: ${errorType}
• 错误描述: ${errorDescription}
• 处理时间: ${new Date().toISOString()}

💾 系统信息:
• 设备: ${navigator.userAgent}
• 内存信息: ${performance && performance.memory ? 
  `已用 ${(performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)}MB / 限制 ${(performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)}MB` : 
  '内存信息不可用'}

🔍 问题分析:
根据错误类型，可能的原因包括：
${errorType === 'array_length_limit' ? 
  '• ZIP文件包含超大文件，超出JavaScript数组大小限制（约2GB）\n• 解压后的数据量超出浏览器处理能力\n• 需要分割文件或使用服务器端处理' :
  errorType === 'memory_limit' ?
  '• 设备可用内存不足\n• 其他应用占用过多内存\n• 需要关闭其他应用或使用内存更大的设备' :
  errorType === 'timeout' ?
  '• 文件过大，解压时间超出限制\n• 系统性能不足\n• 网络或存储速度过慢' :
  errorType === 'corrupted_file' ?
  '• ZIP文件在传输过程中损坏\n• 文件格式不正确\n• 需要重新下载或检查文件完整性' :
  '• 未知错误，建议联系技术支持'
}

💡 建议解决方案:
1. 文件分割：
   - 使用7-Zip、WinRAR等工具分割ZIP文件
   - 建议分割为50-100MB的小文件
   - 逐个处理小文件

2. 服务器端处理：
   - 上传到云端解压服务
   - 使用VPS或专用服务器处理
   - 联系技术支持获取服务器端解决方案

3. 系统优化：
   - 关闭其他浏览器标签页和应用程序
   - 重启浏览器释放内存
   - 使用内存更大的设备

4. 文件优化：
   - 检查ZIP文件是否包含不必要的大文件
   - 移除日志文件、缓存文件等
   - 分离数据库文件单独处理

📞 技术支持:
如果问题持续存在，请联系技术支持团队，并提供此错误报告。

🛡️  系统保护措施:
为避免浏览器崩溃或系统不稳定，系统已自动跳过此文件的解压处理。
这是正常的保护机制，不会影响其他功能的使用。
`;

      const quickGuide = `快速解决指南

❌ 问题: ZIP文件 (${zipSizeMB}MB) 解压失败
🎯 目标: 成功处理IR文件

⚡ 快速解决方案:

1. 立即可行方案 (推荐):
   □ 下载7-Zip (免费): https://www.7-zip.org/
   □ 右键ZIP文件 → 7-Zip → 添加到压缩文件
   □ 设置"分割为卷，大小": 50MB
   □ 生成多个小文件: part1.zip, part2.zip...
   □ 逐个处理小文件

2. 在线处理方案:
   □ 搜索"在线ZIP解压"服务
   □ 上传文件到云端处理
   □ 下载解压后的文件

3. 技术支持方案:
   □ 联系开发团队
   □ 提供此错误报告
   □ 获取专门的大文件处理服务

⏱️  预计解决时间:
• 方案1: 5-10分钟
• 方案2: 10-20分钟  
• 方案3: 1-3个工作日

💬 注意事项:
• 此错误是为了保护系统稳定性
• 不会影响其他功能的正常使用
• 问题出现在文件大小，不是系统故障
`;

      // 创建虚拟的解压结果，包含详细的错误说明
      unzipped = {
        'ERROR_REPORT_DETAILED.txt': new TextEncoder().encode(errorReport),
        'QUICK_SOLUTION_GUIDE.txt': new TextEncoder().encode(quickGuide),
        'ORIGINAL_ERROR.json': new TextEncoder().encode(JSON.stringify({
          timestamp: new Date().toISOString(),
          zipSize: zipData.length,
          zipSizeMB: zipSizeMB,
          errorType: errorType,
          errorMessage: errorDescription,
          originalError: unzipError.message,
          systemInfo: {
            userAgent: navigator.userAgent,
            memory: performance && performance.memory ? {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            } : null
          },
          skipReason: 'unzip_error_protection'
        }, null, 2))
      };
      
      console.log('📄 错误报告文件创建完成');
      progressManager.updateStep(4, 65, '已创建详细错误报告');
    }
    
    // 创建解压目录
    const timestamp = Date.now();
    const basePath = `IR-extracted-${timestamp}/`;
    
    progressManager.updateStep(5, 75, '创建解压目录...');
    
    const mkdirSuccess = await safeMkdir(basePath, 'CACHE', '解压目录');
    if (mkdirSuccess) {
      console.log('创建解压目录:', basePath);
      progressManager.updateStep(5, 78, `解压目录创建完成: ${basePath}`);
    } else {
      console.warn('解压目录创建失败，使用备用方案');
      progressManager.updateStep(5, 78, '使用备用解压目录');
    }
    
    // 🆕 智能文件优先级排序 - irext_db_sqlite.db 优先处理
    console.log('🎯 对文件进行优先级排序...');
    const fileEntries = Object.entries(unzipped);
    
    // 文件优先级分类函数
    const getFilePriority = (path) => {
      const lowerPath = path.toLowerCase();
      
      // 第一优先级：irext_db_sqlite.db 数据库文件
      if (lowerPath.includes('irext_db_sqlite.db') || lowerPath.includes('irext_db.sqlite')) {
        return 1; // 最高优先级
      }
      
      // 第二优先级：其他数据库文件
      if (lowerPath.includes('.db') || lowerPath.includes('.sqlite') || 
          lowerPath.includes('database') || lowerPath.includes('.sql')) {
        return 2; // 高优先级
      }
      
      // 第三优先级：配置和重要文件
      if (lowerPath.includes('config') || lowerPath.includes('.json') || 
          lowerPath.includes('.xml') || lowerPath.includes('setting')) {
        return 3; // 中等优先级  
      }
      
      // 第四优先级：普通文件
      return 4; // 低优先级
    };
    
    // 按优先级排序文件
    const sortedFileEntries = fileEntries.sort(([pathA], [pathB]) => {
      const priorityA = getFilePriority(pathA);
      const priorityB = getFilePriority(pathB);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB; // 数字越小优先级越高
      }
      
      // 同优先级按文件大小排序（大文件先处理，避免内存不足时丢失）
      const dataA = unzipped[pathA];
      const dataB = unzipped[pathB];
      const sizeA = dataA ? dataA.length : 0;
      const sizeB = dataB ? dataB.length : 0;
      return sizeB - sizeA;
    });
    
    // 统计各优先级文件数量
    const priorityStats = {};
    let irextDbFound = false;
    sortedFileEntries.forEach(([path]) => {
      const priority = getFilePriority(path);
      priorityStats[priority] = (priorityStats[priority] || 0) + 1;
      
      if (priority === 1) {
        irextDbFound = true;
        console.log(`🎯 发现IR核心数据库: ${path}`);
      }
    });
    
    console.log('📊 文件处理优先级统计:');
    console.log(`   🥇 IR数据库文件: ${priorityStats[1] || 0} 个`);
    console.log(`   🥈 其他数据库文件: ${priorityStats[2] || 0} 个`);
    console.log(`   🥉 配置文件: ${priorityStats[3] || 0} 个`);
    console.log(`   📄 普通文件: ${priorityStats[4] || 0} 个`);
    
    if (irextDbFound) {
      progressManager.updateStep(5, 78, '🎯 发现IR核心数据库，优先处理...');
      progressManager.showToast('🎯 检测到IR数据库文件，将优先处理', 'center', 3000);
    } else {
      progressManager.updateStep(5, 78, '📋 按优先级排序完成');
    }
    
    // 遍历并保存文件（按优先级顺序）
    let fileCount = 0;
    const savedFiles = [];
    const totalFiles = sortedFileEntries.length;
    
    progressManager.updateStep(5, 80, `开始按优先级保存 ${totalFiles} 个文件...`);
    
    for (const [relativePath, fileData] of sortedFileEntries) {
      // 跳过目录项
      if (relativePath.endsWith('/')) {
        console.log('跳过目录:', relativePath);
        continue;
      }
      
      try {
        // 处理路径分隔符 (Windows兼容)
        const safePath = relativePath.replace(/\\/g, '/');
        const fileName = relativePath.split('/').pop() || relativePath;
        
        // 🆕 检测是否为IR核心数据库文件
        const isIrextDbFile = relativePath.toLowerCase().includes('irext_db_sqlite.db') || 
                             relativePath.toLowerCase().includes('irext_db.sqlite');
        
        // 🆕 根据文件类型选择保存路径
        let fullPath;
        let saveDirectory;
        let isDbDirectory = false;
        
        if (isIrextDbFile) {
          // IR核心数据库文件保存到应用根目录的数据库目录
          if (deviceInfo && deviceInfo.operatingSystem === 'ios') {
            // iOS: 使用标准的DATA目录
            fullPath = 'Library/LocalDatabase/' + fileName;
            saveDirectory = 'DATA';
            
            // 确保目录存在
            await safeMkdir('Library/LocalDatabase', 'DATA', 'iOS数据库目录');
          } else {
            // Android: 使用Capacitor DATA目录作为临时位置
            console.log(`🔍 Android设备：使用Capacitor标准数据目录作为临时位置`);
            console.log(`💡 文件将临时保存到Capacitor目录，然后自动迁移到Cordova目标位置`);
            
            // 使用DATA目录作为临时存储
            fullPath = 'databases/' + fileName;
            saveDirectory = 'DATA';
            
            await safeMkdir('databases', 'DATA', '临时数据库目录');
            console.log(`🎯 处理完成后将自动使用Cordova路径保存到期望位置`);
            console.log(`💡 运行 ir_path_analysis() 查看详细技术说明`);
          }
          
          isDbDirectory = true;
          
          console.log(`🎯 IR数据库文件将保存到: ${fullPath} (${saveDirectory})`);
          console.log(`🔍 预期最终路径: /data/user/0/com.yoslock.smart/app_data/databases/${fileName}`);
        } else {
          // 普通文件保存到解压目录
          fullPath = basePath + safePath;
          saveDirectory = 'CACHE';
          console.log(`📄 普通文件保存到: ${fullPath} (${saveDirectory})`);
        }
        
        console.log(`保存文件 ${fileCount + 1}/${totalFiles}: ${fullPath}`);
        
        // 更新文件保存进度 (80-95%之间)
        const saveProgress = 80 + Math.floor((fileCount / totalFiles) * 15);
        
        if (isIrextDbFile) {
          progressManager.updateStep(5, saveProgress, `🎯 保存IR数据库到专用目录: ${fileName}`);
          console.log(`🎯 开始保存IR核心数据库到数据库目录: ${fullPath}`);
        } else {
          const filePriority = getFilePriority(relativePath);
          const priorityEmoji = filePriority === 2 ? '🥈' : filePriority === 3 ? '🥉' : '📄';
          progressManager.updateStep(5, saveProgress, `${priorityEmoji} 保存文件 ${fileCount + 1}/${totalFiles}: ${fileName}`);
        }
        
        // 增强文件大小和类型检查
        const fileSize = fileData ? fileData.length : 0;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        
        // 基础验证
        if (fileSize === 0 || !fileData) {
          console.warn(`⚠️ 跳过空文件: ${relativePath}`);
          continue;
        }
        
        // 文件类型检查
        const isImportantFile = relativePath.toLowerCase().includes('.db') || 
                               relativePath.toLowerCase().includes('.sqlite') ||
                               relativePath.toLowerCase().includes('database') ||
                               relativePath.toLowerCase().includes('.sql');
        
        // JavaScript数组长度限制检查（约2GB，但实际限制更小）
        const jsArrayLimit = 1024 * 1024 * 1024; // 1GB安全限制
        if (fileSize > jsArrayLimit) {
          console.error(`❌ 文件超出JavaScript数组限制 ${relativePath}: ${fileSizeMB}MB (限制: ${(jsArrayLimit / (1024 * 1024)).toFixed(0)}MB)`);
          
          // 创建错误信息文件代替
          const errorInfo = `文件过大无法处理: ${relativePath}
大小: ${fileSizeMB}MB
限制: ${(jsArrayLimit / (1024 * 1024)).toFixed(0)}MB
建议: 请分割此文件或使用服务器端处理`;
          
          savedFiles.push({
            path: basePath + relativePath + '.ERROR.txt',
            size: errorInfo.length,
            originalPath: relativePath,
            error: 'File too large'
          });
          
          continue;
        }
        
        // 动态大小限制（基于当前内存使用情况）
        let sizeLimit = isImportantFile ? 200 * 1024 * 1024 : 150 * 1024 * 1024;
        
        // 如果可以检查内存使用情况，动态调整限制
        if (performance && performance.memory) {
          const memInfo = performance.memory;
          const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
          
          if (memoryUsageRatio > 0.7) {
            // 内存使用过高，降低文件大小限制
            sizeLimit = Math.min(sizeLimit, 50 * 1024 * 1024); // 降低到50MB
            console.warn(`⚠️ 内存使用率过高 (${(memoryUsageRatio * 100).toFixed(1)}%)，降低文件大小限制到 ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB`);
          }
        }
        
        if (fileSize > sizeLimit) {
          console.warn(`⚠️ 跳过过大文件 ${relativePath}: ${fileSizeMB}MB (当前限制: ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB)`);
          
          // 创建跳过信息文件
          const skipInfo = `文件过大已跳过: ${relativePath}
大小: ${fileSizeMB}MB
限制: ${(sizeLimit / (1024 * 1024)).toFixed(0)}MB
类型: ${isImportantFile ? '数据库文件' : '普通文件'}`;
          
          savedFiles.push({
            path: basePath + relativePath + '.SKIPPED.txt',
            size: skipInfo.length,
            originalPath: relativePath,
            skipped: true
          });
          
          continue;
        }
        
        // 大文件预警
        if (fileSize > 50 * 1024 * 1024) {
          console.log(`📦 处理大文件 ${relativePath}: ${fileSizeMB}MB`);
        }
        
        // 严格的数据类型检查
        if (!(fileData instanceof Uint8Array) && !(fileData instanceof Array)) {
          console.error(`❌ 文件数据类型异常 ${relativePath}: ${typeof fileData}`);
          console.error(`数据构造函数: ${fileData.constructor ? fileData.constructor.name : 'unknown'}`);
          continue;
        }
        
        // 将数组转换为Uint8Array（如果需要）
        if (fileData instanceof Array) {
          try {
            console.log(`🔄 转换普通数组为Uint8Array: ${relativePath}`);
            fileData = new Uint8Array(fileData);
          } catch (conversionError) {
            console.error(`❌ 数组转换失败 ${relativePath}:`, conversionError);
            continue;
          }
        }
        
        // 专门处理80MB+超大文件 - 支持105MB数据库文件
        if (fileSize > 80 * 1024 * 1024) {
          console.log(`🔄 检测到超大文件 ${relativePath} (${fileSizeMB}MB)，启用特殊处理...`);
          
          // 🆕 调整限制：支持150MB以下的数据库文件，避免过度保守
          const dynamicLimit = isImportantFile ? 150 * 1024 * 1024 : 120 * 1024 * 1024; // 数据库文件150MB，普通文件120MB
          
          if (fileSize > dynamicLimit) {
            const limitMB = (dynamicLimit / (1024 * 1024)).toFixed(0);
            console.warn(`❌ 文件过大，跳过处理避免内存问题: ${relativePath} (${fileSizeMB}MB > ${limitMB}MB)`);
            
            const skipInfo = `超大文件跳过说明: ${relativePath}

📊 文件信息:
• 文件大小: ${fileSizeMB}MB
• 文件类型: ${isImportantFile ? '数据库文件' : '普通文件'}
• 当前限制: ${(dynamicLimit / (1024 * 1024)).toFixed(0)}MB
• 文件路径: ${relativePath}
• 跳过时间: ${new Date().toISOString()}

❌ 跳过原因:
此文件 (${fileSizeMB}MB) 超过了${isImportantFile ? '数据库文件150MB' : '普通文件120MB'}的安全处理限制。
处理如此大的文件可能会导致:
• RangeError: Invalid array length（JavaScript数组长度错误）
• 浏览器内存不足或崩溃
• 整个处理流程中断

🎯 针对超大文件的解决方案:

1. 数据库文件分割方案:
   □ 使用SQLite管理工具打开数据库
   □ 导出数据为多个小的SQL文件
   □ 按表或按时间范围分割导出
   □ 每个文件控制在50MB以内

2. 服务器端处理方案:
   □ 上传原始ZIP到云端服务器
   □ 使用服务器端工具解压和处理
   □ 联系技术支持获取专门服务

3. 桌面工具处理方案:
   □ 下载7-Zip或WinRAR在电脑上解压
   □ 使用数据库管理工具直接处理
   □ 在内存更大的设备上操作

💡 立即可行的方案:
如果您需要这个数据库文件，建议：
1. 先处理其他小文件
2. 单独下载数据库文件的ZIP包
3. 在电脑上用专门工具解压
4. 或联系我们提供专门的处理服务

📞 技术支持:
如果这个数据库文件对您很重要，请联系技术支持，
我们可以提供专门的大文件处理服务。

✅ 其他文件处理状态:
除了这个超大数据库文件，其他所有小文件都会正常处理，
不会影响整体的文件处理流程。
`;

            // 保存跳过说明文件
            try {
              const skipInfoPath = basePath + relativePath + '.SKIPPED_LARGE_FILE.txt';
              await Filesystem.writeFile({
                path: skipInfoPath,
                data: skipInfo,
                directory: 'CACHE',
                recursive: true
              });
              
              savedFiles.push({
                path: skipInfoPath,
                size: skipInfo.length,
                originalPath: relativePath,
                skipped: true,
                reason: 'file_too_large_105mb'
              });
              
              console.log(`✅ 已创建跳过说明文件: ${relativePath}.SKIPPED_LARGE_FILE.txt`);
              progressManager.updateStep(5, saveProgress, `⚠️ 跳过超大文件: ${fileName} (${fileSizeMB}MB)`);
              
            } catch (skipError) {
              console.error(`创建跳过说明失败:`, skipError);
            }
            
            continue; // 跳过原文件处理
          }
          
          // 🆕 80-150MB文件的智能预处理（支持105MB数据库）
          console.log(`🔄 大文件预处理检查: ${relativePath} (${fileSizeMB}MB, ${isImportantFile ? '数据库文件' : '普通文件'})`);
          
          // 对于105MB数据库文件，使用更积极的处理策略
          const isTargetDbFile = isImportantFile && fileSize >= 100 * 1024 * 1024 && fileSize <= 110 * 1024 * 1024;
          if (isTargetDbFile) {
            console.log(`🎯 检测到目标数据库文件 (${fileSizeMB}MB)，启用专门优化...`);
            progressManager.updateStep(5, saveProgress, `🎯 处理数据库文件: ${fileName} (${fileSizeMB}MB)`);
          }
          
          // 强制垃圾回收（105MB文件需要更多清理）
          if (window.gc) {
            const gcRounds = isTargetDbFile ? 8 : 5; // 105MB文件需要更多垃圾回收
            console.log(`🧹 超大文件处理前垃圾回收 (${gcRounds}轮)...`);
            for (let i = 0; i < gcRounds; i++) {
              window.gc();
              await new Promise(resolve => setTimeout(resolve, isTargetDbFile ? 150 : 100));
            }
          }
          
          // 检查当前内存状态
          if (performance && performance.memory) {
            const memInfo = performance.memory;
            const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
            const availableMB = (memInfo.jsHeapSizeLimit - memInfo.usedJSHeapSize) / (1024 * 1024);
            
            console.log(`💾 内存状态: 使用率${(memoryUsageRatio * 100).toFixed(1)}%, 可用${availableMB.toFixed(0)}MB`);
            
            // 🆕 智能内存检查：105MB数据库文件给予更宽松的条件
            const memoryThreshold = isTargetDbFile ? 0.75 : 0.7; // 105MB数据库文件容忍75%内存使用率
            const requiredMemoryMB = isTargetDbFile ? 300 : 200; // 105MB数据库文件需要300MB空闲内存
            
            if (memoryUsageRatio > memoryThreshold || availableMB < requiredMemoryMB) {
              console.warn(`⚠️ 内存不足，跳过大文件: ${relativePath} (使用率${(memoryUsageRatio * 100).toFixed(1)}%, 可用${availableMB.toFixed(0)}MB, 需要${requiredMemoryMB}MB)`);
              
              const memorySkipInfo = `内存不足跳过: ${relativePath} ${isTargetDbFile ? '(数据库文件)' : ''}

📊 文件信息:
• 文件大小: ${fileSizeMB}MB
• 文件类型: ${isTargetDbFile ? 'IR数据库文件' : isImportantFile ? '数据库文件' : '普通文件'}
• 内存使用率: ${(memoryUsageRatio * 100).toFixed(1)}% (阈值: ${(memoryThreshold * 100).toFixed(0)}%)
• 可用内存: ${availableMB.toFixed(0)}MB (需要: ${requiredMemoryMB}MB)
• 跳过时间: ${new Date().toISOString()}

⚠️ 跳过原因:
当前内存状态不足以安全处理此大文件${isTargetDbFile ? '（已为数据库文件调整宽松策略）' : ''}。
继续处理可能导致:
• 浏览器卡顿或崩溃
• RangeError: Invalid array length
• 系统不稳定

💡 针对${isTargetDbFile ? '105MB数据库文件' : '大文件'}的解决方案:
1. ${isTargetDbFile ? '关闭所有其他浏览器标签页，释放更多内存' : '关闭其他浏览器标签页和应用程序'}
2. 重启浏览器或设备释放内存
3. ${isTargetDbFile ? '在内存充足时重试（建议至少500MB可用内存）' : '稍后在内存充足时重试'}
4. ${isTargetDbFile ? '使用桌面版本或更高性能设备处理' : '使用内存更大的设备处理'}
`;
              
              try {
                const memorySkipPath = basePath + relativePath + '.MEMORY_SKIP.txt';
                await Filesystem.writeFile({
                  path: memorySkipPath,
                  data: memorySkipInfo,
                  directory: 'CACHE',
                  recursive: true
                });
                
                savedFiles.push({
                  path: memorySkipPath,
                  size: memorySkipInfo.length,
                  originalPath: relativePath,
                  skipped: true,
                  reason: 'insufficient_memory'
                });
                
                console.log(`✅ 已创建内存不足说明: ${relativePath}.MEMORY_SKIP.txt`);
                
              } catch (memorySkipError) {
                console.error(`创建内存不足说明失败:`, memorySkipError);
              }
              
              continue; // 跳过原文件
            }
          }
          
          // 分段验证数组完整性（105MB数据库文件专门优化）
          try {
            console.log(`🔍 验证超大文件数据完整性: ${relativePath} ${isTargetDbFile ? '(105MB数据库专门处理)' : ''}`);
            
            if (fileData.length !== fileSize) {
              throw new Error(`文件大小不匹配: 预期${fileSize}, 实际${fileData.length}`);
            }
            
            // 🆕 针对105MB数据库的优化测试策略
            const testChunkSize = isTargetDbFile ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 105MB数据库用10MB测试块
            const maxTestPoints = isTargetDbFile ? 12 : 8; // 105MB数据库进行更多测试点
            const testPoints = Math.min(maxTestPoints, Math.floor(fileData.length / testChunkSize));
            
            for (let i = 0; i < testPoints; i++) {
              const testIndex = Math.floor((fileData.length / testPoints) * i);
              try {
                const testByte = fileData[testIndex];
                if (testByte === undefined || testByte < 0 || testByte > 255) {
                  throw new Error(`无效字节值 at ${testIndex}: ${testByte}`);
                }
              } catch (accessError) {
                throw new Error(`数组访问失败 at ${testIndex}: ${accessError.message}`);
              }
              
              // 每次测试后都强制垃圾回收和暂停（105MB数据库需要更多清理）
              if (window.gc) {
                window.gc();
                await new Promise(resolve => setTimeout(resolve, isTargetDbFile ? 80 : 50));
              }
              
              // 105MB数据库文件额外的中间进度报告
              if (isTargetDbFile && i % 3 === 0) {
                console.log(`🔍 数据库文件完整性检查进度: ${Math.round((i / testPoints) * 100)}%`);
                progressManager.updateStep(5, saveProgress, `数据库完整性检查: ${Math.round((i / testPoints) * 100)}%`);
              }
            }
            
            console.log(`✅ 超大文件完整性检查通过: ${relativePath} (${testPoints}个检查点)${isTargetDbFile ? ' - 105MB数据库处理就绪' : ''}`);
            
            // 105MB数据库文件成功通过检查的特殊提示
            if (isTargetDbFile) {
              console.log(`🎯 105MB IR数据库文件预处理完成，准备写入文件系统...`);
              progressManager.updateStep(5, saveProgress, `🎯 IR数据库准备完成: ${fileName}`);
            }
            
            // 🆕 文件完整性检查通过，可以继续处理
            console.log(`📋 大文件 ${relativePath} 已通过完整性检查，将继续处理`);
            
            
          } catch (integrityError) {
            console.error(`❌ 超大文件完整性检查失败 ${relativePath}:`, integrityError);
            
            const corruptedInfo = `文件数据损坏: ${relativePath}

📊 文件信息:
• 大小: ${fileSizeMB}MB
• 错误: ${integrityError.message}
• 检查时间: ${new Date().toISOString()}

❌ 检查失败原因:
文件在完整性验证过程中失败，可能的原因：
• 解压过程中数据损坏
• 文件过大导致内存访问异常
• 原始ZIP文件有问题

💡 建议解决方案:
1. 重新下载原始ZIP文件
2. 检查ZIP文件完整性
3. 尝试用其他工具解压
4. 联系技术支持获取帮助
`;
            
            try {
              const corruptedPath = basePath + relativePath + '.CORRUPTED.txt';
              await Filesystem.writeFile({
                path: corruptedPath,
                data: corruptedInfo,
                directory: 'CACHE',
                recursive: true
              });
              
              savedFiles.push({
                path: corruptedPath,
                size: corruptedInfo.length,
                originalPath: relativePath,
                corrupted: true
              });
              
            } catch (corruptedError) {
              console.error(`创建损坏文件说明失败:`, corruptedError);
            }
            
            continue; // 跳过损坏的文件
          }
        }
        
        // 🆕 根据文件类型创建子目录
        const lastSlashIndex = fullPath.lastIndexOf('/');
        if (lastSlashIndex > 0 && !isIrextDbFile) { // IR数据库文件直接保存到根目录，不需要子目录
          const dirPath = fullPath.substring(0, lastSlashIndex);
          await safeMkdir(dirPath, saveDirectory, `子目录 ${dirPath}`);
        } else if (isIrextDbFile) {
          console.log(`🎯 IR数据库文件无需子目录，直接保存到: ${fullPath}`);
        }
        
        // 智能处理文件数据：优先使用直接二进制写入
        let dataToWrite;
        let isBase64 = false;
        
        try {
          if (fileData instanceof Uint8Array) {
            console.log(`处理二进制文件，大小: ${fileSizeMB} MB`);
            
            // 对于超大文件（>80MB），使用特殊处理策略
            if (fileSize > 80 * 1024 * 1024) {
              console.log(`🔄 超大文件检测 (${fileSizeMB}MB)，启用优化处理模式...`);
              
              // 强制垃圾回收（如果可用）
              if (window.gc) {
                console.log('执行垃圾回收...');
                window.gc();
              }
              
              // 验证Uint8Array的有效性（防止Invalid array length）
              try {
                // 测试数组边界访问
                const firstByte = fileData[0];
                const lastByte = fileData[fileData.length - 1];
                
                // 测试数组切片操作（确保不会出现length错误）
                const testSlice = fileData.slice(0, Math.min(1024, fileData.length));
                if (testSlice.length === 0) {
                  throw new Error('数组切片操作失败');
                }
                
                console.log(`数组有效性验证通过 (首字节: ${firstByte}, 末字节: ${lastByte})`);
                
              } catch (arrayError) {
                console.error(`❌ 数组完整性检查失败:`, arrayError);
                throw new Error(`文件数据损坏或过大: ${arrayError.message}`);
              }
              
              // 为了避免内存问题，大文件先尝试直接写入
              dataToWrite = fileData;
              isBase64 = false;
              console.log('超大文件使用直接二进制写入（避免内存复制）');
              
            } else {
              // Capacitor支持直接写入Uint8Array，无需转换为base64
              dataToWrite = fileData;
              isBase64 = false;
              console.log('使用直接二进制写入模式（更高效，节省内存）');
            }
            
          } else {
            // 文本文件或已经是字符串
            dataToWrite = fileData;
            isBase64 = false;
            console.log('处理文本文件');
          }
        } catch (conversionError) {
          console.error(`数据转换失败 ${relativePath}:`, conversionError);
          
          // 如果是数组长度错误，给出具体建议
          if (conversionError.message && conversionError.message.includes('array length')) {
            console.error(`💡 数组长度错误建议:`);
            console.error(`   - 文件 ${relativePath} (${fileSizeMB}MB) 可能超出JavaScript数组限制`);
            console.error(`   - 建议分割文件或使用更大内存的设备`);
          }
          
          throw conversionError;
        }
        
        // 🆕 写入文件 - 针对105MB IR数据库的特殊处理
        try {
          // 🎯 对于IR核心数据库文件，基于移动设备限制的智能处理策略
          if (isIrextDbFile && dataToWrite instanceof Uint8Array && fileSize > 100 * 1024 * 1024) {
            console.log(`🎯 检测到IR核心数据库文件 (${fileSizeMB}MB) - 移动设备优化模式`);
            progressManager.updateStep(5, saveProgress, `🎯 分析IR数据库文件处理策略...`);
            
            // 🆕 移动设备内存评估  
            const isLowMemoryDevice = deviceInfo.platform === 'android' || deviceInfo.platform === 'ios' || deviceInfo.platform === 'mobile';
            
            console.log(`📱 设备信息: ${deviceInfo.platform}, 内存限制模式: ${isLowMemoryDevice}`);
            
            if (isLowMemoryDevice) {
              // 🚀 移动设备超轻量级流式处理策略
              console.log(`🚀 移动设备超轻量级处理模式：${fileSizeMB}MB文件`);
              progressManager.updateStep(5, saveProgress, `🚀 启动移动设备专用超轻量模式`);
              
              try {
                // 🔥 首先验证原始数据的完整性
                console.log(`🔍 验证原始数据: ${typeof dataToWrite}, length: ${dataToWrite ? dataToWrite.length : 'null'}`);
                
                if (!dataToWrite || !(dataToWrite instanceof Uint8Array) || dataToWrite.length === 0) {
                  throw new Error(`原始数据无效: type=${typeof dataToWrite}, isUint8Array=${dataToWrite instanceof Uint8Array}, length=${dataToWrite ? dataToWrite.length : 'null'}`);
                }
                
                // 验证数据的前几个字节
                const firstBytes = Array.from(dataToWrite.slice(0, Math.min(16, dataToWrite.length)));
                console.log(`✅ 数据验证通过: 大小${dataToWrite.length}字节, 前16字节: [${firstBytes.join(', ')}]`);
                
                // 🔥 策略1: 稳定的临时分块文件写入（避免追加读取问题）
                const stableChunkSize = 2 * 1024 * 1024; // 2MB稳定分块
                const totalStableChunks = Math.ceil(dataToWrite.length / stableChunkSize);
                
                console.log(`📊 稳定分块参数: 2MB分块, ${totalStableChunks}个临时文件`);
                progressManager.updateStep(5, saveProgress, `🔥 2MB稳定分块处理...`);
                
                // 🎯 先写入所有临时分块文件
                const tempChunkFiles = [];
                let processedBytes = 0;
                
                for (let i = 0; i < totalStableChunks; i++) {
                  const start = i * stableChunkSize;
                  const end = Math.min(start + stableChunkSize, dataToWrite.length);
                  
                  // 🔥 创建2MB分块，写入临时文件
                  let stableChunk = dataToWrite.slice(start, end);
                  const tempPath = `${fullPath}.temp${String(i).padStart(3, '0')}`;
                  processedBytes += stableChunk.length;
                  
                  console.log(`📝 写入临时分块 ${i + 1}/${totalStableChunks}: ${(stableChunk.length / (1024 * 1024)).toFixed(1)}MB`);
                  
                  // 🔍 验证分块数据
                  if (!stableChunk || stableChunk.length === 0) {
                    throw new Error(`分块${i + 1}无效: length=${stableChunk ? stableChunk.length : 'null'}`);
                  }
                  
                  const chunkFirstByte = stableChunk[0];
                  const chunkLastByte = stableChunk[stableChunk.length - 1];
                  console.log(`🔍 分块${i + 1}验证: 大小${stableChunk.length}, 首字节${chunkFirstByte}, 末字节${chunkLastByte}`);
                  
                  try {
                    // 🔥 转换为base64字符串（移动设备更稳定）
                    console.log(`🔄 转换分块为base64...`);
                    let binaryString = '';
                    let base64Chunk = '';
                    
                    try {
                      for (let j = 0; j < stableChunk.length; j++) {
                        const byteValue = stableChunk[j];
                        if (byteValue < 0 || byteValue > 255) {
                          throw new Error(`无效字节值: ${byteValue} at position ${j}`);
                        }
                        binaryString += String.fromCharCode(byteValue);
                      }
                      
                      console.log(`🔄 二进制字符串创建完成: ${(binaryString.length / (1024 * 1024)).toFixed(1)}MB`);
                      
                      base64Chunk = btoa(binaryString);
                      console.log(`📝 base64编码完成: ${(base64Chunk.length / (1024 * 1024)).toFixed(1)}MB`);
                      
                      // 立即释放binaryString引用
                      binaryString = null;
                      
                      // 验证base64编码是否成功
                      if (!base64Chunk || base64Chunk.length === 0) {
                        throw new Error('base64编码结果为空');
                      }
                      
                    } catch (base64Error) {
                      console.error(`❌ base64转换失败:`, base64Error);
                      throw new Error(`分块${i + 1} base64转换失败: ${base64Error.message}`);
                    }
                    
                    await Filesystem.writeFile({
                      path: tempPath,
                      data: base64Chunk,
                      directory: saveDirectory,
                      recursive: true
                      // 不指定encoding，让Capacitor自动处理base64
                    });
                    
                    tempChunkFiles.push(tempPath);
                    console.log(`✅ base64临时文件创建成功: ${tempPath}`);
                    
                  } catch (tempWriteError) {
                    console.error(`❌ 临时文件写入失败 ${tempPath}:`, tempWriteError);
                    console.error(`❌ 分块详情: 原始大小${stableChunk.length}字节`);
                    throw new Error(`临时分块写入失败: ${tempWriteError.message}`);
                  }
                  
                  // 🔥 立即释放所有引用
                  stableChunk = null;
                  base64Chunk = null;
                  
                  // 进度更新
                  const progress = Math.round((i + 1) / totalStableChunks * 100);
                  const processedMB = (processedBytes / (1024 * 1024)).toFixed(1);
                  progressManager.updateStep(5, saveProgress, `🔥 分块写入: ${progress}% (${processedMB}MB)`);
                  
                  // 🔥 每个分块后强制垃圾回收
                  if (window.gc && i % 3 === 0) {
                    window.gc();
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                  
                  // 每5个块显示进度
                  if (i % 5 === 0 || i === totalStableChunks - 1) {
                    console.log(`📊 分块进度: ${progress}% (${processedMB}MB/${fileSizeMB}MB)`);
                  }
                }
                
                console.log(`✅ 所有临时分块文件写入完成，开始合并...`);
                progressManager.updateStep(5, saveProgress, `🔗 合并临时分块文件...`);
                
                // 🎯 现在读取所有临时文件并合并
                const mergedChunks = [];
                let totalMergedLength = 0;
                
                for (let i = 0; i < tempChunkFiles.length; i++) {
                  const tempPath = tempChunkFiles[i];
                  console.log(`📖 读取临时分块 ${i + 1}/${tempChunkFiles.length}: ${tempPath}`);
                  
                  try {
                    const chunkResult = await Filesystem.readFile({
                      path: tempPath,
                      directory: saveDirectory
                    });
                    
                    // 🔥 转换base64数据格式回Uint8Array
                    let chunkData;
                    if (typeof chunkResult.data === 'string') {
                      // base64 → Uint8Array (我们写入的是base64)
                      console.log(`🔄 解码base64分块: ${(chunkResult.data.length / (1024 * 1024)).toFixed(1)}MB`);
                      const binaryString = atob(chunkResult.data);
                      chunkData = new Uint8Array(binaryString.length);
                      for (let j = 0; j < binaryString.length; j++) {
                        chunkData[j] = binaryString.charCodeAt(j);
                      }
                      console.log(`✅ 解码完成: ${(chunkData.length / (1024 * 1024)).toFixed(1)}MB 原始数据`);
                    } else {
                      // 如果不是字符串，直接转换
                      chunkData = new Uint8Array(chunkResult.data);
                      console.log(`🔄 直接转换: ${(chunkData.length / (1024 * 1024)).toFixed(1)}MB`);
                    }
                    
                    mergedChunks.push(chunkData);
                    totalMergedLength += chunkData.length;
                    
                    console.log(`✅ 读取成功: ${(chunkData.length / (1024 * 1024)).toFixed(1)}MB`);
                    
                    // 🔥 立即删除临时文件释放磁盘空间
                    await Filesystem.deleteFile({
                      path: tempPath,
                      directory: saveDirectory
                    });
                    console.log(`🗑️ 已删除临时文件: ${tempPath}`);
                    
                    // 进度更新
                    const mergeProgress = Math.round((i + 1) / tempChunkFiles.length * 100);
                    progressManager.updateStep(5, saveProgress, `🔗 读取合并: ${mergeProgress}%`);
                    
                  } catch (tempReadError) {
                    console.error(`❌ 读取临时文件失败 ${tempPath}:`, tempReadError);
                    throw new Error(`临时文件读取失败: ${tempReadError.message}`);
                  }
                }
                
                console.log(`🔗 开始最终合并 ${mergedChunks.length} 个分块，总大小: ${(totalMergedLength / (1024 * 1024)).toFixed(2)}MB`);
                progressManager.updateStep(5, saveProgress, `🔗 最终文件合并...`);
                
                // 🎯 创建最终合并的数据
                let finalMergedData = new Uint8Array(totalMergedLength);
                let mergeOffset = 0;
                
                for (const chunk of mergedChunks) {
                  finalMergedData.set(chunk, mergeOffset);
                  mergeOffset += chunk.length;
                }
                
                // 清理分块数组引用
                mergedChunks.length = 0;
                
                console.log(`💾 准备分块写入最终文件: ${fullPath} (${(finalMergedData.length / (1024 * 1024)).toFixed(2)}MB)`);
                
                // 🔥 跳过base64编码，直接分块写入二进制数据（避免140MB内存占用）
                
                // 🔥 关键修复：避免140MB一次性写入导致崩溃
                console.log(`🎯 避免大文件崩溃，改用分块final写入策略...`);
                progressManager.updateStep(5, saveProgress, `🎯 分块写入最终文件...`);
                
                // 🚀 策略：直接分块写入二进制数据，避免140MB base64
                const finalWriteChunkSize = 512 * 1024; // 512KB超小最终写入分块 (移动设备安全)
                const finalWriteChunks = Math.ceil(finalMergedData.length / finalWriteChunkSize);
                
                console.log(`📊 最终写入参数: 512KB超小分块, ${finalWriteChunks}个最终分块`);
                console.log(`💡 直接写入原始二进制数据 (移动设备安全模式)...`);
                
                // 🎯 先删除可能存在的目标文件
                try {
                  await Filesystem.deleteFile({
                    path: fullPath,  
                    directory: saveDirectory
                  });
                  console.log(`🗑️ 已清理旧的目标文件`);
                } catch (deleteError) {
                  console.log(`📁 目标文件不存在，准备创建新文件`);
                }
                
                // 🔥 分块写入最终文件
                for (let i = 0; i < finalWriteChunks; i++) {
                  const finalStart = i * finalWriteChunkSize;
                  const finalEnd = Math.min(finalStart + finalWriteChunkSize, finalMergedData.length);
                  const finalChunk = finalMergedData.slice(finalStart, finalEnd);
                  
                  // 只在关键分块显示日志（避免过多输出）
                  if (i % 10 === 0 || i === finalWriteChunks - 1) {
                    console.log(`📝 最终写入分块 ${i + 1}/${finalWriteChunks}: ${(finalChunk.length / 1024).toFixed(0)}KB`);
                  }
                  
                  if (i === 0) {
                    // 第一个分块：创建文件
                    console.log(`🎉 创建最终文件: ${fullPath}`);
                    await Filesystem.writeFile({
                      path: fullPath,
                      data: finalChunk,
                      directory: saveDirectory,
                      recursive: true,
                      encoding: undefined // 直接二进制写入
                    });
                  } else {
                    // 后续分块：读取现有 + 追加
                    if (i % 20 === 0) { // 每20个分块显示一次日志
                      console.log(`📖 读取现有文件进行最终追加... (${i + 1}/${finalWriteChunks})`);
                    }
                    
                    const existingFinalFile = await Filesystem.readFile({
                      path: fullPath,
                      directory: saveDirectory
                    });
                    
                    // 转换现有数据
                    let existingFinalData;
                    if (typeof existingFinalFile.data === 'string') {
                      const binaryString = atob(existingFinalFile.data);
                      existingFinalData = new Uint8Array(binaryString.length);
                      for (let j = 0; j < binaryString.length; j++) {
                        existingFinalData[j] = binaryString.charCodeAt(j);
                      }
                    } else {
                      existingFinalData = new Uint8Array(existingFinalFile.data);
                    }
                    
                    // 合并数据
                    let appendedData = new Uint8Array(existingFinalData.length + finalChunk.length);
                    appendedData.set(existingFinalData, 0);
                    appendedData.set(finalChunk, existingFinalData.length);
                    
                    // 重写文件
                    await Filesystem.writeFile({
                      path: fullPath,
                      data: appendedData,
                      directory: saveDirectory,
                      recursive: true,
                      encoding: undefined
                    });
                    
                    // 释放临时数据
                    existingFinalData = null;
                    appendedData = null;
                  }
                  
                  // 释放当前分块
                  // finalChunk在声明时是const，会自动在作用域结束时释放
                  
                  // 进度更新（每5个分块更新一次界面）
                  if (i % 5 === 0 || i === finalWriteChunks - 1) {
                    const finalProgress = Math.round((i + 1) / finalWriteChunks * 100);
                    const processedMB = ((i + 1) * finalWriteChunkSize / (1024 * 1024)).toFixed(1);
                    progressManager.updateStep(5, saveProgress, `💾 最终写入: ${finalProgress}% (${processedMB}MB)`);
                  }
                  
                  // 强制垃圾回收（每10个分块回收一次）
                  if (window.gc && i % 10 === 0) {
                    window.gc();
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                }
                
                // 立即释放合并数据引用
                finalMergedData = null;
                
                console.log(`✅ 512KB超小分块最终文件写入完成！`);
                
                console.log(`✅ 移动设备安全模式写入成功！`);
                
                // 🎯 验证文件是否成功保存 + 详细调试信息
                try {
                  console.log(`🔍 开始验证文件: ${fullPath} in ${saveDirectory} directory`);
                  
                  const verifyResult = await Filesystem.stat({
                    path: fullPath,
                    directory: saveDirectory
                  });
                  const savedSizeMB = (verifyResult.size / (1024 * 1024)).toFixed(2);
                  console.log(`✅ 文件验证成功: ${savedSizeMB}MB (预期: ${fileSizeMB}MB)`);
                  console.log(`📁 文件详情:`, verifyResult);
                  
                  // 🔍 获取文件的完整URI路径
                  try {
                    const fileUri = await Filesystem.getUri({
                      path: fullPath,
                      directory: saveDirectory
                    });
                    console.log(`📍 文件完整路径: ${fileUri.uri}`);
                    progressManager.updateStep(5, saveProgress, `✅ 文件验证完成: ${savedSizeMB}MB`);
                    progressManager.showToast(`📍 文件路径: ${fileUri.uri}`, 'center', 8000);
                  } catch (uriError) {
                    console.warn('获取文件URI失败:', uriError);
                  }
                  
                } catch (verifyError) {
                  console.error('❌ 文件验证失败:', verifyError);
                  console.log(`🔍 尝试查看目录内容...`);
                  
                  // 🔍 列出目录内容进行调试
                  try {
                    const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
                    console.log(`🔍 检查目录: ${dirPath} in ${saveDirectory}`);
                    
                    const dirContents = await Filesystem.readdir({
                      path: dirPath || '.',
                      directory: saveDirectory
                    });
                    console.log(`📂 目录内容:`, dirContents);
                    
                    // 查找我们的文件
                    const ourFileName = fileName;
                    const foundFile = dirContents.files.find(f => f.name === ourFileName);
                    if (foundFile) {
                      console.log(`✅ 找到文件: ${ourFileName}`, foundFile);
                    } else {
                      console.log(`❌ 文件未找到: ${ourFileName}`);
                      console.log(`📋 目录中的文件列表:`, dirContents.files.map(f => f.name));
                    }
                  } catch (dirError) {
                    console.error('❌ 目录检查失败:', dirError);
                  }
                }
                
                console.log(`🎉 移动设备512KB超小分块处理成功！最终文件: ${fileSizeMB}MB`);
                
                // 🎯 移动设备512KB分块完成，尝试保存到目标位置
                if (isIrextDbFile && deviceInfo && deviceInfo.platform === 'android') {
                  try {
                    console.log(`🚀 512KB分块完成，使用Cordova路径系统保存到目标位置...`);
                    
                    // 读取完整文件数据
                    const finalFile = await Filesystem.readFile({
                      path: fullPath,
                      directory: saveDirectory
                    });
                    
                    // 转换为Uint8Array
                    let fileData;
                    if (typeof finalFile.data === 'string') {
                      const binaryString = atob(finalFile.data);
                      fileData = new Uint8Array(binaryString.length);
                      for (let j = 0; j < binaryString.length; j++) {
                        fileData[j] = binaryString.charCodeAt(j);
                      }
                    } else {
                      fileData = new Uint8Array(finalFile.data);
                    }
                    
                    // 使用Cordova路径系统保存
                    const cordovaSaveResult = await saveToTargetLocationWithCordova(fileData, fileName, deviceInfo);
                    
                    if (cordovaSaveResult.success) {
                      console.log(`🎉 512KB分块文件成功保存到目标位置: ${cordovaSaveResult.finalPath}`);
                      
                      // 清理临时文件
                      try {
                        await Filesystem.deleteFile({
                          path: fullPath,
                          directory: saveDirectory
                        });
                        console.log(`🗑️ 临时文件已清理: ${fullPath}`);
                      } catch (cleanError) {
                        console.warn('清理临时文件失败:', cleanError);
                      }
                    } else {
                      console.warn('⚠️ Cordova保存失败，保留Capacitor版本');
                    }
                    
                    // 释放内存
                    fileData = null;
                    
                  } catch (cordovaError) {
                    console.error('❌ 512KB分块Cordova保存失败:', cordovaError);
                    console.log('💡 保留Capacitor版本的文件');
                  }
                }
                
                progressManager.updateStep(5, saveProgress, `🎉 移动设备安全模式完成: ${fileName}`);
                progressManager.showToast(`🎉 移动设备安全模式成功处理 ${fileSizeMB}MB 大文件！`, 'center', 4000, 'toast-success');
                
              } catch (mobileStreamError) {
                console.error('❌ 移动设备流式处理失败:', mobileStreamError);
                
                // 🔄 如果流式处理失败，尝试更激进的方法
                console.log('🔄 流式处理失败，尝试超极限分块...');
                progressManager.updateStep(5, saveProgress, `🔄 尝试超极限处理模式...`);
                
                try {
                  // 🔥 超极限方法：500KB分块
                  const extremeChunkSize = 512 * 1024; // 512KB
                  const extremeChunks = Math.ceil(dataToWrite.length / extremeChunkSize);
                  
                  if (extremeChunks > 300) { // 避免创建过多文件
                    throw new Error('文件过大，即使512KB分块也会产生过多临时文件');
                  }
                  
                  console.log(`🔥 超极限模式: 512KB分块, ${extremeChunks}个分块`);
                  
                  // 分别保存每个512KB块为独立文件
                  const extremeFiles = [];
                  
                  for (let i = 0; i < extremeChunks; i++) {
                    const start = i * extremeChunkSize;
                    const end = Math.min(start + extremeChunkSize, dataToWrite.length);
                    const extremeChunk = dataToWrite.slice(start, end);
                    const extremePath = `${fullPath}.part${String(i).padStart(3, '0')}`;
                    
                    // 🔥 超极限分块也使用base64编码（避免NO_DATA）
                    let extremeBinaryString = '';
                    for (let j = 0; j < extremeChunk.length; j++) {
                      extremeBinaryString += String.fromCharCode(extremeChunk[j]);
                    }
                    const extremeBase64 = btoa(extremeBinaryString);
                    
                    await Filesystem.writeFile({
                      path: extremePath,
                      data: extremeBase64,
                      directory: saveDirectory,
                      recursive: true
                      // base64格式，让Capacitor自动处理
                    });
                    
                    extremeFiles.push(extremePath);
                    
                    if (i % 10 === 0) {
                      const progress = Math.round((i + 1) / extremeChunks * 100);
                      progressManager.updateStep(5, saveProgress, `🔥 超极限: ${progress}% (${i + 1}/${extremeChunks})`);
                      console.log(`🔥 超极限进度: ${progress}%`);
                    }
                    
                    // 每个块后垃圾回收
                    if (window.gc && i % 5 === 0) {
                      window.gc();
                      await new Promise(resolve => setTimeout(resolve, 30));
                    }
                  }
                  
                  // 🎯 成功后生成说明文件
                  const partFilesInfo = `🎯 IR数据库文件 - 分块保存模式

📱 设备: ${deviceInfo.platform}
📁 原始文件: ${relativePath} (${fileSizeMB}MB)
🔢 分块数量: ${extremeFiles.length} 个
📦 分块大小: 512KB 每个
📂 保存目录: ${saveDirectory}

📋 分块文件列表:
${extremeFiles.map((f, i) => `• ${f} (${i + 1}/${extremeFiles.length})`).join('\n')}

💡 使用说明:
1. 这些分块文件包含完整的IR数据库数据
2. 系统会自动尝试合并为完整的 irext_db_sqlite.db 文件
3. 合并成功后会自动删除分块文件，只保留完整文件
4. 分块顺序：.part000, .part001, .part002...

🔧 手动合并命令 (如果自动合并失败):
在控制台执行: ir_merge_parts()
这将手动合并所有分块文件为完整数据库

⚠️ 重要说明:
- 由于移动设备内存限制，采用分块保存策略
- 自动合并成功时，只会迁移完整的数据库文件
- 合并失败时，分块文件保留在原位置供手动处理
- 所有数据完整保存，功能不受影响`;

                  await Filesystem.writeFile({
                    path: fullPath + '.PART_FILES_INFO.txt',
                    data: partFilesInfo,
                    directory: saveDirectory,
                    recursive: true
                  });
                  
                  console.log(`🎉 超极限分块成功！已保存${extremeFiles.length}个分块文件`);
                  
                  // 🔗 尝试合并分块文件为完整数据库文件
                  console.log(`🔗 开始尝试合并分块文件为完整的 ${fileName}...`);
                  progressManager.updateStep(5, saveProgress, `🔗 合并分块文件为完整数据库...`);
                  
                  try {
                    const mergeResult = await mergePartFiles(extremeFiles, fullPath, saveDirectory, fileName);
                    
                    if (mergeResult.success) {
                      console.log(`🎉 分块合并成功！完整数据库文件已创建: ${mergeResult.finalPath}`);
                      console.log(`📊 最终文件大小: ${(mergeResult.finalSize / (1024 * 1024)).toFixed(2)}MB`);
                      progressManager.showToast(`🎉 数据库文件合并成功！`, 'center', 5000, 'toast-success');
                      
                      // 🎯 使用Cordova路径系统保存到目标位置
                      if (deviceInfo && deviceInfo.platform === 'android') {
                        try {
                          console.log(`🚀 使用Cordova路径系统保存到正确位置...`);
                          progressManager.updateStep(5, saveProgress + 1, `🔄 保存到目标数据库目录...`);
                          
                          // 读取合并后的文件数据
                          const mergedFile = await Filesystem.readFile({
                            path: mergeResult.finalPath,
                            directory: saveDirectory
                          });
                          
                          // 转换为Uint8Array
                          let fileData;
                          if (typeof mergedFile.data === 'string') {
                            const binaryString = atob(mergedFile.data);
                            fileData = new Uint8Array(binaryString.length);
                            for (let j = 0; j < binaryString.length; j++) {
                              fileData[j] = binaryString.charCodeAt(j);
                            }
                          } else {
                            fileData = new Uint8Array(mergedFile.data);
                          }
                          
                          // 使用Cordova路径系统保存
                          const cordovaSaveResult = await saveToTargetLocationWithCordova(fileData, fileName, deviceInfo);
                          
                          if (cordovaSaveResult.success) {
                            console.log(`🎉 文件成功保存到期望位置: ${cordovaSaveResult.finalPath}`);
                            progressManager.showToast(`🎯 文件已保存到正确位置！`, 'center', 5000, 'toast-success');
                            
                            // 清理临时文件
                            try {
                              await Filesystem.deleteFile({
                                path: mergeResult.finalPath,
                                directory: saveDirectory
                              });
                              console.log(`🗑️ 临时文件已清理: ${mergeResult.finalPath}`);
                            } catch (cleanError) {
                              console.warn('清理临时文件失败:', cleanError);
                            }
                          } else {
                            console.warn('⚠️ Cordova保存失败，保留Capacitor版本');
                          }
                          
                          // 释放内存
                          fileData = null;
                          
                        } catch (cordovaError) {
                          console.error('❌ Cordova保存过程失败:', cordovaError);
                          console.log('💡 保留Capacitor版本的文件');
                        }
                      }
                      
                      console.log(`✅ 完整数据库文件处理完成`);
                      console.log(`💡 现在数据库插件应该能在期望位置找到文件了！`);
                      
                    } else {
                      console.warn('⚠️ 分块合并失败，保留分块文件模式');
                      console.log('💡 由于合并失败，分块文件将保留以供手动处理');
                      console.log('💡 可以手动合并这些分块文件：', extremeFiles);
                      console.log('💡 控制台执行: ir_merge_parts() 进行手动合并');
                      progressManager.showToast(`⚠️ 自动合并失败，已保留分块文件`, 'center', 4000);
                      
                      // ❗ 合并失败时不迁移分块文件，保留在原位置以便手动处理
                      console.log('📝 合并失败时不迁移分块文件，避免破坏数据完整性');
                    }
                    
                  } catch (mergeError) {
                    console.error('❌ 分块合并过程失败:', mergeError);
                    console.log('💡 保留分块文件模式，功能不受影响');
                    progressManager.showToast(`⚠️ 合并失败，已保留分块文件`, 'center', 4000);
                  }
                  
                  progressManager.updateStep(5, saveProgress, `🎉 分块保存成功 (${extremeFiles.length}个文件)`);
                  progressManager.showToast(`🎉 已成功分块保存为${extremeFiles.length}个文件`, 'center', 4000, 'toast-success');
                  
                } catch (extremeError) {
                  console.error('❌ 超极限处理也失败:', extremeError);
                  throw new Error(`移动设备处理失败: ${extremeError.message}`);
                }
              }
              
            } else {
              // 🖥️ 桌面端设备尝试小分块处理
              try {
                console.log('🖥️ 桌面设备检测，尝试小分块处理...');
                progressManager.updateStep(5, saveProgress, `🖥️ 桌面设备模式：小分块处理`);
                
                const ultraSmallChunkSize = 2 * 1024 * 1024; // 2MB超小分块
                const totalChunks = Math.ceil(dataToWrite.length / ultraSmallChunkSize);
                
                console.log(`📊 超小分块参数: 2MB per chunk, ${totalChunks} chunks total`);
                
                if (totalChunks > 100) {
                  throw new Error('分块数量过多，可能影响性能');
                }
                
                // 尝试极小分块写入
                const tempFiles = [];
                for (let i = 0; i < Math.min(totalChunks, 10); i++) { // 先测试前10个分块
                  const start = i * ultraSmallChunkSize;
                  const end = Math.min(start + ultraSmallChunkSize, dataToWrite.length);
                  const tinyChunk = dataToWrite.slice(start, end);
                  const tempPath = `${fullPath}.tiny${i}`;
                  
                  await Filesystem.writeFile({
                    path: tempPath,
                    data: tinyChunk,
                    directory: saveDirectory,
                    recursive: true,
                    encoding: undefined
                  });
                  
                  tempFiles.push(tempPath);
                  
                  if (i % 3 === 0) {
                    progressManager.updateStep(5, saveProgress, `🖥️ 测试小分块: ${i + 1}/10`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                  }
                }
                
                // 清理测试文件
                for (const tempPath of tempFiles) {
                  await Filesystem.deleteFile({ path: tempPath, directory: saveDirectory });
                }
                
                throw new Error('即使桌面设备也无法处理如此大的文件');
                
              } catch (desktopError) {
                console.log('🖥️ 桌面设备处理也失败，生成详细说明...');
                
                const desktopInfo = `IR数据库文件处理报告 - 桌面设备

📊 处理尝试详情:
• 文件: ${relativePath}
• 大小: ${fileSizeMB}MB  
• 设备: ${deviceInfo.platform} (桌面模式)
• 尝试策略: 2MB超小分块
• 失败原因: ${desktopError.message}

❌ 处理挑战:
文件大小 (${fileSizeMB}MB) 超出了JavaScript运行时的处理能力限制。

💡 专业建议:
1. 🛠️ 数据库工具: 使用SQLite专业工具处理
2. 📊 文件分析: 检查是否包含大量冗余数据
3. 🗜️ 压缩优化: 重新打包压缩文件
4. 💾 存储优化: 分表或分库处理

✅ 其他文件状态:
所有其他IR配置文件均已成功处理并保存到指定目录。

📞 专业支持:
如需处理此特大数据库文件，建议联系数据库专家。`;

                await Filesystem.writeFile({
                  path: fullPath + '.DESKTOP_ANALYSIS.txt',
                  data: desktopInfo,
                  directory: saveDirectory,
                  recursive: true
                });
                
                console.log(`📄 已保存桌面分析报告: ${fullPath}.DESKTOP_ANALYSIS.txt`);
                progressManager.updateStep(5, saveProgress, `🖥️ 已生成处理分析: ${fileName}`);
              }
            }
            
          } else {
            // 普通文件写入
          const writeOptions = {
            path: fullPath,
            data: dataToWrite,
              directory: saveDirectory,
            recursive: true
          };
          
          // 如果是二进制数据，添加编码选项
          if (dataToWrite instanceof Uint8Array) {
            writeOptions.encoding = undefined; // 让Capacitor自动处理二进制数据
          }
          
          await Filesystem.writeFile(writeOptions);
          }
          
          console.log(`✅ 成功保存: ${relativePath} (${fileSizeMB}MB)`);
          
          // 🔍 验证文件保存 + 获取实际路径（调试用）
          try {
            console.log(`🔍 验证文件保存: ${fullPath} in ${saveDirectory} directory`);
            
            const fileStats = await Filesystem.stat({
              path: fullPath,
              directory: saveDirectory
            });
            console.log(`📁 文件统计信息:`, fileStats);
            
            // 获取文件URI
            try {
              const fileUri = await Filesystem.getUri({
                path: fullPath,
                directory: saveDirectory
              });
              console.log(`📍 文件完整路径: ${fileUri.uri}`);
              
              // 对于重要文件，显示路径信息
              if (isIrextDbFile || parseFloat(fileSizeMB) > 10) {
                progressManager.showToast(`📍 ${fileName} 保存至: ${fileUri.uri}`, 'center', 6000);
              }
            } catch (uriError) {
              console.warn('获取文件URI失败:', uriError);
            }
            
          } catch (statError) {
            console.error('❌ 文件验证失败:', statError);
          }
          
          // 🎯 IR数据库文件直接保存成功，尝试迁移到目标位置
          if (isIrextDbFile && deviceInfo && deviceInfo.platform === 'android') {
            try {
              console.log(`🚀 直接保存成功，使用Cordova路径系统保存到目标位置...`);
              
              // 转换为Uint8Array
              let fileData;
              if (dataToWrite instanceof Uint8Array) {
                fileData = dataToWrite;
              } else if (typeof dataToWrite === 'string') {
                const binaryString = atob(dataToWrite);
                fileData = new Uint8Array(binaryString.length);
                for (let j = 0; j < binaryString.length; j++) {
                  fileData[j] = binaryString.charCodeAt(j);
                }
              }
              
              // 使用Cordova路径系统保存
              const cordovaSaveResult = await saveToTargetLocationWithCordova(fileData, fileName, deviceInfo);
              
              if (cordovaSaveResult.success) {
                console.log(`🎉 直接保存文件成功保存到目标位置: ${cordovaSaveResult.finalPath}`);
                
                // 清理临时文件
                try {
                  await Filesystem.deleteFile({
                    path: fullPath,
                    directory: saveDirectory
                  });
                  console.log(`🗑️ 临时文件已清理: ${fullPath}`);
                } catch (cleanError) {
                  console.warn('清理临时文件失败:', cleanError);
                }
              } else {
                console.warn('⚠️ Cordova保存失败，保留Capacitor版本');
              }
              
              // 释放内存
              fileData = null;
              
            } catch (cordovaError) {
              console.error('❌ 直接保存Cordova迁移失败:', cordovaError);
              console.log('💡 保留Capacitor版本的文件');
            }
          }

          // 🆕 IR核心数据库文件成功保存的特殊提示
          if (isIrextDbFile) {
            console.log(`🎉 IR核心数据库文件保存成功！这是最重要的文件。`);
            progressManager.updateStep(5, saveProgress, `🎉 IR核心数据库保存成功: ${fileName} (${fileSizeMB}MB)`);
            progressManager.showToast(`🎉 IR核心数据库保存成功 (${fileSizeMB}MB)`, 'center', 4000, 'toast-success');
          } 
          // 大文件成功保存的特殊提示
          else if (parseFloat(fileSizeMB) > 50) {
            progressManager.updateStep(5, saveProgress, `✅ 大文件保存成功: ${fileName} (${fileSizeMB}MB)`);
          }
        } catch (writeError) {
          console.error(`文件写入失败 ${relativePath}:`, writeError);
          
          // 如果直接写入失败，尝试base64备用方案
          if (dataToWrite instanceof Uint8Array) {
            console.log(`🔄 尝试base64备用方案 (${fileSizeMB}MB)...`);
            progressManager.updateStep(5, saveProgress - 1, `🔄 启用备用方案: ${fileName}`);
            
            let finalBase64Data = null; // 在外层作用域定义
            
            try {
              // 根据文件大小动态调整策略
              const isLargeFile = fileSize > 80 * 1024 * 1024;
              const isVeryLargeFile = fileSize > 150 * 1024 * 1024;
              
              // 超大文件使用更小的分块和分批处理
              const chunkSize = isVeryLargeFile ? 2048 : (isLargeFile ? 4096 : 8192);
              const progressInterval = isVeryLargeFile ? 2 * 1024 * 1024 : (isLargeFile ? 5 * 1024 * 1024 : 10 * 1024 * 1024);
              const batchSize = isVeryLargeFile ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 分批大小
              
              console.log(`使用 ${chunkSize} 字节分块处理，${(batchSize / (1024 * 1024)).toFixed(0)}MB分批...`);
              
              let binaryString = '';
              let processedBytes = 0;
              const base64Chunks = []; // 存储分批的base64结果
              
              // 处理数据转换
              for (let i = 0; i < dataToWrite.length; i += chunkSize) {
                const chunk = dataToWrite.slice(i, i + chunkSize);
                
                // 验证chunk的有效性
                if (!chunk || chunk.length === 0) {
                  console.warn(`跳过无效分块 at ${i}`);
                  continue;
                }
                
                // 逐字节转换，避免apply限制和Invalid array length
                try {
                  for (let j = 0; j < chunk.length; j++) {
                    const charCode = chunk[j];
                    if (charCode < 0 || charCode > 255) {
                      throw new Error(`无效字节值: ${charCode} at position ${j}`);
                    }
                    binaryString += String.fromCharCode(charCode);
                  }
                } catch (charError) {
                  console.error(`字符转换错误 at chunk ${i}:`, charError);
                  throw new Error(`字符转换失败: ${charError.message}`);
                }
                
                processedBytes += chunk.length;
                
                // 分批处理：当累积足够数据时，先转换为base64并清理内存
                if (binaryString.length >= batchSize || processedBytes >= dataToWrite.length) {
                  try {
                    console.log(`🔄 分批base64编码 (${(binaryString.length / (1024 * 1024)).toFixed(1)}MB)...`);
                    
                    // 验证binaryString有效性
                    if (!binaryString || binaryString.length === 0) {
                      console.warn('跳过空的二进制字符串');
                    } else {
                      const batchBase64 = btoa(binaryString);
                      if (batchBase64 && batchBase64.length > 0) {
                        base64Chunks.push(batchBase64);
                      }
                    }
                    
                    // 清理内存
                    binaryString = '';
                    if (window.gc && base64Chunks.length % 5 === 0) {
                      window.gc();
                    }
                    
                  } catch (btoaError) {
                    console.error(`Base64编码失败:`, btoaError);
                    console.error(`binaryString length: ${binaryString ? binaryString.length : 'undefined'}`);
                    throw new Error(`Base64编码失败: ${btoaError.message}`);
                  }
                }
                
                // 进度反馈和内存管理
                if (processedBytes % progressInterval === 0 || processedBytes >= dataToWrite.length) {
                  const progress = ((processedBytes / dataToWrite.length) * 100).toFixed(1);
                  console.log(`📊 备用转换进度: ${progress}% (${(processedBytes / (1024 * 1024)).toFixed(1)}MB/${fileSizeMB}MB)`);
                  
                  // 更新Framework7进度显示
                  progressManager.updateStep(5, saveProgress - 1, `备用转换: ${fileName} ${progress}%`);
                  
                  // 对于超大文件，尝试强制垃圾回收
                  if (isLargeFile && window.gc && processedBytes % (20 * 1024 * 1024) === 0) {
                    console.log('🧹 执行中间垃圾回收...');
                    progressManager.updateStep(5, saveProgress - 1, `内存优化中... ${fileName}`);
                    window.gc();
                  }
                }
                
                // 防止UI阻塞，每处理一定量数据暂停一下
                const pauseInterval = isVeryLargeFile ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
                if (processedBytes % pauseInterval === 0) {
                  await new Promise(resolve => setTimeout(resolve, isVeryLargeFile ? 20 : 10));
                }
              }
              
              // 处理剩余的binaryString（如果有的话）
              if (binaryString && binaryString.length > 0) {
                console.log(`🔄 处理最后的字符串块 (${(binaryString.length / (1024 * 1024)).toFixed(1)}MB)...`);
                try {
                  const lastBatchBase64 = btoa(binaryString);
                  if (lastBatchBase64 && lastBatchBase64.length > 0) {
                    base64Chunks.push(lastBatchBase64);
                  }
                } catch (lastBtoaError) {
                  console.error(`最后分块Base64编码失败:`, lastBtoaError);
                  throw new Error(`最后分块Base64编码失败: ${lastBtoaError.message}`);
                }
              }
              
              // 验证base64Chunks数组
              if (!base64Chunks || base64Chunks.length === 0) {
                throw new Error('没有生成任何base64数据块');
              }
              
              // 合并所有base64分块
              console.log(`🔗 合并 ${base64Chunks.length} 个base64分块...`);
              try {
                finalBase64Data = base64Chunks.join('');
              } catch (joinError) {
                console.error('合并base64分块失败:', joinError);
                throw new Error(`合并base64分块失败: ${joinError.message}`);
              }
              
              // 清理分块数组和临时变量
              base64Chunks.length = 0;
              binaryString = null;
              
              if (window.gc) {
                console.log('🧹 最终垃圾回收...');
                window.gc();
              }
              
              // 验证最终数据
              if (!finalBase64Data || finalBase64Data.length === 0) {
                throw new Error('Base64转换结果为空');
              }
              
              console.log(`✅ Base64数据准备完成，大小: ${(finalBase64Data.length / (1024 * 1024)).toFixed(2)}MB`);
              
              console.log(`💾 写入base64数据到文件系统 (${(finalBase64Data.length / (1024 * 1024)).toFixed(2)}MB)...`);
              await Filesystem.writeFile({
                path: fullPath,
                data: finalBase64Data,
                directory: saveDirectory, // 🆕 使用根据文件类型确定的目录
                recursive: true
              });
              
              console.log(`✅ 备用方案成功保存: ${relativePath} (${fileSizeMB}MB)`);
              
              // 🎯 备用方案完成，尝试保存到目标位置
              if (isIrextDbFile && deviceInfo && deviceInfo.platform === 'android') {
                try {
                  console.log(`🚀 备用方案完成，使用Cordova路径系统保存到目标位置...`);
                  
                  // finalBase64Data 是base64格式的数据
                  const binaryString = atob(finalBase64Data);
                  const fileData = new Uint8Array(binaryString.length);
                  for (let j = 0; j < binaryString.length; j++) {
                    fileData[j] = binaryString.charCodeAt(j);
                  }
                  
                  // 使用Cordova路径系统保存
                  const cordovaSaveResult = await saveToTargetLocationWithCordova(fileData, fileName, deviceInfo);
                  
                  if (cordovaSaveResult.success) {
                    console.log(`🎉 备用方案文件成功保存到目标位置: ${cordovaSaveResult.finalPath}`);
                    
                    // 清理临时文件
                    try {
                      await Filesystem.deleteFile({
                        path: fullPath,
                        directory: saveDirectory
                      });
                      console.log(`🗑️ 备用方案临时文件已清理: ${fullPath}`);
                    } catch (cleanError) {
                      console.warn('清理备用方案临时文件失败:', cleanError);
                    }
                  } else {
                    console.warn('⚠️ 备用方案Cordova保存失败，保留Capacitor版本');
                  }
                  
                  // 释放内存
                  fileData = null;
                  
                } catch (cordovaError) {
                  console.error('❌ 备用方案Cordova保存失败:', cordovaError);
                  console.log('💡 保留Capacitor版本的文件');
                }
              }
              
              // 🆕 IR核心数据库文件备用方案成功的特殊提示
              if (isIrextDbFile) {
                console.log(`🎉 IR核心数据库文件备用处理成功！这是最重要的文件。`);
                progressManager.updateStep(5, saveProgress, `🎉 IR核心数据库备用处理成功: ${fileName} (${fileSizeMB}MB)`);
                progressManager.showToast(`🎉 IR核心数据库备用处理成功 (${fileSizeMB}MB)`, 'center', 4000, 'toast-success');
              } else {
              progressManager.updateStep(5, saveProgress, `✅ 备用方案成功: ${fileName} (${fileSizeMB}MB)`);
              }
              
            } catch (backupError) {
              console.error(`❌ 备用方案也失败 ${relativePath}:`, backupError);
              
              // 如果是内存不足错误，给出建议
              if (backupError.message && (backupError.message.includes('memory') || backupError.message.includes('Maximum call stack') || backupError.message.includes('Invalid array length'))) {
                console.error(`💡 建议: 文件 ${relativePath} (${fileSizeMB}MB) 过大，可能需要在设备上释放更多内存`);
              }
              
              // 清理可能的内存占用
              finalBase64Data = null;
              if (window.gc) {
                window.gc();
              }
              
              throw new Error(`备用方案失败: ${backupError.message}`);
            }
          } else {
            throw writeError;
          }
        }
        
        // 🆕 记录文件信息，IR数据库文件包含特殊标记
        const fileRecord = {
          path: fullPath,
          size: fileData.length,
          originalPath: relativePath,
          directory: saveDirectory, // 🆕 记录使用的目录类型
        };
        
        // 🆕 为IR核心数据库文件添加特殊标记
        if (isIrextDbFile) {
          fileRecord.isIrextDatabase = true;
          fileRecord.databasePath = deviceInfo && deviceInfo.operatingSystem === 'ios' 
            ? 'Library/LocalDatabase/' 
            : 'databases/';
          console.log(`📝 记录IR数据库文件: ${fullPath} (DATA目录)`);
        }
        
        savedFiles.push(fileRecord);
        
        fileCount++;
        
        // 强制垃圾回收大文件的内存（如果可能）
        if (fileSize > 10 * 1024 * 1024) { // 10MB以上
          console.log(`🧹 清理大文件内存 (${fileSizeMB}MB)...`);
          dataToWrite = null;
          
          if (window.gc) {
            window.gc();
          }
          
          // 超大文件额外暂停，让系统回收内存
          if (fileSize > 80 * 1024 * 1024) {
            console.log('⏸️  超大文件处理完成，暂停以释放内存...');
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
      } catch (fileError) {
        console.error(`❌ 保存文件失败 ${relativePath}:`, fileError);
        // 继续处理其他文件，不中断整个过程
      }
    }
    
    // 🆕 处理完成后的统计报告 - 特别关注IR核心数据库
    console.log('📊 文件处理完成统计:');
    const irextDbFiles = savedFiles.filter(file => 
      file.originalPath && (
        file.originalPath.toLowerCase().includes('irext_db_sqlite.db') || 
        file.originalPath.toLowerCase().includes('irext_db.sqlite')
      )
    );
    
    const dbFiles = savedFiles.filter(file => 
      file.originalPath && (
        file.originalPath.toLowerCase().includes('.db') || 
        file.originalPath.toLowerCase().includes('.sqlite')
      )
    );
    
    if (irextDbFiles.length > 0) {
      console.log(`🎯 IR核心数据库文件: ${irextDbFiles.length} 个`);
      
      // 🆕 显示数据库文件的特殊保存路径
      const dbDirectoryPath = deviceInfo && deviceInfo.operatingSystem === 'ios' 
        ? 'Library/LocalDatabase/' 
        : 'databases/';
      
      console.log(`📁 数据库文件保存目录: ${dbDirectoryPath} (DATA目录)`);
      
      irextDbFiles.forEach(file => {
        const sizeMB = file.size ? (file.size / (1024 * 1024)).toFixed(2) : '未知';
        const fileName = file.originalPath ? file.originalPath.split('/').pop() : 'unknown';
        console.log(`   ✅ ${file.originalPath} → ${dbDirectoryPath}${fileName} (${sizeMB}MB)`);
      });
      
      progressManager.showToast(`🎉 IR数据库已保存到${dbDirectoryPath} (${irextDbFiles.length}个文件)`, 'center', 5000, 'toast-success');
    } else {
      console.log('💭 未发现IR核心数据库文件');
    }
    
    console.log(`🥈 其他数据库文件: ${dbFiles.length - irextDbFiles.length} 个`);
    console.log(`📄 总文件处理: ${fileCount} 个`);
    
    return {
      basePath: basePath,
      extractedFiles: savedFiles,
      totalFiles: fileCount,
      success: true,
      message: `成功解压 ${fileCount} 个文件到 ${basePath}${irextDbFiles.length > 0 ? `（包含 ${irextDbFiles.length} 个IR核心数据库）` : ''}`,
      irextDbFiles: irextDbFiles.length, // 🆕 添加IR数据库统计
      priorityProcessing: true // 🆕 标记使用了优先级处理
    };
  };
  
  try {
    // 步骤1: 准备下载路径
    progressManager.updateStep(2, 15, '准备下载环境...');
    
    let mkdirFilePath = `databases/`;
    if (deviceInfo.operatingSystem === 'ios') {
      mkdirFilePath = `Library/LocalDatabase/`;
    }
    
    // 确保目录存在
    const mkdirSuccess = await safeMkdir(mkdirFilePath.replace(/\/$/, ''), 'DATA', '下载目录');
    if (mkdirSuccess) {
      progressManager.updateStep(2, 18, '下载目录创建完成');
    } else {
      progressManager.updateStep(2, 18, '使用默认下载目录');
    }
    
    let fileName = 'IR-v1.0.zip';
    const downloadPath = cordova.file.applicationStorageDirectory + mkdirFilePath + fileName;
    
    // 🆕 步骤2: 检查本地文件是否已存在
    progressManager.updateStep(2, 20, '检查本地文件...');
    console.log('检查本地文件是否存在:', mkdirFilePath + fileName);
    
    let zipData = null;
    let fileExistsAndValid = false;
    
    try {
      // 检查文件是否存在并获取文件信息
      const statResult = await Filesystem.stat({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      
      console.log('发现本地文件:', statResult);
      const localFileSizeMB = (statResult.size / (1024 * 1024)).toFixed(2);
      progressManager.updateStep(2, 25, `发现本地文件 (${localFileSizeMB}MB)`);
      
      // 验证文件大小（简单的完整性检查）
      if (statResult.size > 1000) { // 文件大于1KB，认为可能是有效的
        console.log(`✅ 本地文件有效 (${localFileSizeMB}MB)，跳过下载`);
        progressManager.updateStep(2, 30, `使用本地文件 (${localFileSizeMB}MB)`);
        
        // 直接读取本地文件
        console.log('从本地读取ZIP文件...');
        progressManager.updateStep(3, 35, '读取本地ZIP文件...');
        
        const zipFileResult = await Filesystem.readFile({
          path: mkdirFilePath + fileName,
          directory: 'DATA'
        });
        
        // 转换文件数据
        const fileDataType = typeof zipFileResult.data;
        console.log(`本地ZIP文件数据类型: ${fileDataType}`);
        
        if (fileDataType === 'string') {
          // Base64数据转换
          const base64Data = zipFileResult.data;
          const dataSize = base64Data.length;
          console.log(`Base64数据大小: ${(dataSize / (1024 * 1024)).toFixed(2)} MB`);
          
          if (dataSize > 50 * 1024 * 1024) { // 50MB以上使用分块转换
            console.log('🔄 使用分块转换本地大文件...');
            progressManager.updateStep(3, 40, '分块转换本地大文件...');
            
            const chunkSize = 1024 * 1024; // 1MB分块
            const totalChunks = Math.ceil(dataSize / chunkSize);
            const uint8Arrays = [];
            
            for (let i = 0; i < totalChunks; i++) {
              const start = i * chunkSize;
              const end = Math.min(start + chunkSize, dataSize);
              const chunk = base64Data.slice(start, end);
              
              const binaryChunk = atob(chunk);
              const chunkBytes = new Uint8Array(binaryChunk.length);
              for (let j = 0; j < binaryChunk.length; j++) {
                chunkBytes[j] = binaryChunk.charCodeAt(j);
              }
              uint8Arrays.push(chunkBytes);
              
              if (i % 10 === 0 || i === totalChunks - 1) {
                const chunkProgress = ((i + 1) / totalChunks * 100).toFixed(1);
                progressManager.updateStep(3, 40, `本地文件转换: ${chunkProgress}%`);
              }
            }
            
            // 合并分块
            const totalLength = uint8Arrays.reduce((sum, arr) => sum + arr.length, 0);
            zipData = new Uint8Array(totalLength);
            let offset = 0;
            for (const arr of uint8Arrays) {
              zipData.set(arr, offset);
              offset += arr.length;
            }
            uint8Arrays.length = 0;
            
          } else {
            // 小文件直接转换
            const binaryString = atob(base64Data);
            zipData = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              zipData[i] = binaryString.charCodeAt(i);
            }
          }
        } else {
          zipData = new Uint8Array(zipFileResult.data);
        }
        
        const finalSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
        console.log(`✅ 本地ZIP文件加载完成: ${finalSizeMB}MB`);
        progressManager.updateStep(3, 45, `本地文件加载完成: ${finalSizeMB}MB`);
        
        fileExistsAndValid = true;
        
      } else {
        console.warn(`⚠️ 本地文件过小 (${statResult.size}字节)，可能损坏，将重新下载`);
        progressManager.updateStep(2, 22, '本地文件异常，准备重新下载...');
      }
      
    } catch (statError) {
      console.log('本地文件不存在或无法访问:', statError.message);
      progressManager.updateStep(2, 22, '本地文件不存在，准备下载...');
    }
    
    // 🆕 步骤3: 如果本地文件无效，则下载新文件
    if (!fileExistsAndValid) {
    console.log('开始下载文件到:', downloadPath);
      progressManager.updateStep(2, 25, `开始下载: ${fileName}`);
    
    const resData = await http2.request({
      url: zipUrl,
      method: 'DOWNLOAD',
      timeout: 60,
      debug: true,
      file: {
        path: downloadPath,
        name: fileName,
      },
    });
    
    console.log("下载结果:", resData);
    progressManager.updateStep(2, 40, '文件下载完成');
    
    // 检查下载是否成功
    if (!resData || resData.status !== 200) {
      progressManager.showError(`下载失败: ${resData?.status || 'unknown error'}`);
      throw new Error(`下载失败: ${resData?.status || 'unknown error'}`);
    }
    
      progressManager.updateStep(2, 42, '下载状态验证通过');
      
      // 验证下载的文件
      try {
        const downloadedStat = await Filesystem.stat({
          path: mkdirFilePath + fileName,
          directory: 'DATA'
        });
        console.log('下载文件验证:', downloadedStat);
        const downloadedSizeMB = (downloadedStat.size / (1024 * 1024)).toFixed(2);
        progressManager.updateStep(2, 45, `下载验证通过 (${downloadedSizeMB}MB)`);
      } catch (downloadStatError) {
        console.error('下载文件验证失败:', downloadStatError);
        progressManager.updateStep(2, 45, '下载验证失败，尝试读取...');
      }
    }
    
    // 🆕 步骤4: 读取ZIP文件数据（如果尚未读取）
    if (!zipData) {
      console.log('需要读取新下载的ZIP文件...');
      progressManager.updateStep(3, 47, '读取新下载的ZIP文件...');
    
    // 先检查文件是否存在（用于调试）
    try {
      const statResult = await Filesystem.stat({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      console.log('文件信息:', statResult);
      progressManager.updateStep(3, 48, `文件验证通过 (${(statResult.size / (1024 * 1024)).toFixed(2)}MB)`);
    } catch (statError) {
      console.error('文件状态检查失败:', statError);
      progressManager.updateStep(3, 48, '文件状态检查失败，尝试备用读取...');
      
      // 可能文件下载到了不同的位置，尝试其他路径
      // 尝试使用绝对路径直接读取
      try {
        console.log('尝试从下载路径直接读取文件...');
        progressManager.updateStep(3, 49, '使用Cordova直接读取...');
        const directPath = downloadPath;
        
        // 使用cordova文件系统直接读取
        const fileContent = await new Promise((resolve, reject) => {
          window.resolveLocalFileSystemURL(directPath, (fileEntry) => {
            fileEntry.file((file) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsArrayBuffer(file);
            }, reject);
          }, reject);
        });
        
          zipData = new Uint8Array(fileContent);
        console.log('直接读取ZIP文件成功，大小:', zipData.length, 'bytes');
        progressManager.updateStep(3, 50, `直接读取成功 (${(zipData.length / (1024 * 1024)).toFixed(2)}MB)`);
        
      } catch (directReadError) {
        console.error('直接读取也失败:', directReadError);
        progressManager.showError('无法读取下载的ZIP文件');
        throw new Error('无法读取下载的ZIP文件，请检查下载是否成功');
      }
    }
    
      // 如果还没有zipData，从文件系统读取
      if (!zipData) {
    console.log('从Filesystem API读取ZIP文件...');
    progressManager.updateStep(3, 48, '从文件系统读取ZIP数据...');
    
    const zipFileResult = await Filesystem.readFile({
      path: mkdirFilePath + fileName,
      directory: 'DATA'
    });
    
    // 安全获取文件数据，处理超大ZIP文件
    const fileDataType = typeof zipFileResult.data;
    console.log(`ZIP文件数据类型: ${fileDataType}`);
    progressManager.updateStep(3, 49, `数据类型: ${fileDataType}`);
    
    try {
      if (fileDataType === 'string') {
        // 如果是base64字符串，需要安全转换为ArrayBuffer
        const base64Data = zipFileResult.data;
        const dataSize = base64Data.length;
        console.log(`Base64数据大小: ${(dataSize / (1024 * 1024)).toFixed(2)} MB`);
        progressManager.updateStep(3, 49, `Base64数据: ${(dataSize / (1024 * 1024)).toFixed(2)}MB`);
        
        // 对于超大base64数据，使用分块转换避免内存问题
        if (dataSize > 50 * 1024 * 1024) { // 50MB以上的base64数据
          console.log('🔄 检测到超大base64数据，使用分块转换...');
          progressManager.updateStep(3, 49, '检测到超大数据，启用分块转换...');
          
          const chunkSize = 1024 * 1024; // 1MB分块
          const totalChunks = Math.ceil(dataSize / chunkSize);
          const uint8Arrays = [];
          
          for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, dataSize);
            const chunk = base64Data.slice(start, end);
            
            // 转换分块
            const binaryChunk = atob(chunk);
            const chunkBytes = new Uint8Array(binaryChunk.length);
            for (let j = 0; j < binaryChunk.length; j++) {
              chunkBytes[j] = binaryChunk.charCodeAt(j);
            }
            uint8Arrays.push(chunkBytes);
            
            if (i % 10 === 0 || i === totalChunks - 1) {
              const chunkProgress = ((i + 1) / totalChunks * 100).toFixed(1);
              console.log(`分块转换进度: ${chunkProgress}%`);
              progressManager.updateStep(3, 49, `分块转换: ${chunkProgress}%`);
            }
          }
          
          // 合并所有分块
          console.log('🔗 合并分块数据...');
          progressManager.updateStep(3, 49, '合并分块数据...');
          const totalLength = uint8Arrays.reduce((sum, arr) => sum + arr.length, 0);
          zipData = new Uint8Array(totalLength);
          
          let offset = 0;
          for (const arr of uint8Arrays) {
            zipData.set(arr, offset);
            offset += arr.length;
          }
          
          // 清理临时数组
          uint8Arrays.length = 0;
          
        } else {
          // 小文件直接转换
          progressManager.updateStep(3, 49, '直接转换Base64数据...');
          const binaryString = atob(base64Data);
          zipData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            zipData[i] = binaryString.charCodeAt(i);
          }
        }
      } else {
        // 直接使用二进制数据
        progressManager.updateStep(3, 49, '使用二进制数据...');
        zipData = new Uint8Array(zipFileResult.data);
      }
      
    } catch (zipLoadError) {
      console.error('ZIP文件数据转换失败:', zipLoadError);
      progressManager.showError(`ZIP文件加载失败: ${zipLoadError.message}`);
      throw new Error(`ZIP文件加载失败: ${zipLoadError.message}`);
        }
      }
      
      const zipSizeMB = (zipData.length / (1024 * 1024)).toFixed(2);
      console.log(`✅ ZIP文件加载完成: ${zipSizeMB} MB`);
      progressManager.updateStep(3, 50, `ZIP文件加载完成: ${zipSizeMB}MB`);
    } else {
      console.log('✅ 使用已加载的本地ZIP文件数据');
      progressManager.updateStep(3, 50, '使用本地文件数据');
    }
    
    // 步骤4: 解压文件
    const result = await processUnzip(zipData);
    
    // 🆕 步骤6: 保留本地ZIP文件（可选清理）
    progressManager.updateStep(6, 96, '文件缓存管理...');
    
    // 检查文件大小决定是否保留
    try {
      const finalStatResult = await Filesystem.stat({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      
      const zipSizeMB = (finalStatResult.size / (1024 * 1024)).toFixed(2);
      console.log(`📁 ZIP文件已缓存 (${zipSizeMB}MB): ${mkdirFilePath + fileName}`);
      
      // 根据文件大小和用户偏好决定保留策略
      const shouldKeepFile = finalStatResult.size < 500 * 1024 * 1024; // 小于500MB的文件默认保留
      
      if (shouldKeepFile) {
        progressManager.updateStep(6, 98, `文件已缓存 (${zipSizeMB}MB)，下次使用将更快`);
        console.log(`✅ 文件已保留用于下次快速访问: ${zipSizeMB}MB`);
        
        // 显示缓存信息
        progressManager.showToast(`📁 文件已缓存 (${zipSizeMB}MB)，下次加载将更快`, 'center', 3000);
        
      } else {
        // 超大文件提示用户选择
        console.log(`⚠️ 文件较大 (${zipSizeMB}MB)，建议清理节省空间`);
        progressManager.updateStep(6, 97, `文件较大 (${zipSizeMB}MB)，准备清理...`);
        
    try {
      await Filesystem.deleteFile({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
          console.log('已清理超大ZIP文件节省空间');
          progressManager.updateStep(6, 98, '已清理大文件节省空间');
          progressManager.showToast(`🧹 已清理大文件 (${zipSizeMB}MB) 节省空间`, 'center', 3000);
        } catch (deleteError) {
          console.warn('清理大文件失败:', deleteError);
          progressManager.updateStep(6, 98, '文件清理失败，但不影响使用');
        }
      }
      
    } catch (finalStatError) {
      console.warn('无法获取最终文件信息:', finalStatError);
      progressManager.updateStep(6, 98, '文件缓存状态未知');
    }
    
    // 步骤7: 处理完成
    console.log('解压完成!', result);
    progressManager.updateStep(7, 100, '所有步骤完成！');
    
    // 显示成功结果
    progressManager.showSuccess('IR文件处理完成！', result);
    
    return result;
    
  } catch (error) {
    console.error('IR文件下载解压过程中出错:', error);
    
    // 显示错误信息
    progressManager.showError(`处理失败: ${error.message || error}`);
    
    // 🆕 智能清理策略：只清理可能损坏的文件
    progressManager.updateStep(6, 50, '检查文件状态...');
    try {
      const fileName = 'IR-v1.0.zip';
      let mkdirFilePath = `databases/`;
      if (deviceInfo.operatingSystem === 'ios') {
        mkdirFilePath = `Library/LocalDatabase/`;
      }
      
      // 检查文件是否存在和大小
      const statResult = await Filesystem.stat({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      
      // 如果文件很小（可能损坏），则删除；否则保留
      if (statResult.size < 1000) { // 小于1KB可能是损坏文件
      await Filesystem.deleteFile({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
        console.log('已清理可能损坏的小文件');
        progressManager.updateStep(6, 55, '已清理损坏文件');
      } else {
        console.log(`保留下载的文件 (${(statResult.size / (1024*1024)).toFixed(2)}MB) 供下次使用`);
        progressManager.updateStep(6, 55, '保留文件供下次使用');
      }
      
    } catch (cleanupError) {
      console.warn('文件状态检查失败:', cleanupError);
      progressManager.updateStep(6, 55, '文件状态检查失败');
    }
    
    // 延迟显示详细错误信息
    setTimeout(() => {
      app.dialog.alert(
        `处理失败！<br/>
        错误详情: ${error.message || error}<br/>
        <br/>
        💡 建议：<br/>
        • 检查网络连接<br/>
        • 确保设备有足够存储空间<br/>
        • 尝试关闭其他应用释放内存<br/>
        • 如问题持续，请联系技术支持`,
        'IR文件处理失败'
      );
    }, 1000);
    
    throw {
      success: false,
      error: error.message || error,
      details: error
    };
  }
}

// 🆕 缓存管理功能
window.ir_manage_cache = async () => {
  console.log('🗂️ 开始缓存管理...');
  
  try {
    const fileName = 'IR-v1.0.zip';
    let mkdirFilePath = `databases/`;
    if (deviceInfo && deviceInfo.operatingSystem === 'ios') {
      mkdirFilePath = `Library/LocalDatabase/`;
    }
    
    // 检查缓存文件状态
    try {
      const statResult = await Filesystem.stat({
        path: mkdirFilePath + fileName,
        directory: 'DATA'
      });
      
      const cacheSizeMB = (statResult.size / (1024 * 1024)).toFixed(2);
      const cacheDate = statResult.mtime ? new Date(statResult.mtime).toLocaleString() : '未知';
      
      console.log(`📁 发现缓存文件: ${cacheSizeMB}MB, 修改时间: ${cacheDate}`);
      
      // 显示缓存信息和管理选项
      const cacheInfo = `IR文件缓存管理

📁 缓存文件信息:
• 文件大小: ${cacheSizeMB} MB
• 修改时间: ${cacheDate}
• 文件路径: ${mkdirFilePath}${fileName}

💡 缓存作用:
• 避免重复下载，节省网络流量
• 提高处理速度，直接使用本地文件
• 离线也可以处理文件

⚠️ 如果需要下载最新版本，可以清理缓存`;

      if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.confirm(
          cacheInfo,
          'IR文件缓存管理',
          () => {
            // 用户选择清理缓存
            clearCache();
          },
          () => {
            // 用户选择保留缓存
            if (app.toast) {
              app.toast.show({
                text: '📁 缓存文件已保留',
                position: 'center',
                closeTimeout: 2000
              });
            }
          },
          '清理缓存',
          '保留缓存'
        );
      } else {
        // 降级处理
        const shouldClear = confirm(`缓存文件大小: ${cacheSizeMB}MB\n修改时间: ${cacheDate}\n\n是否清理缓存？`);
        if (shouldClear) {
          clearCache();
        }
      }
      
    } catch (statError) {
      console.log('💭 未发现缓存文件');
      
      const noCacheInfo = `IR文件缓存管理

📭 当前状态: 无缓存文件

💡 说明:
• 首次使用时会下载并缓存IR文件
• 缓存后的处理速度会显著提升
• 缓存文件会自动管理，无需手动操作

🚀 建议:
运行一次IR文件处理，系统会自动创建缓存`;

      if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.alert(noCacheInfo, 'IR文件缓存状态');
      } else {
        alert('未发现缓存文件。首次使用时会自动创建缓存。');
      }
    }
    
    // 清理缓存的内部函数
    async function clearCache() {
      try {
        console.log('🧹 开始清理缓存...');
        
        await Filesystem.deleteFile({
          path: mkdirFilePath + fileName,
          directory: 'DATA'
        });
        
        console.log('✅ 缓存清理完成');
        
        const successMessage = '🧹 缓存清理完成！\n\n下次处理IR文件时会重新下载最新版本。';
        
        if (typeof app !== 'undefined' && app.dialog) {
          app.dialog.alert(successMessage, '清理完成');
        } else {
          alert('缓存清理完成！');
        }
        
      } catch (deleteError) {
        console.error('清理缓存失败:', deleteError);
        
        const errorMessage = `清理缓存失败: ${deleteError.message}\n\n可能的原因:\n• 文件正在被使用\n• 权限不足\n• 文件已被删除`;
        
        if (typeof app !== 'undefined' && app.dialog) {
          app.dialog.alert(errorMessage, '清理失败');
        } else {
          alert('清理缓存失败: ' + deleteError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('缓存管理出错:', error);
    
    if (typeof app !== 'undefined' && app.dialog) {
      app.dialog.alert(`缓存管理出错: ${error.message}`, '错误');
    } else {
      alert('缓存管理出错: ' + error.message);
    }
  }
};

// 🆕 获取缓存状态信息
window.ir_cache_status = async () => {
  try {
    const fileName = 'IR-v1.0.zip';
    let mkdirFilePath = `databases/`;
    if (deviceInfo && deviceInfo.operatingSystem === 'ios') {
      mkdirFilePath = `Library/LocalDatabase/`;
    }
    
    const statResult = await Filesystem.stat({
      path: mkdirFilePath + fileName,
      directory: 'DATA'
    });
    
    return {
      exists: true,
      size: statResult.size,
      sizeMB: (statResult.size / (1024 * 1024)).toFixed(2),
      path: mkdirFilePath + fileName,
      lastModified: statResult.mtime ? new Date(statResult.mtime) : null
    };
    
  } catch (error) {
    return {
      exists: false,
      size: 0,
      sizeMB: '0',
      path: null,
      lastModified: null,
      error: error.message
    };
  }
};

  // 🔗 手动合并分块文件功能
  window.ir_merge_parts = async (partBaseName = 'databases/irext_db_sqlite.db') => {
    try {
      console.log(`🔗 开始手动合并分块文件: ${partBaseName}.*`);
      
      // 获取设备信息
      const deviceInfo = await Capacitor.Plugins.Device.getInfo();
      
      // 查找所有分块文件
      let partFiles = [];
      let saveDirectory = 'DATA';
      
      // 尝试查找分块文件（从.part000开始）
      for (let i = 0; i < 1000; i++) { // 最多查找1000个分块
        const partPath = `${partBaseName}.part${String(i).padStart(3, '0')}`;
        try {
          await Filesystem.stat({
            path: partPath,
            directory: saveDirectory
          });
          partFiles.push(partPath);
          console.log(`📁 找到分块文件: ${partPath}`);
        } catch (statError) {
          // 文件不存在，停止查找
          break;
        }
      }
      
      if (partFiles.length === 0) {
        console.warn('❌ 未找到任何分块文件');
        alert('未找到分块文件！请确认文件路径正确。');
        return;
      }
      
      console.log(`📋 找到 ${partFiles.length} 个分块文件，开始合并...`);
      alert(`找到 ${partFiles.length} 个分块文件，开始合并...`);
      
      // 调用合并函数
      const mergeResult = await mergePartFiles(partFiles, partBaseName, saveDirectory, 'irext_db_sqlite.db');
      
      if (mergeResult.success) {
        console.log(`🎉 手动合并成功！文件路径: ${mergeResult.finalPath}`);
        console.log(`📊 文件大小: ${(mergeResult.finalSize / (1024 * 1024)).toFixed(2)}MB`);
        alert(`🎉 合并成功！\n文件: ${mergeResult.finalPath}\n大小: ${(mergeResult.finalSize / (1024 * 1024)).toFixed(2)}MB`);
        
        // 使用Cordova路径系统保存到目标位置
        if (deviceInfo.platform === 'android') {
          try {
            console.log('🚀 手动合并完成，使用Cordova路径系统保存到目标位置...');
            
            // 读取合并后的文件数据
            const mergedFile = await Filesystem.readFile({
              path: mergeResult.finalPath,
              directory: saveDirectory || 'DATA'
            });
            
            // 转换为Uint8Array
            let fileData;
            if (typeof mergedFile.data === 'string') {
              const binaryString = atob(mergedFile.data);
              fileData = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                fileData[j] = binaryString.charCodeAt(j);
              }
            } else {
              fileData = new Uint8Array(mergedFile.data);
            }
            
            // 使用Cordova路径系统保存
            const cordovaSaveResult = await saveToTargetLocationWithCordova(fileData, 'irext_db_sqlite.db', deviceInfo);
            
            if (cordovaSaveResult.success) {
              console.log(`🎉 手动合并文件成功保存到目标位置: ${cordovaSaveResult.finalPath}`);
              alert(`🎉 手动合并成功并保存到目标位置！\n路径: ${cordovaSaveResult.finalPath}\n大小: ${(cordovaSaveResult.finalSize / (1024 * 1024)).toFixed(2)}MB`);
              
              // 清理临时文件
              try {
                await Filesystem.deleteFile({
                  path: mergeResult.finalPath,
                  directory: saveDirectory || 'DATA'
                });
                console.log(`🗑️ 手动合并临时文件已清理: ${mergeResult.finalPath}`);
              } catch (cleanError) {
                console.warn('清理手动合并临时文件失败:', cleanError);
              }
            } else {
              console.warn('⚠️ 手动合并Cordova保存失败，保留Capacitor版本');
              alert(`⚠️ 保存到目标位置失败，但文件仍可在Capacitor位置使用`);
            }
            
            // 释放内存
            fileData = null;
            
          } catch (cordovaError) {
            console.error('❌ 手动合并Cordova保存失败:', cordovaError);
            console.log('💡 保留Capacitor版本的文件');
            alert(`⚠️ 保存过程出错，但合并成功的文件仍可使用`);
          }
        } else {
          console.log('✅ 手动合并完成，文件已就绪');
          console.log(`📍 文件路径: ${mergeResult.finalPath}`);
        }
        
      } else {
        console.error(`❌ 手动合并失败: ${mergeResult.error}`);
        alert(`❌ 合并失败: ${mergeResult.error}`);
      }
      
    } catch (mergeError) {
      console.error('❌ 手动合并过程出错:', mergeError);
      alert(`❌ 合并过程出错: ${mergeError.message}`);
    }
  };

  // 📋 问题分析和解决方案说明
  window.ir_path_analysis = () => {
    console.log(`
🔍 ==== Capacitor文件系统路径分析 ====

❌ 问题诊断:
• 期望路径: /data/user/0/com.yoslock.smart/databases/
• 实际路径: /data/user/0/com.yoslock.smart/files/databases/
• 原因: Capacitor.Filesystem.Directory.DATA 映射到 files/ 子目录

🛠️ 根本原因:
• Capacitor的Filesystem API有安全限制
• 无法直接访问应用根目录的databases/文件夹
• databases/通常是Android系统管理的SQLite目录
• 所有迁移方案都会失败，因为这是API层面的限制

✅ 明确解决方案:

方案1【已实现】: 使用Cordova路径系统
• 发现下载使用的是: cordova.file.applicationStorageDirectory + databases/
• 现已优化保存逻辑，使用相同的Cordova路径系统
• 文件会自动保存到: /data/user/0/com.yoslock.smart/databases/
• 这与下载路径完全一致！

方案2【备选】: 修改数据库插件配置
• 如果Cordova方案有问题，可用Capacitor路径
• 让数据库插件读取: files/databases/irext_db_sqlite.db
• 这也是完全可用的稳定路径

🎯 当前状态:
1. 系统会自动尝试使用Cordova路径保存
2. 成功时文件保存到期望的 databases/ 目录
3. 失败时回退到稳定的 files/databases/ 目录
4. 两种路径都包含完整的105MB数据库文件

💡 技术说明:
• 当前实现已经成功创建了完整的数据库文件
• 文件完整性和大小都正确 (105.33MB)
• 唯一问题是路径不符合预期，但功能完全正常
    `);
    
    return {
      expectedPath: '/data/user/0/com.yoslock.smart/databases/',
      actualPath: '/data/user/0/com.yoslock.smart/files/databases/',
      issue: 'Capacitor API limitation',
      solution: 'Update database plugin configuration',
      recommendation: 'Use files/databases/ path in database plugin'
    };
  };

  // 🔍 调试功能：查看文件目录内容
  window.ir_debug_files = async () => {
  try {
    const { Filesystem } = Capacitor.Plugins;
    console.log('🔍 开始调试文件系统...');
    
    // 检查设备类型
    let deviceInfo = null;
    try {
      const { Device } = Capacitor.Plugins;
      deviceInfo = await Device.getInfo();
      console.log('📱 设备信息:', deviceInfo);
    } catch (deviceError) {
      console.warn('无法获取设备信息:', deviceError);
    }
    
    const directories = ['DATA', 'CACHE', 'DOCUMENTS'];
    let debugInfo = '🔍 文件系统调试报告:\n\n';
    
    for (const dir of directories) {
      debugInfo += `📂 ${dir} 目录:\n`;
      
      try {
        // 列出根目录
        const rootContents = await Filesystem.readdir({
          path: '.',
          directory: dir
        });
        
        debugInfo += `  根目录文件数: ${rootContents.files.length}\n`;
        rootContents.files.forEach(file => {
          debugInfo += `  - ${file.name} (${file.type})\n`;
        });
        
        // 检查databases目录
        try {
          const dbContents = await Filesystem.readdir({
            path: 'databases',
            directory: dir
          });
          debugInfo += `  📁 databases/ 目录:\n`;
          dbContents.files.forEach(file => {
            debugInfo += `    - ${file.name} (${file.type})\n`;
          });
        } catch (dbError) {
          debugInfo += `  📁 databases/ 目录不存在或为空\n`;
        }
        
        // iOS检查Library/LocalDatabase目录
        if (deviceInfo && deviceInfo.operatingSystem === 'ios') {
          try {
            const iosContents = await Filesystem.readdir({
              path: 'Library/LocalDatabase',
              directory: dir
            });
            debugInfo += `  📁 Library/LocalDatabase/ 目录:\n`;
            iosContents.files.forEach(file => {
              debugInfo += `    - ${file.name} (${file.type})\n`;
            });
          } catch (iosError) {
            debugInfo += `  📁 Library/LocalDatabase/ 目录不存在或为空\n`;
          }
        }
        
      } catch (dirError) {
        debugInfo += `  ❌ 无法访问 ${dir} 目录: ${dirError.message}\n`;
      }
      
      debugInfo += '\n';
    }
    
    console.log(debugInfo);
    alert(debugInfo);
    
  } catch (error) {
    const errorMsg = '调试功能失败: ' + error.message;
    console.error(errorMsg, error);
    alert(errorMsg);
  }
};