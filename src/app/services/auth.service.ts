import { Injectable } from '@angular/core';
import * as firebase  from 'firebase/app'
import { AngularFireAuth } from 'angularfire2/auth'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private angularFireAuth: AngularFireAuth) { }

  LoginWithEmail (email: string, password: string) {
    return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password)
  }

  registerWithEmail (email: string, password: string) {
    return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password)
  }

  getStatus () {
    return this.angularFireAuth.authState
  }

  logOut() {
    return this.angularFireAuth.auth.signOut()
  }

  loginWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider()
    provider.setCustomParameters({
      'display': 'popup'
    })
    return this.angularFireAuth.auth.signInWithPopup(provider)
  }

  handleFatalError (err) {
    console.log('Fatal error in Auth service')
    console.log(err)
  }
}
