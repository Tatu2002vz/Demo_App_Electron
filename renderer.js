const si = require("systeminformation");
const os = require("os");
const { exec } = require("node:child_process");

// const btnActionDocker = document.getElementById("action-docker");
var pr = 0;
var ps = 0;
var dSpeed;
var uSpeed;
var maxSpeed = 0;
window.onload = () => {
  const guideWin = document.getElementsByClassName("guide-win")[0];
  const guideLinux = document.getElementsByClassName("guide-linux")[0];
  const guideMac = document.getElementsByClassName("guide-mac")[0];
  const cpuName = document.getElementById("cpu-name");
  const memoryInfo = document.getElementById("memory-info");
  const cpuInfo = document.getElementById("cpu-info");
  const deviceName = document.getElementById("device-name");
  const diskInfo = document.getElementById("disk-info");
  const dockerStatus = document.getElementById("docker-status");
  const table = document.getElementById("containerTable");
  uSpeed = document.querySelector("#speedUp");
  dSpeed = document.querySelector("#speedDown");
  const inputImage = document.querySelector("#input-image");
  const inputContainer = document.querySelector("#input-container");
  const btnCreateTask = document.querySelector("#create-new-task");
  let imageVal = "";
  let containerVal = "";

  
  const platform = os.platform();

  si.cpu().then((cpu) => {
    cpuName.innerHTML = `(${cpu.manufacturer} ${cpu.brand})`;
  });

  deviceName.innerHTML = os.hostname();
  function getGigabytes(a) {
    return (a / 1024 / 1024 / 1024).toFixed(2);
  }
  // lấy thông tin cpu - ram

  setInterval(async () => {
    try {
      const memory = await si.mem();

      // const process = await si.process();
      memoryInfo.innerHTML = `<p>${getGigabytes(memory.used)} / ${getGigabytes(
        memory.total
      )} GB (${(memory.used / memory.total).toFixed(2) * 100}%)</p>`;
      // cpuInfo.innerHTML = `${(cpu.percentCPUUsage * 100).toFixed(0)}% - ${cpu.cumulativeCPUUsage}`;
    } catch (error) {
      alert(error.message);
    }
  }, 3000); // Lấy thông tin mỗi giây

  setInterval(async () => {
    try {
      const cpu = process.getCPUUsage();

      cpuInfo.innerHTML = `${
        (cpu.percentCPUUsage * 100).toFixed(0) > 100
          ? "100"
          : (cpu.percentCPUUsage * 100).toFixed(0)
      }%`;
    } catch (error) {
      alert(error.message);
    }
  }, 1000); // Lấy thông tin mỗi giây

  // lấy thông tin ổ cứng
  const getDisk = async () => {
    try {
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
      if (err) {
        console.error("Docker is not running!");
        dockerStatus.innerHTML = "Đang tắt";
        dockerStatus.style.color = "Red";
        // btnActionDocker.innerHTML = "Bật";
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
        console.log("Docker is running.");
        dockerStatus.innerHTML = "Đang chạy";
        dockerStatus.style.color = "Green";
        // btnActionDocker.innerHTML = "Tắt";

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
        for (let i = table.rows.length - 1; i > 0; i--) {
          table.deleteRow(i);
        }
        containers.forEach((containerInfo) => {
          let row = table.insertRow();
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);

          cell1.innerHTML = containerInfo.Id;
          cell2.innerHTML = containerInfo.Names;
          cell3.innerHTML = containerInfo.State;
          cell4.innerHTML = `<div class="actionBtn">
            <button>${
              containerInfo.State === "running" ? "Pause" : "Start"
            }</button>
            <button>Delete</button>
          </div>`;
        });
      }
    });
  };

  getInfoDocker();

  //
  setInterval(getNetwork, 1000);
  function getNetwork() {
    exec("netstat -e", (error, stdout, stderr) => {
      data = stdout.split("\r\n");
      line = data[4].split(/(\s+)/);
      rec = line[2];
      send = line[4];

      // totalRec.innerText = (rec / 1048576).toFixed(2) + ' Mb';
      // totalSent.innerText = (send / 1048576).toFixed(2) + ' Mb';

      var down = (rec - pr) / 1024;
      var up = (send - ps) / 1024;

      if (pr > 0) {
        if (down > maxSpeed) {
          maxSpeed = down;
          // mSpeed.innerText = maxSpeed.toFixed(2) + ' Kb/s';
        }
        dSpeed.innerText = down.toFixed(2) + " Kb/s";
        uSpeed.innerText = up.toFixed(2) + " Kb/s";
      }

      pr = rec;
      ps = send;
    });
  }
  btnCreateTask.addEventListener("click", function (e) {});
};
