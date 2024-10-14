const si = require("systeminformation");
function getGigabytes(a) {
  return (a / 1024 / 1024 / 1024).toFixed(2);
}
setInterval(async () => {
  try {
    const memory = await si.mem();
    const cpu = await si.cpu();
    const memoryInfo = document.getElementById("memory-info");
    const cpuInfo = document.getElementById("cpu-info");
    // const process = await si.process();
    memoryInfo.innerHTML = `<p>${getGigabytes(memory.used)} / ${getGigabytes(
      memory.total
    )} GB (${(memory.used / memory.total).toFixed(2) * 100}%)</p>`;
    cpuInfo.innerHTML = `${cpu.speedMax} GHz`;
  } catch (error) {
    alert(error.message);
  }
}, 3000); // Lấy thông tin mỗi giây

const getDisk = async () => {
  try {
    const diskInfo = document.getElementById("disk-info");
    const disk = await si.fsSize();
    // diskInfo.innerHTML = `${getGigabytes(
    //   disk[0].available
    // )} GB free of ${getGigabytes(disk[0].size)} GB`;
    let diskAvailable = 0;
    let diskSize = 0;
    for (var item of disk) {
      diskAvailable += item.available;
      diskSize += item.size;
    }
    diskInfo.innerHTML = `${getGigabytes(
      diskAvailable
    )} GB free of ${getGigabytes(diskSize)} GB`;
  } catch (error) {
    alert(error.message);
  }
};
getDisk();
