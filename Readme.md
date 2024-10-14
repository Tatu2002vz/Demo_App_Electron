# Hướng dẫn cài đặt app

## Clone project 
```
git clone https://github.com/Tatu2002vz/Demo_App_Electron.git
```

## Truy cập app và cài đặt các package cần thiết
```
cd Demo_App_Electron
npm install
npm start
```

## Build app theo các platform
```
npm run make -- --platform win32 // for windows
npm run make -- --platform linux // for linux
npm run make -- --platform darwin // for macos
```

File cài đặt sẽ nằm ở trong ./out/make



