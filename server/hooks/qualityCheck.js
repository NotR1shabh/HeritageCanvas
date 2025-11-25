// server/hooks/qualityCheck.js
const fs = require('fs');

module.exports = async function qualityCheck(localFilePath) {
  try {
    const stat = fs.statSync(localFilePath);
    if (!stat || stat.size === 0) return { ok: false, reason: 'empty_file' };
    // TODO: plug OpenCV here later
    return { ok: true, reason: null };
  } catch (e) {
    return { ok: false, reason: 'file_error' };
  }
};