import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  operation: string = 'login'
  email: string = null
  password: string = null
  nick: string = null

  constructor(private authService: AuthService, 
              private userService: UserService,
              private router: Router) { }

  ngOnInit() {
  }

  async login () {
    try {
      const data = await this.authService.LoginWithEmail(this.email, this.password)
      alert('Loggeado correctamente')
      this.router.navigate(['home'])
    } catch (err) {
      this.authService.handleFatalError(err)
    }
  }

  async loginWithFacebook () {
    try {
      const data = await this.authService.loginWithFacebook()
      alert('Loggeado con Facebook correctamente')
      const user = {
        uid: data.user.uid,
        email: data.user.email,
        nick: data.user.displayName,
        status: 'online'
      }
      if (data.additionalUserInfo.isNewUser) this.createUser(user)
      this.router.navigate(['home'])
    } catch (err) {
      this.authService.handleFatalError(err)
    }
  }

  async register () {
    try {
      const data = await this.authService.registerWithEmail(this.email, this.password)
      const user = {
        uid: data.user.uid,
        email: this.email,
        nick: this.nick,
        status: 'online'
      }
      this.createUser(user)
    } catch (err) {
      this.authService.handleFatalError(err)
    }
  }

  async createUser (user) {
    try {
      const data = await this.userService.createOrUpdateUser(user)
      alert('Usuario registrado satisfactoriamente')
      this.operation = 'login'
    } catch (err) {
      this.userService.handleFatalError(err)
    }
  }
}
