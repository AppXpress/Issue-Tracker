# Issue Tracker

Made using the [GT Nexus](http://www.gtnexus.com/) (owned by [Infor](http://www.infor.com/)) [App Xpress platform][1].

Before you can use this project, you must have a GT Nexus account or request one from the [developer website][1].

This repository contains 2 projects related to the Issue Tracker app:

* In the `App Xpress` folder you'll find the scripts used in the Issue Tracker platform module and the files for the FEF UI.
* In the `Mobile` folder you'll find the files for an Ionic/Apache Cordova cross-platform mobile app that uses the module.



## Quick links
* [App Xpress](#app-xpress)
  * [Files](#files)
  * [Preparation](#preparation)
  * [Usage](#usage)
  * [Modifying](#modifying)
* [Mobile App](#mobile-app)
  * [Files](#files-1)
  * [Preparation](#preparation-1)
  * [Usage](#usage-1)
  * [Modifying](#modifying-1)



## App Xpress


### Files

The "App Xpress" folder contains:

* `$IssueT3/`, containing the files for the FEF UI.
* `issueScript.js` and `messageScript.js`, the module scripts.
* `severityList.csv`, the file used for the severity picklist.


### Preparation

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


### Usage

This app runs on the GT Nexus trade website. While logged in as a trade user, you can:

1. Create a new issue by going to **Create** > **Issues** in the header bar.
2. View and edit existing issues by going to **Applications** > **Issues** (under **Documents**).

#### Creating a new issue

* You can set a short **Subject** for the issue, as well as a longer **Description**.
* You can select a **Severity** from a list of *high*, *medium*, and *low* (can be configured).
* You can also assign a specific organization to the issue using **Assigned To**.
* Other data in the system can be added to the issue by adding to the **Transactions** list.
  * Added data will have a link to view the original document.
* Other organizations can be allowed to view and edit the issue by adding them to the **Participants** list.
* Click the save issue to finish creating the issue.

#### Editing an existing issue

* Existing issues have all the same options as new issues.
* The **Assigned To** field may be disabled after assigning the issue.
* After saving an issue, you can add files to the issue by adding to the **Attachments** list.
* You can also use **Create message** and **Create message with attachments** to comment on the issue.
* Issues have a workflow system that goes from **Opened** > **Assigned** > **Resolved** > **Closed**.
  * New issues start as **Opened**.
  * The creator can transition the issue to **Assigned** by setting the **Assigned To** field and clicking **Assign**.
  * The assigned party will then have options to set the owner of the issue, or can click **Resolve** to move it to **Resolved**.
  * Finally, the creator can confirm the issue is finished by clicking **Close** to move it to **Closed**.
* After an issue is set to **Closed**, it cannot be edited and messages are disabled.


### Modifying

Most of your changes will probably be in the FEF UI:

* The FEF files are in the `$IssueT3/source/` folder.
* `source/behaviors` has the code that adds functionality to the templates.
  * `behaviors/anchor.js` handles the **Transactions** list and the lookup popover for adding a transaction.
  * `behaviors/issue.js` has basic functionality not specific to the **Transactions** or **Messages**.
  * `behaviors/messages.js` handles the message list and creating a new message.
* `source/templates` has the HTML files that structure the UI.
  * `templates/anchor.html` has the HTML for the popover that comes up when adding to **Transactions**.
  * `templates/issue.html` is the main template for the issue itself, and shows everything except messages.
  * `templates/messages.html` is included in the issue template and has the message list as well as the creation popover.
* After making changes to the UI, you can upload it by following these steps:
  1. Compress the `$IssueT3` folder in a .zip archive.
     * The directory structure should be something like: `[any name].zip/$IssueT3/source/...`.
  2. This can then be uploaded by clicking the **Draft** button in the module in the **Platform Console**.
  3. Then, click the **User Interfaces** tab and click **Browse**, select the .zip, and click the *green checkmark*.
  4. Finally, click the **Publish** button and your UI changes will apply.



## Mobile App

In order to use the mobile app, you must have set up the App Xpress module using the instructions above.


### Files

The **Mobile** folder is an Ionic app directory, containing:

* `app/`, which stores the actual templates and scripts for the app
* `config.xml`, which has a widget ID that needs to be edited when building for iOS.
* `ionic.config.json`, which has an app ID that needs to be cleared when using Ionic Package.
* All other files were auto generated by Ionic.


### Preparation

You need to install Ionic and Cordova prior to using this app:

1. Download and install [Node.js](https://nodejs.org/en/).
2. Open a terminal and run `npm install -g ionic@beta` and `npm install -g cordova`.
   * You might need to run these undo `sudo` on Mac and Linux.

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
   * You're on you're own, maybe try [this](http://docs.ionic.io/docs/package-ios)? :P
5. Less reliable but easier to use method of running on a device:
   * Ionic comes with a free handy feature that will let you test the app almost natively (although some things might now work).
   * You will need an Ionic account from [here](https://apps.ionic.io/) to use this method.
   * After creating an account, open a terminal in the app directory and run `ionic login`.
   * Once your account has been added, you can use `ionic upload` to upload the app to your account.
     * Note that you may need to delete the app ID in the `ionic.config.json` file for this to work.
   * On a device, download the **Ionic View** app from your app store and login.
   * Tapping on the **Issue Tracker** option in the Ionic View app will let you download and run the app.


### Usage

Once the app is open, simply log in to your trade account.

#### Issue list

* The first place you are taken after logging in is the issue list.
  * This list shows you all the issues visible to you.
  * You can filter through them by clicking on the funnel in the top right corner.
* You can tap on any issue from the list to view details about it.
* You can also tap the **+** button to create a new issue.

#### Issue details

* Once you are viewing the details of an issue, you can see all the data available in the FEF UI.
  * Attachments that are not images cannot be viewed from the app.
  * You can only view the name and type for transactions, but there is no link to view it.
* You can transition through the workflow using the *triple dot* button in the top bar.
* You can tap on **Messages** at the top to view the message list for the issue.
* You can tap on the *pencil* button to edit the issue.

#### Creating and editing issues

* Creating and editing issues has the same options, editing an issue just comes pre-populated with the current data.
* The mobile app has the same most of the same functionality for each field.
  * *Note: you can only use mobile app attachments when running on a device.*
  * In the mobile app, attachments can be added before the issue has been saved, but only images can be attached.
  * You also cannot remove attachments already on the issue from the mobile app.
  * The transactions list may be more difficult to navigate because there is no filter, and you cannot view the selected transaction.
* You can tap the *checkmark* at the top to save the issue, or the "*x*" to cancel.

#### Message list

* The message list shows all the messages posted on the current issue.
* You can view any images attached to the messages, and tapping on them gives a fullscreen view.
* You can tap the "*+*" button to create a new message.
* Like the FEF UI, messages cannot be edited.

#### Creating messages

* In the message editor, you can type your message into the field.
* Messages also have an attachment system identical to the one for issues.
  * *Note: you can only use mobile app attachments when running on a device.*
  * You can only attach images in the mobile app.
  * You can attach a new image taken from the camera or an existing image in your gallery.


### Modifying

If you want to make changes to the app:

* The main files you'll need to edit are in the `app/` directory.
* The `componenets/` folder only has an attachment component for viewing and editing image attachments.
* The `pages/` folder in the app is divided into 4 folders:
  * `app/pages/display/` has the detailed issue viewer and the message list.
  * `app/pages/index/` has the issue list and the filter system.
  * `app/pages/login/` only has the login page.
  * `app/pages/update/` has the issue creator and editor, and the message creator.
* I created some services to simplify the pages themselves.
  * `app/data.service.ts` gets a list of organizations, users, and object types when a user logs in.
  * `app/image.service.ts` handles the downloading and uploading of images to the system.
  * `app/query.service.ts` simplifies API calls and stores token/authorization data.
  * `app/select.service.ts` has methods for easily creating selectors for organizations, users, and other items.
* This app was made with the Ionic 2 beta with Angular 2 and Typescript.



[1]: https://developer.gtnexus.com/
