const si = require("systeminformation");
const os = require("os");
const { exec } = require("node:child_process");

const btnActionDocker = document.getElementById("action-docker");

const guideWin = document.getElementsByClassName("guide-win")[0];
const guideLinux = document.getElementsByClassName("guide-linux")[0];
const guideMac = document.getElementsByClassName("guide-mac")[0];
const platform = os.platform();

btnActionDocker.addEventListener("click", () => {
  console.log("click!!");

  if (platform === "linux") {
    console.log("Hệ điều hành đang chạy là Linux.");
  } else if (platform === "win32") {
    console.log("Hệ điều hành đang chạy là Windows.");
    exec("docker stop $(docker ps -aq)", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
    });
  } else if (platform === "darwin") {
    console.log("Hệ điều hành đang chạy là macOS.");
  } else {
    console.log(
      "Hệ điều hành không được nhận diện là Linux, Windows hoặc macOS."
    );
  }
  getInfoDocker();
});
// lấy tên máy tính
const deviceName = document.getElementById("device-name");

deviceName.innerHTML = os.hostname();
function getGigabytes(a) {
  return (a / 1024 / 1024 / 1024).toFixed(2);
}
// lấy thông tin cpu - ram

setInterval(async () => {
  try {
    const memory = await si.mem();
    const cpu = process.getCPUUsage();
    const memoryInfo = document.getElementById("memory-info");
    const cpuInfo = document.getElementById("cpu-info");
    // const process = await si.process();
    memoryInfo.innerHTML = `<p>${getGigabytes(memory.used)} / ${getGigabytes(
      memory.total
    )} GB (${(memory.used / memory.total).toFixed(2) * 100}%)</p>`;
    // cpuInfo.innerHTML = `${(cpu.percentCPUUsage * 100).toFixed(0)}% - ${cpu.cumulativeCPUUsage}`;
    console.log(cpu.percentCPUUsage)
  } catch (error) {
    alert(error.message);
  }
}, 3000); // Lấy thông tin mỗi giây

setInterval(async () => {
  try {
    const cpuInfo = document.getElementById("cpu-info");

    const cpu = process.getCPUUsage();
    cpuInfo.innerHTML = `${(cpu.percentCPUUsage * 100).toFixed(0)}%`;
    console.log(cpu.percentCPUUsage)
  } catch (error) {
    alert(error.message);
  }
}, 1000); // Lấy thông tin mỗi giây

// lấy thông tin ổ cứng
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

// lấy thông tin docker

const Docker = require("dockerode");

const getInfoDocker = () => {
  const docker = new Docker();
  docker.ping((err, data) => {
    const dockerStatus = document.getElementById("docker-status");
    if (err) {
      console.error("Docker is not running!");
      dockerStatus.innerHTML = "Đang tắt";
      dockerStatus.style.color = "Red";
      btnActionDocker.innerHTML = "Bật";
      if (platform === "linux") {
        console.log("Hệ điều hành đang chạy là Linux.");
        guideLinux.style.display = "inline-block";
      } else if (platform === "win32") {
        console.log("Hệ điều hành đang chạy là Windows.");
        guideWin.style.display = "inline-block";
      } else if (platform === "darwin") {
        console.log("Hệ điều hành đang chạy là macOS.");
        guideMac.style.display = "inline-block";
      } else {
        console.log(
          "Hệ điều hành không được nhận diện là Linux, Windows hoặc macOS."
        );
      }
    } else {
      // if (!data) {
      //   dockerStatus.innerHTML = "Stopped";
      //   dockerStatus.style.color = "Red";
      // } else {
      console.log("data: ", data);
      console.log("Docker is running.");
      dockerStatus.innerHTML = "Đang chạy";
      dockerStatus.style.color = "Green";
      btnActionDocker.innerHTML = "Tắt";

      // }
    }
  });
  // liệt kê danh sách các container
  docker.listContainers({ all: true }, (err, containers) => {
    if (err) {
      console.error(err);
    } else {
      // containers.forEach((containerInfo) => {
      //   console.log("Container ID:", containerInfo.Id);
      //   console.log("Container Name:", containerInfo.Names);
      //   console.log("Container State:", containerInfo.State);
      // });
      const table = document.getElementById("containerTable");
      for (let i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
      }
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
};

getInfoDocker();
