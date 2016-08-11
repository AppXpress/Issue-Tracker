import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';

import {LoginPage} from './pages/login/login';
import {QueryService} from './services';


@Component({
	template: '<ion-nav [root]="rootPage"></ion-nav>',
	providers: [QueryService]
})
export class App {
	private rootPage: any;

	constructor(private platform: Platform) {
		this.rootPage = LoginPage;

		platform.ready().then(() => {
			StatusBar.styleDefault();
		});
	}
}

ionicBootstrap(App);