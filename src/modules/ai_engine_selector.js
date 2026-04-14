/**
 * AI Engine Selector - 选择使用 Worker 版还是原始版 AI
 * 
 * 使用方式：
 *   const ai = window.AIEngineSelector.createAIPlayer({ difficulty: 'normal' });
 * 
 * 环境变量：
 *   window.USE_AI_WORKER = true/false  (默认: true if supported)
 */

window.AIEngineSelector = (() => {
  // 检测是否支持 Web Worker
  const supportsWorker = typeof Worker !== 'undefined';
  
  // 决定使用哪个引擎
  const useWorker = window.USE_AI_WORKER !== undefined 
    ? window.USE_AI_WORKER 
    : supportsWorker;

  function createAIPlayer(options) {
    if (useWorker && window.AIWorkerBridge) {
      console.log('[AI Engine] Using Web Worker backend');
      return window.AIWorkerBridge.createAIPlayer(options);
    } else {
      console.log('[AI Engine] Using main thread backend');
      return window.SnakeAIPlayer.createAIPlayer(options);
    }
  }

  function isUsingWorker() {
    return useWorker && window.AIWorkerBridge;
  }

  function getSupportedEngines() {
    return {
      worker: supportsWorker,
      using: useWorker ? 'worker' : 'main'
    };
  }

  return { createAIPlayer, isUsingWorker, getSupportedEngines };
})();
