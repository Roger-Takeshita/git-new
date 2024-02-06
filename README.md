## Description

Creates a new GitHub repository only using terminal.

## What's the purpose?

Easy way to create a new repository (personal/organization) on GitHub using only the terminal.

## What does it do?

1. Creates a new local folder
2. Initialize a git repository (`git init`)
3. Creates a `.gitignore` file (optional)
4. Creates a `LiCENSE` file (optional)
5. Creates a `README.md` file (optional)
6. Creates a GitHub repository
7. Pushes first commit to the `main` branch

## Installation

```Bash
  npm install -g git-new
```

## How to use?

On your `terminal`:

```Bash
  git-new

  # or
  git-new <your_repo_name>

  # or
  git-new <your_repo_name> --private
```

- `Y/N` questions, if no answer is given, the default value is `True`
- All the white spaces in repo's name will be replaced with `_` (e.g `your_repo_name`)

## How to configure?

**Single GitHub Account**

- If you only have one account, you will need:
  - Create a [Personal Access Token](https://github.com/settings/tokens)
  - Add GitHub `account` and `token` to `.gitconfig` file

**Multiple GitHub Accounts**

- To use with multiple GitHub accounts, you will need:
  - Create a new SSH key
    - Config GitHub to use the new SSH public key
    - Config ssh `config` file
  - Create a [Personal Access Token](https://github.com/settings/tokens)
    - Add new GitHub `account` and `token` to `.gitconfig` file

### Single GitHub Account Config

![](https://i.imgur.com/HJxQ9V3.png)

![](https://i.imgur.com/1mMyXC6.png)

**Personal Access Token**

1. Create a GitHub [personal access token](https://github.com/settings/tokens)

   ![](https://i.imgur.com/lfBfnut.png)

2. Add your GitHub `account` and `token` to your `gitconfig` file

   ```Bash
     git config --global user.acc "your_github_acc"
     git config --global user.token "243f93cd40c14c9dd16e29bfff73b6aa5384285e"
   ```

   - In `/Users/<your_username>/.gitconfig`, you will have:

     ```Bash
       [user]
           name = your_name
           email = your_email@gmail.com
           acc = your_github_acc
           token = 243f93cd40c14c9dd16e29bfff73b6aa5384285e
     ```

### Multiple GitHub Accounts Config

![](https://i.imgur.com/5qJrDF9.png)

#### Create New SSH Key

1. On `Terminal` generate a new SSH key

   ```Bash
     ssh-keygen -t rsa -C "your_email@gmail.com"
     # Generating public/private rsa key pair.
     # Enter file in which to save the key (/Users/<your_username>/.ssh/id_rsa):
     /Users/<your_username>/.ssh/id_rsa_dev
     # Enter passphrase (empty for no passphrase):
     your_password
     # Enter same passphrase again:
     your_password
     # Your identification has been saved in /Users/<your_username>/.ssh/id_rsa_dev.
     # Your public key has been saved in /Users/<your_username>/.ssh/id_rsa_dev.pub.
     # The key fingerprint is:
     # SHA256:I60nfahisdhfiahsidfhiasdifhiashyH4 your_email@gmail.com
     # The key's randomart image is:
     # +---[RSA 3072]----+
     # |                 |
     # |                 |
     # |                .|
     # |       .       ..|
     # |      k S    oo1.|
     # |     o +..  .d%+=|
     # |. . . =.c+  .-+*.|
     # | p D =a*+.o  o...|
     # |...  +Ffff +*f   |
     # +----[SHA256]-----+
   ```

2. Add SSH key to your second GitHub account

   - Copy your new **public** SSH key (ends with `.pub`)

     ```Bash
       cat /Users/<your_username>/.ssh/id_rsa_dev.pub

       # ssh-rsa AAAAB3Nzafskdlfajsdjflajsdlf ... /qUg/DM= your_email@gmail.com
     ```

   - On GitHub, go to `Settings`

     ![](https://i.imgur.com/2QR3ZvM.png)

   - Click on `SSH and GPG keys > New SSH key`

     ![](https://i.imgur.com/hFkYsiY.png)

   - On `SSH keys / Add new` page

     - Title: `add_a_title`
     - Key: `paste your public key`
     - Click on **Add SSH key**

       ![](https://i.imgur.com/Lvsk3B8.png)

3. Add New SSH Private Key To List

   - Add the the new ssh key to your ssh list

     ```Bash
       ssh-add /Users/<your_username>/.ssh/id_rsa_dev

       # Enter passphrase for /Users/<your_username>/.ssh/id_rsa_dev:
       your_password

       # Identity added: /Users/<your_username>/.ssh/id_rsa_dev (your_email@gmail.com)
     ```

4. Configure ssh `config` file

   - In `/Users/<your_username>/.ssh/config` (create a `config` if file doesn't exist)
   - Add a new Host and point to your **private** SSH key (without the `.pub`)

     ```Bash
       Host your_unique_profile_name
         UseKeychain yes
         HostName github.com
         User your_new_github_user
         IdentityFile /Users/<your_username>/.ssh/id_rsa_dev
     ```

#### Configure GitHub

Add a second profile (`user1`) to your `.gitconfig` file

- the `user1` will the name of the profile
  - the name of the profile has to start with `user` and followed by an unique `number` (eg. `user1`, `user2`...)
- Create a [Personal Access Token](https://github.com/settings/tokens)
- Add a new user to `.gitconfig` file

  ```Bash
    git config --global user1.name "your_name"
    #                       ^
    #                       └── user1 (user One)
    git config --global user1.email "your_second_email@gmail.com"
    #                       ^
    #                       └── user1 (user One)
    git config --global user1.acc "your_second_github_acc"
    #                       ^
    #                       └── user1 (user One)
    git config --global user1.token "243f93cd40c14c9dd16e29bfff73b6aa5384285e"
    #                       ^
    #                       └── user1 (user One)
  ```

In your `/Users/<your_username>/.gitconfig`:

```Bash
  [user] # <-------- Default profile
      name = your_name
      email = your_email@gmail.com
      acc = your_github_acc
      token = 243f93cd40c14c9dd16e29bfff73b6aa5384285e
  [user1] # <-------- New profile
      name = your_name
      email = your_second_email@gmail.com
      acc = your_second_github_acc
      token = 243f93cd40c14c9dd16e29bfff73b6aa5384285e
```
