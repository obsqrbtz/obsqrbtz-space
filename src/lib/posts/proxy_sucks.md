---
title: "Proxy sucks (QT as well)"
date: "2024-08-07"
updated: "2024-08-07"
categories:
  - "Network"
  - "WSL2"
  - "QT"
  - "C++"
excerpt: "How to deal with QT under WSL2 behind proxy"
---

Normally, setting up WSL is as easy as "press the `Next` button untill the `Finish` appears", but behind proxy this proccess can be described as "Fuck around and find out".

## WSL

We need to install the distro somehow. Let's use Ubuntu. Ofc, it won't download normally, so we have to use 'web-download` option:

```powershell
wsl --install Ubuntu-24.04 --web-download
```

Awesome, we got some linux up and running, but there are no network under WSL. Okay, let's fix that:

Add it to `~/.bashrc`, `~/.zshrc` or whatever and source the file to get proxy in the terminal:

```bash
export http_proxy="http://xxx.xxx.x.x:xxxx"
export https_proxy="http://xxx.xxx.x.x:xxxx"
```

And enable it in current session:

```bash
source ~/.bashrc # or ~/.zshrc.
```

Perfect, we can access the web, but package managers refuse to do anything whatsoever.

Well, under sudo proxy won't work at all. Fix it this way:

```bash
sudo visudo
```

Then add this to the opened file:

```bash
Defaults env_keep+="http_proxy ftp_proxy all_proxy https_proxy no_proxy"
```

## QT

Fortunately, installing QT is straightforward. Required packages are `qt6-base-dev, qt6-tools-dev, gcc, cmake, gdb' (package names may vary in different distros).

## VS Code

That's one more tricky. First, install `C/C++ Extension Pack` extension and add `includePath ` to QT libs in `c_cpp_properties.json` in `.vscode` dir. This path can be obtained this way:

```bash
/usr/lib/qt6/bin/qmake -query QT_INSTALL_HEADERS
```

Then add this path to `c_cpp_properties.json`. Example config:

```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "/usr/include/x86_64-linux-gnu/qt6",
                "${workspaceFolder}/**"
            ],
            "defines": [],
            "compilerPath": "/usr/bin/gcc",
            "cStandard": "c17",
            "cppStandard": "c++20",
            "intelliSenseMode": "linux-gcc-x64",
            "configurationProvider": "ms-vscode.cmake-tools",
            "browse": {
                "path": ["/usr/include/qt6/**", "/usr/include/x86_64-linux-gnu/qt6","${workspaceFolder}/**"],
                "limitSymbolsToIncludedHeaders": true,
                "databaseFilename": "${workspaceFolder}/.vscode/browse.vc.db"
              }
        }
    ],
    "version": 4,
    "enableConfigurationSquiggles": true
}
```

Nice, there are no warnings in VS Code, but debugging still does not work. Let's slap `launch.json` config to `.vscode` dir:

```json
{
    "configurations": [
        {
            "name": "Qt6 Debug",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/build/<executableName>",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                },
                {
                    "description": "Set Disassembly Flavor to Intel",
                    "text": "-gdb-set disassembly-flavor intel",
                    "ignoreFailures": true
                }
            ],
            "visualizerFile": "${workspaceFolder}/qt6.natvis"
        }
    ],
    "version": "2.0.0"
}
```

Relevant `qt6.natvis` file for QT 6.7.1 can be downloaded from QT ftp or any mirror (https://mirror.accum.se/mirror/qt.io/qtproject/official_releases/vsaddin/qt6.natvis).

That's all. Dev environment is ready for some shitty C++ code.