import '../build/engine.js'; CyberEngineModule().then(M => { console.log('✅ Motor C++ operativo'); window.engine = new M.CyberEngine(); });
