const bunVersion = process.versions.bun;
const nodeVersion = process.versions.node;

const isVersionLowerOrEqual = (current, target) => {
  const c = current.split('.').map(Number);
  const t = target.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (c[i] < t[i]) return true;  
    if (c[i] > t[i]) return false; 
  }
  return true;
};

const enforceVersion = () => {
  if (bunVersion) {
    if (isVersionLowerOrEqual(bunVersion, "1.4.3")) {
      console.error(`\x1b[41m\x1b[37m [FATAL ERROR] \x1b[0m Versi Bun Anda (${bunVersion}) rentan/tidak didukung!`);
      console.error(`\x1b[33m=> Harap upgrade ke Bun versi di atas 1.4.3 untuk menjalankan backend ini.\x1b[0m\n`);
      process.exit(1); 
    }
  } else if (nodeVersion) {
    const major = nodeVersion.split('.')[0];
    let isInvalid = false;
    let minRequired = "";

    if (major === "22") {
      if (isVersionLowerOrEqual(nodeVersion, "22.23.4")) { isInvalid = true; minRequired = "22.23.4"; }
    } else if (major === "24") {
      if (isVersionLowerOrEqual(nodeVersion, "24.22.1")) { isInvalid = true; minRequired = "24.22.1"; }
    } else if (major === "26") {
      if (isVersionLowerOrEqual(nodeVersion, "26.12.1")) { isInvalid = true; minRequired = "26.12.1"; }
    } else if (Number(major) < 22) {
      isInvalid = true; 
      minRequired = "22.23.5"; 
    }

    if (isInvalid) {
      console.error(`\x1b[41m\x1b[37m [FATAL ERROR] \x1b[0m Versi Node.js Anda (${nodeVersion}) rentan/tidak didukung!`);
      console.error(`\x1b[33m=> Harap upgrade ke versi di atas ${minRequired} untuk menjalankan backend ini.\x1b[0m\n`);
      process.exit(1);
    }
  }
};

enforceVersion();