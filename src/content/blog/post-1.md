---
title: Setting up NixOS configuration with flakes and home manager
excerpt: Making reproducible NixOS configuration
publishDate: 'April 28 2024'
isFeatured: true
tags:
  - Guide
  - NixOS
  - Linux
seo:
  image:
    src: 'https://raw.githubusercontent.com/obsqrbtz/nixdots/0c024447c466d6a55608c75d19998ee885c482e2/scrots/current.png'
    alt: Running system
---

![Running system](https://raw.githubusercontent.com/obsqrbtz/nixdots/0c024447c466d6a55608c75d19998ee885c482e2/scrots/current.png)

## Preface

As an average Arch enjoyer I've been a bit confused after installing NixOS and not being able to simply install stuff as usual.
Below are some notes on configuring NixOS in the reproducible manner.

## Install NixOS

Well, obviously you need the system up and running to install and configure things there. 
Installation option does not matter, but I'd suggest basic Gnome option to make initial configuration from fully functional environment.

## Set up config file structure

Create a new dir for system configuration at your `$HOME`. For example `~/nix`

After clean install you will have a `configuration.nix` and `hardware-configuration.nix` files in the `/etc/nixos/` directory.
Copy these files to `~/nix/nixos`.

Enable flakes by adding the line `nix.settings.experimental-features = [ "nix-command" "flakes" ]` in your `configuration.nix`.

At this point we would like to get some packages to our system. Create a file `packages.nix` alongside the `configuration.nix` and add it to your main config:

```nix
{ config, pkgs, ... }:

{
  imports =
    [ 
      ./hardware-configuration.nix
      ./packages.nix
    ];
    ...
}
```

Then in `packages.nix` declare the packages, which you would like to have system-wide:

```nix
{ pkgs, ... }: {
  nixpkgs.config = {
    allowUnfree = true;
    permittedInsecurePackages = 
      ["python-2.7.18.7" "python-2.7.18.8" "electron-25.9.0"];
  };

  environment.systemPackages = with pkgs; [
    firefox
    alacritty
    
    gnumake
    gcc
    nodejs
    vscode
    python
    (python3.withPackages (ps: with ps; [ requests ]))

    wget
    git
    nix-index
    unzip
    zip
    openssl
    vim
    neofetch # we definitely need it to flex on r/unixporn
   
    pipewire
    pulseaudio
    pamixer

    home-manager
  ];

}
```

For simplicty sake, only the essentials are listed here. This list can be modified for your use case, but we'll need home-manager to proceed further. You may see full configuration sample on [GitHub](https://github.com/obsqrbtz/nixdots).

Create a directory `~/nix/nixos/modules` for system-wide modules and create the file `bundle.nix`, which will import everything else in this directory:

```nix
{
  imports = [
    ./sound.nix
    ./user.nix
  ];
}
```

Imports may vary, depending on your system. I'll include only the essentials there.

`sound.nix`

```nix
{
  hardware.pulseaudio.enable = false;
  sound.enable = true;

  security.rtkit.enable = true;

  services.pipewire = {
    enable = true;

    alsa.enable = true;
    alsa.support32Bit = true;
    pulse.enable = true;

  };
}
```

`user.nix`

```nix
{ pkgs, ... }: {
  programs.fish.enable = true;

  users = {
    defaultUserShell = pkgs.fish;

    users.dan = {
      isNormalUser = true;
      description = "Dan";
      extraGroups = [ "networkmanager" "wheel" "input" ];
      packages = with pkgs; [];
    };
  };
}
```

Then import `bundle.nix` in the `configuration.nix`:

```nix
imports =
  [ 
    ./hardware-configuration.nix
    ./packages.nix
    ./modules/bundle.nix
  ];
```

When you add any system-wide config for specific packages, create the `.nix` file in the `~/nix/nixos/modules` and add the import to the `bundle.nix`.

Create a directory for your user configs. Let it be `~/nix/home-manager`.
In this directory create a folder for home manager modules `~/nix/home-manager/modules` and the `bundle.nix` with similar content:

```nix
{
  imports = [
    ./alacritty.nix
  ];
}
```

This file should contain imports to user configurations for your apps.

Example app configuration looks like:

```nix
{config, nixpkgs, ...}:
{
  programs.alacritty = {
    enable = true;
    settings = {
      window.opacity = 1.0;
      window = {
        padding = {
          x = 10;
          y = 10;
        };
      };
      font = {
        size = 14.0;
        normal = {
          family = "GohuFont";
        };
        bold = {
          family = "GohuFont";
          style = "Regular";
        };
      };
    };
  };
}
```

Create the `~/nix/home-manager/home.nix` file:

```nix
{ config, pkgs, inputs, ... }:
{
  imports = [
    inputs.nix-colors.homeManagerModules.default
    ./modules/bundle.nix
  ];

  home = {
    username = "dan";
    homeDirectory = "/home/dan";
    stateVersion = "23.11";
  };
}
```

Now it's time to glue everything together.

Create the file `flake.nix` in the `~/nix` directory.

```nix
{
  description = "Write anything there";

  inputs = {

    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable"; # remove it if you would like to stick to the latest tagged release
    nixpkgs-stable.url = "github:nixos/nixpkgs/nixos-23.11";

    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, nixpkgs-stable, home-manager, ... }@inputs:

    let
      system = "x86_64-linux";
    in {
      # nixos - system hostname
      nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
        specialArgs = {
          pkgs-stable = import nixpkgs-stable {
            inherit system;
            config.allowUnfree = true;
          };
          inherit inputs system;
        };
        modules = [
          ./nixos/configuration.nix
        ];
      };
      # Edit to match your username
      homeConfigurations.dan = home-manager.lib.homeManagerConfiguration {
        pkgs = nixpkgs.legacyPackages.${system};
        extraSpecialArgs = { inherit inputs; };
        modules = [ ./home-manager/home.nix ];
      };
  };
}
```

## Apply the configuration

When the file structure is ready, you may adjust your settings. When it's done run in the `~/nix` directory:

```bash
sudo nixos-rebuild switch --flake .
home-manager switch --flake .
```

Optionally, you may create a `git` repository to store your configuration. If it's applied to different machine, overwrite the `hardware-configuration.nix` file with the autogenerated by NixOS installer.

Full example with Hyprland installed can be explored [here](https://github.com/obsqrbtz/nixdots)