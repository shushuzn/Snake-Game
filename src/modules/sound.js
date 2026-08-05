/**
 * 音效模块 — WebAudio 合成, 零外部资源。
 * 提供比原 beep() 更丰富的音效: 双音/滑音/琶音/包络。
 * 经典脚本挂载 window.SnakeSound, 兼容 file:// 直开。
 *
 * 用法:
 *   SnakeSound.play('eat');        // 吃食物
 *   SnakeSound.play('bonus');      // 拾取道具
 *   SnakeSound.play('hit');        // 死亡/碰撞
 *   SnakeSound.play('mission');    // 任务完成
 *   SnakeSound.play('achievement');// 成就解锁
 *   SnakeSound.play('click');      // 按钮点击
 *   SnakeSound.play('levelUp');    // 升级
 *   SnakeSound.setEnabled(false);  // 静音
 */
window.SnakeSound = (() => {
  let ctx = null;
  let enabled = true;
  let masterVolume = 0.5;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') {
      // 用户交互后浏览器允许恢复
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /**
   * 播放单个音。
   * @param {object} o
   * @param {number} o.freq 起始频率 Hz
   * @param {number} [o.slideTo] 结束频率(滑音)
   * @param {string} [o.type='sine'] 波形
   * @param {number} [o.dur=0.08] 时长 s
   * @param {number} [o.vol=0.5] 相对音量
   * @param {number} [o.delay=0] 延迟 s
   */
  function tone({ freq, slideTo = null, type = 'sine', dur = 0.08, vol = 0.5, delay = 0 }) {
    const c = ensureCtx();
    if (!c || !enabled) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    }
    const peak = Math.min(0.9, masterVolume * vol);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  const SFX = {
    // 吃食物: 短促双音 (轻快)
    eat() {
      tone({ freq: 660, dur: 0.045, vol: 0.35 });
      tone({ freq: 990, dur: 0.05, vol: 0.3, delay: 0.035 });
    },
    // 拾取道具: 上行滑音
    bonus() {
      tone({ freq: 520, slideTo: 1100, dur: 0.12, vol: 0.4 });
      tone({ freq: 1300, dur: 0.08, vol: 0.25, delay: 0.09 });
    },
    // 碰撞/死亡: 低频下降
    hit() {
      tone({ freq: 240, slideTo: 90, dur: 0.2, type: 'sawtooth', vol: 0.3 });
      tone({ freq: 160, slideTo: 60, dur: 0.25, type: 'square', vol: 0.15, delay: 0.05 });
    },
    // 任务完成: 三连音
    mission() {
      [660, 880, 1100].forEach((f, i) => {
        tone({ freq: f, dur: 0.09, vol: 0.32, delay: i * 0.06 });
      });
    },
    // 成就解锁: 双音琶音
    achievement() {
      tone({ freq: 523, dur: 0.14, vol: 0.38 });
      tone({ freq: 784, dur: 0.18, vol: 0.35, delay: 0.09 });
      tone({ freq: 1046, dur: 0.22, vol: 0.3, delay: 0.18 });
    },
    // 按钮点击: 极短
    click() {
      tone({ freq: 480, dur: 0.03, vol: 0.18 });
    },
    // 升级: 上行琶音
    levelUp() {
      [440, 554, 659, 880].forEach((f, i) => {
        tone({ freq: f, dur: 0.11, vol: 0.3, delay: i * 0.07 });
      });
    }
  };

  function play(type) {
    const fn = SFX[type] || SFX.eat;
    fn();
  }

  function setEnabled(v) {
    enabled = !!v;
    if (!enabled && ctx) {
      ctx.suspend().catch(() => {});
    }
  }

  function setVolume(v) {
    masterVolume = Math.min(1, Math.max(0, Number(v) || 0));
  }

  return { play, setEnabled, setVolume };
})();
