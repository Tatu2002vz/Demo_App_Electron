// window.addEventListener("DOMContentLoaded", () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   for (const type of ["chrome", "node", "electron"]) {
//     replaceText(`${type}-version`, process.versions[type]);
//   }
  
// });

const Docker = require("dockerode");





const docker = new Docker();

docker.listContainers({ all: true }, (err, containers) => {
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
