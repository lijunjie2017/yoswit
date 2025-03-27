window.device_setting_radar_mode_detail_vm = null;

/**
 * @param {string} json
 * @param {string} mode
 */
window.iot_mode_setup_radar_mode_detail_init = function (json, mode) {
  // NOTICE: Need Release VM
  try {
    if (window.device_setting_radar_mode_detail_vm) {
      window.device_setting_radar_mode_detail_vm.$destroy();
      window.device_setting_radar_mode_detail_vm = null;
    }
  } catch (err) {
    // ignore
  }

  mainView.router.once('routeChanged', () => {
    try {
      if (window.device_setting_radar_mode_detail_vm) {
        window.device_setting_radar_mode_detail_vm.$destroy();
        window.device_setting_radar_mode_detail_vm = null;
      }
    } catch (err) {
      // ignore
    }
  });

  const subdevice = JSON.parse(json);
  const guid = subdevice.guid;
  const p = window.peripheral[guid].prop
  console.log(mode);

  window.device_setting_radar_mode_detail_vm = new Vue({
    el: '#device-setting-radar-mode-detail',
    template: /* html */ `
    <div ref="container" class="radar-mode-conntainer" v-clock>
      <a ref="formSave" href="#" class="link icon-only" @click="handleSave">
        <i class="icon material-icons">check</i>
      </a>

      <div class="card no-border">
        <div class="card-header display-flex flex-direction-row bg-color-primary active-state">
        <span style="line-height: 12px;margin-right: 10px;"><i class="material-icons" style="color:#fff;" @click="showInfo">info</i></span>  
        <span class="color-white" style="color:#fff;">Detection</span>
          <span style="flex: 1;"></span>
          <i class="material-icons" style="color:#fff;" @click="handleDetection">change_circle</i>
          <div style="width: 8px;"></div>
          <i class="material-icons" :class="{ 'disabled': recordCount <= 0 }" style="color:#fff;" @click="handleFill">edit</i>
        </div>

        <div class="card-content card-content-padding">
          <div class="list inline-labels inset" style="padding: 6px;">
            <ul>
              <li class="item-content item-input">
                <div class="item-inner">
                  <div class="item-title item-label" style="flex: 2;">Unmanned Duration</div>
                  <div class="item-input-wrap" style="flex: 1;">
                    <input class="text-align-right" type="text" v-model="unmannedDuration" required validate pattern="[0-9]*" />
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="display-flex flex-direction-row" style="margin-top: 30px;">
            <div style="flex: 1;">
              <h6 class="text-align-center">Radius (m)</h6>
              <div class="list no-hairlines-md">
                <ul>
                  <li class="item-content item-input item-input-with-info" v-for="index in 9" :key="index">
                    <div class="item-inner">
                      <div class="item-input-wrap">
                        <input class="text-align-center" type="text" readonly :value="getRadius(index - 1)" />
                        <div class="item-input-info">Reference</div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div style="flex: 1;">
              <h6 class="text-align-center">Moving</h6>
              <div class="list no-hairlines-md">
                <ul>
                  <li class="item-content item-input item-input-with-info" v-for="(value, index) in movingRange" :key="index">
                    <div class="item-inner">
                      <div class="item-input-wrap">
                        <input class="text-align-center" required validate pattern="^(?:[0-9]|[1-9][0-9]|100)$" type="text" v-model="movingRange[index]" />
                        <div class="item-input-info text-align-center">{{ getReference(movingReferenceRange[index]) }}</div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div style="flex: 1;">
              <h6 class="text-align-center">Stationary</h6>
              <div class="list no-hairlines-md">
                <ul>
                  <li class="item-content item-input item-input-with-info" v-for="(value, index) in staticRange" :key="index">
                    <div class="item-inner">
                      <div class="item-input-wrap">
                        <input class="text-align-center" required validate pattern="^(?:[0-9]|[1-9][0-9]|100)$" type="text" v-model="staticRange[index]" />
                        <div class="item-input-info text-align-center">{{ getReference(staticReferenceRange[index]) }}</div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data: {
      detectionRange: 0,
      movingRange: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      staticRange: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      movingReferenceRange: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      staticReferenceRange: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      recordCount: 0,
      unmannedDuration: 0,
      enableDetection: false,
    },
    methods: {
      startNotification() {
        iot_ble_check_enable()
          .then(() => {
            return window.peripheral[guid].connect();
          })
          .then(() => {
            return new Promise((resolve, reject) => {
              if (Capacitor.getPlatform() === 'android') {
                ble.requestMtu(
                  p.id,
                  512,
                  () => {
                    console.log('>>>> radar request mtu success');
                    resolve();
                  },
                  (err) => {
                    console.log('>>>> radar request mtu fail: ' + err);
                    reject(err);
                  },
                );
              } else {
                resolve();
              }
            });
          })
          .then(() => {
            ble.startNotification(
              p.id,
              'ff80',
              'ff82',
              (rs) => {
                // console.log('>>>> radar notify data: ' + rs);

                this.processNotifyData(rs);
              },
              (err) => {
                console.log('>>>> radar notify error: ' + err);
              },
            );
          })
          .then(() => {
            this.writeCmd('9500');
          })
          .catch((err) => {
            app.dialog.alert(err, runtime.appInfo.name, () => {
              // mainView.router.back();
            });
          });
      },
      writeCmd(cmd) {
        iot_ble_check_enable()
          .then(() => {
            return window.peripheral[guid].connect();
          })
          .then(() => {
            console.log('>>>>> radar write cmd: ' + cmd);

            // return iot_ble_write(guid, 'ff80', 'ff81', cmd);
            return window.peripheral[guid].write([
                {
                  service: 'ff80',
                  characteristic: 'ff81',
                  data: cmd,
                },
            ]);
          })
          .catch((err) => {
            app.dialog.alert(_(erp.get_log_description(err)));
          });
      },
      /**
       * @param {string} rs 
       */
      processNotifyData(rs) {
        if (rs.startsWith('9500000030')) {
          const byteStrings = rs.match(/.{1,2}/g);
          console.log(byteStrings);

          // 触发间距 (* 100)
          // 1 -> 0.75m | 0 -> 0.2m
          const range_gate_resolution = iot_utils_from_little_endian_hex(
            byteStrings.slice(6, 6 + 2).join(''),
          );
          this.detectionRange = range_gate_resolution;

          if (mode === 'sleep') {
            // 无人持续时间
            const no_target_lastfor = iot_utils_from_little_endian_hex(
              byteStrings.slice(31, 31 + 4).join(''),
            );
            this.unmannedDuration = no_target_lastfor;

            // 运动能量值 [0-8]
            const move_range_gate = byteStrings.slice(35, 35 + 9).map((e) => parseInt(e, 16));
            this.movingRange = move_range_gate;

            // 静止能量值 [0-8]
            const static_range_gate = byteStrings.slice(44, 44 + 9).map((e) => parseInt(e, 16));
            this.staticRange = static_range_gate;
          } else {
            // 无人持续时间
            const no_target_lastfor = iot_utils_from_little_endian_hex(
              byteStrings.slice(8, 8 + 4).join(''),
            );
            this.unmannedDuration = no_target_lastfor;

            // 运动能量值 [0-8]
            const move_range_gate = byteStrings.slice(12, 12 + 9).map((e) => parseInt(e, 16));
            this.movingRange = move_range_gate;

            // 静止能量值 [0-8]
            const static_range_gate = byteStrings.slice(21, 21 + 9).map((e) => parseInt(e, 16));
            this.staticRange = static_range_gate;
          }
        } else if (rs.startsWith('950100001F'.toLowerCase())) {
          if (!this.enableDetection) {
            return;
          }

          const byteStrings = rs.match(/.{1,2}/g);

          // 运动能量值 [0-8]
          const move_range_gate = byteStrings.slice(16, 16 + 9).map((e) => parseInt(e, 16));
          move_range_gate.forEach((v, i) => {
            this.movingReferenceRange[i] += v;
          });

          // 静止能量值 [0-8]
          const static_range_gate = byteStrings.slice(25, 25 + 9).map((e) => parseInt(e, 16));
          static_range_gate.forEach((v, i) => {
            this.staticReferenceRange[i] += v;
          });

          this.recordCount += 1;
        }
      },
      getRadius(index) {
        const m = (this.detectionRange === 0 ? 0.2 : 0.75) * 100;
        if (index === 0) {
          return '0';
        } else {
          return `${((index - 1) * m) / 100} - ${(index * m) / 100}`;
        }
      },
      getReference(value) {
        if (this.enableDetection || this.recordCount === 0) {
          return '--';
        } else {
          return value;
        }
      },
      handleDetection() {
        app.preloader.show();
        this.recordCount = 0;
        this.staticReferenceRange = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.movingReferenceRange = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        // 打开工程模式
        this.enableDetection = true;
        this.writeCmd('950400000101');

        // 收集6秒数据
        setTimeout(() => {
          this.writeCmd('950400000100')
          this.enableDetection = false;

          this.staticReferenceRange = this.staticReferenceRange.map((e) => parseInt(e / this.recordCount));
          this.movingReferenceRange = this.movingReferenceRange.map((e) => parseInt(e / this.recordCount));

          app.preloader.hide();
        }, 6000)
      },
      showInfo(){
        const self = this;

  const manualContent = `
    <h3 style="font-size:16px; color:#007aff; margin:12px 0;">产品设置说明</h3>
    <p style="font-size:12px; color:#999; margin-bottom:8px;">型号：YO203DC-24G</p>
    
    <section style="margin-bottom:20px;">
      <h4 style="font-size:15px; color:#666; margin:10px 0 8px;">一、最远探测距离</h4>
      <p style="font-size:14px; color:#888; line-height:1.5; margin:4px 0;">
        1. 设置最远可探测的距离，只有在此最远距离内出现的人体目标才会被探测到并输出结果。<br>
        2. 以距离门为单位进行设置， 每个距离门为0.75m。<br>
        3. 包括运动探测最远距离门和静止探测最远距离门，可设置范围为1～8，例如设置最远距离门为2，则只有在1.5m内有人体存在才会有效探测到并输出结果。
      </p>
    </section>

    <section style="margin-bottom:20px;">
      <h4 style="font-size:15px; color:#666; margin:10px 0 8px;">二、灵敏度</h4>
      <ol style="padding-left:20px; font-size:14px; color:#888; line-height:1.5;">
        <li>探测到的目标能量值(范围0～100)大于灵敏度值时才会判定为目标存在，否则忽略。</li>
        <li>灵敏度值可设置范围0～100。每个距离门可独立设置灵敏度，即可对不同距离范围内的探测进行精准调节，局部精准探测或对特定区域干扰源的过滤。</li>
        <li>另外如果将某个距离门的灵敏度设置为100时，可达到不识别此距离门下目标的效果。例如将距离门3和距离门4的灵敏度设置为20，其他距离门的灵敏度都设置为100，则可实现仅对距离模块2.25～3.75m范围内的人体进行探测。</li>
      </ol>
    </section>
    <section style="margin-bottom:20px;">
      <h4 style="font-size:15px; color:#666; margin:10px 0 8px;">三、无人持续时间</h4>
      <ol style="padding-left:20px; font-size:14px; color:#888; line-height:1.5;">
        <li>雷达在输出从有人到无人的结果中，会持续一段时间上报有人，若在此时间段雷达测试范围内持续无人，雷达上报无人；若在此时间段雷达检测到有人，则重刷新此时间，单位秒。相当于无人延时时间，人离开后，保持无人超过此持续时间后才会输出状态为无人。</li>
      </ol>
    </section>
  `;

  app.dialog.create({
    title: '<span style="font-size:18px; font-weight:bold; color:#333;">产品说明书</span>',
    content: `
      <div style="width:100%; padding:0 16px;">
        <div style="border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:12px;">
          <div style="font-size:12px; color:#999;">版本：V2.5.0</div>
          <div style="font-size:12px; color:#ccc;">更新日期：2025-03-05</div>
        </div>
        <div class="manual-scrollable" 
             style="overflow-y:auto; 
                    -webkit-overflow-scrolling:touch;
                    padding:8px 0;
                    max-height:60vh;">
          ${manualContent}
        </div>
      </div>
    `,
    buttons: [
      {
        text: '关闭',
        color: 'gray',
        onClick(dialog) {
          dialog.close();
        }
      }
    ],
    on: {
      open(dialog) {
        // 动态设置最大高度（备用方案）
        const screenHeight = app.height;
        dialog.$el.find('.manual-scrollable')
          .css('max-height', `${screenHeight * 0.6}px`);
      }
    }
  }).open();
      },
      handleFill() {
        if (this.recordCount > 0) {
          this.movingRange = [].concat(this.movingReferenceRange);
          this.staticRange = [].concat(this.staticReferenceRange);
        }
      },
      handleSave() {
        if (!app.input.validateInputs(this.$refs.container)) {
          return;
        }

        let data = '9505000016';

        if (mode === 'sleep') {
          data = '9512000016';
        }

        data += iot_utils_to_little_endian_hex(parseInt(this.unmannedDuration), 4);

        data += this.movingRange.map((e) => {
          return parseInt(e).toString(16).pad('00');
        }).join('');

        data += this.staticRange.map((e) => {
          return parseInt(e).toString(16).pad('00');
        }).join('');

        app.preloader.show();
        this.writeCmd(data);

        setTimeout(() => {
          app.preloader.hide();
        }, 1500);
      }
    },
    mounted() {
      try {
        document.querySelector('.frappe-form-right').appendChild(this.$refs.formSave);
      } catch (err) {
        // ignore
      }

      this.startNotification();
    },
    destroyed() {},
  });
};
