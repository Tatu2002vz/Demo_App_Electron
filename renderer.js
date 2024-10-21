const si = require("systeminformation");
const os = require("os");
const { exec, execSync, spawn } = require("node:child_process");
// const btnActionDocker = document.getElementById("action-docker");
var pr = 0;
var ps = 0;
var dSpeed;
var uSpeed;
var maxSpeed = 0;
let btnStops;
let btnDels;

const executeCommand = (string) => {
  return new Promise((resolve, reject) => {
    exec(string, (err, stdout, stderr) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
};
window.onload = async () => {
  const main = document.querySelector("#main");
  const dialog = document.querySelector("#dialog");
  const guideWin = document.getElementsByClassName("guide-win")[0];
  const guideLinux = document.getElementsByClassName("guide-linux")[0];
  const guideMac = document.getElementsByClassName("guide-mac")[0];
  const cpuName = document.getElementById("cpu-name");
  const memoryInfo = document.getElementById("memory-info");
  const cpuInfo = document.getElementById("cpu-info");
  const gpuInfo = document.getElementById("gpu-info");
  const deviceName = document.getElementById("device-name");
  const diskInfo = document.getElementById("disk-info");
  const dockerStatus = document.getElementById("docker-status");
  const table = document.getElementById("containerTable");
  uSpeed = document.querySelector("#speedUp");
  dSpeed = document.querySelector("#speedDown");
  const inputImage = document.querySelector("#input-image");
  const inputContainer = document.querySelector("#input-container");
  const btnCreateTask = document.querySelector("#create-new-task");
  const loading = document.querySelector("#loading");
  const errorMessage = document.querySelector("#error");
  const btnConnect = document.querySelector("#btn-connect");
  const inputToken = document.querySelector("#input-token");

  let imageVal = "";
  let containerVal = "";
  inputImage.addEventListener("change", (e) => {
    imageVal = e.target.value;
  });
  inputContainer.addEventListener("change", (e) => {
    containerVal = e.target.value;
  });
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
      const gpu = await si.graphics();
      console.log(gpu.controllers);
      // diskInfo.innerHTML = `${getGigabytes(
      //   disk[0].available
      // )} GB free of ${getGigabytes(disk[0].size)} GB`;
      if (gpu.controllers.length === 0) {
        gpuInfo.innerHTML = "Không có!";
      } else {
        let strGpu = "";
        gpu.controllers.forEach((item) => {
          strGpu += `<p>${item.model}</p>`;
        });

        gpuInfo.innerHTML = strGpu;
      }
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
  const docker = new Docker();
  function getContainers() {
    return new Promise((resolve, reject) => {
      docker.listContainers({ all: true }, (err, containers) => {
        if (err) {
          reject(err);
        } else {
          resolve(containers);
        }
      });
    });
  }
  async function displayContainers() {
    try {
      const stats = await getContainerStats();
      const containers = await getContainers();
      // Xóa các dòng hiện tại trong bảng
      for (let i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
      }
      // Hiển thị thông tin containers trong bảng
      containers.forEach((containerInfo) => {
        let row = table.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);

        let name = containerInfo.Names[0].slice(1);
        let CPUPerc = "";
        let MemPerc = "";
        let MemUsage = "";
        Array.from(stats).forEach((item) => {
          if (item.Name === name) {
            CPUPerc = item.CPUPerc;
            MemPerc = item.MemPerc;
            MemUsage = item.MemUsage;
          }
        });
        cell1.innerHTML = containerInfo.Id;
        cell2.innerHTML = name;
        cell3.innerHTML = containerInfo.State;
        cell6.innerHTML = `<div class="actionBtn"> 
              <button class="btn-stop" data-containerId="${containerInfo.Id}">${
          containerInfo.State === "running" ? "Pause" : "Start"
        }</button>
              <button class="btn-del" data-containerId="${
                containerInfo.Id
              }">Delete</button>
          </div>`;
        cell4.innerHTML = `${CPUPerc}`;
        cell5.innerHTML = `${MemUsage} ${MemPerc ? "(" + MemPerc + ")" : ""}`;
      });
    } catch (error) {
      console.error(error);
    }
  }
  const getInfoDocker = async () => {
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
    function getContainers() {
      return new Promise((resolve, reject) => {
        docker.listContainers({ all: true }, (err, containers) => {
          if (err) {
            reject(err);
          } else {
            resolve(containers);
          }
        });
      });
    }
    async function displayContainers() {
      try {
        const stats = await getContainerStats();
        const containers = await getContainers();
        // Xóa các dòng hiện tại trong bảng
        for (let i = table.rows.length - 1; i > 0; i--) {
          table.deleteRow(i);
        }
        // Hiển thị thông tin containers trong bảng
        containers.forEach((containerInfo) => {
          let row = table.insertRow();
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          let cell6 = row.insertCell(5);

          let name = containerInfo.Names[0].slice(1);
          let CPUPerc = "";
          let MemPerc = "";
          let MemUsage = "";
          Array.from(stats).forEach((item) => {
            if (item.Name === name) {
              CPUPerc = item.CPUPerc;
              MemPerc = item.MemPerc;
              MemUsage = item.MemUsage;
            }
          });
          cell1.innerHTML = `<p id="id-container">${containerInfo.Id}</p>`;
          cell2.innerHTML = name;
          cell3.innerHTML = containerInfo.State;
          cell6.innerHTML = `<div class="actionBtn"> 
                <button class="btn-stop" data-containerId="${
                  containerInfo.Id
                }">${
            containerInfo.State === "running" ? "Pause" : "Start"
          }</button>
                <button class="btn-del" data-containerId="${
                  containerInfo.Id
                }">Delete</button>
            </div>`;
          cell4.innerHTML = `${CPUPerc}`;
          cell5.innerHTML = `${MemUsage} ${MemPerc ? "(" + MemPerc + ")" : ""}`;
        });
      } catch (error) {
        console.error(error);
      }
    }
    // liệt kê danh sách các container
    await displayContainers();
    btnStops = document.querySelectorAll(".btn-stop");
    btnDels = document.querySelectorAll(".btn-del");
    btnStops.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const containerId = btn.getAttribute("data-containerId");
        if (btn.innerText === "Start") {
          await startContainer(containerId);
        } else {
          await stopContainer(containerId);
        }
        setTimeout(async () => {
          await getInfoDocker();
        }, 1000);
      });
    });
    btnDels.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const containerId = btn.getAttribute("data-containerId");
        await removeContainer(containerId);
        // await getInfoDocker();
        setTimeout(async () => {
          await getInfoDocker();
        }, 1000);
      });
    });
    return 1;
  };

  await getInfoDocker();

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
  btnCreateTask.addEventListener("click", async function () {
    inputImage.value = "";
    inputContainer.value = "";
    console.log("image: " + imageVal);
    console.log("container: " + containerVal);
    loading.style.opacity = 1;
    // const exec = util.promisify(require("node:child_process").exec);
    // const { stdout, stderr } = await exec(str);

    docker.pull(imageVal, function (err, stream) {
      if (err) {
        console.error("Error pulling image:", err);
      } else {
        docker.modem.followProgress(stream, onFinished, onProgress);

        function onFinished(err, output) {
          if (err) {
            console.error("Error pulling image:", err);
            errorMessage.innerHTML = "Error pulling image: " + err.message;
          } else {
            console.log("Image pulled successfully.");
            docker.createContainer(
              { name: containerVal, Image: imageVal },
              (err, container) => {
                if (err) {
                  errorMessage.innerHTML = "Error create container: " + err.message;
                  loading.style.opacity = 0;
                  return;
                }

                container.start(async function (err, data) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  await getInfoDocker();
                  loading.style.opacity = 0;
                });
              }
            );
          }
        }

        function onProgress(event) {
          console.log(event.status);
        }
      }
    });

    // const createCmd = 'docker run --name ' + containerVal + ' ' + imageVal;

    // const output =  execSync(createCmd)
    // console.log(output.toString())

    // const command = "docker";
    // const args = ["run", "--name", containerVal, imageVal];

    // const dockerProcess = spawn(command, args);

    // dockerProcess.stdout.on("data", (data) => {
    //   console.log(`stdout: ${data}`);
    //   errorMessage.innerHTML = data;

    // });

    // dockerProcess.stderr.on("data", (data) => {
    //   console.error(`stderr: ${data}`);
    //   if(data.includes('docker login')) {
    //     exec('docker login')
    //   }
    //   errorMessage.innerHTML = data.toString();

    // });

    // dockerProcess.on("close", (code) => {
    //   console.log(`child process exited with code ${code}`);
    //   errorMessage.innerHTML = data;
    // });
  });

  async function stopContainer(containerId) {
    return new Promise((resolve, reject) => {
      const container = docker.getContainer(containerId);
      container.stop(function (err, data) {
        // if (err) {
        //   console.error(err);
        //   reject(err);
        // }
        console.log("Container stopped");
        resolve();
      });
    });
  }

  // Hàm để xóa container
  function removeContainer(containerId) {
    return new Promise(async (resolve, reject) => {
      await stopContainer(containerId);
      const container = docker.getContainer(containerId);
      container.remove(function (err, data) {
        if (err) {
          console.error(err);
          reject(err);
        }

        console.log("Container removed");
        resolve();
      });
    });
  }
  function startContainer(containerId) {
    return new Promise((resolve, reject) => {
      const container = docker.getContainer(containerId);

      container.start(function (err, data) {
        if (err) {
          console.error(err);
          reject(err);
        }

        console.log(`Container ${containerId} started`);
        resolve();
      });
    });
  }

  async function getContainerStats() {
    let rs = await executeCommand("docker stats --no-stream --format json");
    // rs = JSON.parse(rs)
    rs = rs.split("\n");
    rs.pop();
    rs.forEach((item, index) => {
      rs[index] = JSON.parse(item);
    });
    return rs;
  }
  setInterval(() => {
    // displayContainers()
    getInfoDocker();
  }, 2000);
  // function getContainerStats(containerId) {
  //   return new Promise((resolve, reject) => {
  //     const container = docker.getContainer(containerId);
  //     container.inspect((err, data) => {
  //       console.log(data.State.Pid);
  //       resolve(data.State);
  //     });
  //     // container.stats({ stream: false }, (err, stats) => {
  //     //   if (err) {
  //     //     reject(err);
  //     //   } else {
  //     //     resolve(stats);
  //     //   }
  //     // });
  //   });
  // }
  // async function displayContainerStats(containerId, row) {
  //   try {
  //     const stats = await getContainerStats(containerId);
  //     console.log(stats);
  //     const listProcess = await si.processes();
  //     // listProcess.list.sort((a, b) => a.name > b.name);
  //     // console.log(listProcess.list);
  //     listProcess.list.forEach((item) => {
  //       item.pid = stats
  //     })
  //     // const cpuUsage =
  //     //   stats.cpu_stats.cpu_usage.percpu_usage.reduce(
  //     //     (acc, val) => acc + val,
  //     //     0
  //     //   ) / stats.cpu_stats.cpu_usage.percpu_usage.length;
  //     // const ramUsage = stats.memory_stats.usage / (1024 * 1024); // Chuyển từ byte sang MB
  //     //   console.log('cpu usage: ' + cpuUsage.toFixed(2))
  //     //   console.log('ram usage: ' + ramUsage.toFixed(2))
  //     //   console.log('stats:', stats)
  //     // row.cells[3].textContent = `${cpuUsage.toFixed(2)}%`;
  //     // row.cells[4].textContent = `${ramUsage.toFixed(2)} MB`;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  // displayContainerStats(
  //   "53ed77d37a5eddeefea361b817ef3b03632eee2890eab34a5ac5b37e9d0644a1"
  // );

  // console.log(await psList());

  btnConnect.addEventListener("click", () => {
    if (inputToken.value) {
      main.style.display = "block";
      dialog.style.display = "none";
    }
  });
};
