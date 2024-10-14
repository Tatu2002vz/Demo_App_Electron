const os = require("os");
const si = require("systeminformation");
const { exec } = require("node:child_process");

const Docker = require("dockerode");

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
}, 200); // Lấy thông tin mỗi giây

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

// exec('docker ps', (err, stdout, stderr) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(typeof stdout);
// });

const docker = new Docker();

docker.listContainers({ all: false }, (err, containers) => {
  if (err) {
    console.error(err);
  } else {
    containers.forEach((containerInfo) => {
      console.log("Container ID:", containerInfo.Id);
      console.log("Container Name:", containerInfo.Names);
      console.log("Container State:", containerInfo.State);
    });
    const table = document.getElementById("containerTable");
    containers.forEach((containerInfo) => {
      let row = table.insertRow();
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);

      cell1.innerHTML = containerInfo.Id;
      cell2.innerHTML = containerInfo.Names;
      cell3.innerHTML = containerInfo.State;
    });
  }
});
