# Issue Tracker

Made using the [GT Nexus](http://www.gtnexus.com/) (owned by [Infor](http://www.infor.com/)) [App Xpress platform][1].

Before you can use this project, you must have a GT Nexus account or request one from the [developer website][1].

This repository contains 2 projects related to the Issue Tracker app.

* In the `App Xpress` folder you'll find the scripts used in the Issue Tracker platform module and the files for the FEF UI.
* In the `Mobile` folder you'll find the files for an Ionic/Apache Cordova cross-platform mobile app that uses the module.

## Quick links
* [App Xpress](#app-xpress)
  * [Files](#files)
  * [Installation](#installation)
* [Mobile App](#mobile-app)
  * [Files](#files-1)
  * [Running](#running)


## App Xpress

### Files

The "App Xpress" folder contains:

* `$IssueT3/`, containing the files for the FEF UI.
* `issueScript.js` and `messageScript.js`, the module scripts.
* `severityList.csv`, the file used for the severity picklist.

### Installation

In order to install the FEF UI for this app:

1. Log in to a trade account and go to **Tools** > **Platform Console** in the header bar.
2. At the top of the page, go to the **Modules** > **Manage Modules** > **Tools** > **Import**.
3. Choose the platform module .zip file in the **App Xpress** directory and import it.
5. Click **Publish** to finish adding the module.

After installation, you must Provision the app:

1. In the module, go to **Provisioning** > **Manage Provisioning** > **Add**.
2. Select the following values for each field:

   |Field                    |Value               |
   |-------------------------|--------------------|
   |Licensee                 |*Your organization* |
   |Run As User              |*Any platform agent*|
   |Deploment Type           |**Community**       |
   |Deploy To                |*Leave the default* |
   |Licensee Transaction Role|**Buyer**           |

3. Click **Save**, then click **Submit**.

After provisioning, you must grant user permissions for the app:

1. Log in to an administrator account and search for your organization.
2. Go to **Users** in your organization and find your trade user.
3. Click **Security Profile** and then click **Edit** at the bottom.
4. Tick the boxes for **Issue Create** and **Issue Edit** as well as **Message Create** and **Message Edit**.
5. Click **Get Approval** at the bottom to save your changes.

You can now use the FEF UI! To use it:

1. Log in to your trade account.

   * Go to **New** > **Issues** to create a new issue.
   * Go to **Applications** > **Issues** (under the *Documents* section) to view existing issues.


## Mobile App

In order to use the mobile app, you must have set up the App Xpress module using the instructions above.

### Files

The **Mobile** folder is an Ionic app directory, containing:

* `app/`, which stores the actual templates and scripts for the app
* `config.xml`, which has a widget ID that needs to be edited when building for iOS.
* `ionic.config.json`, which has an app ID that needs to be cleared when using Ionic Package.
* All other files were auto generated by Ionic.

### Running

You need to install Ionic and Cordova prior to using this app:

1. Download and install [Node.js](https://nodejs.org/en/).
2. Open a terminal and run `npm install -g cordova ionic`.

Edit the code to include your data key:

1. Go to `app/query.service.ts` and scroll down to line 104.
2. Change the `dataKey` string have an authorized data key. To get a data key,

   1. Log in to GT Nexus with an admin acocunt.
   2. Find your organization and go to **Software Provider**.
   3. Copy an **API key** under **Software Profile List**.

      * If there isn't one, click **New**, enter a name, and save.

3. If you use an environment other than demo, also change the URL base.

   1. Go to the GT Nexus admin or trade site and look at your address bar.
   2. Replace `/en/...` and everything after it in the URL with `/rest/310` and use that as the base.

      * Example: `https://commerce-demo.gtnexus.com/en/trade/login.jsp` -> `https://commerce-demo.gtnexus.com/rest/310`

Now you can use the app:

1. Open a terminal in the directory where you've saved the app.
2. Run `ionic serve` to start previewing the app in the browser.

   * Note: Chrome and other browsers may have security restrictions that prevent API calls from running.
     To get around this, try running Chrome with the follow command line flags:
     `--disable-web-security --user-data-dir="C:/chrome-insecure"`.

3. Alternatively, you can run the app directly on an Android device:

   1. Install [Android Studio](https://developer.android.com/studio/index.html) as well as any drivers or other requirements for your device.
   2. Make sure your device has ADB enabled. Go to **Settings** > **About** and find **Build Number**, then tap on repeatedly until it says developer options are enabled.
   3. Go to **Settings** > **Developer options** and enabled **USB Debugging** under the **Debugging** section.
   4. Connect your device via USB and enter `ionic run android` in your terminal window.

4. Running on an iOS device:

   * You're on you're own :P, maybe try [here](http://docs.ionic.io/docs/package-ios).

[1]: https://developer.gtnexus.com/
