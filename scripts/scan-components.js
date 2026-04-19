/**
 * scan-components.js
 * Script quét app/components/ và so sánh với COMPONENT_INVENTORY.md
 * Phát hiện các component mới chưa được đăng ký
 *
 * Chạy: node scripts/scan-components.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'app', 'components');
const UI_DIR = path.join(ROOT, 'components', 'ui');
const INVENTORY_FILE = path.join(ROOT, 'COMPONENT_INVENTORY.md');

// ---- Helpers ----

function scanDir(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // skip non-component dirs
            if (['node_modules', '.next', 'types', 'data', 'hooks'].includes(entry.name)) continue;
            scanDir(fullPath, results);
        } else if (entry.name.endsWith('.tsx') && !entry.name.startsWith('index')) {
            results.push(fullPath);
        }
    }
    return results;
}

function getRelativePath(fullPath) {
    return fullPath.replace(ROOT + path.sep, '').replace(/\\/g, '/');
}

// ---- Main ----

console.log('\n🔍 Scanning components...\n');

// 1. Collect all .tsx files
const customComponents = scanDir(COMPONENTS_DIR);
const uiComponents = scanDir(UI_DIR);

// 2. Read inventory
const inventoryContent = fs.existsSync(INVENTORY_FILE)
    ? fs.readFileSync(INVENTORY_FILE, 'utf-8')
    : '';

// 3. Find unregistered components
const unregistered = [];

for (const filePath of customComponents) {
    const rel = getRelativePath(filePath);
    const fileName = path.basename(filePath, '.tsx');
    // Check if file or its basename appears in inventory
    if (!inventoryContent.includes(fileName) && !inventoryContent.includes(rel)) {
        unregistered.push({ fileName, rel });
    }
}

// 4. Report
if (unregistered.length === 0) {
    console.log('✅ COMPONENT_INVENTORY.md đang cập nhật đầy đủ!\n');
    console.log(`📊 Tổng: ${customComponents.length} custom components, ${uiComponents.length} UI components\n`);
} else {
    console.log(`⚠️  Phát hiện ${unregistered.length} component CHƯA được đăng ký trong COMPONENT_INVENTORY.md:\n`);
    for (const c of unregistered) {
        console.log(`   ❌ ${c.fileName}`);
        console.log(`      Path: ${c.rel}`);
        console.log(`      → Thêm vào bảng đúng module trong COMPONENT_INVENTORY.md\n`);
    }

    console.log('\n📋 Template để copy vào inventory:');
    console.log('```markdown');
    for (const c of unregistered) {
        console.log(`| **${c.fileName}** | \`${c.rel}\` | [Mô tả] | ⚠️ Cần kiểm tra |`);
    }
    console.log('```\n');
}

console.log(`📊 Tổng: ${customComponents.length} custom components | ${uiComponents.length} UI components`);
console.log(`📁 COMPONENT_INVENTORY.md: ${INVENTORY_FILE}\n`);
