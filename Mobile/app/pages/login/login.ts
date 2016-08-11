import {Component} from '@angular/core';
import {SqlStorage, NavController, Alert, Loading, Toast} from 'ionic-angular';

import {DataService, QueryService} from '../../services';
import {ListPage} from '../index/list';


/**
 * A page used to log in to the GT Nexus platform.
 * 
 * @export
 * @class LoginPage
 */
@Component({
	templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
	private store;
	private username: string;
	private password: string;
	private remember: boolean;

	/** Convenience option for usin when debugging, not for production */
	private allowSaveAuth = true;

	/**
	 * Creates an instance of LoginPage.
	 * 
	 * @param {QueryService} query A service used to make API calls
	 * @param {NavController} nav The navigation controller of the app
	 */
	constructor(private query: QueryService, private nav: NavController) {
		if (this.allowSaveAuth) {
			// Gets an SQL store access object
			this.store = new SqlStorage();

			// Attempts to get credentials from the database
			this.store.get('auth').then(data => {
				if (data) {
					// If credentials were stored, decode them and set the values appropriately
					// Note: the encoding basically does nothing, I only did this because it felt wrong to store them in plain text :P
					let auth = atob(data).split(':');
					this.username = auth[0];
					this.password = auth[1];
					this.remember = true;
				}
			});
		}
	}

	/**
	 * Called when the form is submitted, queries the system to verify authentication.
	 */
	login() {

		// Show a loading indicator
		let loading = Loading.create({
			content: 'Logging in...'
		});
		this.nav.present(loading);

		// Call the query service login method
		this.query.login(this.username, this.password).subscribe(
			data => {
				if (this.allowSaveAuth) {
					if (this.remember) {
						// If remember was turned on, encode and store the credentials
						this.store.set('auth', btoa(this.username + ':' + this.password));
					} else {
						// If remembering was switched off, delete the credentials
						this.store.remove('auth');
					}
				}

				// Remove the loading indicator and go to the list page if successful
				loading.dismiss().then(value => {
					this.nav.setRoot(ListPage);
				});

				// Update the object type and organization lists
				DataService.update(this.query);
			},
			error => {
				// Otherwise hide the loading indicator and show an error toast message
				loading.dismiss().then(value => {
					this.nav.present(Toast.create({
						message: 'Login failed, please try again.',
						duration: 3000
					}));
				});
			}
		);
	}
}