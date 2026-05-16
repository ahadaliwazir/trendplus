const express = require('express');
const router = express.Router();

// --- DASHBOARD WRAPPER ---
const getPageTemplate = (content, title = "Security Lab Dashboard") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        body { 
            background: radial-gradient(circle at top right, #1a1a2e, #16213e, #0f3460);
            font-family: 'Outfit', sans-serif;
            color: #e9ecef;
            min-height: 100vh;
        }
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
        }
        .code-font { font-family: 'JetBrains Mono', monospace; }
        .glow { box-shadow: 0 0 20px rgba(74, 222, 128, 0.2); }
        .glow-red { box-shadow: 0 0 20px rgba(248, 113, 113, 0.2); }
        .status-badge {
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
    </style>
</head>
<body class="p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">StudentHub Security Lab</h1>
                <p class="text-gray-400 text-sm mt-1">Simulated Vulnerability Environment v2.0</p>
            </div>
            <div class="hidden md:flex space-x-2">
                <span class="status-badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">System Online</span>
                <span class="status-badge bg-blue-500/20 text-blue-400 border border-blue-500/30">Target: LocalNode</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Sidebar Navigation -->
            <div class="lg:col-span-1 space-y-3">
                <a href="/api/lab/xss" class="block p-4 glass hover:bg-white/10 transition-all rounded-2xl group border-l-4 border-blue-500">
                    <div class="text-xs text-blue-400 mb-1 font-bold tracking-widest uppercase">Module 01</div>
                    <div class="font-semibold text-gray-200">Reflected XSS</div>
                </a>
                <a href="/api/lab/status" class="block p-4 glass hover:bg-white/10 transition-all rounded-2xl group">
                    <div class="text-xs text-gray-500 mb-1 font-bold tracking-widest uppercase">Module 02</div>
                    <div class="font-semibold text-gray-400">CSRF Attack</div>
                </a>
                <div class="p-4 glass opacity-50 cursor-not-allowed rounded-2xl">
                    <div class="text-xs text-gray-600 mb-1 font-bold tracking-widest uppercase">Module 03</div>
                    <div class="font-semibold text-gray-500">Brute Force</div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="lg:col-span-3">
                ${content}
            </div>
        </div>
        
        <footer class="mt-12 text-center text-gray-500 text-xs">
            &copy; 2026 StudentHub Research Lab &bull; Educational Use Only
        </footer>
    </div>
</body>
</html>
`;

// --- XSS MODULE ---
router.get('/xss', (req, res) => {
    const { name } = req.query;
    const isAttacked = name && name.includes('<script>');
    
    const content = `
        <div class="glass p-8 ${isAttacked ? 'glow-red border-red-500/30' : 'glow'}">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold">XSS Simulation</h2>
                    <p class="text-gray-400 mt-1">Cross-Site Scripting (Reflected) demonstration.</p>
                </div>
                <div class="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs code-font">
                    GET /api/lab/xss
                </div>
            </div>

            <div class="bg-black/40 rounded-xl p-6 mb-8 border border-white/5">
                <div class="text-gray-500 text-xs mb-4 uppercase tracking-widest font-bold">Server Response Output</div>
                <div class="text-xl">
                    Hello, <span class="font-bold text-emerald-400">${name || '<span class="text-gray-600 italic">Guest User</span>'}</span>!
                </div>
                <div class="mt-4 pt-4 border-t border-white/5 text-sm text-gray-500 italic">
                    Welcome back to the secure research portal.
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 class="text-sm font-bold text-emerald-400 mb-2 underline decoration-emerald-500/30 underline-offset-4">Scenario 1: Safe Input</h3>
                    <p class="text-xs text-gray-400 mb-4">Passing a standard string via the "name" parameter.</p>
                    <a href="/api/lab/xss?name=JohnDoe" class="inline-block w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-sm">
                        Execute Safe Test
                    </a>
                </div>
                <div class="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 class="text-sm font-bold text-red-400 mb-2 underline decoration-red-500/30 underline-offset-4">Scenario 2: Malicious Payload</h3>
                    <p class="text-xs text-gray-400 mb-4">Injecting an unescaped &lt;script&gt; tag to trigger XSS.</p>
                    <a href="/api/lab/xss?name=<script>alert('VULNERABILITY_FOUND')</script>" class="inline-block w-full text-center py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors text-sm">
                        Launch XSS Attack
                    </a>
                </div>
            </div>
            
            <div class="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <h4 class="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-1">Laboratory Note</h4>
                <p class="text-xs text-yellow-500/70 leading-relaxed italic">
                    Observe how the browser executes the script in Scenario 2. This happens because the server renders the raw input directly into the DOM without sanitization.
                </p>
            </div>
        </div>
    `;
    
    res.send(getPageTemplate(content, "XSS Vulnerability Lab"));
});

// --- CSRF MODULE ---
let labStatus = "Normal";

router.get('/status', (req, res) => {
    const content = `
        <div class="glass p-8 glow">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold">CSRF Dashboard</h2>
                    <p class="text-gray-400 mt-1">Cross-Site Request Forgery simulation.</p>
                </div>
                <div class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs code-font">
                    POST /api/lab/change-status
                </div>
            </div>

            <div class="flex flex-col items-center justify-center p-12 bg-black/40 rounded-3xl border border-white/5 mb-8">
                <div class="text-xs text-gray-500 mb-4 uppercase tracking-widest font-bold">Current System Status</div>
                <div class="text-6xl font-black ${labStatus === 'Normal' ? 'text-blue-400' : 'text-red-500 animate-pulse'} tracking-tighter">
                    ${labStatus}
                </div>
                <div class="mt-6 flex space-x-2">
                    <div class="w-2 h-2 rounded-full ${labStatus === 'Normal' ? 'bg-emerald-500' : 'bg-red-500'} animate-ping"></div>
                    <span class="text-xs text-gray-500">${labStatus === 'Normal' ? 'Secure Integrity' : 'Vulnerability Detected'}</span>
                </div>
            </div>

            <div class="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h3 class="font-bold mb-4">Integrity Controls</h3>
                <div class="flex space-x-4">
                    <button onclick="window.location.reload()" class="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10">
                        Refresh Status
                    </a>
                    <a href="/api/lab/reset-status" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold rounded-xl transition-all">
                        Reset System
                    </a>
                </div>
                <p class="mt-4 text-xs text-gray-500 text-center italic">
                    To simulate a CSRF attack, open <span class="code-font text-gray-300">/public/hacker.html</span> while logged in.
                </p>
            </div>
        </div>
    `;
    res.send(getPageTemplate(content, "CSRF Vulnerability Lab"));
});

// Reset status route
router.get('/reset-status', (req, res) => {
    labStatus = "Normal";
    res.redirect('/api/lab/status');
});

router.post('/change-status', (req, res) => {
    const { newStatus } = req.body;
    if (newStatus) {
        labStatus = newStatus;
        console.log(`[LAB] Status changed to: ${labStatus}`);
        return res.json({ success: true, message: `Status updated to ${labStatus}` });
    }
    res.status(400).json({ success: false, message: "Missing newStatus" });
});

module.exports = router;

